"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, ArrowRight, BookOpen, Check, FlaskConical, Loader2, MapPin, Plus, Search, X } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSubject, findSimilarSubjectsAction } from "@/actions/groups"
import { SCHEMES, SEMESTERS, SUBJECT_TYPES, toRomanSemester, type SimilarSubject, type Subject, type SubjectModule, type SubjectSearchResult, type SubjectType } from "@/types/groups"
import type { SubjectSearchResultWithCommunities } from "@/lib/server/subjects"
import { ModuleEditor } from "./ModuleEditor"
import { btnPrimary, btnSecondary, btnSm, inputCls, labelCls, selectCls } from "./ui"

function useDebounced<T>(value: T, ms = 250): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export function subjectLabel(s: Pick<Subject, "name" | "code" | "semester" | "scheme"> & { subject_type?: string | null }) {
  const typeBadge = s.subject_type === "lab" ? "Lab" : null
  const bits = [s.code, s.semester ? `Sem ${toRomanSemester(s.semester)}` : null, s.scheme, typeBadge].filter(Boolean)
  return bits.length ? `${s.name} · ${bits.join(" · ")}` : s.name
}

export function SubjectMetaBadges({
  subject: s,
}: {
  subject: Pick<Subject, "code" | "semester" | "scheme"> & { subject_type?: string | null }
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {s.code && (
        <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded-[4px] bg-muted text-foreground border border-border">
          {s.code}
        </span>
      )}
      {s.semester && (
        <span className="font-mono text-[11px] font-medium px-1.5 py-0.5 rounded-[4px] bg-background text-muted-foreground border border-border whitespace-nowrap">
          Sem {toRomanSemester(s.semester)}
        </span>
      )}
      {s.scheme && (
        <span className="font-mono text-[11px] font-medium px-1.5 py-0.5 rounded-[4px] bg-background text-muted-foreground border border-border whitespace-nowrap">
          {s.scheme}
        </span>
      )}
    </div>
  )
}

export function SubjectItemContent({
  subject: s,
}: {
  subject: Pick<Subject, "name" | "code" | "semester" | "scheme"> & {
    subject_type?: string | null
    short_name?: string | null
  }
}) {
  const isLab = s.subject_type === "lab"
  return (
    <div className="min-w-0 flex-1 space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-heading font-bold text-[14px] text-foreground tracking-tight leading-snug truncate" title={s.name}>
          {s.name}
        </span>
        {isLab ? (
          <span className="shrink-0 font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-[4px] bg-[#0057FF]/15 text-[#0057FF] border border-[#0057FF]/30">
            Lab
          </span>
        ) : s.subject_type === "theory" ? (
          <span className="shrink-0 font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-[4px] bg-muted text-muted-foreground border border-border">
            Theory
          </span>
        ) : null}
      </div>
      <SubjectMetaBadges subject={s} />
    </div>
  )
}


