"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateShare, type UpdateShareInput } from "@/actions/groups"
import type { CommunityResource, ResourceType } from "@/types/groups"
import { currentAcademicYear } from "@/types/groups"
import { ClassificationFields, type Classification } from "./ClassificationFields"
import { TagInput } from "./TagInput"
import { btnPrimary, btnSecondary, dialogCls, inputCls, labelCls } from "./ui"

// Edit the details of one share. HOD/dev can also move it to another subject/module;
// the sharer can classify a legacy "Unsorted" item once.
export function EditShareDialog({
  resource,
  onClose,
  canMove,
}: {
  resource: CommunityResource
  onClose: () => void
  /** HOD/dev, or the sharer of an unsorted item. */
  canMove: boolean
}) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(resource.title)
  const [description, setDescription] = useState(resource.description ?? "")
  const [tags, setTags] = useState<string[]>(resource.tags)
  const [cls, setCls] = useState<Classification>({
    subject: resource.subject,
    moduleChoice: resource.subject ? (resource.module?.id ?? null) : undefined,
    resourceType: resource.resource_type ?? "",
    year: resource.academic_year ?? currentAcademicYear(),
  })
  const [saving, setSaving] = useState(false)

  const { data: tagSuggestions = [] } = useQuery<string[]>({
    queryKey: ["tagSuggestions", resource.community_id],
    queryFn: async () => {
      const res = await fetch(`/api/tags?community_ids=${resource.community_id}`)
      return res.ok ? (await res.json()).data : []
    },
  })

  const isUnsorted = !resource.subject

  const missingClassification = canMove && (!cls.subject || cls.moduleChoice === undefined)
  const canSave = !!title.trim() && !!cls.resourceType && !missingClassification && !saving

  const save = async () => {
    if (!canSave || !cls.resourceType) return
    setSaving(true)
    const updates: UpdateShareInput = {
      title,
      tags,
      description: description.trim() || null,
      resource_type: cls.resourceType as ResourceType,
      academic_year: cls.year,
    }
    if (canMove && cls.subject) {
      const moduleId = cls.moduleChoice ?? null
      if (cls.subject.id !== resource.subject?.id || moduleId !== (resource.module?.id ?? null) || isUnsorted) {
        updates.subject_id = cls.subject.id
        updates.module_id = moduleId
      }
    }
    const res = await updateShare(resource.id, updates)
    setSaving(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    toast.success(isUnsorted ? "Item classified" : "Changes saved")
    queryClient.invalidateQueries({ queryKey: ["communityVault", resource.community_id] })
    queryClient.invalidateQueries({ queryKey: ["communitySubjects", resource.community_id] })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className={`${dialogCls} max-w-xl`}>
        <DialogHeader>
          <DialogTitle className="font-heading font-extrabold text-[22px] text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] border-[2px] border-foreground bg-[#00C853] flex items-center justify-center shadow-[2px_2px_0px_black]">
              <Pencil className="w-4 h-4 text-white" />
            </div>
            {isUnsorted ? "Classify item" : "Edit details"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label className={labelCls}>
              Title <span className="text-[#FF3B30]">*</span>
            </Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </div>

          <ClassificationFields
            value={cls}
            onChange={(patch) => setCls((prev) => ({ ...prev, ...patch }))}
            communityIds={[resource.community_id]}
            showSubject={canMove}
            showModule={canMove}
          />

          <div className="space-y-2">
            <Label className={labelCls}>
              Description <span className="normal-case tracking-normal">(optional)</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={500}
              className="border-[2px] border-foreground rounded-[0.75rem] font-sans text-[14px] resize-none"
            />
          </div>

          <TagInput tags={tags} onChange={setTags} suggestions={tagSuggestions} />
        </div>

        <DialogFooter className="mt-6 gap-3">
          <button type="button" onClick={onClose} disabled={saving} className={btnSecondary}>
            Cancel
          </button>
          <button type="button" onClick={save} disabled={!canSave} className={btnPrimary}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
