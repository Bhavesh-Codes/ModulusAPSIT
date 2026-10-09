"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getViewer, getCommunityAccess, type AdminClient } from "@/lib/server/access"
import { normalizeCommunityRole, type CommunityRole } from "@/lib/roles"

interface CreateModuleData {
  name: string
  description?: string
}

interface UpdateModuleDetailsData {
  name: string
  description?: string
  banner_url?: string
}

/** Members shown to people: visible rows, never the hidden dev role. */
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

// ─── Community Lifecycle ──────────────────────────────────────────────────────────

export async function createModule(data: CreateModuleData) {
  const viewer = await getViewer()
  const admin = createAdminClient()

  const name = data.name?.trim()
  if (!name || name.length < 3) throw new Error("Group name must be at least 3 characters.")

  // Create community with viewer as owner
  const { data: module_, error: insertError } = await admin
    .from("communities")
    .insert([{
      name,
      description: data.description?.trim() || null,
      owner_id: viewer.userId,
      member_count: 1,
    }])
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)

  // Add the creator as owner in community_members as well
  await admin.from("community_members").insert([{
    community_id: module_.id,
    user_id: viewer.userId,
    role: "owner",
  }])

  revalidatePath("/groups")
  return module_
}

export async function joinModule(moduleId: string) {
  const viewer = await getViewer()
  const admin = createAdminClient()

  if (viewer.isAdmin) {
    throw new Error("As an Admin, you already have full access to every group.")
  }

  const { data: module_, error: fetchError } = await admin
    .from("communities")
    .select("id, owner_id")
    .eq("id", moduleId)
    .single()

  if (fetchError || !module_) throw new Error("Group not found")

  // Check if already a member
  const { data: existing } = await admin
    .from("community_members")
    .select("role")
    .eq("community_id", moduleId)
    .eq("user_id", viewer.userId)
    .maybeSingle()

  if (existing) {
    return { success: true, role: normalizeCommunityRole(existing.role) }
  }

  // Join as standard 'member'
  const { error } = await admin
    .from("community_members")
    .insert([{ community_id: moduleId, user_id: viewer.userId, role: "member" }])

  if (error) throw new Error(error.message)

  await syncMemberCount(moduleId)

  revalidatePath(`/groups/${moduleId}`)
  revalidatePath("/groups")
  return { success: true, role: "member" as const }
}

export async function leaveModule(moduleId: string) {
  const viewer = await getViewer()
  const admin = createAdminClient()

  // Check if user is the community owner
  const { data: community } = await admin
    .from("communities")
    .select("owner_id, name")
    .eq("id", moduleId)
    .maybeSingle()

  if (community?.owner_id === viewer.userId && !viewer.isAdmin) {
    throw new Error("As the group Owner, you cannot leave. Transfer ownership or delete the group instead.")
  }

  const { error } = await admin
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
  const viewer = await getViewer()
  const admin = createAdminClient()
  const access = await getCommunityAccess(admin, viewer, moduleId)

  // Backend RBAC enforcement: Only Owner or Platform Admin can delete community
  if (!access.permissions.canDeleteCommunity) {
    throw new Error("Only the group Owner or an Admin can delete this group.")
  }

  const { error } = await admin.from("communities").delete().eq("id", moduleId)

  if (error) {
    console.error("Error deleting group:", error)
    throw new Error("Failed to delete group.")
  }

  revalidatePath("/groups")
  return { success: true }
}

// ─── Community Settings ────────────────────────────────────────────────────────────

export async function updateModuleDetails(moduleId: string, data: UpdateModuleDetailsData) {
  const viewer = await getViewer()
  const admin = createAdminClient()
  const access = await getCommunityAccess(admin, viewer, moduleId)

  // Backend RBAC enforcement: Only Owner or Platform Admin can edit community settings
  if (!access.permissions.canEditCommunity) {
    throw new Error("Only the group Owner or an Admin can edit group settings.")
  }

  const { error } = await admin
    .from("communities")
    .update({
      name: data.name,
      description: data.description || null,
      banner_url: data.banner_url || null,
    })
    .eq("id", moduleId)

  if (error) {
    console.error("Error updating group details:", error)
    throw new Error("Failed to update group details.")
  }

  revalidatePath(`/groups/${moduleId}`)
  return { success: true }
}

// ─── Community Membership & Roles ──────────────────────────────────────────────────

