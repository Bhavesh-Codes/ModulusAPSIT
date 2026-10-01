"use client"

import { useState } from "react"
import { GitMerge, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { mergeSubjects } from "@/actions/groups"
import type { Subject } from "@/types/groups"
import { SubjectPicker, subjectLabel } from "./SubjectPicker"
import { btnPrimary, btnSecondary, dialogCls } from "./ui"

// HOD/dev only: move everything from this subject into another one, then hide this one.
export function MergeSubjectDialog({
  source,
  communityId,
  onClose,
  onMerged,
}: {
  source: Subject
  communityId: string
  onClose: () => void
  onMerged: (target: Subject) => void
}) {
  const [target, setTarget] = useState<Subject | null>(null)
  const [busy, setBusy] = useState(false)

  const close = () => {
    setTarget(null)
    onClose()
  }

  const confirm = async () => {
    if (!target) return
    setBusy(true)
    const res = await mergeSubjects(source.id, target.id)
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(`Merged. ${res.data.moved} item(s) moved.`)
    const merged = target
    setTarget(null)
    onMerged(merged)
  }

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && close()}>
      <DialogContent className={`${dialogCls} max-w-lg`}>
        <DialogHeader>
          <DialogTitle className="font-heading font-extrabold text-[22px] text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] border-[2px] border-foreground bg-[#FF3CAC] flex items-center justify-center shadow-[2px_2px_0px_black]">
              <GitMerge className="w-4 h-4 text-white" />
            </div>
            Merge duplicate subject
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="font-sans text-[14px]">
            Everything in <strong>{subjectLabel(source)}</strong> (shared items and community links) will be moved to the subject
            you choose. Modules are matched by number. This subject will then be hidden.
          </p>
          <SubjectPicker
            value={target}
            onChange={(s) => setTarget(s && s.id !== source.id ? s : null)}
            communityIds={[communityId]}
            allowCreate={false}
          />
        </div>
        <DialogFooter className="mt-6 gap-3">
          <button type="button" onClick={close} disabled={busy} className={btnSecondary}>
            Cancel
          </button>
          <button type="button" onClick={confirm} disabled={!target || busy} className={btnPrimary}>
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Merge
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
