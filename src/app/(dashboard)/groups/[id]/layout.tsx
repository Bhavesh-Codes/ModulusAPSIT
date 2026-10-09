"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, usePathname } from "next/navigation"
import {
  Loader2, UserMinus, UserPlus, Users, ArrowLeft,
  Shield, User, Crown,
  GraduationCap, FolderOpen,
  ChevronLeft, ChevronRight, Menu, X,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUiStore } from "@/lib/stores/uiStore"
import { CommunitySettingsModal } from "@/components/modules/CommunitySettingsModal"
import { joinModule, leaveModule, getModuleMembers, removeMember, updateMemberRole } from "@/actions/modules"
import { normalizeCommunityRole } from "@/lib/roles"
import { useViewer } from "@/hooks/useViewer"
import { useCommunityResources } from "@/components/groups/useCommunityData"

// ─── Constants ───────────────────────────────────────────────────────────────

const SIDEBAR_OPEN_WIDTH = 260
const SIDEBAR_COLLAPSED_WIDTH = 68

// ─── Module Faculty Sidebar ──────────────────────────────────────────────────

function CommunitySidebar({ id }: { id: string }) {
  const {
    communitySidebarOpen,
    toggleCommunitySidebar,
    communitySidebarMobileOpen,
    setCommunitySidebarMobileOpen,
    selectedTeacher,
    setSelectedTeacher,
  } = useUiStore()

  const width = communitySidebarOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_COLLAPSED_WIDTH

  const { data: resources = [] } = useCommunityResources(id)
  const { data: members = [] } = useQuery({
    queryKey: ["communityMembers", id],
    queryFn: () => getModuleMembers(id),
  })

  // Extract faculty members who belong to this domain and have uploaded files
  const teacherList = useMemo(() => {
    const map = new Map<string, { count: number; profilePic?: string | null }>()

    // Map members by id and lowercase name for profile pic lookup
    const memberMap = new Map<string, any>()
    for (const m of members) {
      if (m.id) memberMap.set(m.id, m)
      if (m.name) memberMap.set(m.name.trim().toLowerCase(), m)
    }

    for (const r of resources) {
      const name = r.uploaded_by_name?.trim()
      if (!name) continue

      const existing = map.get(name)
      if (existing) {
        existing.count += 1
      } else {
        const m = (r.shared_by_user_id ? memberMap.get(r.shared_by_user_id) : null) ||
                  memberMap.get(name.toLowerCase())
        map.set(name, {
          count: 1,
          profilePic: m?.profile_pic || null,
        })
      }
    }

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        profilePic: data.profilePic,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [resources, members])

  const totalNotes = resources.length

  const handleSelect = (teacherName: string | null) => {
    setSelectedTeacher(teacherName)
    setCommunitySidebarMobileOpen(false)
  }

  // Render list of items (expanded or collapsed)
  const renderFacultyList = (collapsed: boolean) => {
    if (collapsed) {
      return (
        <div className="flex flex-col items-center gap-3 py-2">
          {/* All faculty button */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            title={`All Faculty (${totalNotes} notes)`}
            aria-label="All Faculty"
            className={`
              flex items-center justify-center w-11 h-11 rounded-[10px] transition-all
              border-[2px] border-foreground
              ${selectedTeacher === null
                ? "bg-[#FFD600] shadow-[2px_2px_0px_black] translate-x-[1px] translate-y-[1px]"
                : "bg-card shadow-[2px_2px_0px_black] hover:bg-[#FFD600] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              }
            `}
          >
            <Users className="w-5 h-5 text-foreground" />
          </button>

          {/* Teacher buttons */}
          {teacherList.map((t) => {
            const isSelected = selectedTeacher === t.name
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => handleSelect(isSelected ? null : t.name)}
                title={`${t.name} (${t.count} ${t.count === 1 ? "note" : "notes"})`}
                aria-label={t.name}
                className={`
                  relative flex items-center justify-center w-11 h-11 rounded-[10px] transition-all overflow-hidden
                  border-[2px] border-foreground
                  ${isSelected
                    ? "bg-[#FFD600] shadow-[2px_2px_0px_black] ring-2 ring-foreground translate-x-[1px] translate-y-[1px]"
                    : "bg-card shadow-[2px_2px_0px_black] hover:bg-[#FFD600] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                  }
                `}
              >
                {t.profilePic ? (
                  <img src={t.profilePic} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-heading font-extrabold text-[14px] text-foreground">
                    {t.name[0]?.toUpperCase()}
                  </span>
                )}
                {isSelected && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-foreground" />
                )}
              </button>
            )
          })}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-2.5 px-3 py-2">
        {/* All faculty button */}
        <button
          type="button"
          onClick={() => handleSelect(null)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-[1rem] transition-all text-left
            border-[2px] border-foreground
            ${selectedTeacher === null
              ? "bg-[#FFD600] shadow-[3px_3px_0px_black] translate-x-[1px] translate-y-[1px]"
              : "bg-card shadow-[2px_2px_0px_black] hover:bg-[#FFD600]/25 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            }
          `}
        >
          <div className="w-9 h-9 rounded-[8px] bg-background border-[1.5px] border-foreground flex items-center justify-center shrink-0 shadow-[1px_1px_0px_black]">
            <Users className="w-4 h-4 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-heading font-bold text-[13px] text-foreground truncate">
              All Faculty
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {totalNotes} {totalNotes === 1 ? "note" : "notes"}
            </div>
          </div>
          {selectedTeacher === null && (
            <span className="w-2 h-2 rounded-full bg-foreground shrink-0 mr-1" />
          )}
        </button>

        {teacherList.length === 0 ? (
          <div className="p-4 text-center mt-2 rounded-[1rem] border-[2px] border-dashed border-foreground/40 bg-muted/40">
            <FolderOpen className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
            <p className="font-heading font-bold text-[12px] text-foreground">No faculty notes</p>
            <p className="font-sans text-[11px] text-muted-foreground mt-0.5">
              Faculty notes will appear here once uploaded.
            </p>
          </div>
        ) : (
          teacherList.map((t) => {
            const isSelected = selectedTeacher === t.name
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => handleSelect(isSelected ? null : t.name)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-[1rem] transition-all text-left
                  border-[2px] border-foreground
                  ${isSelected
                    ? "bg-[#FFD600] shadow-[3px_3px_0px_black] translate-x-[1px] translate-y-[1px]"
                    : "bg-card shadow-[2px_2px_0px_black] hover:bg-[#FFD600]/25 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  }
                `}
              >
                <div className="w-9 h-9 rounded-[8px] bg-[#00E5FF] border-[1.5px] border-foreground overflow-hidden flex items-center justify-center shrink-0 shadow-[1px_1px_0px_black]">
                  {t.profilePic ? (
                    <img src={t.profilePic} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-heading font-extrabold text-[14px] text-foreground">
                      {t.name[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-heading font-bold text-[13px] text-foreground truncate" title={t.name}>
                    {t.name}
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {t.count} {t.count === 1 ? "note" : "notes"}
                  </div>
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-foreground shrink-0 mr-1" />
                )}
              </button>
            )
          })
        )}
      </div>
    )
  }

  // Desktop sidebar (fixed right panel)
  const desktopSidebar = (
    <aside
      style={{
        position: "fixed",
        top: "var(--topnav-height, 64px)",
        right: 0,
        width,
        height: "calc(100vh - var(--topnav-height, 64px))",
        transition: "width 0.25s ease, top 0.3s ease, height 0.3s ease",
        flexDirection: "column",
        background: "var(--background)",
        borderLeft: "2px solid var(--foreground)",
        zIndex: 30,
        overflow: "hidden",
      }}
      className="hidden md:flex shadow-[-4px_0_10px_rgba(0,0,0,0.05)]"
    >
      {/* Toggle button & Section header */}
      <div
        className="shrink-0 flex items-center border-b-[2px] border-b-[var(--foreground)] bg-card shadow-sm"
        style={{
          height: 64,
          justifyContent: communitySidebarOpen ? "space-between" : "center",
          padding: communitySidebarOpen ? "0 16px" : "0",
        }}
      >
        {communitySidebarOpen && (
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-foreground" />
            <span className="font-heading font-extrabold text-[13px] tracking-wide text-foreground">
              Faculty Notes
            </span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-[6px] border-[1.5px] border-foreground bg-muted">
              {teacherList.length}
            </span>
          </div>
        )}

        <button
          onClick={toggleCommunitySidebar}
          title={communitySidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="flex items-center justify-center bg-card hover:bg-[#FFD600] border-[2px] border-foreground shadow-[3px_3px_0_black] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all rounded-[10px]"
          style={{ width: 40, height: 40, minWidth: 40 }}
        >
          {communitySidebarOpen
            ? <ChevronRight style={{ width: 20, height: 20, color: "var(--foreground)" }} />
            : <ChevronLeft style={{ width: 20, height: 20, color: "var(--foreground)" }} />
          }
        </button>
      </div>

      {/* Faculty list */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col py-4 pb-12">
        {renderFacultyList(!communitySidebarOpen)}
      </nav>
    </aside>
  )

  // Mobile sidebar (overlay from right)
  const mobileSidebar = (
    <>
      {/* Backdrop */}
      {communitySidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 md:hidden"
          onClick={() => setCommunitySidebarMobileOpen(false)}
        />
      )}

      {/* Panel */}
      <aside
        style={{
          position: "fixed",
          top: "var(--topnav-height, 64px)",
          right: 0,
          width: SIDEBAR_OPEN_WIDTH,
          height: "calc(100vh - var(--topnav-height, 64px))",
          transform: communitySidebarMobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s ease, top 0.3s ease, height 0.3s ease",
          flexDirection: "column",
          background: "var(--background)",
          borderLeft: "2px solid var(--foreground)",
          zIndex: 50,
        }}
        className="flex flex-col md:hidden shadow-[-4px_0_10px_rgba(0,0,0,0.05)]"
      >
        <div
          className="shrink-0 flex items-center justify-between border-b-[2px] border-b-[var(--foreground)] bg-card px-4"
          style={{ height: 64 }}
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-foreground" />
            <span className="font-heading font-extrabold text-[14px] text-foreground">
              Faculty Notes
            </span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-[6px] border-[1.5px] border-foreground bg-muted">
              {teacherList.length}
            </span>
          </div>
          <button
            onClick={() => setCommunitySidebarMobileOpen(false)}
            className="flex items-center justify-center bg-card hover:bg-[#FFD600] border-[2px] border-foreground shadow-[3px_3px_0_black] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all rounded-[10px]"
            style={{ width: 40, height: 40, minWidth: 40 }}
          >
            <X style={{ width: 18, height: 18, color: "var(--foreground)" }} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto flex flex-col py-4 pb-12">
          {renderFacultyList(false)}
        </nav>
      </aside>
    </>
  )

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  )
}

