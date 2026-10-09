"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { BookOpen, FolderSync, HelpCircle, Layers, Loader2, Search, Clock, ArrowRight } from "lucide-react"
import { useCommunity, useCommunityResources, useCommunitySubjects } from "@/components/groups/useCommunityData"
import { ResourceCard } from "@/components/groups/ResourceCard"
import { EditShareDialog } from "@/components/groups/EditShareDialog"
import { ShareEntryButtons } from "@/components/groups/ShareEntryButtons"
import {
  ResourceFilters, applyFilters, emptyFilters, hasResourceFilter, type Filters,
} from "@/components/groups/ResourceFilters"
import { useSubjectDetail } from "@/components/groups/ClassificationFields"
import { toRomanSemester, type CommunityResource } from "@/types/groups"

export default function GroupLibraryPage() {
  const params = useParams()
  const id = params.id as string

  const { data: community } = useCommunity(id)
  const { data: resources = [], isLoading } = useCommunityResources(id)
  const { data: subjects = [], isLoading: subjectsLoading } = useCommunitySubjects(id)

  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [editing, setEditing] = useState<CommunityResource | null>(null)

  const canShare = !!community?.membership && community.membership.role !== "viewer"
  const canManage = !!community?.can_manage
  const viewerId = community?.viewer_id ?? null

  const patch = (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p }))

  // Modules of the chosen subject, for the module filter.
  const subjectDetail = useSubjectDetail(filters.subjectId || null)

  const filtered = useMemo(() => applyFilters(resources, filters), [resources, filters])
  const browsing = !hasResourceFilter(filters)

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
    <div className="space-y-6 relative min-h-[70vh] mt-4">
      {/* Recently Added Strip */}
      {recentResources.length > 0 && browsing && (
        <div className="bg-card border-[3px] border-foreground rounded-[1rem] shadow-[4px_4px_0px_black] p-3 flex flex-col md:flex-row items-start md:items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-[8px] bg-[#FFD600] border-[2px] border-foreground flex items-center justify-center">
              <Clock className="w-4 h-4 text-foreground" />
            </div>
            <span className="font-heading font-bold text-[14px]">Recently Added</span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0 w-full">
            {recentResources.map((item) => (
              <Link
                key={item.id}
                href={item.subject ? `/groups/${id}/subjects/${item.subject.id}` : `/groups/${id}`}
                className="shrink-0 flex items-center gap-2 bg-background border-[2px] border-foreground rounded-[8px] px-3 py-1.5 hover:bg-[#FFD600] transition-colors"
                title={item.title}
              >
                <div className="w-2 h-2 rounded-full bg-[#0057FF]" />
                <span className="font-heading font-bold text-[12px] truncate max-w-[150px]">{item.title}</span>
                <ArrowRight className="w-3 h-3 ml-1" />
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
        filters={filters}
        onChange={patch}
        resources={resources}
        subjects={subjects}
        modules={filters.subjectId ? subjectDetail.data?.modules : undefined}
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
                {gridSubjects.map((s) => (
                  <Link
                    key={s.id}
                    href={`/groups/${id}/subjects/${s.id}`}
                    className="group flex flex-col gap-3 bg-card border-[2px] border-foreground rounded-[1.5rem] p-5 shadow-[4px_4px_0px_black] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-12 h-12 rounded-[10px] bg-[#0057FF] border-[2px] border-foreground flex items-center justify-center shadow-[2px_2px_0px_black] shrink-0">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {s.subject_type && (
                          <span className={`px-2 py-0.5 rounded-[100px] border-[1.5px] border-foreground font-mono text-[10px] font-bold ${
                            s.subject_type === "lab" ? "bg-[#00E5FF] text-foreground" : "bg-background text-foreground"
                          }`}>
                            {s.subject_type === "lab" ? "Lab" : "Theory"}
                          </span>
                        )}
                        {s.semester && (
                          <span className="px-2 py-0.5 rounded-[100px] border-[1.5px] border-foreground bg-background font-mono text-[10px] font-bold">
                            Sem {toRomanSemester(s.semester)}
                          </span>
                        )}
                        {s.scheme && (
                          <span className="px-2 py-0.5 rounded-[100px] border-[1.5px] border-foreground bg-background font-mono text-[10px] font-bold">
                            {s.scheme}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-[18px] leading-snug line-clamp-2">{s.name}</h3>
                      {s.code && <p className="font-mono text-[12px] text-muted-foreground mt-0.5">{s.code}</p>}
                    </div>
                    <div className="mt-auto flex items-center gap-4 font-mono text-[12px] text-muted-foreground pt-3 border-t-[2px] border-dashed border-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> {s.resource_count} resource{s.resource_count !== 1 ? "s" : ""}
                      </span>
                      <span>{s.module_count} module{s.module_count !== 1 ? "s" : ""}</span>
                    </div>
                  </Link>
                ))}
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
        <section aria-label="Results" className="space-y-4">
          <p className="font-mono text-[12px] text-muted-foreground flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
          {filtered.length === 0 ? (
            <div className="bg-background border-[2px] border-foreground rounded-[1.5rem] border-dashed p-12 text-center">
              <h3 className="font-heading font-bold text-[20px] mb-2">No results found</h3>
              <p className="font-sans text-[15px] text-muted-foreground">Try fewer filters, or tick “Show outdated &amp; archived”.</p>
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
