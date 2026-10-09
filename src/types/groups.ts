export type PlatformRole = "admin" | "user"
export type CommunityRole = "owner" | "curator" | "member" | "viewer" | "hod" | "faculty"

export interface CommunityPermissions {
  role: "owner" | "curator" | "member" | "viewer"
  isPlatformAdmin: boolean
  isOwner: boolean
  isCurator: boolean
  isMember: boolean
  isViewer: boolean
  canEditCommunity: boolean
  canDeleteCommunity: boolean
  canManageSettings: boolean
  canManageMembers: boolean
  canAppointCurator: boolean
  canUploadContent: boolean
  canPinContent: boolean
  canCreateSubject: boolean
  canDeleteModule: boolean
  canMergeSubjects: boolean
}

export type ResourceType =
  | "lecture_notes"
  | "lecture_ppt"
  | "lab_manual"
  | "question_bank"
  | "previous_papers"
  | "assignment"
  | "solutions"
  | "case_study"
  | "video"
  | "reference"
  | "other"

export const RESOURCE_TYPES: { value: ResourceType; label: string; plural: string }[] = [
  { value: "lecture_notes", label: "Lecture notes", plural: "Lecture notes" },
  { value: "lecture_ppt", label: "Lecture PPT", plural: "Lecture PPTs" },
  { value: "lab_manual", label: "Lab manual", plural: "Lab manuals" },
  { value: "question_bank", label: "Question bank", plural: "Question banks" },
  { value: "previous_papers", label: "Previous papers", plural: "Previous papers" },
  { value: "assignment", label: "Assignment", plural: "Assignments" },
  { value: "solutions", label: "Solutions", plural: "Solutions" },
  { value: "case_study", label: "Case study", plural: "Case studies" },
  { value: "video", label: "Video", plural: "Videos" },
  { value: "reference", label: "Reference", plural: "References" },
  { value: "other", label: "Other", plural: "Other" },
]

export const RESOURCE_TYPE_VALUES = RESOURCE_TYPES.map((t) => t.value)

export function normalizeResourceType(value: string | null | undefined): ResourceType | null {
  if (!value) return null
  if (value === "ppt") return "lecture_ppt"
  return (RESOURCE_TYPE_VALUES.includes(value as ResourceType) ? value : "other") as ResourceType
}

export function resourceTypeLabel(value: string | null | undefined): string {
  const norm = normalizeResourceType(value)
  return RESOURCE_TYPES.find((t) => t.value === norm)?.label ?? "Unclassified"
}

export type ShareStatus = "current" | "outdated" | "archived"

export const SCHEMES = ["C-Scheme", "NEP-2020"] as const
export type Scheme = (typeof SCHEMES)[number]

export const SUBJECT_TYPES = [
  { value: "theory", label: "Theory" },
  { value: "lab", label: "Lab" },
] as const
export type SubjectType = (typeof SUBJECT_TYPES)[number]["value"]

export const SEMESTERS = [
  { value: 3, label: "III", roman: "III" },
  { value: 4, label: "IV", roman: "IV" },
  { value: 5, label: "V", roman: "V" },
  { value: 6, label: "VI", roman: "VI" },
  { value: 7, label: "VII", roman: "VII" },
  { value: 8, label: "VIII", roman: "VIII" },
] as const

const ROMAN_SEMESTERS: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
}

export function toRomanSemester(sem: number | string | null | undefined): string {
  if (!sem) return ""
  const n = typeof sem === "string" ? parseInt(sem, 10) : sem
  return ROMAN_SEMESTERS[n] ?? String(sem)
}

export interface Subject {
  id: string
  name: string
  short_name: string | null
  code: string | null
  semester: number | null
  scheme: Scheme | string | null
  subject_type?: SubjectType | null
}

export interface SubjectModule {
  id: string
  subject_id: string
  number: number
  title: string
}

/** A subject plus the communities it belongs to (used by the search combobox). */
export interface SubjectSearchResult extends Subject {
  community_ids: string[]
}

/** A subject as listed inside one community. */
export interface CommunitySubject extends Subject {
  resource_count: number
  module_count: number
}

export interface SimilarSubject extends Subject {
  reason: "same_code" | "similar_name"
}

/** One shared file/link in a community, as sent to the browser. */
export interface CommunityResource {
  id: string
  community_id: string
  vault_item_id: string
  title: string
  description: string | null
  tags: string[]
  created_at: string
  status: ShareStatus
  is_pinned: boolean
  supersedes_share_id: string | null
  subject: Subject | null
  module: { id: string; number: number; title: string } | null
  resource_type: ResourceType | null
  academic_year: string | null
  item_type: "file" | "link"
  url: string | null
  file: { filename: string; mime_type: string | null; size_bytes: number | null } | null
  /** Shown as "Uploaded by …". Null when unknown (and always null for the hidden dev role). */
  uploaded_by_name: string | null
  /** Sharer's user id, so the browser can tell "my" shares. Null for the hidden dev role. */
  shared_by_user_id: string | null
}

export interface CommunityViewer {
  viewer_id: string
  /** HOD or dev: curator powers in every community. */
  can_manage: boolean
}

/** July onward belongs to the academic year starting that calendar year, e.g. 2025-26. */
export function currentAcademicYear(date: Date = new Date()): string {
  const start = date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`
}

/** Academic years offered in pickers: the next one, the current one and the previous five. */
export function academicYearOptions(date: Date = new Date()): string[] {
  const current = Number(currentAcademicYear(date).slice(0, 4))
  const out: string[] = []
  for (let y = current + 1; y >= current - 5; y--) {
    out.push(`${y}-${String((y + 1) % 100).padStart(2, "0")}`)
  }
  return out
}

export const ACADEMIC_YEAR_RE = /^\d{4}-\d{2}$/

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

export interface ShareConflict {
  /** Index into the items array that was checked. */
  itemIndex: number
  communityId: string
  kind: "same_item" | "same_hash"
  /** Where the existing copy lives, e.g. "Operating Systems › Module 2". */
  location: string
}
