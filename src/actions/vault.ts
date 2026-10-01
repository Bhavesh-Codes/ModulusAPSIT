"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { deleteFileFromR2 } from "@/lib/r2"

async function requireUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error("Unauthorized")
  return user
}

// ─── Personal Vault: Folders ──────────────────────────────────────────────────

export async function createVaultFolder(name: string, parentId: string | null) {
  const supabase = await createClient()
  const user = await requireUser(supabase)

  if (!name?.trim()) throw new Error("Folder name is required")

  if (parentId) {
    const { data: parent, error: parentError } = await supabase
      .from("folders")
      .select("id")
      .eq("id", parentId)
      .eq("owner_id", user.id)
      .eq("scope", "vault")
      .single()

    if (parentError || !parent) throw new Error("Parent folder not found or access denied")
  }

  const { data, error } = await supabase
    .from("folders")
    .insert({ owner_id: user.id, name: name.trim(), parent_id: parentId ?? null, scope: "vault" })
    .select()
    .single()

  if (error) throw new Error("Failed to create folder")

  revalidatePath("/vault")
  return data
}

export async function updateVaultFolder(
  folderId: string,
  updates: { name?: string; parent_id?: string | null }
) {
  const supabase = await createClient()
  const user = await requireUser(supabase)

  if (!updates.name && updates.parent_id === undefined) {
    throw new Error("Nothing to update. Provide name or parent_id.")
  }

  const { data: folder, error: fetchError } = await supabase
    .from("folders")
    .select("id")
    .eq("id", folderId)
    .eq("owner_id", user.id)
    .eq("scope", "vault")
    .single()

  if (fetchError || !folder) throw new Error("Folder not found or access denied")

  const payload: Record<string, any> = {}
  if (updates.name) payload.name = updates.name.trim()
  if (updates.parent_id !== undefined) payload.parent_id = updates.parent_id

  const { error: updateError } = await supabase.from("folders").update(payload).eq("id", folderId)
  if (updateError) throw new Error("Failed to update folder")

  revalidatePath("/vault")
  return { success: true }
}

export async function deleteVaultFolder(folderId: string) {
  const supabase = await createClient()
  const user = await requireUser(supabase)

  const { data: folder, error: fetchError } = await supabase
    .from("folders")
    .select("id")
    .eq("id", folderId)
    .eq("owner_id", user.id)
    .eq("scope", "vault")
    .single()

  if (fetchError || !folder) throw new Error("Folder not found or access denied")

  // Rule: deleting a folder moves its files and sub-folders to root, rather than cascading.
  const { error: itemsUpdateError } = await supabase
    .from("vault_items")
    .update({ folder_id: null })
    .eq("folder_id", folderId)
  if (itemsUpdateError) throw new Error("Failed to move child items to root. Deletion aborted.")

  const { error: foldersUpdateError } = await supabase
    .from("folders")
    .update({ parent_id: null })
    .eq("parent_id", folderId)
  if (foldersUpdateError) throw new Error("Failed to move sub-folders to root. Deletion aborted.")

  const { error: deleteError } = await supabase.from("folders").delete().eq("id", folderId)
  if (deleteError) throw new Error("Failed to delete folder")

  revalidatePath("/vault")
  return { success: true }
}

// ─── Personal Vault: Items ────────────────────────────────────────────────────

export async function deleteVaultItem(itemId: string) {
  const supabase = await createClient()
  const user = await requireUser(supabase)

  const { data: vaultItem, error: fetchError } = await supabase
    .from("vault_items")
    .select("*, files(id, r2_object_key, size_bytes)")
    .eq("id", itemId)
    .eq("owner_id", user.id)
    .single()

  if (fetchError || !vaultItem) throw new Error("File not found or access denied")

  const fileRecord = vaultItem.files

  if (fileRecord?.r2_object_key) {
    try {
      await deleteFileFromR2(fileRecord.r2_object_key)
    } catch (r2Error) {
      console.error("Failed to delete file from R2:", r2Error)
    }

    const { error: fileDeleteError } = await supabase.from("files").delete().eq("id", fileRecord.id)
    if (fileDeleteError) throw new Error("Failed to delete file record")

    if (fileRecord.size_bytes) {
      const { data: userData } = await supabase
        .from("users")
        .select("storage_used_bytes")
        .eq("id", user.id)
        .single()

      if (userData) {
        const newStorage = Math.max((userData.storage_used_bytes || 0) - fileRecord.size_bytes, 0)
        await supabase.from("users").update({ storage_used_bytes: newStorage }).eq("id", user.id)
      }
    }
  } else {
    await supabase.from("vault_items").delete().eq("id", itemId)
  }

  revalidatePath("/vault")
  return { success: true }
}

export async function updateVaultItem(
  itemId: string,
  updates: { filename?: string; tags?: string[]; folder_id?: string | null }
) {
  const supabase = await createClient()
  const user = await requireUser(supabase)

  if (!updates.filename && updates.tags === undefined && updates.folder_id === undefined) {
    throw new Error("Nothing to update.")
  }

  const { data: vaultItem, error: fetchError } = await supabase
    .from("vault_items")
    .select("id, file_id, owner_id")
    .eq("id", itemId)
    .eq("owner_id", user.id)
    .single()

  if (fetchError || !vaultItem) throw new Error("Item not found or access denied")

  if (updates.filename && vaultItem.file_id) {
    const { error: fileUpdateError } = await supabase
      .from("files")
      .update({ filename: updates.filename.trim() })
      .eq("id", vaultItem.file_id)
    if (fileUpdateError) throw new Error("Failed to update filename")
  }

  if (updates.tags !== undefined) {
    const { error: tagsUpdateError } = await supabase
      .from("vault_items")
      .update({ tags: updates.tags })
      .eq("id", itemId)
    if (tagsUpdateError) throw new Error("Failed to update tags")
  }

  if (updates.folder_id !== undefined) {
    const { error: folderUpdateError } = await supabase
      .from("vault_items")
      .update({ folder_id: updates.folder_id })
      .eq("id", itemId)
    if (folderUpdateError) throw new Error("Failed to move file")
  }

  revalidatePath("/vault")
  return { success: true }
}

export async function createVaultLink(input: {
  title: string
  url: string
  tags?: string[]
  folder_id?: string | null
}) {
  const supabase = await createClient()
  const user = await requireUser(supabase)

  const title = input.title?.trim()
  const url = input.url?.trim()

  if (!title) throw new Error("Title is required.")
  if (!url) throw new Error("URL is required.")
  try {
    new URL(url)
  } catch {
    throw new Error("Invalid URL format.")
  }

  const { data, error } = await supabase
    .from("vault_items")
    .insert({
      owner_id: user.id,
      item_type: "link",
      title,
      url,
      is_private: true,
      ...(input.tags && input.tags.length > 0 ? { tags: input.tags } : {}),
      ...(input.folder_id ? { folder_id: input.folder_id } : {}),
    })
    .select()
    .single()

  if (error) throw new Error("Failed to save link to vault.")

  revalidatePath("/vault")
  return data
}
