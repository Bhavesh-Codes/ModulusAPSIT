import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { CommunityRole } from "@/types/groups"

export type AdminClient = ReturnType<typeof createAdminClient>

export interface Viewer {
  userId: string
  systemRole: string
  /** HOD or dev. Treated as a member of every community with full curator powers. */
  isPrivileged: boolean
}

export class HttpError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

export function isPrivilegedRole(role: string | null | undefined): boolean {
  const r = (role ?? "").toLowerCase()
  return r === "hod" || r === "dev"
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
  return { userId: user.id, systemRole, isPrivileged: isPrivilegedRole(systemRole) }
}

export interface CommunityAccess {
  /** Role to show in the UI. Dev is shown as 'hod' so the hidden role never leaks. */
  role: CommunityRole | null
  /** May share into this community. */
  canShare: boolean
}

export async function getCommunityAccess(
  admin: AdminClient,
  viewer: Viewer,
  communityId: string
): Promise<CommunityAccess> {
  if (viewer.isPrivileged) return { role: "hod", canShare: true }
  const { data } = await admin
    .from("community_members")
    .select("role")
    .eq("community_id", communityId)
    .eq("user_id", viewer.userId)
    .maybeSingle()
  const role = data?.role === "hod" || data?.role === "faculty" ? (data.role as CommunityRole) : null
  return { role, canShare: role !== null }
}

/** Anyone who belongs to at least one community (or is HOD/dev) may add subjects and modules. */
export async function canContribute(admin: AdminClient, viewer: Viewer): Promise<boolean> {
  if (viewer.isPrivileged) return true
  const { count } = await admin
    .from("community_members")
    .select("community_id", { count: "exact", head: true })
    .eq("user_id", viewer.userId)
  return (count ?? 0) > 0
}
