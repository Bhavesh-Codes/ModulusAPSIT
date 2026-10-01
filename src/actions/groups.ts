"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { getViewer, getCommunityAccess, canContribute } from "@/lib/server/access"
import { findSimilarSubjects } from "@/lib/server/subjects"
import {
  ACADEMIC_YEAR_RE,
  RESOURCE_TYPE_VALUES,
  type ActionResult,
  type ResourceType,
  type ShareConflict,
  type ShareStatus,
  type SimilarSubject,
  type Subject,
  type SubjectModule,
} from "@/types/groups"

// ─── helpers ──────────────────────────────────────────────────────────────────

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" }
  }
}

async function ctx() {
  const viewer = await getViewer()
  const admin = createAdminClient()
  return { viewer, admin }
}

type Ctx = Awaited<ReturnType<typeof ctx>>

const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null))

function revalidateGroups() {
  revalidatePath("/groups", "layout")
  revalidatePath("/vault")
}

function isResourceType(v: unknown): v is ResourceType {
  return typeof v === "string" && (RESOURCE_TYPE_VALUES as string[]).includes(v)
}

function cleanTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return []
  const out = new Set<string>()
  for (const t of tags) {
    if (typeof t !== "string") continue
    const v = t.trim().replace(/^#+/, "")
    if (v) out.add(v.slice(0, 40))
  }
  return Array.from(out).slice(0, 20)
}

async function assertSubjectAndModule(
  admin: Ctx["admin"],
  subjectId: string,
  moduleId: string | null
): Promise<void> {
  const { data: subject } = await admin.from("subjects").select("id, merged_into_id").eq("id", subjectId).maybeSingle()
  if (!subject) throw new Error("Subject not found.")
  if (subject.merged_into_id) throw new Error("That subject was merged into another one. Pick the merged subject.")
  if (moduleId) {
    const { data: mod } = await admin
      .from("subject_modules")
      .select("id")
      .eq("id", moduleId)
      .eq("subject_id", subjectId)
      .maybeSingle()
    if (!mod) throw new Error("That module does not belong to the chosen subject.")
  }
}

async function linkSubjectToCommunities(admin: Ctx["admin"], subjectId: string, communityIds: string[]) {
  if (communityIds.length === 0) return
  const { error } = await admin
    .from("subject_domains")
    .upsert(
      communityIds.map((community_id) => ({ subject_id: subjectId, community_id })),
      { onConflict: "subject_id,community_id", ignoreDuplicates: true }
    )
  if (error) throw new Error(error.message)
}

interface LocationRow {
  status?: string | null
  subjects?: { name: string } | { name: string }[] | null
  subject_modules?: { number: number } | { number: number }[] | null
}

function describeLocation(row: LocationRow): string {
  const subject = one(row.subjects)
  const mod = one(row.subject_modules)
  const where = subject ? `${subject.name}${mod ? ` › Module ${mod.number}` : ""}` : "Unsorted"
  return row.status && row.status !== "current" ? `${where} (${row.status})` : where
}

// ─── Share conflicts (same item twice / same file content) ────────────────────

interface ConflictQueryItem {
  vault_item_id?: string | null
  content_hash?: string | null
}

