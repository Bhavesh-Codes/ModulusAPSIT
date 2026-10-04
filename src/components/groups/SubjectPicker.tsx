"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, BookOpen, Check, Loader2, Plus, Search, X } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSubject, findSimilarSubjectsAction } from "@/actions/groups"
import type { SimilarSubject, Subject, SubjectModule, SubjectSearchResult } from "@/types/groups"
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

export function subjectLabel(s: Pick<Subject, "name" | "code" | "semester" | "scheme">) {
  const bits = [s.code, s.semester ? `Sem ${s.semester}` : null, s.scheme].filter(Boolean)
  return bits.length ? `${s.name} · ${bits.join(" · ")}` : s.name
}

// Search-first subject picker. "Create new subject" is only offered once matches have been shown.
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

  const { data, isFetching, isError } = useQuery({
    queryKey: ["subjectSearch", debounced, communityIds.join(",")],
    enabled: open && !disabled,
    queryFn: async (): Promise<SubjectSearchResult[]> => {
      const res = await fetch(
        `/api/subjects?q=${encodeURIComponent(debounced)}&community_ids=${communityIds.join(",")}`
      )
      if (!res.ok) throw new Error("Search failed")
      return (await res.json()).data
    },
  })

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
          <Check className="w-4 h-4 text-[#00C853]" /> “{createdFor.subject.name}” created. Name its modules:
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
    return (
      <div className="flex items-center justify-between gap-2 border-[2px] border-foreground rounded-[0.75rem] bg-card px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 shrink-0 text-[#0057FF]" />
          <span className="font-sans text-[14px] font-medium truncate">{subjectLabel(value)}</span>
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

  const results = (data ?? []).filter(
    (s) => communityIds.length === 0 || s.community_ids.some((c) => communityIds.includes(c))
  )
  const searched = open && !isFetching && !isError && data !== undefined
  // Only offer creation once the user has looked at the matches for a real query.
  const canOfferCreate = allowCreate && searched && debounced.trim().length >= 2

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={disabled ? "Choose a community first" : "Search by subject name or code…"}
          aria-label="Search subjects"
          className={`${inputCls} pl-9 pr-8`}
        />
        {query ? (
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
        <div className="border-[2px] border-foreground rounded-[0.75rem] bg-card max-h-56 overflow-y-auto">
          {isFetching && !data ? (
            <div className="p-3 flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching…
            </div>
          ) : isError ? (
            <div className="p-3 text-[13px] text-[#FF3B30]">Could not search subjects. Try again.</div>
          ) : results.length === 0 ? (
            <div className="p-3 text-[13px] text-muted-foreground">
              {debounced.trim() ? "No subject matches that search in this group." : "Start typing a subject name or code."}
            </div>
          ) : (
            <ul>
              {results.map((s) => {
                const inGroup = s.community_ids.some((c) => communityIds.includes(c))
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => pick(s)}
                      className="w-full text-left px-3 py-2 hover:bg-[#FFD600]/30 flex items-center justify-between gap-2 border-b border-border last:border-b-0"
                    >
                      <span className="font-sans text-[14px] font-medium">{subjectLabel(s)}</span>
                      {inGroup && communityIds.length > 1 && (
                        <span className="shrink-0 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-foreground bg-background">
                          In this group
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {canOfferCreate && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="w-full text-left px-3 py-2.5 border-t-[2px] border-foreground bg-background font-heading font-bold text-[13px] flex items-center gap-2 hover:bg-[#FFD600]/30"
            >
              <Plus className="w-4 h-4" /> Create new subject “{debounced.trim()}”
            </button>
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
      <div className="font-heading font-extrabold text-[15px]">New subject</div>

      {similar.length > 0 && (
        <div className="rounded-[0.75rem] border-[2px] border-[#FF6B00] bg-[#FF6B00]/10 p-3 space-y-2">
          <div className="flex items-center gap-2 font-heading font-bold text-[13px]">
            <AlertTriangle className="w-4 h-4 text-[#FF6B00]" />
            {similar.some((s) => s.reason === "same_code") ? "A subject with this code already exists" : "This looks like an existing subject"}
          </div>
          {similar.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2">
              <span className="font-sans text-[13px]">{subjectLabel(s)}</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className={labelCls}>Subject code</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} placeholder="e.g. ITC401" />
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Semester</Label>
          <select value={semester} onChange={(e) => setSemester(e.target.value)} className={selectCls}>
            <option value="">—</option>
            {Array.from({ length: 8 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Scheme</Label>
          <Input value={scheme} onChange={(e) => setScheme(e.target.value)} className={inputCls} placeholder="e.g. R-2019" />
        </div>
      </div>
      <p className="font-sans text-[12px] text-muted-foreground">
        The code is optional but helps others find the subject and avoids duplicates.
      </p>
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
