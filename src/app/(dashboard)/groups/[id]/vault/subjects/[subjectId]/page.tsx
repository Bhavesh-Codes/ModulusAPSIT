"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, GitMerge, ListOrdered, Loader2, Pencil, Star } from "lucide-react"
import { useCommunity, useCommunityResources } from "@/components/groups/useCommunityData"
import { useSubjectDetail } from "@/components/groups/ClassificationFields"
import { ResourceCard } from "@/components/groups/ResourceCard"
import { EditShareDialog } from "@/components/groups/EditShareDialog"
import { EditSubjectDialog } from "@/components/groups/EditSubjectDialog"
import { MergeSubjectDialog } from "@/components/groups/MergeSubjectDialog"
import { ModuleEditor } from "@/components/groups/ModuleEditor"
import { ShareEntryButtons } from "@/components/groups/ShareEntryButtons"
import { ResourceFilters, applyFilters, emptyFilters, type Filters } from "@/components/groups/ResourceFilters"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { btnSm, dialogCls } from "@/components/groups/ui"
import { RESOURCE_TYPES, type CommunityResource } from "@/types/groups"
import { useViewer } from "@/hooks/useViewer"

function sortResources(list: CommunityResource[]) {
  return [...list].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at))
}

export default function SubjectPage() {
  const params = useParams()
  const id = params.id as string
  const subjectId = params.subjectId as string
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: community } = useCommunity(id)
  const { data: allResources = [], isLoading } = useCommunityResources(id)
  const detail = useSubjectDetail(subjectId)
  const viewer = useViewer()

  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [editing, setEditing] = useState<CommunityResource | null>(null)
  const [editingSubject, setEditingSubject] = useState(false)
  const [editingModules, setEditingModules] = useState(false)
  const [merging, setMerging] = useState(false)

  const canShare = !!community?.membership
  const canManage = !!community?.can_manage
  const viewerId = community?.viewer_id ?? null
  const subject = detail.data?.subject
  const modules = useMemo(() => detail.data?.modules ?? [], [detail.data])

  // A merged subject forwards to the one it was merged into.
  useEffect(() => {
    if (subject?.merged_into_id) router.replace(`/groups/${id}/vault/subjects/${subject.merged_into_id}`)
  }, [subject?.merged_into_id, id, router])

  const patch = (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p }))

  const forSubject = useMemo(() => allResources.filter((r) => r.subject?.id === subjectId), [allResources, subjectId])
  const visible = useMemo(() => applyFilters(forSubject, { ...filters, subjectId: "" }), [forSubject, filters])

  const pinned = sortResources(visible.filter((r) => r.is_pinned))
  const rest = visible.filter((r) => !r.is_pinned)

  const sections = useMemo(() => {
    const byModule = (moduleId: string | null) => rest.filter((r) => (r.module?.id ?? null) === moduleId)
    const list = modules.map((m) => ({ key: m.id, label: `Module ${m.number}: ${m.title}`, items: byModule(m.id) }))
    list.push({ key: "general", label: "General / whole subject", items: byModule(null) })
    return list
  }, [modules, rest])

  if (isLoading || detail.isLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="py-16 text-center space-y-3">
        <h2 className="font-heading font-extrabold text-[24px]">Subject not found</h2>
        <Link href={`/groups/${id}/vault`} className={`${btnSm} inline-flex`}>
          <ArrowLeft className="w-4 h-4" /> Back to subjects
        </Link>
      </div>
    )
  }

  const canEditSubject = canManage || (!!viewerId && subject.created_by === viewerId)

  const grouped = (items: CommunityResource[]) =>
    RESOURCE_TYPES.map((t) => ({ type: t, items: sortResources(items.filter((r) => r.resource_type === t.value)) })).concat([
      {
        type: { value: "other", label: "Unclassified", plural: "Unclassified" },
        items: sortResources(items.filter((r) => !r.resource_type)),
      },
    ]).filter((g) => g.items.length > 0)

  const card = (r: CommunityResource) => (
    <ResourceCard key={r.id} resource={r} viewerId={viewerId} canManage={canManage} onEdit={setEditing} />
  )

  return (
    <div className="space-y-6 min-h-[70vh]">
      <div className="space-y-3">
        <Link href={`/groups/${id}/vault`} className={`${btnSm} inline-flex`}>
          <ArrowLeft className="w-4 h-4" /> All subjects
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-heading font-extrabold text-[28px] leading-tight">{subject.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {subject.code && (
                <span className="px-2.5 py-0.5 rounded-[100px] border-[1.5px] border-foreground bg-background font-mono text-[11px] font-bold">
                  {subject.code}
                </span>
              )}
              {subject.semester && (
                <span className="px-2.5 py-0.5 rounded-[100px] border-[1.5px] border-foreground bg-background font-mono text-[11px] font-bold">
                  Semester {subject.semester}
                </span>
              )}
              {subject.scheme && (
                <span className="px-2.5 py-0.5 rounded-[100px] border-[1.5px] border-foreground bg-background font-mono text-[11px] font-bold">
                  {subject.scheme}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {canShare && (
                <button type="button" onClick={() => setEditingModules(true)} className={btnSm}>
                  <ListOrdered className="w-3.5 h-3.5" /> Edit modules
                </button>
              )}
              {canEditSubject && (
                <button type="button" onClick={() => setEditingSubject(true)} className={btnSm}>
                  <Pencil className="w-3.5 h-3.5" /> Edit subject
                </button>
              )}
              {canManage && (
                <button type="button" onClick={() => setMerging(true)} className={btnSm}>
                  <GitMerge className="w-3.5 h-3.5" /> Merge into…
                </button>
              )}
            </div>
          </div>
          {canShare && <ShareEntryButtons communityId={id} defaultSubject={subject} />}
        </div>
      </div>

      <ResourceFilters
        filters={filters}
        onChange={patch}
        resources={forSubject}
        modules={modules}
        show={["module", "type", "year", "uploader"]}
      />

      {visible.length === 0 ? (
        <div className="bg-background border-[2px] border-foreground rounded-[1.5rem] border-dashed p-12 text-center">
          <h3 className="font-heading font-bold text-[20px] mb-2">{forSubject.length === 0 ? "Nothing shared yet" : "No results"}</h3>
          <p className="font-sans text-[15px] text-muted-foreground">
            {forSubject.length === 0
              ? canShare
                ? "Be the first to share material for this subject."
                : "Material appears here as members share it."
              : "Try fewer filters, or tick “Show outdated & archived”."}
          </p>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <section aria-label="Start here" className="space-y-4">
              <h3 className="font-heading font-extrabold text-[20px] flex items-center gap-2">
                <span className="w-8 h-8 rounded-[8px] bg-[#FF3CAC] border-[2px] border-foreground flex items-center justify-center shadow-[2px_2px_0px_black]">
                  <Star className="w-4 h-4 text-white" />
                </span>
                Start here
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{pinned.map(card)}</div>
            </section>
          )}

          {sections.map((section) =>
            section.items.length === 0 ? (
              !filters.moduleId && !filters.type && !filters.year && !filters.uploader && !filters.q ? (
                <div key={section.key} className="font-sans text-[14px] text-muted-foreground border-t-[2px] border-dashed border-border pt-3">
                  <span className="font-heading font-bold text-foreground">{section.label}</span> — nothing here yet
                </div>
              ) : null
            ) : (
              <section key={section.key} aria-label={section.label} className="space-y-5 border-t-[2px] border-foreground pt-5">
                <h3 className="font-heading font-extrabold text-[20px]">{section.label}</h3>
                {grouped(section.items).map((g) => (
                  <div key={g.type.value + g.type.label} className="space-y-3">
                    <h4 className="font-mono text-[12px] uppercase tracking-wider text-muted-foreground">
                      {g.type.plural} <span className="font-bold text-foreground">({g.items.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{g.items.map(card)}</div>
                  </div>
                ))}
              </section>
            )
          )}
        </>
      )}

      {editing && (
        <EditShareDialog
          key={editing.id}
          resource={editing}
          onClose={() => setEditing(null)}
          canMove={canManage || (!editing.subject && editing.shared_by_user_id === viewerId)}
        />
      )}
      {editingSubject && <EditSubjectDialog key={subject.id} subject={subject} onClose={() => setEditingSubject(false)} />}
      {merging && (
        <MergeSubjectDialog
          source={subject}
          communityId={id}
          onClose={() => setMerging(false)}
          onMerged={(target) => {
            setMerging(false)
            queryClient.invalidateQueries({ queryKey: ["communityVault"] })
            queryClient.invalidateQueries({ queryKey: ["communitySubjects"] })
            router.replace(`/groups/${id}/vault/subjects/${target.id}`)
          }}
        />
      )}
      <Dialog open={editingModules} onOpenChange={setEditingModules}>
        <DialogContent className={`${dialogCls} max-w-lg`}>
          <DialogHeader>
            <DialogTitle className="font-heading font-extrabold text-[22px]">Module names</DialogTitle>
          </DialogHeader>
          <ModuleEditor
            subjectId={subject.id}
            modules={modules}
            canDelete={viewer.isPrivileged}
            onSaved={() => {
              queryClient.invalidateQueries({ queryKey: ["subject", subject.id] })
              queryClient.invalidateQueries({ queryKey: ["communitySubjects"] })
              setEditingModules(false)
            }}
            onSkip={() => setEditingModules(false)}
            skipLabel="Close"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