async function findConflicts(
  admin: Ctx["admin"],
  communityIds: string[],
  items: ConflictQueryItem[]
): Promise<ShareConflict[]> {
  if (communityIds.length === 0 || items.length === 0) return []

  // Fill in hashes of existing vault items that were uploaded earlier.
  const idsNeedingHash = items.filter((i) => i.vault_item_id && !i.content_hash).map((i) => i.vault_item_id as string)
  const storedHash = new Map<string, string | null>()
  if (idsNeedingHash.length > 0) {
    const { data } = await admin.from("vault_items").select("id, content_hash").in("id", idsNeedingHash)
    for (const row of data ?? []) storedHash.set(row.id, row.content_hash ?? null)
  }
  const hashes = items.map((i) => i.content_hash ?? (i.vault_item_id ? storedHash.get(i.vault_item_id) ?? null : null))

  const conflicts: ShareConflict[] = []
  const seen = new Set<string>()
  const push = (c: ShareConflict) => {
    const key = `${c.itemIndex}|${c.communityId}`
    if (seen.has(key)) return
    seen.add(key)
    conflicts.push(c)
  }

  const vaultIds = items.map((i) => i.vault_item_id).filter((v): v is string => !!v)
  if (vaultIds.length > 0) {
    const { data } = await admin
      .from("community_vault_items")
      .select("community_id, vault_item_id, status, subjects ( name ), subject_modules ( number )")
      .in("community_id", communityIds)
      .in("vault_item_id", vaultIds)
    for (const row of data ?? []) {
      items.forEach((it, idx) => {
        if (it.vault_item_id === row.vault_item_id) {
          push({ itemIndex: idx, communityId: row.community_id, kind: "same_item", location: describeLocation(row) })
        }
      })
    }
  }

  const distinctHashes = Array.from(new Set(hashes.filter((h): h is string => !!h)))
  if (distinctHashes.length > 0) {
    const { data } = await admin
      .from("community_vault_items")
      .select("community_id, status, subjects ( name ), subject_modules ( number ), vault_items!inner ( content_hash )")
      .in("community_id", communityIds)
      .in("vault_items.content_hash", distinctHashes)
    for (const row of data ?? []) {
      const rowHash = one<{ content_hash: string | null }>(row.vault_items)?.content_hash
      hashes.forEach((h, idx) => {
        if (h && h === rowHash) {
          push({ itemIndex: idx, communityId: row.community_id, kind: "same_hash", location: describeLocation(row) })
        }
      })
    }
  }

  return conflicts
}

export async function checkShareConflicts(input: {
  communityIds: string[]
  items: ConflictQueryItem[]
}): Promise<ActionResult<ShareConflict[]>> {
  return run(async () => {
    const { admin } = await ctx()
    return findConflicts(admin, input.communityIds ?? [], input.items ?? [])
  })
}

// ─── Share ────────────────────────────────────────────────────────────────────

export interface ShareInput {
  communityIds: string[]
  items: { vault_item_id: string; title: string }[]
  subject_id: string
  module_id: string | null
  resource_type: ResourceType
  academic_year: string
  description?: string | null
  tags?: string[]
  supersedes_share_id?: string | null
}