export async function getModuleMembers(moduleId: string) {
  // All authenticated users can view the member roster
  await getViewer()
  const admin = createAdminClient()

  // Fetch community to know who the owner is
  const { data: community } = await admin
    .from("communities")
    .select("owner_id")
    .eq("id", moduleId)
    .maybeSingle()

  const rows = await visibleMemberRows(admin, moduleId)

  return rows.map((item: any) => {
    const u = Array.isArray(item.users) ? item.users[0] : item.users
    let role = normalizeCommunityRole(item.role)
    // If this user is the registered owner_id, ensure role reflects 'owner'
    if (community?.owner_id === u?.id) {
      role = "owner"
    }
    return {
      id: u.id as string,
      name: u.name as string | null,
      email: u.email as string | null,
      profile_pic: u.profile_pic as string | null,
      role: role as CommunityRole,
      joined_at: item.joined_at as string,
    }
  })
}

export async function removeMember(moduleId: string, targetUserId: string) {
  const viewer = await getViewer()
  const admin = createAdminClient()
  const access = await getCommunityAccess(admin, viewer, moduleId)

  // Backend RBAC enforcement: Must have membership management permission
  if (!access.permissions.canManageMembers) {
    throw new Error("You do not have permission to remove members from this group.")
  }

  // Determine target user's role
  const { data: community } = await admin
    .from("communities")
    .select("owner_id")
    .eq("id", moduleId)
    .maybeSingle()

  const isTargetOwner = community?.owner_id === targetUserId

  const { data: targetMember } = await admin
    .from("community_members")
    .select("role")
    .eq("community_id", moduleId)
    .eq("user_id", targetUserId)
    .maybeSingle()

  const targetRole: CommunityRole = isTargetOwner
    ? "owner"
    : normalizeCommunityRole(targetMember?.role)

  // Validate that the viewer's role is allowed to remove the target's role
  const canRemove = access.permissions.canRemoveUser(targetRole, targetUserId === viewer.userId)
  if (!canRemove) {
    if (targetRole === "owner") {
      throw new Error("Only platform Admins can remove the group Owner.")
    }
    if (targetRole === "curator") {
      throw new Error("Only the group Owner or an Admin can remove a Curator.")
    }
    throw new Error("You do not have permission to remove this member.")
  }

  const { error } = await admin
    .from("community_members")
    .delete()
    .eq("community_id", moduleId)
    .eq("user_id", targetUserId)

  if (error) {
    console.error("Error removing member:", error)
    throw new Error("Failed to remove member.")
  }

  await syncMemberCount(moduleId)

  revalidatePath(`/groups/${moduleId}`)
  return { success: true }
}

export async function updateMemberRole(
  moduleId: string,
  targetUserId: string,
  newRole: "curator" | "member" | "owner"
) {
  const viewer = await getViewer()
  const admin = createAdminClient()
  const access = await getCommunityAccess(admin, viewer, moduleId)

  // Backend RBAC enforcement: Only Owner and Platform Admin can manage roles
  if (!access.permissions.canAppointCurator) {
    throw new Error("Only the group Owner or an Admin can appoint Curators or modify member roles.")
  }

  // If transferring ownership
  if (newRole === "owner") {
    // Only current Owner or Platform Admin can transfer ownership
    if (!access.permissions.isOwner && !access.permissions.isPlatformAdmin) {
      throw new Error("Only the current Owner or an Admin can transfer group ownership.")
    }

    // Set new owner_id on community
    await admin.from("communities").update({ owner_id: targetUserId }).eq("id", moduleId)
    // Ensure target has member record with 'owner'
    await admin.from("community_members").upsert({
      community_id: moduleId,
      user_id: targetUserId,
      role: "owner",
    })
    // Demote previous owner to curator if not admin
    if (access.permissions.isOwner && viewer.userId !== targetUserId) {
      await admin.from("community_members").update({ role: "curator" }).eq("community_id", moduleId).eq("user_id", viewer.userId)
    }

    await syncMemberCount(moduleId)
    revalidatePath(`/groups/${moduleId}`)
    return { success: true }
  }

  // Update target role to curator or member
  const { error } = await admin
    .from("community_members")
    .update({ role: newRole })
    .eq("community_id", moduleId)
    .eq("user_id", targetUserId)

  if (error) {
    console.error("Error updating member role:", error)
    throw new Error("Failed to update member role.")
  }

  revalidatePath(`/groups/${moduleId}`)
  return { success: true }
}

