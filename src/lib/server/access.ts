import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { CommunityRole, PlatformRole } from "@/types/groups"
import {
  isPlatformAdmin,
  normalizeCommunityRole,
  computeCommunityPermissions,
  type ComputedCommunityPermissions,
} from "@/lib/roles"

export type AdminClient = ReturnType<typeof createAdminClient>

export interface Viewer {
  userId: string
  systemRole: string
  platformRole: PlatformRole
  isAdmin: boolean
  /** HOD, dev, or admin. Maintained for full backward compatibility across the app. */
  isPrivileged: boolean
}

export class HttpError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

export function isPrivilegedRole(role: string | null | undefined): boolean {
  return isPlatformAdmin(role)
}

export async function getViewer(): Promise<Viewer> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new HttpError("Unauthorized", 401)

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle()
  const systemRole = (profile?.role as string | undefined) ?? "faculty"
  const isAdmin = isPlatformAdmin(systemRole)
  const platformRole: PlatformRole = isAdmin ? "admin" : "user"

  return {
    userId: user.id,
    systemRole,
    platformRole,
    isAdmin,
    isPrivileged: isAdmin,
  }
}

export interface CommunityAccess {
  /** Effective role within the community: 'owner' | 'curator' | 'member' | 'viewer' */
  role: CommunityRole
  /** True if the user is an explicit member (Owner, Curator, or Member), false if Viewer */
  isMember: boolean
  /** May upload or share resources into this community */
  canShare: boolean
  /** Has managerial rights (Owner, Curator, or Platform Admin) */
  canManage: boolean
  /** Fine-grained permission flags and functions */
  permissions: ComputedCommunityPermissions
}

export async function getCommunityAccess(
  admin: AdminClient,
  viewer: Viewer,
  communityId: string
): Promise<CommunityAccess> {
  // 1. Platform-level Admins are automatically assigned Owner role in every community
  if (viewer.isAdmin) {
    const permissions = computeCommunityPermissions("owner", true, viewer.userId)
    return {
      role: "owner",
      isMember: true,
      canShare: true,
      canManage: true,
      permissions,
    }
  }

  // 2. Check if the user is the owner of the community
  const { data: community } = await admin
    .from("communities")
    .select("owner_id")
    .eq("id", communityId)
    .maybeSingle()

  if (community?.owner_id === viewer.userId) {
    const permissions = computeCommunityPermissions("owner", false, viewer.userId)
    return {
      role: "owner",
      isMember: true,
      canShare: true,
      canManage: true,
      permissions,
    }
  }

  // 3. Check community membership row
  const { data: memberRow } = await admin
    .from("community_members")
    .select("role")
    .eq("community_id", communityId)
    .eq("user_id", viewer.userId)
    .maybeSingle()

  if (memberRow) {
    const role = normalizeCommunityRole(memberRow.role)
    const permissions = computeCommunityPermissions(role, false, viewer.userId)
    return {
      role,
      isMember: true,
      canShare: permissions.canUploadContent,
      canManage: permissions.canManageSettings || permissions.canManageMembers,
      permissions,
    }
  }

  // 4. Default: Viewer (every registered platform user is a Viewer of every community)
  const permissions = computeCommunityPermissions("viewer", false, viewer.userId)
  return {
    role: "viewer",
    isMember: false,
    canShare: false,
    canManage: false,
    permissions,
  }
}

/** Anyone who belongs to at least one community as a Member/Curator/Owner (or is Platform Admin) may add subjects. */
export async function canContribute(admin: AdminClient, viewer: Viewer): Promise<boolean> {
  if (viewer.isAdmin) return true
  const { count } = await admin
    .from("community_members")
    .select("community_id", { count: "exact", head: true })
    .eq("user_id", viewer.userId)
  return (count ?? 0) > 0
}