// ─── Module Header ─────────────────────────────────────────────────────────

function RoleBadge({ role, compact }: { role: string | undefined; compact?: boolean }) {
  const norm = normalizeCommunityRole(role)
  if (norm === "viewer" || !role) return null

  let Icon = User
  let tone = "bg-muted text-foreground"
  let label = "MEMBER"

  if (norm === "owner") {
    Icon = Crown
    tone = "bg-[#FFD600] text-foreground"
    label = "OWNER"
  } else if (norm === "curator") {
    Icon = Shield
    tone = "bg-[#0057FF] text-white"
    label = "CURATOR"
  } else if (norm === "member") {
    Icon = User
    tone = "bg-[#00E5FF] text-foreground"
    label = "MEMBER"
  }

  if (compact) {
    return (
      <span title={label} className={`flex items-center justify-center w-8 h-8 rounded-full border-[2px] border-foreground shadow-[2px_2px_0_black] ${tone}`}>
        <Icon className="w-4 h-4" />
      </span>
    )
  }
  return (
    <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-[100px] border-[2px] border-foreground shadow-[2px_2px_0px_black] font-mono text-[12px] font-bold tracking-wide ${tone}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

function CommunityHeader({
  community,
  id,
  isSubPage,
  isMember,
  canManage,
  canEditCommunity,
  effectiveRole,
  onManageMembers,
  onMobileMenuOpen,
}: {
  community: any
  id: string
  isSubPage: boolean
  isMember: boolean
  canManage: boolean
  canEditCommunity: boolean
  effectiveRole: string
  onManageMembers: () => void
  onMobileMenuOpen: () => void
}) {
  const queryClient = useQueryClient()

  const joinMutation = useMutation({
    mutationFn: () => joinModule(id),
    onSuccess: () => {
      toast.success("Group joined!")
      queryClient.invalidateQueries({ queryKey: ["community", id] })
      queryClient.invalidateQueries({ queryKey: ["communities"] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to join")
    },
  })

  const leaveMutation = useMutation({
    mutationFn: () => leaveModule(id),
    onSuccess: () => {
      toast.success("Left group")
      queryClient.invalidateQueries({ queryKey: ["community", id] })
      queryClient.invalidateQueries({ queryKey: ["communities"] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to leave")
    },
  })

  return (
    <header
      className="flex items-center bg-[#FFD600] border-[3px] border-foreground rounded-[1.5rem] shadow-[6px_6px_0px_black] px-5 py-3 gap-3 sticky top-4 z-40 shrink-0 transition-all duration-300 ease-in-out"
    >
      <Link
        href={isSubPage ? `/groups/${id}` : `/groups`}
        className="px-3 py-1.5 flex items-center justify-center gap-1.5 rounded-[0.875rem] border-[2px] border-foreground bg-card shadow-[3px_3px_0px_black] font-heading font-bold text-[14px] text-foreground hover:bg-background hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all shrink-0"
        title={isSubPage ? "Back to group home" : "Back to Groups"}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden md:inline">Back</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 flex-1 overflow-hidden">
        <span className="font-heading font-extrabold text-foreground leading-none truncate text-[18px]">
          {community.name}
        </span>
        <span className="font-mono text-[12px] text-foreground opacity-80">
          <span className="hidden md:inline mr-2">•</span>
          {community.member_count} member{community.member_count !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <RoleBadge role={effectiveRole} compact />

        {canManage && (
          <button
            onClick={onManageMembers}
            className="hidden md:flex px-3 py-1.5 rounded-[0.75rem] border-[2px] border-foreground bg-card shadow-[3px_3px_0px_black] font-heading font-bold text-[12px] text-foreground hover:bg-background hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Members
          </button>
        )}

        {canEditCommunity && (
          <div className="hidden md:block">
            <CommunitySettingsModal community={community} />
          </div>
        )}

        {!isMember && (
          <button
            onClick={() => joinMutation.mutate()}
            disabled={joinMutation.isPending}
            className="hidden md:flex px-3 py-1.5 rounded-[0.75rem] border-[2px] border-foreground bg-card shadow-[3px_3px_0px_black] font-heading font-bold text-[12px] text-foreground hover:bg-background hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all items-center gap-2"
          >
            {joinMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <UserPlus className="w-3 h-3" />
            )}
            Join
          </button>
        )}
        
        {isMember && effectiveRole !== "owner" && (
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to leave ${community.name}?`)) {
                leaveMutation.mutate()
              }
            }}
            disabled={leaveMutation.isPending}
            className="hidden md:flex px-3 py-1.5 rounded-[0.75rem] border-[2px] border-foreground bg-[#FF3B30] text-white shadow-[3px_3px_0px_black] font-heading font-bold text-[12px] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all items-center gap-2"
          >
            {leaveMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <UserMinus className="w-3 h-3" />
            )}
            Leave
          </button>
        )}

        <button
          onClick={onMobileMenuOpen}
          className="ml-auto flex items-center justify-center bg-card hover:bg-background border-[2px] border-foreground shadow-[2px_2px_0_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-[8px] md:hidden shrink-0"
          style={{ width: 36, height: 36 }}
          title="Faculty Notes"
        >
          <Menu style={{ width: 18, height: 18, color: "var(--foreground)" }} />
        </button>
      </div>
    </header>
  )
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const id = params.id as string
  const pathname = usePathname()

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)

  const {
    communitySidebarOpen,
    communitySidebarMobileOpen,
    setCommunitySidebarMobileOpen,
    setSelectedTeacher,
  } = useUiStore()

  useEffect(() => {
    // Reset teacher filter when changing communities
    setSelectedTeacher(null)
  }, [id, setSelectedTeacher])

  const viewer = useViewer()

  const { data: community, isLoading } = useQuery({
    queryKey: ["community", id],
    queryFn: async () => {
      const res = await fetch(`/api/communities/${id}`)
      if (!res.ok) throw new Error("Failed to fetch community")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-foreground" />
      </div>
    )
  }

  if (!community) {
    return (
      <div className="p-8 text-center mt-20">
        <h2 className="font-heading font-extrabold text-[28px] text-foreground">
          Group Not Found
        </h2>
        <Link
          href="/groups"
          className="px-5 py-2.5 mt-4 inline-flex items-center justify-center gap-2 rounded-[0.875rem] border-[2px] border-foreground bg-card shadow-[3px_3px_0px_black] font-heading font-bold text-[14px] text-foreground hover:bg-background hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to Groups
        </Link>
      </div>
    )
  }

  const effectiveRole = community.effective_role || community.membership?.role || "viewer"
  const isMember = !!community.membership && community.membership.role !== "viewer"
  const canManage = !!community.can_manage
  const canEditCommunity = !!community.can_edit_community

  // Detect sub-page: pathname is longer than "/groups/[id]"
  const groupRoot = `/groups/${id}`
  const isSubPage = pathname !== groupRoot && !pathname.endsWith(`/groups/${id}`) && pathname !== `/modules/${id}` && !pathname.endsWith(`/modules/${id}`)

  // Sidebar width for content area right-padding (desktop only). Everyone can open the vault.
  const sidebarWidth = communitySidebarOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_COLLAPSED_WIDTH

  return (
    <>
      {/* Right-side App Sidebar */}
      <CommunitySidebar id={id} />

      {/* Page content — shifts left to not go under sidebar on desktop */}
      <div
        className="[padding-right:0] md:[padding-right:var(--sidebar-w)] transition-[padding-right] duration-[250ms] ease-in-out"
        style={{ "--sidebar-w": `${sidebarWidth}px` } as React.CSSProperties}
      >
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-4 pb-32 space-y-6">
          {/* Module header */}
          <CommunityHeader
            community={community}
            id={id}
            isSubPage={isSubPage}
            isMember={isMember}
            canManage={canManage}
            canEditCommunity={canEditCommunity}
            effectiveRole={effectiveRole}
            onManageMembers={() => setIsMembersModalOpen(true)}
            onMobileMenuOpen={() => setCommunitySidebarMobileOpen(true)}
          />

          {/* Page content */}
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>

      {/* Manage members modal */}
      {canManage && (
        <ManageMembersModal
          isOpen={isMembersModalOpen}
          onClose={() => setIsMembersModalOpen(false)}
          communityId={id}
          canAppoint={canEditCommunity}
          currentUserId={viewer.userId}
          isOwnerOrAdmin={canEditCommunity}
          isCurator={effectiveRole === "curator"}
        />
      )}
    </>
  )
}

// ─── Manage Members Modal ─────────────────────────────────────────────────────

function ManageMembersModal({
  isOpen,
  onClose,
  communityId,
  canAppoint,
  currentUserId,
  isOwnerOrAdmin,
  isCurator,
}: {
  isOpen: boolean
  onClose: () => void
  communityId: string
  canAppoint: boolean
  currentUserId: string | null
  isOwnerOrAdmin: boolean
  isCurator: boolean
}) {
  const queryClient = useQueryClient()

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["communityMembers", communityId],
    queryFn: () => getModuleMembers(communityId),
    enabled: isOpen,
  })

  const kickMutation = useMutation({
    mutationFn: (userId: string) => removeMember(communityId, userId),
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ["communityMembers", communityId] })
      const previousMembers = queryClient.getQueryData(["communityMembers", communityId])
      queryClient.setQueryData(["communityMembers", communityId], (old: any) => {
        if (!old) return old
        return old.filter((m: any) => m.id !== userId)
      })
      return { previousMembers }
    },
    onError: (err: any, _v, context) => {
      toast.error(err.message)
      if (context?.previousMembers) {
        queryClient.setQueryData(["communityMembers", communityId], context.previousMembers)
      }
    },
    onSuccess: () => toast.success("Member removed"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["communityMembers", communityId] })
      queryClient.invalidateQueries({ queryKey: ["community", communityId] })
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: "curator" | "member" }) =>
      updateMemberRole(communityId, userId, newRole),
    onSuccess: () => {
      toast.success("Member role updated")
      queryClient.invalidateQueries({ queryKey: ["communityMembers", communityId] })
      queryClient.invalidateQueries({ queryKey: ["community", communityId] })
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update role")
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="bg-card border-[3px] border-foreground rounded-[2rem] shadow-[8px_8px_0px_black] max-w-lg p-6 flex flex-col max-h-[85vh]">
        <DialogHeader className="mb-4 shrink-0">
          <DialogTitle className="font-heading font-extrabold text-[22px] text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] bg-[#FFD600] border-[2px] border-foreground shadow-[2px_2px_0px_black] flex items-center justify-center">
              <Users className="w-4 h-4 text-foreground" />
            </div>
            Manage Members
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto pr-2 space-y-4 flex-1">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-foreground" />
            </div>
          ) : (
            <>
              <h3 className="font-heading font-extrabold text-[16px] text-foreground flex items-center justify-between border-b-[2px] border-foreground pb-2 border-dashed">
                Members
                <span className="bg-muted text-foreground px-2 py-0.5 rounded-[100px] text-[12px] shadow-[2px_2px_0px_black] border-[1.5px] border-foreground">
                  {members.length}
                </span>
              </h3>
              {members.length === 0 && (
                <p className="font-sans text-[14px] text-muted-foreground">No members yet. Faculty can join from the group page.</p>
              )}
              <div className="space-y-3">
                {members.map((m: any) => {
                  const normRole = normalizeCommunityRole(m.role)
                  const isSelf = m.id === currentUserId
                  const isTargetOwner = normRole === "owner"
                  const isTargetCurator = normRole === "curator"

                  let canRemoveThisUser = false
                  if (!isSelf && !isTargetOwner) {
                    if (isOwnerOrAdmin) {
                      canRemoveThisUser = true
                    } else if (isCurator && !isTargetCurator) {
                      canRemoveThisUser = true
                    }
                  }

                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-[1rem] border-[2px] border-foreground bg-card hover:bg-background transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-[8px] bg-[#FFD600] border-[1.5px] border-foreground overflow-hidden flex items-center justify-center shrink-0 shadow-[2px_2px_0px_black]">
                          {m.profile_pic ? (
                            <img src={m.profile_pic} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold font-heading text-[16px] text-foreground">
                              {m.name?.[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[14px] font-heading text-foreground line-clamp-1 flex items-center gap-2">
                            {m.name || "Unknown User"}
                            {normRole === "owner" && (
                              <span className="text-[10px] bg-[#FFD600] text-foreground border-[1.5px] border-foreground px-2 py-0.5 rounded-[100px] font-bold tracking-wider uppercase inline-flex items-center gap-1 shadow-[1px_1px_0px_black]">
                                <Crown className="w-3 h-3" /> Owner
                              </span>
                            )}
                            {normRole === "curator" && (
                              <span className="text-[10px] bg-[#0057FF] text-white border-[1.5px] border-foreground px-2 py-0.5 rounded-[100px] font-bold tracking-wider uppercase inline-flex items-center gap-1 shadow-[1px_1px_0px_black]">
                                <Shield className="w-3 h-3" /> Curator
                              </span>
                            )}
                            {normRole === "member" && (
                              <span className="text-[10px] bg-[#00E5FF] text-foreground border-[1.5px] border-foreground px-2 py-0.5 rounded-[100px] font-bold tracking-wider uppercase inline-flex items-center gap-1 shadow-[1px_1px_0px_black]">
                                <User className="w-3 h-3" /> Member
                              </span>
                            )}
                          </div>
                          <div className="font-sans text-[12px] text-muted-foreground mt-0.5">
                            Joined {new Date(m.joined_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {canAppoint && !isTargetOwner && !isSelf && (
                          normRole === "curator" ? (
                            <button
                              disabled={updateRoleMutation.isPending}
                              onClick={() => {
                                if (window.confirm(`Demote ${m.name || "user"} to regular Member?`)) {
                                  updateRoleMutation.mutate({ userId: m.id, newRole: "member" })
                                }
                              }}
                              title="Demote to Member"
                              className="px-2.5 py-1 text-[11px] font-heading font-bold rounded-[8px] border-[1.5px] border-foreground bg-muted hover:bg-background text-foreground shadow-[2px_2px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50"
                            >
                              Demote to Member
                            </button>
                          ) : (
                            <button
                              disabled={updateRoleMutation.isPending}
                              onClick={() => {
                                if (window.confirm(`Appoint ${m.name || "user"} as Curator? Curators can manage materials and members.`)) {
                                  updateRoleMutation.mutate({ userId: m.id, newRole: "curator" })
                                }
                              }}
                              title="Appoint as Curator"
                              className="px-2.5 py-1 text-[11px] font-heading font-bold rounded-[8px] border-[1.5px] border-foreground bg-[#0057FF] text-white shadow-[2px_2px_0px_black] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50"
                            >
                              Appoint Curator
                            </button>
                          )
                        )}

                        {canRemoveThisUser && (
                          <button
                            disabled={kickMutation.isPending}
                            onClick={() => {
                              if (window.confirm(`Remove ${m.name || "this user"} from the group?`)) {
                                kickMutation.mutate(m.id)
                              }
                            }}
                            title="Remove member"
                            aria-label="Remove member"
                            className="w-8 h-8 shrink-0 rounded-[8px] border-[2px] border-foreground bg-[#FF3B30] text-white shadow-[2px_2px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center disabled:opacity-50"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