export async function shareToCommunities(input: ShareInput): Promise<ActionResult<{ created: number }>> {
  return run(async () => {
    const { viewer, admin } = await ctx()

    const communityIds = Array.from(new Set(input.communityIds ?? []))
    if (communityIds.length === 0) throw new Error("Choose at least one community.")
    if (!input.items?.length) throw new Error("Nothing to share.")
    if (!input.subject_id) throw new Error("Subject is required.")
    if (!isResourceType(input.resource_type)) throw new Error("Resource type is required.")
    if (!ACADEMIC_YEAR_RE.test(input.academic_year ?? "")) throw new Error("Academic year is required.")

    const items = Array.from(new Map(input.items.map((i) => [i.vault_item_id, i])).values())
    for (const it of items) {
      if (!it.title?.trim()) throw new Error("Every item needs a title.")
    }

    for (const communityId of communityIds) {
      const access = await getCommunityAccess(admin, viewer, communityId)
      if (!access.canShare) throw new Error("Only members of a community can share into it.")
    }

    await assertSubjectAndModule(admin, input.subject_id, input.module_id ?? null)

    // The items must be the sharer's own vault items.
    const { data: owned } = await admin
      .from("vault_items")
      .select("id")
      .in("id", items.map((i) => i.vault_item_id))
      .eq("owner_id", viewer.userId)
    if ((owned ?? []).length !== items.length) throw new Error("You can only share items from your own vault.")

    // Replaces-older-item only makes sense for one item.
    let supersedes: { id: string; community_id: string } | null = null
    if (input.supersedes_share_id) {
      if (items.length !== 1) throw new Error("“Replaces older item” works for one item at a time.")
      const { data: old } = await admin
        .from("community_vault_items")
        .select("id, community_id, shared_by_user_id")
        .eq("id", input.supersedes_share_id)
        .maybeSingle()
      if (!old) throw new Error("The item you want to replace no longer exists.")
      if (communityIds.includes(old.community_id)) {
        if (old.shared_by_user_id !== viewer.userId && !viewer.isPrivileged) {
          throw new Error("You can only replace your own items.")
        }
        supersedes = { id: old.id, community_id: old.community_id }
      }
    }

    const conflicts = await findConflicts(
      admin,
      communityIds,
      items.map((i) => ({ vault_item_id: i.vault_item_id }))
    )
    if (conflicts.length > 0) {
      const c = conflicts[0]
      throw new Error(
        c.kind === "same_item"
          ? `This item is already shared in that community (${c.location}).`
          : `The same file is already shared in that community (${c.location}).`
      )
    }

    // Item-level metadata lives on the vault item.
    const description = input.description?.trim() || null
    const { error: metaError } = await admin
      .from("vault_items")
      .update({ resource_type: input.resource_type, academic_year: input.academic_year, description })
      .in("id", items.map((i) => i.vault_item_id))
    if (metaError) throw new Error(metaError.message)

    for (const communityId of communityIds) await linkSubjectToCommunities(admin, input.subject_id, [communityId])

    const tags = cleanTags(input.tags)
    const rows = communityIds.flatMap((community_id) =>
      items.map((it) => ({
        community_id,
        vault_item_id: it.vault_item_id,
        shared_by_user_id: viewer.userId,
        title: it.title.trim(),
        tags,
        subject_id: input.subject_id,
        module_id: input.module_id ?? null,
        status: "current" as ShareStatus,
        supersedes_share_id: supersedes && supersedes.community_id === community_id ? supersedes.id : null,
      }))
    )

    const { error: insertError } = await admin.from("community_vault_items").insert(rows)
    if (insertError) throw new Error(insertError.message)

    if (supersedes) {
      const { error } = await admin.from("community_vault_items").update({ status: "outdated" }).eq("id", supersedes.id)
      if (error) throw new Error(error.message)
    }

    revalidateGroups()
    return { created: rows.length }
  })
}

// ─── Edit / status / pin / unshare ────────────────────────────────────────────

async function loadShare(admin: Ctx["admin"], shareId: string) {
  const { data } = await admin
    .from("community_vault_items")
    .select("id, community_id, vault_item_id, shared_by_user_id, subject_id, module_id, status")
    .eq("id", shareId)
    .maybeSingle()
  if (!data) throw new Error("Item not found.")
  return data
}

export interface UpdateShareInput {
  title?: string
  tags?: string[]
  description?: string | null
  resource_type?: ResourceType
  academic_year?: string
  subject_id?: string
  module_id?: string | null
}

export async function updateShare(shareId: string, updates: UpdateShareInput): Promise<ActionResult<null>> {
  return run(async () => {
    const { viewer, admin } = await ctx()
    const share = await loadShare(admin, shareId)
    const isSharer = share.shared_by_user_id === viewer.userId
    if (!isSharer && !viewer.isPrivileged) throw new Error("Only the person who shared this, or the HOD, can edit it.")

    const sharePatch: Record<string, unknown> = {}
    const itemPatch: Record<string, unknown> = {}

    if (updates.title !== undefined) {
      if (!updates.title.trim()) throw new Error("Title is required.")
      sharePatch.title = updates.title.trim()
    }
    if (updates.tags !== undefined) sharePatch.tags = cleanTags(updates.tags)
    if (updates.description !== undefined) itemPatch.description = updates.description?.trim() || null
    if (updates.resource_type !== undefined) {
      if (!isResourceType(updates.resource_type)) throw new Error("Invalid resource type.")
      itemPatch.resource_type = updates.resource_type
    }
    if (updates.academic_year !== undefined) {
      if (!ACADEMIC_YEAR_RE.test(updates.academic_year)) throw new Error("Invalid academic year.")
      itemPatch.academic_year = updates.academic_year
    }

    // Moving between subjects/modules: HOD/dev always; the sharer only to classify a legacy "Unsorted" item.
    const classifying = updates.subject_id !== undefined || updates.module_id !== undefined
    if (classifying) {
      if (!viewer.isPrivileged && !(isSharer && share.subject_id === null)) {
        throw new Error("Only the HOD can move items between subjects.")
      }
      const subjectId = updates.subject_id ?? share.subject_id
      if (!subjectId) throw new Error("Choose a subject.")
      const subjectChanged = subjectId !== share.subject_id
      const moduleId = updates.module_id !== undefined ? updates.module_id : subjectChanged ? null : share.module_id
      await assertSubjectAndModule(admin, subjectId, moduleId)
      sharePatch.subject_id = subjectId
      sharePatch.module_id = moduleId
      await linkSubjectToCommunities(admin, subjectId, [share.community_id])
    }

    if (Object.keys(sharePatch).length > 0) {
      const { error } = await admin.from("community_vault_items").update(sharePatch).eq("id", shareId)
      if (error) throw new Error(error.message)
    }
    if (Object.keys(itemPatch).length > 0) {
      const { error } = await admin.from("vault_items").update(itemPatch).eq("id", share.vault_item_id)
      if (error) throw new Error(error.message)
    }

    revalidateGroups()
    return null
  })
}

