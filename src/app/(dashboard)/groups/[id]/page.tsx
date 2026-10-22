"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowRight,
  BookOpen,
  Clock,
  FileText,
  FolderSync,
  GraduationCap,
  HelpCircle,
  Layers,
  Laptop,
  Loader2,
  Search,
  User,
} from "lucide-react"
import { useCommunity, useCommunityResources, useCommunitySubjects } from "@/components/groups/useCommunityData"
import { ResourceCard } from "@/components/groups/ResourceCard"
import { EditShareDialog } from "@/components/groups/EditShareDialog"
import { ShareEntryButtons } from "@/components/groups/ShareEntryButtons"
import {
  ResourceFilters, applyFilters, emptyFilters, hasResourceFilter, type Filters,
} from "@/components/groups/ResourceFilters"
import { useSubjectDetail } from "@/components/groups/ClassificationFields"
import { toRomanSemester, type CommunityResource } from "@/types/groups"
import { useUiStore } from "@/lib/stores/uiStore"

export default function GroupLibraryPage() {
  const params = useParams()
  const id = params.id as string

  const { selectedTeacher, setSelectedTeacher } = useUiStore()

  const { data: community } = useCommunity(id)
  const { data: resources = [], isLoading } = useCommunityResources(id)
  const { data: subjects = [], isLoading: subjectsLoading } = useCommunitySubjects(id)

  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [editing, setEditing] = useState<CommunityResource | null>(null)

  const canShare = !!community?.membership && community.membership.role !== "viewer"
  const canManage = !!community?.can_manage
  const viewerId = community?.viewer_id ?? null

  const activeFilters = useMemo(
    () => ({
      ...filters,
      uploader: selectedTeacher ?? filters.uploader,
    }),
    [filters, selectedTeacher]
  )

  const patch = (p: Partial<Filters>) => {
    if ("uploader" in p) {
      setSelectedTeacher(p.uploader || null)
    }
    setFilters((f) => ({ ...f, ...p }))
  }

  // Modules of the chosen subject, for the module filter.
  const subjectDetail = useSubjectDetail(activeFilters.subjectId || null)

  const filtered = useMemo(() => applyFilters(resources, activeFilters), [resources, activeFilters])
  const browsing = !hasResourceFilter(activeFilters)

  const groupedBySubject = useMemo(() => {
    if (!selectedTeacher) return null
    const groups: {
      subject: { id: string; name: string; code: string | null } | null
      items: CommunityResource[]
    }[] = []

    const subjectMap = new Map<string, { subject: any; items: CommunityResource[] }>()
    const unsortedItems: CommunityResource[] = []

    for (const r of filtered) {
      if (r.subject) {
        const existing = subjectMap.get(r.subject.id)
        if (existing) {
          existing.items.push(r)
        } else {
          const entry = { subject: r.subject, items: [r] }
          subjectMap.set(r.subject.id, entry)
          groups.push(entry)
        }
      } else {
        unsortedItems.push(r)
      }
    }

    groups.sort((a, b) => (a.subject?.name ?? "").localeCompare(b.subject?.name ?? ""))

    if (unsortedItems.length > 0) {
      groups.push({ subject: null, items: unsortedItems })
    }

    return groups
  }, [filtered, selectedTeacher])

  const selectedTeacherAvatar = useMemo(() => {
    if (!selectedTeacher) return null
    return resources.find((r) => r.uploaded_by_name === selectedTeacher)?.uploaded_by_avatar || null
  }, [resources, selectedTeacher])

  const gridSubjects = useMemo(
    () =>
      subjects
        .filter((s) => (!filters.semester || String(s.semester ?? "") === filters.semester) && (!filters.scheme || (s.scheme ?? "") === filters.scheme))
        .sort((a, b) => (a.semester ?? 99) - (b.semester ?? 99) || a.name.localeCompare(b.name)),
    [subjects, filters.semester, filters.scheme]
  )

  const unsorted = useMemo(
    () => resources.filter((r) => !r.subject && (filters.showInactive || r.status === "current")),
    [resources, filters.showInactive]
  )
  
  const recentResources = useMemo(() => {
    return [...resources].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
  }, [resources])

  if (isLoading || subjectsLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5 relative min-h-[70vh] mt-2">
      {/* Recently Added Strip — simplified, compact & sleek */}
      {recentResources.length > 0 && browsing && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-[5px] bg-[#FFD600] border-[1.2px] border-foreground shadow-[1px_1px_0px_black]">
            <Clock className="w-3 h-3 text-foreground" />
            <span className="font-heading font-extrabold text-[10px] text-foreground uppercase tracking-wider">
              Recent
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {recentResources.map((item) => (
              <Link
                key={item.id}
                href={item.subject ? `/groups/${id}/subjects/${item.subject.id}` : `/groups/${id}`}
                className="shrink-0 flex items-center gap-1.5 bg-card border-[1.2px] border-foreground/50 rounded-[6px] px-2.5 py-0.5 shadow-[1px_1px_0px_rgba(0,0,0,0.12)] hover:border-foreground hover:bg-[#FFD600] hover:shadow-[1.5px_1.5px_0px_black] hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all group"
                title={item.title}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0057FF] shrink-0" />
                <span className="font-heading font-bold text-[12px] text-foreground truncate max-w-[140px] sm:max-w-[180px]">
                  {item.title}
                </span>
                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors ml-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-[24px] text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] border-[2px] border-foreground bg-[#FF3CAC] flex items-center justify-center shadow-[2px_2px_0px_black]">
              <FolderSync className="w-4 h-4 text-white" />
            </div>
            Library
          </h2>
          <p className="font-sans text-[15px] text-muted-foreground">Shared material, organised by subject, module and type.</p>
        </div>
        {canShare && <ShareEntryButtons communityId={id} />}
      </div>

      {community && !canShare && (
        <div className="rounded-[1rem] border-[2px] border-foreground bg-[#FFD600]/20 px-4 py-3 font-sans text-[14px]">
          You can browse and download everything here. Join the group to share your own files.
        </div>
      )}

      <ResourceFilters
        filters={activeFilters}
        onChange={patch}
        resources={resources}
        subjects={subjects}
        modules={activeFilters.subjectId ? subjectDetail.data?.modules : undefined}
      />

      {browsing ? (
        <>
          {gridSubjects.length === 0 ? (
            <div className="bg-background border-[2px] border-foreground rounded-[1.5rem] border-dashed p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-[16px] bg-card border-[2px] border-foreground flex items-center justify-center mb-4 shadow-[4px_4px_0px_black]">
                <BookOpen className="w-8 h-8 text-foreground opacity-50" />
              </div>
              <h3 className="font-heading font-bold text-[20px] mb-2">
                {subjects.length === 0 ? "No subjects yet" : "No subjects match these filters"}
              </h3>
              <p className="font-sans text-[15px] text-muted-foreground max-w-md">
                {subjects.length === 0
                  ? canShare
                    ? "Share the first file and pick or create its subject. It will appear here."
                    : "Subjects appear here as members share material."
                  : "Try a different semester or scheme."}
              </p>
            </div>
          ) : (
            <section aria-label="Subjects">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {gridSubjects.map((s) => {
                  const isLab = s.subject_type === "lab" || /lab|practical|workshop/i.test(s.name)
                  return (
                    <Link
                      key={s.id}
                      href={`/groups/${id}/subjects/${s.id}`}
                      className="group flex flex-col justify-between bg-card border-[2px] border-foreground rounded-[1.25rem] p-5 shadow-[4px_4px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_black] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/40 min-h-[180px]"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`w-12 h-12 rounded-[12px] border-[2px] border-foreground flex items-center justify-center shadow-[2.5px_2.5px_0px_black] shrink-0 transition-transform group-hover:scale-105 ${
                              isLab ? "bg-[#00E5FF] text-foreground" : "bg-[#7C3AED] text-white"
                            }`}
                            title={isLab ? "Laboratory Subject" : "Theory Subject"}
                          >
                            {isLab ? (
                              <Laptop className="w-6 h-6 text-foreground" strokeWidth={2.4} />
                            ) : (
                              <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.4} />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {s.semester && (
                              <span className="px-2.5 py-1 rounded-[8px] border-[2px] border-foreground bg-[#FFD600] text-foreground font-heading font-extrabold text-[12px] shadow-[2px_2px_0px_black] tracking-wide">
                                Sem {toRomanSemester(s.semester)}
                              </span>
                            )}
                            {s.scheme && (
                              <span className="px-2.5 py-1 rounded-[8px] border-[2px] border-foreground bg-card text-foreground font-mono font-extrabold text-[11px] shadow-[2px_2px_0px_black] uppercase tracking-wider">
                                {s.scheme}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-heading font-extrabold text-[18px] sm:text-[19px] leading-snug line-clamp-2 text-foreground group-hover:text-[#7C3AED] transition-colors">
                            {s.name}
                          </h3>
                        </div>
                      </div>

                      <div className="mt-4 pt-3.5 border-t-[2px] border-dashed border-foreground/30 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] border-[2px] border-foreground shadow-[2px_2px_0px_black] ${
                              s.resource_count > 0 ? "bg-[#FFD600]/25 text-foreground" : "bg-muted/30 text-muted-foreground"
                            }`}
                          >
                            <FileText
                              className={`w-3.5 h-3.5 ${s.resource_count > 0 ? "text-[#7C3AED]" : "text-muted-foreground"}`}
                              strokeWidth={2.5}
                            />
                            <span className="font-heading font-extrabold text-[13px] text-foreground">
                              {s.resource_count}
                            </span>
                            <span className="font-sans font-bold text-[11px] text-muted-foreground">
                              {s.resource_count === 1 ? "resource" : "resources"}
                            </span>
                          </div>

                          {s.module_count > 0 && (
                            <span className="font-mono text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5" />
                              {s.module_count} {s.module_count === 1 ? "module" : "modules"}
                            </span>
                          )}
                        </div>

                        <div className="w-8 h-8 rounded-[9px] border-[1.5px] border-foreground bg-background group-hover:bg-[#FFD600] group-hover:translate-x-0.5 transition-all shadow-[1.5px_1.5px_0px_black] flex items-center justify-center shrink-0">
                          <ArrowRight className="w-4 h-4 text-foreground" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {unsorted.length > 0 && (
            <section aria-label="Unsorted" className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-[#FF6B00] border-[2px] border-foreground flex items-center justify-center shadow-[2px_2px_0px_black]">
                  <HelpCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-heading font-extrabold text-[18px]">Unsorted</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-background border-[2px] border-foreground text-[12px] font-mono font-bold">
                  {unsorted.length}
                </span>
              </div>
              <p className="font-sans text-[14px] text-muted-foreground">
                Shared before subjects existed. The person who shared an item, or the HOD, can classify it from the ⋮ menu (Edit).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {unsorted.map((r) => (
                  <ResourceCard key={r.id} resource={r} viewerId={viewerId} canManage={canManage} onEdit={setEditing} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <section aria-label="Results" className="space-y-6">
          {selectedTeacher && (
            <div className="bg-[#FFD600] border-[3px] border-foreground rounded-[1.25rem] p-4 shadow-[4px_4px_0px_black] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-card border-[2px] border-foreground overflow-hidden flex items-center justify-center font-heading font-extrabold text-[16px] text-foreground shadow-[2px_2px_0px_black] shrink-0">
                  {selectedTeacherAvatar ? (
                    <img
                      src={selectedTeacherAvatar}
                      alt={selectedTeacher}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    selectedTeacher[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-[16px] text-foreground leading-tight">
                    Notes by {selectedTeacher}
                  </h3>
                  <p className="font-mono text-[12px] text-foreground/80">
                    {filtered.length} {filtered.length === 1 ? "note" : "notes"} in this domain
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="px-3.5 py-1.5 rounded-[10px] border-[2px] border-foreground bg-card text-foreground font-heading font-bold text-[12px] shadow-[2px_2px_0px_black] hover:bg-background hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all self-start sm:self-auto"
              >
                Clear Filter (Show All)
              </button>
            </div>
          )}

          <p className="font-mono text-[12px] text-muted-foreground flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>

          {filtered.length === 0 ? (
            <div className="bg-background border-[2px] border-foreground rounded-[1.5rem] border-dashed p-12 text-center">
              <h3 className="font-heading font-bold text-[20px] mb-2">No results found</h3>
              <p className="font-sans text-[15px] text-muted-foreground">Try fewer filters, or tick “Show outdated &amp; archived”.</p>
            </div>
          ) : groupedBySubject ? (
            <div className="space-y-8">
              {groupedBySubject.map(({ subject, items }) => (
                <section key={subject?.id || "unsorted"} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b-[2px] border-foreground border-dashed">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-[8px] border-[2px] border-foreground flex items-center justify-center shadow-[2px_2px_0px_black] shrink-0 ${
                          subject?.subject_type === "lab" || /lab|practical|workshop/i.test(subject?.name || "")
                            ? "bg-[#00E5FF] text-foreground"
                            : "bg-[#7C3AED] text-white"
                        }`}
                      >
                        {subject?.subject_type === "lab" || /lab|practical|workshop/i.test(subject?.name || "") ? (
                          <Laptop className="w-4 h-4 text-foreground" strokeWidth={2.2} />
                        ) : (
                          <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.2} />
                        )}
                      </div>
                      <h3 className="font-heading font-bold text-[17px] text-foreground">
                        {subject ? subject.name : "Unsorted"}
                      </h3>
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-[100px] border-[1.5px] border-foreground bg-background">
                        {items.length} {items.length === 1 ? "note" : "notes"}
                      </span>
                    </div>
                    {subject && (
                      <Link
                        href={`/groups/${id}/subjects/${subject.id}`}
                        className="px-3 py-1 rounded-[8px] border-[1.5px] border-foreground bg-card text-foreground font-heading font-bold text-[12px] shadow-[2px_2px_0px_black] hover:bg-[#FFD600] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-1.5"
                      >
                        Go to subject <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((r) => (
                      <ResourceCard
                        key={r.id}
                        resource={r}
                        viewerId={viewerId}
                        canManage={canManage}
                        showSubject={false}
                        onEdit={setEditing}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((r) => (
                <ResourceCard key={r.id} resource={r} viewerId={viewerId} canManage={canManage} showSubject onEdit={setEditing} />
              ))}
            </div>
          )}
        </section>
      )}

      {editing && (
        <EditShareDialog
          key={editing.id}
          resource={editing}
          onClose={() => setEditing(null)}
          canMove={canManage || (!editing.subject && editing.shared_by_user_id === viewerId)}
        />
      )}
    </div>
  )
}
