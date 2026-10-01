/* eslint-disable @typescript-eslint/no-explicit-any -- rows come from an untyped Supabase client */
import type { CommunityResource, ResourceType, ShareStatus } from "@/types/groups"

// Columns fetched for every shared item. The nested selects rely on the foreign keys
// community_vault_items → users / subjects / subject_modules / vault_items.
export const RESOURCE_SELECT = `
  id, community_id, vault_item_id, shared_by_user_id, shared_by_name, title, tags, created_at,
  subject_id, module_id, status, is_pinned, supersedes_share_id,
  users ( id, role ),
  subjects ( id, name, short_name, code, semester, scheme ),
  subject_modules ( id, number, title ),
  vault_items ( id, item_type, title, url, resource_type, academic_year, description, uploaded_by_name, files ( filename, mime_type, size_bytes ) )
`

const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null))

/** Turns a raw row into what the browser may see. Never exposes user rows or the dev role. */
export function toResource(row: any): CommunityResource {
  const sharer = one<any>(row.users)
  const sharerIsDev = (sharer?.role ?? "").toLowerCase() === "dev"
  const vi = one<any>(row.vault_items)
  const file = one<any>(vi?.files)
  const subject = one<any>(row.subjects)
  const mod = one<any>(row.subject_modules)

  const isLink = vi?.item_type === "link"
  const title: string = row.title?.trim() || (isLink ? vi?.title : file?.filename) || "Untitled"
  const name: string | null = vi?.uploaded_by_name ?? row.shared_by_name ?? null

  return {
    id: row.id,
    community_id: row.community_id,
    vault_item_id: row.vault_item_id,
    title,
    description: vi?.description ?? null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    created_at: row.created_at,
    status: (row.status ?? "current") as ShareStatus,
    is_pinned: !!row.is_pinned,
    supersedes_share_id: row.supersedes_share_id ?? null,
    subject: subject
      ? {
          id: subject.id,
          name: subject.name,
          short_name: subject.short_name ?? null,
          code: subject.code ?? null,
          semester: subject.semester ?? null,
          scheme: subject.scheme ?? null,
        }
      : null,
    module: mod ? { id: mod.id, number: mod.number, title: mod.title } : null,
    resource_type: (vi?.resource_type ?? null) as ResourceType | null,
    academic_year: vi?.academic_year ?? null,
    item_type: isLink ? "link" : "file",
    url: isLink ? (vi?.url ?? null) : null,
    file: file
      ? { filename: file.filename, mime_type: file.mime_type ?? null, size_bytes: file.size_bytes ?? null }
      : null,
    // The hidden dev role is shown as a generic name, matching the database trigger.
    uploaded_by_name: sharerIsDev ? "Faculty Member" : name,
    shared_by_user_id: sharerIsDev ? null : (row.shared_by_user_id ?? null),
  }
}