export async function setShareStatus(shareId: string, status: ShareStatus): Promise<ActionResult<null>> {
  return run(async () => {
    if (!["current", "outdated", "archived"].includes(status)) throw new Error("Invalid status.")
    const { viewer, admin } = await ctx()
    const share = await loadShare(admin, shareId)
    if (share.shared_by_user_id !== viewer.userId && !viewer.isPrivileged) {
      throw new Error("Only the person who shared this, or the HOD, can change its status.")
    }
    const { error } = await admin.from("community_vault_items").update({ status }).eq("id", shareId)
    if (error) throw new Error(error.message)
    revalidateGroups()
    return null
  })
}

export async function setSharePinned(shareId: string, pinned: boolean): Promise<ActionResult<null>> {
  return run(async () => {
    const { viewer, admin } = await ctx()
    if (!viewer.isPrivileged) throw new Error("Only the HOD can pin items.")
    await loadShare(admin, shareId)
    const { error } = await admin.from("community_vault_items").update({ is_pinned: pinned }).eq("id", shareId)
    if (error) throw new Error(error.message)
    revalidateGroups()
    return null
  })
}

export async function removeShare(shareId: string): Promise<ActionResult<null>> {
  return run(async () => {
    const { viewer, admin } = await ctx()
    const share = await loadShare(admin, shareId)
    if (share.shared_by_user_id !== viewer.userId && !viewer.isPrivileged) {
      throw new Error("Only the person who shared this, or the HOD, can unshare it.")
    }
    const { error } = await admin.from("community_vault_items").delete().eq("id", shareId)
    if (error) throw new Error(error.message)
    revalidateGroups()
    return null
  })
}

// ─── Subjects & modules ───────────────────────────────────────────────────────

export interface CreateSubjectInput {
  name: string
  code?: string | null
  semester?: number | null
  scheme?: string | null
  communityIds: string[]
}

export async function findSimilarSubjectsAction(name: string, code: string | null): Promise<ActionResult<SimilarSubject[]>> {
  return run(async () => {
    const { admin } = await ctx()
    return findSimilarSubjects(admin, name ?? "", code?.trim() || null)
  })
}