// Search-first subject picker. Shows in-domain results first, then cross-domain hints.
export function SubjectPicker({
  value,
  onChange,
  communityIds,
  disabled = false,
  allowCreate = true,
}: {
  value: Subject | null
  onChange: (subject: Subject | null) => void
  communityIds: string[]
  disabled?: boolean
  allowCreate?: boolean
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createdFor, setCreatedFor] = useState<{ subject: Subject; modules: SubjectModule[] } | null>(null)
  const debounced = useDebounced(query)

  // Use cross-domain search whenever we're inside a community
  const { data: crossData, isFetching, isError } = useQuery({
    queryKey: ["subjectSearch", debounced, communityIds.join(","), "cross"],
    enabled: open && !disabled && communityIds.length > 0,
    queryFn: async (): Promise<{ inDomain: SubjectSearchResultWithCommunities[]; otherDomain: SubjectSearchResultWithCommunities[] }> => {
      const res = await fetch(
        `/api/subjects?q=${encodeURIComponent(debounced)}&community_ids=${communityIds.join(",")}&cross=1`
      )
      if (!res.ok) throw new Error("Search failed")
      return res.json()
    },
  })

  // Fallback for when no community filter is active
  const { data: simpleData, isFetching: simpleFetching, isError: simpleError } = useQuery({
    queryKey: ["subjectSearch", debounced, ""],
    enabled: open && !disabled && communityIds.length === 0,
    queryFn: async (): Promise<SubjectSearchResult[]> => {
      const res = await fetch(`/api/subjects?q=${encodeURIComponent(debounced)}`)
      if (!res.ok) throw new Error("Search failed")
      return (await res.json()).data
    },
  })

  const inDomain: SubjectSearchResultWithCommunities[] =
    communityIds.length > 0
      ? (crossData?.inDomain ?? [])
      : (simpleData ?? []).map((s) => ({ ...s, community_names: [], is_other_domain: false }))

  const otherDomain: SubjectSearchResultWithCommunities[] =
    communityIds.length > 0 ? (crossData?.otherDomain ?? []) : []

  const loading = communityIds.length > 0 ? isFetching : simpleFetching
  const hasError = communityIds.length > 0 ? isError : simpleError
  const dataReady = communityIds.length > 0 ? crossData !== undefined : simpleData !== undefined

  const pick = (s: Subject) => {
    onChange(s)
    setOpen(false)
    setCreating(false)
    setQuery("")
  }

  if (createdFor) {
    return (
      <div className="border-[2px] border-foreground rounded-[1rem] p-4 bg-background space-y-3">
        <div className="font-heading font-bold text-[14px] flex items-center gap-2">
          <Check className="w-4 h-4 text-[#00C853]" /> "{createdFor.subject.name}" created. Name its modules:
        </div>
        <ModuleEditor
          subjectId={createdFor.subject.id}
          modules={createdFor.modules}
          onSkip={() => {
            pick(createdFor.subject)
            setCreatedFor(null)
          }}
          onSaved={() => {
            pick(createdFor.subject)
            setCreatedFor(null)
          }}
        />
      </div>
    )
  }
  if (value && !open) {
    const isLab = value.subject_type === "lab"
    return (
      <div className="w-full flex items-center justify-between gap-3 border-[2px] border-foreground rounded-[0.875rem] bg-card p-3 shadow-[2px_2px_0px_black] min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-9 h-9 shrink-0 rounded-[8px] border-[1.5px] border-foreground flex items-center justify-center ${
              isLab ? "bg-[#0057FF]/15 text-[#0057FF]" : "bg-[#FFD600]/30 text-foreground"
            }`}
          >
            {isLab ? <FlaskConical className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          </div>
          <SubjectItemContent subject={value} />
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={() => {
              setOpen(true)
              onChange(null)
            }}
            className={btnSm}
          >
            Change
          </button>
        )}
      </div>
    )
  }

  const searched = open && !loading && !hasError && dataReady
  const hasQuery = debounced.trim().length >= 2
  const noInDomainResults = searched && inDomain.length === 0
  // Always show Create button when searched. Emphasise it when no in-domain results found.
  const canOfferCreate = allowCreate && searched && hasQuery

  return (
    <div className="space-y-2 w-full min-w-0">
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (creating) setCreating(false)
          }}
          onFocus={() => {
            setOpen(true)
            if (creating) setCreating(false)
          }}
          placeholder={disabled ? "Choose a community first" : "Search by subject name or code…"}
          aria-label="Search subjects"
          className={`${inputCls} pl-9 pr-8 w-full`}
        />
        {creating ? (
          <button
            type="button"
            onClick={() => setCreating(false)}
            aria-label="Close create subject"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-4 h-4" />
          </button>
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("")
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setQuery("")
            }}
            aria-label="Cancel change"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {open && !disabled && !creating && (
        <div className="border-[2px] border-foreground rounded-[0.75rem] bg-card max-h-72 overflow-y-auto overflow-x-hidden w-full divide-y divide-border shadow-[2px_2px_0px_black]">
          {loading && !dataReady ? (
            <div className="p-3 flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching…
            </div>
          ) : hasError ? (
            <div className="p-3 text-[13px] text-[#FF3B30]">Could not search subjects. Try again.</div>
          ) : (
            <>
              {/* ── In-domain results ─────────────────────────────── */}
              {inDomain.length > 0 ? (
                <ul className="divide-y divide-border">
                  {inDomain.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => pick(s)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-[#FFD600]/25 transition-colors flex items-center justify-between gap-3 group"
                      >
                        <SubjectItemContent subject={s} />
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0 -translate-x-1 group-hover:translate-x-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3.5 py-3 text-[13px] text-muted-foreground">
                  {hasQuery
                    ? "No subject matches that search in this group."
                    : "Start typing a subject name or code."}
                </div>
              )}

              {/* ── Cross-domain hint ─────────────────────────────── */}
              {otherDomain.length > 0 && (
                <div className="border-t-[2px] border-dashed border-border">
                  <div className="px-3.5 pt-2.5 pb-1 font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Found in other groups
                  </div>
                  <ul className="divide-y divide-border">
                    {otherDomain.map((s) => (
                      <li key={s.id}>
                        <div className="px-3.5 py-2.5 hover:bg-muted/20 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <SubjectItemContent subject={s} />
                            {s.community_ids.length <= 1 ? (
                              <a
                                href={`/groups/${s.community_ids[0] || ""}`}
                                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-foreground/30 bg-background font-sans text-[11px] font-semibold text-foreground hover:bg-[#FFD600] hover:border-foreground transition-all shadow-[1px_1px_0px_black] whitespace-nowrap mt-0.5"
                                title={`Switch to group: ${s.community_names[0] || ""}`}
                              >
                                <span>Switch group</span>
                                <ArrowRight className="w-3 h-3" />
                              </a>
                            ) : (
                              <div className="shrink-0 flex items-center gap-1 mt-0.5">
                                {s.community_ids.map((cId, idx) => (
                                  <a
                                    key={cId}
                                    href={`/groups/${cId}`}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] border border-foreground/30 bg-background font-sans text-[10px] font-semibold text-foreground hover:bg-[#FFD600] hover:border-foreground transition-all shadow-[1px_1px_0px_black] whitespace-nowrap"
                                    title={`Switch to: ${s.community_names[idx] || "group"}`}
                                  >
                                    <span>Switch</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="font-sans text-[11px] text-muted-foreground truncate mt-1.5" title={s.community_names.join(", ")}>
                            In group: <span className="font-medium text-foreground/80">{s.community_names.join(", ") || "Other group"}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Create new subject ────────────────────────────── */}
              {canOfferCreate && (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className={`w-full text-left px-3 py-2.5 border-t-[2px] border-foreground font-heading font-bold text-[13px] flex items-center gap-2 transition-colors ${
                    noInDomainResults
                      ? "bg-[#FFD600]/20 hover:bg-[#FFD600]/50 text-foreground"
                      : "bg-background hover:bg-[#FFD600]/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Plus className={`w-4 h-4 ${noInDomainResults ? "text-foreground" : ""}`} />
                  {noInDomainResults ? (
                    <span>
                      Not found? <strong>Create "{debounced.trim()}"</strong> as a new subject
                    </span>
                  ) : (
                    <span>Create new subject "{debounced.trim()}"</span>
                  )}
                </button>
              )}

              {/* ── Always show a subtle Create button even with no query ─── */}
              {allowCreate && searched && !hasQuery && (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="w-full text-left px-3 py-2 border-t border-border font-sans text-[12px] text-muted-foreground flex items-center gap-1.5 hover:bg-[#FFD600]/20 hover:text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add a new subject
                </button>
              )}
            </>
          )}
        </div>
      )}

      {creating && (
        <CreateSubjectForm
          initialName={debounced.trim()}
          communityIds={communityIds}
          onCancel={() => setCreating(false)}
          onUseExisting={(s) => pick(s)}
          onCreated={(r) => {
            setCreating(false)
            setCreatedFor(r)
          }}
        />
      )}
    </div>
  )
}


