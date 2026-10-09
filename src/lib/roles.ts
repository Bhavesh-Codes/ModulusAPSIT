export type UserRole = 'faculty' | 'hod' | 'dev' | 'admin' | 'user';
export type PlatformRole = 'admin' | 'user';
export type CommunityRole = 'owner' | 'curator' | 'member' | 'viewer';

export function isPlatformAdmin(role: string | null | undefined): boolean {
  if (!role) return false;
  const lowerRole = role.toLowerCase();
  return lowerRole === 'admin' || lowerRole === 'hod' || lowerRole === 'dev';
}

export function normalizeCommunityRole(role: string | null | undefined): CommunityRole {
  if (!role) return 'viewer';
  const lower = role.toLowerCase();
  if (lower === 'owner') return 'owner';
  if (lower === 'curator' || lower === 'hod') return 'curator';
  if (lower === 'member' || lower === 'faculty') return 'member';
  if (lower === 'viewer') return 'viewer';
  return 'viewer';
}

export function getDisplayRole(role: string | null | undefined): string {
  if (!role) return 'Faculty';
  const lowerRole = role.toLowerCase();
  if (lowerRole === 'dev') return 'Dev';
  if (lowerRole === 'hod') return 'HOD';
  if (lowerRole === 'admin') return 'Admin';
  if (lowerRole === 'user') return 'User';
  return 'Faculty';
}

export function getCommunityRoleDisplay(role: string | null | undefined): string {
  const norm = normalizeCommunityRole(role);
  switch (norm) {
    case 'owner':
      return 'Owner';
    case 'curator':
      return 'Curator';
    case 'member':
      return 'Member';
    case 'viewer':
      return 'Viewer';
  }
}

export function hasGlobalViewingRights(role: string | null | undefined): boolean {
  // In the new RBAC system, all registered users have global viewing rights across all communities!
  return true;
}

export interface ComputedCommunityPermissions {
  role: CommunityRole;
  isPlatformAdmin: boolean;
  isOwner: boolean;
  isCurator: boolean;
  isMember: boolean;
  isViewer: boolean;
  canEditCommunity: boolean;
  canDeleteCommunity: boolean;
  canManageSettings: boolean;
  canManageMembers: boolean;
  canAppointCurator: boolean;
  canUploadContent: boolean;
  canPinContent: boolean;
  canCreateSubject: boolean;
  canDeleteModule: boolean;
  canMergeSubjects: boolean;
  canEditContent: (uploaderId: string | null) => boolean;
  canDeleteContent: (uploaderId: string | null) => boolean;
  canEditSubject: (createdById: string | null) => boolean;
  canRemoveUser: (targetRole: CommunityRole, isSelf?: boolean) => boolean;
}

export function computeCommunityPermissions(
  rawRole: string | null | undefined,
  isAdmin: boolean,
  viewerUserId: string
): ComputedCommunityPermissions {
  // Platform admins are automatically assigned Owner role in every community
  const role: CommunityRole = isAdmin ? 'owner' : normalizeCommunityRole(rawRole);
  const isOwner = role === 'owner';
  const isCurator = role === 'curator';
  const isMember = role === 'member';
  const isViewer = role === 'viewer';

  // Can manage community itself: Owner and Platform Admin
  const canEditCommunity = isAdmin || isOwner;
  const canDeleteCommunity = isAdmin || isOwner;
  const canManageSettings = isAdmin || isOwner;

  // Appointing curators / managing member roles: Owner and Admin
  const canAppointCurator = isAdmin || isOwner;

  // Membership management: Curator, Owner, Admin
  const canManageMembers = isAdmin || isOwner || isCurator;

  // Content upload: Member, Curator, Owner, Admin
  const canUploadContent = isAdmin || isOwner || isCurator || isMember;

  // Pinning items: Curator, Owner, Admin
  const canPinContent = isAdmin || isOwner || isCurator;

  // Subject creation: Member, Curator, Owner, Admin
  const canCreateSubject = isAdmin || isOwner || isCurator || isMember;

  // Module deletion: Curator, Owner, Admin
  const canDeleteModule = isAdmin || isOwner || isCurator;

  // Subject merging: Curator, Owner, Admin
  const canMergeSubjects = isAdmin || isOwner || isCurator;

  return {
    role,
    isPlatformAdmin: isAdmin,
    isOwner,
    isCurator,
    isMember,
    isViewer,
    canEditCommunity,
    canDeleteCommunity,
    canManageSettings,
    canManageMembers,
    canAppointCurator,
    canUploadContent,
    canPinContent,
    canCreateSubject,
    canDeleteModule,
    canMergeSubjects,
    canEditContent: (uploaderId: string | null) => {
      if (isAdmin || isOwner || isCurator) return true;
      if (isMember && uploaderId === viewerUserId) return true;
      return false;
    },
    canDeleteContent: (uploaderId: string | null) => {
      if (isAdmin || isOwner || isCurator) return true;
      if (isMember && uploaderId === viewerUserId) return true;
      return false;
    },
    canEditSubject: (createdById: string | null) => {
      if (isAdmin || isOwner || isCurator) return true;
      if (isMember && createdById === viewerUserId) return true;
      return false;
    },
    canRemoveUser: (targetRole: CommunityRole, isSelf = false) => {
      if (isSelf) return true; // Anyone can leave (except owner handled separately)
      if (isAdmin) return true; // Platform admin can remove anyone
      if (isOwner) return targetRole !== 'owner'; // Owner can remove Curators and Members
      if (isCurator) return targetRole === 'member'; // Curator can only remove Members
      return false;
    },
  };
}