export async function createSubject(
  input: CreateSubjectInput
): Promise<ActionResult<{ subject: Subject; modules: SubjectModule[] }>> {
  return run(async () => {
    const { viewer, admin } = await ctx()
    if (!(await canContribute(admin, viewer))) throw new Error("Join a community first to add subjects.")

    const name = input.name?.trim()
    if (!name || name.length < 2) throw new Error("Subject name is required.")
    if (name.length > 150) throw new Error("Subject name is too long.")
    const code = input.code?.trim() || null
    const scheme = input.scheme?.trim() || null
    const semester = input.semester ?? null
    if (semester !== null && (!Number.isInteger(semester) || semester < 1 || semester > 8)) {
      throw new Error("Semester must be between 1 and 8.")
    }

    if (code) {
      const { data: dupes } = await admin
        .from("subjects")
        .select("id, name, scheme")
        .ilike("code", code.replace(/[%_\\]/g, (m) => `\\${m}`))
        .is("merged_into_id", null)
      const clash = (dupes ?? []).find((d) => (d.scheme ?? "") === (scheme ?? ""))
      if (clash) throw new Error(`A subject with code ${code}${scheme ? ` (${scheme})` : ""} already exists: ${clash.name}.`)
    }

    const { data: subject, error } = await admin
      .from("subjects")
      .insert({ name, code, semester, scheme, created_by: viewer.userId })
      .select("id, name, short_name, code, semester, scheme")
      .single()
    if (error || !subject) throw new Error(error?.message ?? "Could not create the subject.")

    const { data: modules, error: modError } = await admin
      .from("subject_modules")
      .insert(Array.from({ length: 6 }, (_, i) => ({ subject_id: subject.id, number: i + 1, title: `Module ${i + 1}` })))
      .select("id, subject_id, number, title")
    if (modError) throw new Error(modError.message)

    await linkSubjectToCommunities(admin, subject.id, Array.from(new Set(input.communityIds ?? [])))

    revalidateGroups()
    return {
      subject: subject as Subject,
      modules: ((modules ?? []) as SubjectModule[]).sort((a, b) => a.number - b.number),
    }
  })
}

export async function updateSubject(
  subjectId: string,
  updates: { name?: string; short_name?: string | null; code?: string | null; semester?: number | null; scheme?: string | null }
): Promise<ActionResult<null>> {
  return run(async () => {
    const { viewer, admin } = await ctx()
    const { data: subject } = await admin.from("subjects").select("id, created_by").eq("id", subjectId).maybeSingle()
    if (!subject) throw new Error("Subject not found.")
    if (!viewer.isPrivileged && subject.created_by !== viewer.userId) {
      throw new Error("Only the HOD or the person who added this subject can edit it.")
    }
    const patch: Record<string, unknown> = {}
    if (updates.name !== undefined) {
      if (!updates.name.trim()) throw new Error("Subject name is required.")
      patch.name = updates.name.trim()
    }
    if (updates.short_name !== undefined) patch.short_name = updates.short_name?.trim() || null
    if (updates.code !== undefined) patch.code = updates.code?.trim() || null
    if (updates.scheme !== undefined) patch.scheme = updates.scheme?.trim() || null
    if (updates.semester !== undefined) {
      if (updates.semester !== null && (!Number.isInteger(updates.semester) || updates.semester < 1 || updates.semester > 8)) {
        throw new Error("Semester must be between 1 and 8.")
      }
      patch.semester = updates.semester
    }
    const { error } = await admin.from("subjects").update(patch).eq("id", subjectId)
    if (error) throw new Error(error.message)
    revalidateGroups()
    return null
  })
}

export async function saveSubjectModules(
  subjectId: string,
  modules: { id?: string; number: number; title: string }[]
): Promise<ActionResult<SubjectModule[]>> {
  return run(async () => {
    const { viewer, admin } = await ctx()
    if (!(await canContribute(admin, viewer))) throw new Error("Only community members can edit modules.")
    await assertSubjectAndModule(admin, subjectId, null)

    const numbers = new Set<number>()
    for (const m of modules) {
      if (!Number.isInteger(m.number) || m.number < 1 || m.number > 50) throw new Error("Invalid module number.")
      if (numbers.has(m.number)) throw new Error(`Module ${m.number} appears twice.`)
      numbers.add(m.number)
      if (!m.title?.trim()) throw new Error(`Module ${m.number} needs a name.`)
      if (m.title.length > 150) throw new Error(`Module ${m.number}'s name is too long.`)
    }

    for (const m of modules.filter((x) => x.id)) {
      const { error } = await admin
        .from("subject_modules")
        .update({ title: m.title.trim() })
        .eq("id", m.id as string)
        .eq("subject_id", subjectId)
      if (error) throw new Error(error.message)
    }
    const fresh = modules.filter((x) => !x.id)
    if (fresh.length > 0) {
      const { error } = await admin
        .from("subject_modules")
        .insert(fresh.map((m) => ({ subject_id: subjectId, number: m.number, title: m.title.trim() })))
      if (error) throw new Error(error.message)
    }

    const { data } = await admin
      .from("subject_modules")
      .select("id, subject_id, number, title")
      .eq("subject_id", subjectId)
      .order("number")
    revalidateGroups()
    return (data ?? []) as SubjectModule[]
  })
}

