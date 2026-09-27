export type UserRole = 'faculty' | 'hod' | 'dev';

export function getDisplayRole(role: string | null | undefined): string {
  if (!role) return 'Faculty';
  const lowerRole = role.toLowerCase();
  if (lowerRole === 'dev') return 'Dev';
  if (lowerRole === 'hod') return 'HOD';
  return 'Faculty'; // Default display for unknown roles or 'faculty'
}

export function hasGlobalViewingRights(role: string | null | undefined): boolean {
  if (!role) return false;
  const lowerRole = role.toLowerCase();
  return lowerRole === 'hod' || lowerRole === 'dev';
}
