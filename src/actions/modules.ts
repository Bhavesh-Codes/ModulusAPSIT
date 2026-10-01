"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getViewer, type AdminClient } from "@/lib/server/access"

interface CreateModuleData {
  name: string
  description?: string
}

interface UpdateModuleDetailsData {
  name: string
  description?: string
  banner_url?: string
}

async function requirePrivileged() {
  const viewer = await getViewer()
  if (!viewer.isPrivileged) throw new Error("Only the HOD can do this.")
  return viewer
}

/** Members shown to people: faculty and HOD rows, never the hidden dev role. */
async function visibleMemberRows(admin: AdminClient, moduleId: string) {
  const { data, error } = await admin
    .from("community_members")
    .select(`
      role,
      user_id,
      joined_at,
      users:user_id (
        id,
        name,
        email,
        profile_pic,
        role
      )
    `)
    .eq("community_id", moduleId)
    .in("role", ["hod", "faculty"])

  if (error) throw new Error("Failed to fetch module members.")

  return (data ?? []).filter((row: any) => {
    const u = Array.isArray(row.users) ? row.users[0] : row.users
    return u && (u.role ?? "").toLowerCase() !== "dev"
  })
}

async function syncMemberCount(moduleId: string) {
  const admin = createAdminClient()
  const rows = await visibleMemberRows(admin, moduleId)
  await admin.from("communities").update({ member_count: rows.length }).eq("id", moduleId)
}

// ─── Module Lifecycle ──────────────────────────────────────────────────────────

export async function createModule(data: CreateModuleData) {
  const supabase = await createClient()
  const viewer = await requirePrivileged()

  // HOD/dev are members of every community through their role, so no member row is needed.
  const { data: module_, error: insertError } = await supabase
    .from("communities")
    .insert([{ name: data.name, description: data.description, owner_id: viewer.userId }])
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  revalidatePath("/groups")
  return module_
}

export async function joinModule(moduleId: string) {
  const supabase = await createClient()
  const viewer = await getViewer()

  if (viewer.isPrivileged) throw new Error("You already have access to every group.")

  const { data: module_, error: fetchError } = await supabase
    .from("communities")
    .select("id")
    .eq("id", moduleId)
    .single()

  if (fetchError || !module_) throw new Error("Group not found")

  const { error } = await supabase
    .from("community_members")
    .insert([{ community_id: moduleId, user_id: viewer.userId, role: "faculty" }])

  if (error) throw new Error(error.message)

  await syncMemberCount(moduleId)

  revalidatePath(`/groups/${moduleId}`)
  revalidatePath("/groups")
  return { success: true, role: "faculty" as const }
}

export async function leaveModule(moduleId: string) {
  const supabase = await createClient()
  const viewer = await getViewer()

  const { error } = await supabase
    .from("community_members")
    .delete()
    .eq("community_id", moduleId)
    .eq("user_id", viewer.userId)

  if (error) throw new Error(error.message)

  await syncMemberCount(moduleId)

  revalidatePath(`/groups/${moduleId}`)
  revalidatePath("/groups")
  return { success: true }
}

export async function deleteModule(moduleId: string) {
  await requirePrivileged()
  const admin = createAdminClient()

  const { error } = await admin.from("communities").delete().eq("id", moduleId)

  if (error) {
    console.error("Error deleting module:", error)
    throw new Error("Failed to delete group.")
  }

  revalidatePath("/groups")
  return { success: true }
}

// ─── Module Settings ────────────────────────────────────────────────────────────

export async function updateModuleDetails(moduleId: string, data: UpdateModuleDetailsData) {
  await requirePrivileged()
  const admin = createAdminClient()

  const { error } = await admin
    .from("communities")
    .update({
      name: data.name,
      description: data.description || null,
      banner_url: data.banner_url || null,
    })
    .eq("id", moduleId)

  if (error) {
    console.error("Error updating module details:", error)
    throw new Error("Failed to update group details.")
  }

  revalidatePath(`/groups/${moduleId}`)
  return { success: true }
}

// ─── Module Members ──────────────────────────────────────────────────────────

export async function getModuleMembers(moduleId: string) {
  await requirePrivileged()
  const admin = createAdminClient()
  const rows = await visibleMemberRows(admin, moduleId)

  return rows.map((item: any) => {
    const u = Array.isArray(item.users) ? item.users[0] : item.users
    return {
      id: u.id as string,
      name: u.name as string | null,
      email: u.email as string | null,
      profile_pic: u.profile_pic as string | null,
      role: item.role as "hod" | "faculty",
      joined_at: item.joined_at as string,
    }
  })
}

export async function removeMember(moduleId: string, userId: string) {
  await requirePrivileged()
  const admin = createAdminClient()

  const { error } = await admin
    .from("community_members")
    .delete()
    .eq("community_id", moduleId)
    .eq("user_id", userId)

  if (error) {
    console.error("Error removing member:", error)
    throw new Error("Failed to remove member.")
  }

  await syncMemberCount(moduleId)

  revalidatePath(`/groups/${moduleId}`)
  return { success: true }
}
