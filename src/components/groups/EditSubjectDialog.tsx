"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateSubject } from "@/actions/groups"
import type { Subject } from "@/types/groups"
import { btnPrimary, btnSecondary, dialogCls, inputCls, labelCls, selectCls } from "./ui"

export function EditSubjectDialog({ subject, onClose }: { subject: Subject; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(subject.name)
  const [shortName, setShortName] = useState(subject.short_name ?? "")
  const [code, setCode] = useState(subject.code ?? "")
  const [semester, setSemester] = useState(subject.semester ? String(subject.semester) : "")
  const [scheme, setScheme] = useState(subject.scheme ?? "")
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const res = await updateSubject(subject.id, {
      name,
      short_name: shortName || null,
      code: code || null,
      semester: semester ? Number(semester) : null,
      scheme: scheme || null,
    })
    setSaving(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success("Subject updated")
    queryClient.invalidateQueries({ queryKey: ["subject", subject.id] })
    queryClient.invalidateQueries({ queryKey: ["communitySubjects"] })
    queryClient.invalidateQueries({ queryKey: ["communityVault"] })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className={`${dialogCls} max-w-md`}>
        <DialogHeader>
          <DialogTitle className="font-heading font-extrabold text-[22px] text-foreground">Edit subject</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className={labelCls}>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Short name</Label>
            <Input value={shortName} onChange={(e) => setShortName(e.target.value)} className={inputCls} placeholder="e.g. OS" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className={labelCls}>Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} />
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
              <Input value={scheme} onChange={(e) => setScheme(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6 gap-3">
          <button type="button" onClick={onClose} disabled={saving} className={btnSecondary}>
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving || !name.trim()} className={btnPrimary}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