export async function deleteSubjectModule(moduleId: string): Promise<ActionResult<null>> {
  return run(async () => {
    const { viewer, admin } = await ctx()
    if (!viewer.isPrivileged) throw new Error("Only the HOD can delete modules.")
    const { count } = await admin
      .from("community_vault_items")
      .select("id", { count: "exact", head: true })
      .eq("module_id", moduleId)
    if ((count ?? 0) > 0) throw new Error("This module still has shared items. Move them first.")
    const { error } = await admin.from("subject_modules").delete().eq("id", moduleId)
    if (error) throw new Error(error.message)
    revalidateGroups()
    return null
  })
}

/** Moves every share and community link of `sourceId` onto `targetId`, matching modules by number. */
export async function mergeSubjects(sourceId: string, targetId: string): Promise<ActionResult<{ moved: number }>> {
  return run(async () => {
    const { viewer, admin } = await ctx()
    if (!viewer.isPrivileged) throw new Error("Only the HOD can merge subjects.")
    if (sourceId === targetId) throw new Error("Pick a different subject to merge into.")

    const { data: source } = await admin.from("subjects").select("id, merged_into_id").eq("id", sourceId).maybeSingle()
    if (!source) throw new Error("Subject not found.")
    if (source.merged_into_id) throw new Error("This subject was already merged.")

    // Follow a chain of earlier merges so we always land on a live subject.
    let finalTargetId = targetId
    for (let i = 0; i < 5; i++) {
      const { data: t } = await admin.from("subjects").select("id, merged_into_id").eq("id", finalTargetId).maybeSingle()
      if (!t) throw new Error("Target subject not found.")
      if (!t.merged_into_id) break
      finalTargetId = t.merged_into_id
    }
    if (finalTargetId === sourceId) throw new Error("Pick a different subject to merge into.")

    const [{ data: srcModules }, { data: tgtModules }] = await Promise.all([
      admin.from("subject_modules").select("id, number, title").eq("subject_id", sourceId),
      admin.from("subject_modules").select("id, number").eq("subject_id", finalTargetId),
    ])
    const targetByNumber = new Map((tgtModules ?? []).map((m) => [m.number, m.id as string]))

    const moduleMap = new Map<string, string>()
    for (const m of srcModules ?? []) {
      let to = targetByNumber.get(m.number)
      if (!to) {
        const { data: created, error } = await admin
          .from("subject_modules")
          .insert({ subject_id: finalTargetId, number: m.number, title: m.title })
          .select("id")
          .single()
        if (error || !created) throw new Error(error?.message ?? "Could not create a matching module.")
        to = created.id as string
        targetByNumber.set(m.number, to)
      }
      moduleMap.set(m.id, to)
    }

    let moved = 0
    for (const [fromModule, toModule] of moduleMap) {
      const { data, error } = await admin
        .from("community_vault_items")
        .update({ subject_id: finalTargetId, module_id: toModule })
        .eq("subject_id", sourceId)
        .eq("module_id", fromModule)
        .select("id")
      if (error) throw new Error(error.message)
      moved += data?.length ?? 0
    }
    const { data: rest, error: restError } = await admin
      .from("community_vault_items")
      .update({ subject_id: finalTargetId })
      .eq("subject_id", sourceId)
      .select("id")
    if (restError) throw new Error(restError.message)
    moved += rest?.length ?? 0

    const { data: domains } = await admin.from("subject_domains").select("community_id").eq("subject_id", sourceId)
    await linkSubjectToCommunities(
      admin,
      finalTargetId,
      (domains ?? []).map((d) => d.community_id)
    )
    const { error: delError } = await admin.from("subject_domains").delete().eq("subject_id", sourceId)
    if (delError) throw new Error(delError.message)

    const { error: mergeError } = await admin.from("subjects").update({ merged_into_id: finalTargetId }).eq("id", sourceId)
    if (mergeError) throw new Error(mergeError.message)

    revalidateGroups()
    return { moved }
  })
}
