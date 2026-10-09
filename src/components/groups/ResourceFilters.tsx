"use client"

import { useMemo } from "react"
import { Search, X } from "lucide-react"
import { RESOURCE_TYPES, resourceTypeLabel, toRomanSemester, type CommunityResource, type CommunitySubject, type SubjectModule } from "@/types/groups"
import { selectCls } from "./ui"

export interface Filters {
  q: string
  subjectId: string
  semester: string
  scheme: string
  moduleId: string
  type: string
  year: string
  uploader: string
  showInactive: boolean
}

export const emptyFilters: Filters = {
  q: "",
  subjectId: "",
  semester: "",
  scheme: "",
  moduleId: "",
  type: "",
  year: "",
  uploader: "",
  showInactive: false,
}

/** Any filter that narrows individual resources (as opposed to just browsing subjects). */
export function hasResourceFilter(f: Filters): boolean {
  return !!(f.q.trim() || f.subjectId || f.moduleId || f.type || f.year || f.uploader)
}

export function applyFilters(resources: CommunityResource[], f: Filters): CommunityResource[] {
  const q = f.q.trim().toLowerCase()
  return resources.filter((r) => {
    if (!f.showInactive && r.status !== "current") return false
    if (f.subjectId && r.subject?.id !== f.subjectId) return false
    if (f.semester && String(r.subject?.semester ?? "") !== f.semester) return false
    if (f.scheme && (r.subject?.scheme ?? "") !== f.scheme) return false
    if (f.moduleId && r.module?.id !== f.moduleId) return false
    if (f.type && r.resource_type !== f.type) return false
    if (f.year && r.academic_year !== f.year) return false
    if (f.uploader && r.uploaded_by_name !== f.uploader) return false
    if (q) {
      const hay = [
        r.title,
        r.description ?? "",
        r.tags.join(" "),
        r.subject?.code ?? "",
        r.subject?.name ?? "",
        r.module?.title ?? "",
      ]
        .join(" ")
        .toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

const cls = selectCls

export function ResourceFilters({
  filters,
  onChange,
  resources,
  subjects,
  modules,
  show = ["subject", "semester", "scheme", "module", "type", "year", "uploader"],
}: {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  resources: CommunityResource[]
  subjects?: CommunitySubject[]
  modules?: SubjectModule[]
  show?: ("subject" | "semester" | "scheme" | "module" | "type" | "year" | "uploader")[]
}) {
  const years = useMemo(
    () => Array.from(new Set(resources.map((r) => r.academic_year).filter((y): y is string => !!y))).sort().reverse(),
    [resources]
  )
  const uploaders = useMemo(
    () => Array.from(new Set(resources.map((r) => r.uploaded_by_name).filter((n): n is string => !!n))).sort(),
    [resources]
  )
  const types = useMemo(
    () => RESOURCE_TYPES.filter((t) => resources.some((r) => r.resource_type === t.value)),
    [resources]
  )
  const semesters = useMemo(
    () => Array.from(new Set((subjects ?? []).map((s) => s.semester).filter((n): n is number => !!n))).sort((a, b) => a - b),
    [subjects]
  )
  const schemes = useMemo(
    () => Array.from(new Set((subjects ?? []).map((s) => s.scheme).filter((n): n is string => !!n))).sort(),
    [subjects]
  )

  const active = hasResourceFilter(filters) || filters.semester || filters.scheme || filters.showInactive

  return (
    <div className="bg-muted p-3 rounded-[1rem] border-[2px] border-foreground space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder="Search title, description, tags or subject code…"
          aria-label="Search resources"
          className="w-full pl-9 pr-3 h-10 rounded-[0.75rem] border-[2px] border-foreground bg-card font-sans text-[14px] shadow-[2px_2px_0px_black] outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {show.includes("subject") && subjects && (
          <select aria-label="Subject" value={filters.subjectId} onChange={(e) => onChange({ subjectId: e.target.value, moduleId: "" })} className={cls}>
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `${s.code} · ` : ""}
                {s.name}
              </option>
            ))}
          </select>
        )}
        {show.includes("semester") && semesters.length > 0 && (
          <select aria-label="Semester" value={filters.semester} onChange={(e) => onChange({ semester: e.target.value })} className={cls}>
            <option value="">Any semester</option>
            {semesters.map((n) => (
              <option key={n} value={n}>
                Sem {toRomanSemester(n)}
              </option>
            ))}
          </select>
        )}
        {show.includes("scheme") && schemes.length > 0 && (
          <select aria-label="Scheme" value={filters.scheme} onChange={(e) => onChange({ scheme: e.target.value })} className={cls}>
            <option value="">Any scheme</option>
            {schemes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        {show.includes("module") && modules && modules.length > 0 && (
          <select aria-label="Module" value={filters.moduleId} onChange={(e) => onChange({ moduleId: e.target.value })} className={cls}>
            <option value="">All modules</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                Module {m.number}: {m.title}
              </option>
            ))}
          </select>
        )}
        {show.includes("type") && (
          <select aria-label="Resource type" value={filters.type} onChange={(e) => onChange({ type: e.target.value })} className={cls}>
            <option value="">All types</option>
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {resourceTypeLabel(t.value)}
              </option>
            ))}
          </select>
        )}
        {show.includes("year") && years.length > 0 && (
          <select aria-label="Academic year" value={filters.year} onChange={(e) => onChange({ year: e.target.value })} className={cls}>
            <option value="">Any year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
        {show.includes("uploader") && uploaders.length > 0 && (
          <select aria-label="Uploaded by" value={filters.uploader} onChange={(e) => onChange({ uploader: e.target.value })} className={cls}>
            <option value="">Anyone</option>
            {uploaders.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 font-sans text-[13px] font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showInactive}
            onChange={(e) => onChange({ showInactive: e.target.checked })}
            className="accent-black"
          />
          Show outdated &amp; archived
        </label>
        {active && (
          <button
            type="button"
            onClick={() => onChange({ ...emptyFilters })}
            className="font-heading font-bold text-[13px] text-foreground hover:underline flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
