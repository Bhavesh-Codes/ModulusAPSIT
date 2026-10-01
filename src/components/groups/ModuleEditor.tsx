"use client"

import { useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { saveSubjectModules, deleteSubjectModule } from "@/actions/groups"
import type { SubjectModule } from "@/types/groups"
import { btnPrimary, btnSecondary, btnSm, inputCls } from "./ui"

interface Row {
  id?: string
  number: number
  title: string
}

// Edit the real syllabus module names of a subject. Anyone who can contribute may rename or add modules.
export function ModuleEditor({
  subjectId,
  modules,
  canDelete = false,
  onSaved,
  onSkip,
  skipLabel = "Later",
}: {
  subjectId: string
  modules: SubjectModule[]
  canDelete?: boolean
  onSaved: (modules: SubjectModule[]) => void
  onSkip?: () => void
  skipLabel?: string
}) {
  const [rows, setRows] = useState<Row[]>(
    [...modules].sort((a, b) => a.number - b.number).map((m) => ({ id: m.id, number: m.number, title: m.title }))
  )
  const [saving, setSaving] = useState(false)

  const update = (number: number, title: string) =>
    setRows((prev) => prev.map((r) => (r.number === number ? { ...r, title } : r)))

  const addRow = () =>
    setRows((prev) => {
      const next = prev.length ? Math.max(...prev.map((r) => r.number)) + 1 : 1
      return [...prev, { number: next, title: `Module ${next}` }]
    })

  const removeRow = async (row: Row) => {
    if (!row.id) {
      setRows((prev) => prev.filter((r) => r !== row))
      return
    }
    if (!window.confirm(`Delete Module ${row.number}?`)) return
    const res = await deleteSubjectModule(row.id)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id))
  }

  const save = async () => {
    setSaving(true)
    const res = await saveSubjectModules(subjectId, rows)
    setSaving(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success("Module names saved")
    onSaved(res.data)
  }

  return (
    <div className="space-y-3">
      <p className="font-sans text-[13px] text-muted-foreground">
        Enter the module names from the syllabus so everyone files material under the right module.
      </p>
      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
        {rows.map((row) => (
          <div key={row.number} className="flex items-center gap-2">
            <span className="w-8 shrink-0 font-mono text-[12px] font-bold text-muted-foreground text-right">{row.number}.</span>
            <Input
              value={row.title}
              onChange={(e) => update(row.number, e.target.value)}
              aria-label={`Module ${row.number} name`}
              className={`${inputCls} h-9 flex-1`}
            />
            {(canDelete || !row.id) && (
              <button
                type="button"
                onClick={() => removeRow(row)}
                aria-label={`Delete module ${row.number}`}
                className="w-8 h-8 shrink-0 rounded-[8px] border-[1.5px] border-foreground bg-card hover:bg-[#FF3B30] hover:text-white flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button type="button" onClick={addRow} className={btnSm}>
          <Plus className="w-3.5 h-3.5" /> Add module
        </button>
        <div className="flex gap-2">
          {onSkip && (
            <button type="button" onClick={onSkip} className={btnSecondary}>
              {skipLabel}
            </button>
          )}
          <button type="button" onClick={save} disabled={saving || rows.some((r) => !r.title.trim())} className={btnPrimary}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save names
          </button>
        </div>
      </div>
    </div>
  )
}