function CreateSubjectForm({
  initialName,
  communityIds,
  onCancel,
  onUseExisting,
  onCreated,
}: {
  initialName: string
  communityIds: string[]
  onCancel: () => void
  onUseExisting: (s: Subject) => void
  onCreated: (r: { subject: Subject; modules: SubjectModule[] }) => void
}) {
  const [name, setName] = useState(initialName)
  const [code, setCode] = useState("")
  const [semester, setSemester] = useState("")
  const [scheme, setScheme] = useState("")
  const [subjectType, setSubjectType] = useState<SubjectType>("theory")
  const [saving, setSaving] = useState(false)
  const [similarFound, setSimilar] = useState<SimilarSubject[]>([])

  const dName = useDebounced(name, 400)
  const dCode = useDebounced(code, 400)

  const shouldSearch = dName.trim().length >= 2 || !!dCode.trim()

  useEffect(() => {
    let cancelled = false
    if (!shouldSearch) return
    findSimilarSubjectsAction(dName, dCode.trim() || null).then((res) => {
      if (!cancelled && res.ok) setSimilar(res.data)
    })
    return () => {
      cancelled = true
    }
  }, [dName, dCode, shouldSearch])

  const similar = shouldSearch ? similarFound : []

  const submit = async () => {
    setSaving(true)
    const res = await createSubject({
      name,
      code: code.trim() || null,
      semester: semester ? Number(semester) : null,
      scheme: scheme.trim() || null,
      subject_type: subjectType,
      communityIds,
    })
    setSaving(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    onCreated(res.data)
  }

  return (
    <div className="border-[2px] border-foreground rounded-[1rem] p-4 bg-background space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-heading font-extrabold text-[15px]">New subject</div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="w-7 h-7 rounded-full border border-foreground/40 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {similar.length > 0 && (
        <div className="rounded-[0.75rem] border-[2px] border-[#FF6B00] bg-[#FF6B00]/10 p-3 space-y-2">
          <div className="flex items-center gap-2 font-heading font-bold text-[13px]">
            <AlertTriangle className="w-4 h-4 text-[#FF6B00]" />
            {similar.some((s) => s.reason === "same_code") ? "A subject with this code already exists" : "This looks like an existing subject"}
          </div>
          {similar.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-[0.5rem] bg-background/60 border border-[#FF6B00]/30">
              <SubjectItemContent subject={s} />
              <button type="button" onClick={() => onUseExisting(s)} className={btnSm}>
                Use this
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <Label className={labelCls}>Subject name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Operating Systems" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className={labelCls}>Subject code</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} placeholder="e.g. ITC401" />
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Type</Label>
          <select value={subjectType} onChange={(e) => setSubjectType(e.target.value as SubjectType)} className={selectCls}>
            {SUBJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Semester</Label>
          <select value={semester} onChange={(e) => setSemester(e.target.value)} className={selectCls}>
            <option value="">—</option>
            {SEMESTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Scheme</Label>
          <select value={scheme} onChange={(e) => setScheme(e.target.value)} className={selectCls}>
            <option value="">—</option>
            {SCHEMES.map((sch) => (
              <option key={sch} value={sch}>
                {sch}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
        <button type="button" onClick={submit} disabled={saving || name.trim().length < 2} className={btnPrimary}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create subject
        </button>
      </div>
    </div>
  )
}
