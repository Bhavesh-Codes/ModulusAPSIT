"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Label } from "@/components/ui/label"
import {
  RESOURCE_TYPES,
  academicYearOptions,
  type ResourceType,
  type Subject,
  type SubjectModule,
} from "@/types/groups"
import { ModuleEditor } from "./ModuleEditor"
import { SubjectPicker } from "./SubjectPicker"
import { btnSm, labelCls, selectCls } from "./ui"

export interface Classification {
  subject: Subject | null
  /** undefined = not chosen yet, null = "General / whole subject", string = module id */
  moduleChoice: string | null | undefined
  resourceType: ResourceType | ""
  year: string
}

const GENERAL = "__general__"

export function useSubjectDetail(subjectId: string | null | undefined) {
  return useQuery({
    queryKey: ["subject", subjectId],
    enabled: !!subjectId,
    queryFn: async (): Promise<{
      subject: Subject & { merged_into_id: string | null; created_by?: string | null }
      modules: SubjectModule[]
    }> => {
      const res = await fetch(`/api/subjects/${subjectId}`)
      if (!res.ok) throw new Error("Failed to load subject")
      return (await res.json()).data
    },
  })
}

// Subject → module → resource type → academic year. Shared by the share dialog and the edit dialog.
export function ClassificationFields({
  value,
  onChange,
  communityIds,
  lockSubject = false,
  showSubject = true,
  showModule = true,
}: {
  value: Classification
  onChange: (patch: Partial<Classification>) => void
  communityIds: string[]
  lockSubject?: boolean
  showSubject?: boolean
  showModule?: boolean
}) {
  const queryClient = useQueryClient()
  const detail = useSubjectDetail(value.subject?.id)
  const [editingModules, setEditingModules] = useState(false)
  const modules = detail.data?.modules ?? []

  return (
    <div className="space-y-5">
      {showSubject && (
        <div className="space-y-2">
          <Label className={labelCls}>
            Subject <span className="text-[#FF3B30]">*</span>
          </Label>
          <SubjectPicker
            value={value.subject}
            onChange={(subject) => onChange({ subject, moduleChoice: undefined })}
            communityIds={communityIds}
            disabled={lockSubject || communityIds.length === 0}
          />
        </div>
      )}

      {value.subject && showModule && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className={labelCls}>
              Module <span className="text-[#FF3B30]">*</span>
            </Label>
            <button type="button" onClick={() => setEditingModules((v) => !v)} className={btnSm}>
              {editingModules ? "Close" : "Edit module names"}
            </button>
          </div>
          {editingModules && detail.data ? (
            <div className="border-[2px] border-foreground rounded-[1rem] p-4 bg-background">
              <ModuleEditor
                subjectId={detail.data.subject.id}
                modules={modules}
                onSaved={() => {
                  queryClient.invalidateQueries({ queryKey: ["subject", value.subject?.id] })
                  setEditingModules(false)
                }}
                onSkip={() => setEditingModules(false)}
                skipLabel="Cancel"
              />
            </div>
          ) : (
            <select
              value={value.moduleChoice === undefined ? "" : value.moduleChoice === null ? GENERAL : value.moduleChoice}
              onChange={(e) => {
                const v = e.target.value
                onChange({ moduleChoice: v === "" ? undefined : v === GENERAL ? null : v })
              }}
              className={selectCls}
              aria-label="Module"
            >
              <option value="">Choose a module…</option>
              <option value={GENERAL}>General / whole subject</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  Module {m.number}: {m.title}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label className={labelCls}>
          Resource type <span className="text-[#FF3B30]">*</span>
        </Label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Resource type">
          {RESOURCE_TYPES.map((t) => {
            const active = value.resourceType === t.value
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ resourceType: t.value })}
                className={`px-3 py-1.5 rounded-[100px] border-[2px] border-foreground font-heading font-bold text-[13px] transition-colors ${
                  active ? "bg-[#FFD600] text-foreground shadow-[2px_2px_0px_black]" : "bg-card text-foreground hover:bg-background"
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2 max-w-[12rem]">
        <Label className={labelCls}>
          Academic year <span className="text-[#FF3B30]">*</span>
        </Label>
        <select value={value.year} onChange={(e) => onChange({ year: e.target.value })} className={selectCls} aria-label="Academic year">
          {academicYearOptions().map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
