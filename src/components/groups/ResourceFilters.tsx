"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react"
import { RESOURCE_TYPES, resourceTypeLabel, toRomanSemester, type CommunityResource, type CommunitySubject, type SubjectModule } from "@/types/groups"
import { btnSm } from "./ui"

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

const selectCls =
  "w-full h-9 px-2.5 border-[1.5px] border-foreground rounded-[0.6rem] bg-background font-sans text-[12.5px] font-medium shadow-[1.5px_1.5px_0px_black] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 text-foreground cursor-pointer"

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

  // Collapsed by default — search + common quick filters on desktop stay in single toolbar row
  const [expanded, setExpanded] = useState(false)

  const activeCount = useMemo(() => {
    let n = 0
    if (show.includes("subject") && filters.subjectId) n += 1
    if (show.includes("semester") && filters.semester) n += 1
    if (show.includes("scheme") && filters.scheme) n += 1
    if (show.includes("module") && filters.moduleId) n += 1
    if (show.includes("type") && filters.type) n += 1
    if (show.includes("year") && filters.year) n += 1
    if (show.includes("uploader") && filters.uploader) n += 1
    if (filters.showInactive) n += 1
    return n
  }, [show, filters])

  const subjectAvailable = show.includes("subject") && !!subjects && subjects.length > 0
  const semesterAvailable = show.includes("semester") && semesters.length > 0
  const schemeAvailable = show.includes("scheme") && schemes.length > 0
  const moduleAvailable = show.includes("module") && !!modules && modules.length > 0
  const typeAvailable = show.includes("type")
  const yearAvailable = show.includes("year") && years.length > 0
  const uploaderAvailable = show.includes("uploader") && uploaders.length > 0

  return (
    <div className="bg-card p-2 sm:p-2.5 rounded-[1rem] border-[1.5px] border-foreground shadow-[2.5px_2.5px_0px_black] space-y-2">
      {/* Compact Main Toolbar Row */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Search material, tags, subject…"
            aria-label="Search resources"
            className="w-full pl-8 pr-7 h-9 rounded-[0.6rem] border-[1.5px] border-foreground bg-background font-sans text-[13px] shadow-[1.5px_1.5px_0px_black] outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => onChange({ q: "" })}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Type Filter on medium+ screens */}
        {typeAvailable && (
          <div className="hidden md:block w-36 shrink-0">
            <select
              aria-label="Resource type"
              value={filters.type}
              onChange={(e) => onChange({ type: e.target.value })}
              className={selectCls}
            >
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {resourceTypeLabel(t.value)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Subject Filter on medium+ screens */}
        {subjectAvailable && (
          <div className="hidden lg:block w-40 shrink-0">
            <select
              aria-label="Subject"
              value={filters.subjectId}
              onChange={(e) => onChange({ subjectId: e.target.value, moduleId: "" })}
              className={selectCls}
            >
              <option value="">All subjects</option>
              {subjects!.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code ? `${s.code} · ` : ""}{s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filters Toggle Button */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="resource-filters-more"
          className={`h-9 px-3 rounded-[0.6rem] border-[1.5px] border-foreground shadow-[2px_2px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-heading font-bold text-[12px] text-foreground flex items-center gap-1.5 shrink-0 ${
            expanded || activeCount > 0 ? "bg-[#FFD600]" : "bg-card hover:bg-background"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="font-mono text-[10px] px-1 py-0.2 rounded-[4px] bg-foreground text-background font-extrabold">
              {activeCount}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </button>

        {/* Reset button when active */}
        {active && (
          <button
            type="button"
            onClick={() => onChange({ ...emptyFilters })}
            className="h-9 px-2.5 rounded-[0.6rem] border-[1.5px] border-foreground bg-background hover:bg-[#FF3B30] hover:text-white shadow-[1.5px_1.5px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-heading font-bold text-[12px] flex items-center gap-1 shrink-0"
            title="Reset all filters"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Expanded Advanced Filters Drawer */}
      {expanded && (
        <div id="resource-filters-more" className="pt-2.5 border-t-[1.5px] border-dashed border-foreground/30 space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {/* Subject on mobile / tablet if hidden above */}
            {subjectAvailable && (
              <div className="lg:hidden">
                <select
                  aria-label="Subject"
                  value={filters.subjectId}
                  onChange={(e) => onChange({ subjectId: e.target.value, moduleId: "" })}
                  className={selectCls}
                >
                  <option value="">All subjects</option>
                  {subjects!.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code ? `${s.code} · ` : ""}{s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Type on mobile if hidden above */}
            {typeAvailable && (
              <div className="md:hidden">
                <select
                  aria-label="Resource type"
                  value={filters.type}
                  onChange={(e) => onChange({ type: e.target.value })}
                  className={selectCls}
                >
                  <option value="">All types</option>
                  {types.map((t) => (
                    <option key={t.value} value={t.value}>
                      {resourceTypeLabel(t.value)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {moduleAvailable && (
              <div>
                <select
                  aria-label="Module"
                  value={filters.moduleId}
                  onChange={(e) => onChange({ moduleId: e.target.value })}
                  className={selectCls}
                >
                  <option value="">All modules</option>
                  {modules!.map((m) => (
                    <option key={m.id} value={m.id}>
                      Module {m.number}: {m.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {semesterAvailable && (
              <div>
                <select
                  aria-label="Semester"
                  value={filters.semester}
                  onChange={(e) => onChange({ semester: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Any semester</option>
                  {semesters.map((n) => (
                    <option key={n} value={n}>
                      Sem {toRomanSemester(n)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {schemeAvailable && (
              <div>
                <select
                  aria-label="Scheme"
                  value={filters.scheme}
                  onChange={(e) => onChange({ scheme: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Any scheme</option>
                  {schemes.map((s) => (
                    <option key={s} value={s}>
                      Scheme {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {yearAvailable && (
              <div>
                <select
                  aria-label="Academic year"
                  value={filters.year}
                  onChange={(e) => onChange({ year: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Any year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {uploaderAvailable && (
              <div>
                <select
                  aria-label="Uploaded by"
                  value={filters.uploader}
                  onChange={(e) => onChange({ uploader: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Any teacher</option>
                  {uploaders.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 font-sans text-[12.5px] font-medium text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.showInactive}
                onChange={(e) => onChange({ showInactive: e.target.checked })}
                className="rounded accent-foreground w-3.5 h-3.5"
              />
              Show outdated &amp; archived
            </label>

            {active && (
              <button
                type="button"
                onClick={() => onChange({ ...emptyFilters })}
                className="font-heading font-bold text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
