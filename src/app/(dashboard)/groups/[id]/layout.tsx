"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, usePathname } from "next/navigation"
import {
  Loader2, UserMinus, UserPlus, Users, ArrowLeft,
  Shield, User,
  FolderSync,
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
import { joinModule, leaveModule, getModuleMembers, removeMember } from "@/actions/modules"

// ─── Constants ───────────────────────────────────────────────────────────────

const SIDEBAR_OPEN_WIDTH = 240
const SIDEBAR_COLLAPSED_WIDTH = 64

// ─── App nav links ────────────────────────────────────────────────────────────

function getNavLinks(id: string) {
  return [
    { label: "Vault", href: `/groups/${id}/vault`, icon: FolderSync },
  ]
}

// ─── Module App Sidebar ────────────────────────────────────────────────────

function CommunitySidebar({ id }: { id: string }) {
  const {
    communitySidebarOpen,
    toggleCommunitySidebar,
    communitySidebarMobileOpen,
    setCommunitySidebarMobileOpen,
  } = useUiStore()

  const pathname = usePathname()
  const navLinks = getNavLinks(id)

  const width = communitySidebarOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_COLLAPSED_WIDTH

  // Shared link renderer
  const renderLinks = (collapsed: boolean) =>
    navLinks.map(({ label, href, icon: Icon }) => {
      const isActive = pathname.startsWith(href)
      return (
        <Link
          key={href}
          href={href}
          title={collapsed ? label : undefined}
          onClick={() => setCommunitySidebarMobileOpen(false)}
          className={`
            relative flex items-center md:flex-1 gap-3 transition-all
            ${collapsed ? "justify-center p-3 rounded-[1rem] mx-2" : "px-4 py-3 rounded-[1rem] mx-4"}
            border-[2px] border-foreground shadow-[3px_3px_0px_black] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none
            ${isActive
              ? "bg-[#FFD600]"
              : "bg-card"
            }
          `}
          style={{ minHeight: 48 }}
        >
          <Icon
            className="shrink-0"
            style={{ width: 20, height: 20, color: "var(--foreground)" }}
            strokeWidth={isActive ? 2.5 : 2}
          />
          {!collapsed && (
            <span
              className="font-sans text-[14px] text-foreground whitespace-nowrap overflow-hidden"
              style={{ fontWeight: isActive ? 700 : 500 }}
            >
              {label}
            </span>
          )}
        </Link>
      )
    })

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
        // NOTE: no 'display' here — let className="hidden md:flex" control it
        // so that inline style doesn't override the hidden class on mobile.
        flexDirection: "column",
        background: "var(--background)",
        borderLeft: "2px solid var(--foreground)",
        zIndex: 30,
        overflow: "hidden",
      }}
      className="hidden md:flex shadow-[-4px_0_10px_rgba(0,0,0,0.05)]"
    >
      {/* Toggle button */}
      <div
        className="shrink-0 flex items-center border-b-[2px] border-b-[var(--foreground)] bg-card shadow-sm mb-4"
        style={{
          height: 64,
          justifyContent: communitySidebarOpen ? "flex-end" : "center",
          padding: communitySidebarOpen ? "0 16px" : "0",
        }}
      >
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

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col py-8 pb-12 gap-5">
        {renderLinks(!communitySidebarOpen)}
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
          // NOTE: no 'display' here — 'flex' is in className so md:hidden can override
          flexDirection: "column",
          background: "var(--background)",
          borderLeft: "2px solid var(--foreground)",
          zIndex: 50,
        }}
        className="flex flex-col md:hidden shadow-[-4px_0_10px_rgba(0,0,0,0.05)]"
      >
        <div
          className="shrink-0 flex items-center justify-between border-b-[2px] border-b-[var(--foreground)] bg-card px-4 mb-4"
          style={{ height: 64 }}
        >
          <span className="font-heading font-bold text-[15px] text-foreground">Apps</span>
          <button
            onClick={() => setCommunitySidebarMobileOpen(false)}
            className="flex items-center justify-center bg-card hover:bg-[#FFD600] border-[2px] border-foreground shadow-[3px_3px_0_black] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all rounded-[10px]"
            style={{ width: 40, height: 40, minWidth: 40 }}
          >
            <X style={{ width: 18, height: 18, color: "var(--foreground)" }} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto flex flex-col py-8 pb-12 gap-5">
          {renderLinks(false)}
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
  if (role !== "hod" && role !== "faculty") return null
  const isHod = role === "hod"
  const Icon = isHod ? Shield : User
  const tone = isHod ? "bg-[#0057FF] text-white" : "bg-[#FFD600] text-foreground"
  if (compact) {
    return (
      <span title={isHod ? "HOD" : "Faculty"} className={`flex items-center justify-center w-8 h-8 rounded-full border-[2px] border-foreground shadow-[2px_2px_0_black] ${tone}`}>
        <Icon className="w-4 h-4" />
      </span>
    )
  }
  return (
    <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-[100px] border-[2px] border-foreground shadow-[2px_2px_0px_black] font-mono text-[13px] font-bold tracking-wide ${tone}`}>
      <Icon className="w-4 h-4" />
      {isHod ? "HOD" : "FACULTY"}
    </span>
  )
}

function CommunityHeader({
  community,
  id,
  isSubPage,
  isMember,
  canManage,
  role,
  onManageMembers,
  onMobileMenuOpen,
}: {
  community: any
  id: string
  isSubPage: boolean
  isMember: boolean
  canManage: boolean
  role: string | undefined
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

  // ── Collapsed header (sub-pages) ──────────────────────────────────────────
  if (isSubPage) {
    return (
      <header
        className="flex items-center bg-card border-[3px] border-foreground rounded-[1.5rem] shadow-[6px_6px_0px_black] px-5 py-3 gap-3 sticky top-4 z-40 shrink-0 transition-all duration-300 ease-in-out"
      >
        <Link
          href={`/groups/${id}`}
          className="px-3 py-1.5 flex items-center justify-center gap-1.5 rounded-[0.875rem] border-[2px] border-foreground bg-card shadow-[3px_3px_0px_black] font-heading font-bold text-[14px] text-foreground hover:bg-background hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all shrink-0"
          title="Back to group home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:inline">Back</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 flex-1 overflow-hidden">
          <span className="font-heading font-extrabold text-foreground leading-none truncate text-[18px]">
            {community.name}
          </span>
          <span className="font-mono text-[12px] text-muted-foreground">
            <span className="hidden md:inline mr-2">•</span>
            {community.member_count} member{community.member_count !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <RoleBadge role={role} compact />
        </div>

        <button
          onClick={onMobileMenuOpen}
          className="ml-auto flex items-center justify-center bg-card hover:bg-[#FFD600] border-[2px] border-foreground shadow-[2px_2px_0_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-[8px] md:hidden shrink-0"
          style={{ width: 36, height: 36 }}
          title="Open apps"
        >
          <Menu style={{ width: 18, height: 18, color: "var(--foreground)" }} />
        </button>
      </header>
    )
  }

  // ── Expanded header (group home) ──────────────────────────────────────
  return (
    <header
      className="relative bg-card border-[3px] border-foreground rounded-[2rem] shadow-[8px_8px_0px_black] overflow-hidden"
      style={{ transition: "all 0.3s ease" }}
    >
      <div className="h-48 md:h-64 bg-[#FFD600] border-b-[3px] border-foreground relative flex items-center justify-center overflow-hidden">
        <div className="absolute top-4 left-4 w-12 h-12 rounded-full border-[3px] border-foreground bg-[#FF3CAC] -translate-x-2 -translate-y-2 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-16 h-16 border-[3px] border-foreground bg-[#0057FF] rotate-12 translate-x-2 translate-y-2 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(var(--foreground) 2.5px, transparent 2.5px)",
            backgroundSize: "30px 30px",
          }}
        />
        {community.banner_url ? (
          <img
            src={community.banner_url}
            alt="banner"
            className="w-full h-full object-cover relative z-10"
          />
        ) : (
          <h1 className="font-heading font-extrabold text-8xl text-foreground opacity-20 relative z-10 select-none">
            {community.name[0]?.toUpperCase()}
          </h1>
        )}

        <Link
          href="/groups"
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-[0.875rem] border-[2px] border-[#0A0A0A] bg-[#FFFFFF] shadow-[3px_3px_0px_#0A0A0A] font-heading font-bold text-[13px] text-[#0A0A0A] hover:bg-[#FFD600] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
          title="Back to Groups"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Groups</span>
        </Link>
      </div>

      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex-1 space-y-4">
          <div className="flex items-center flex-wrap gap-3">
            <h1 className="font-heading font-extrabold text-[32px] md:text-[42px] leading-none text-foreground">
              {community.name}
            </h1>

            <RoleBadge role={role} />

            {canManage && (
              <button
                onClick={onManageMembers}
                className="ml-auto md:ml-2 px-4 py-1.5 rounded-[0.75rem] border-[2px] border-foreground bg-card shadow-[3px_3px_0px_black] font-heading font-bold text-[14px] text-foreground hover:bg-[#FFD600] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Manage Members
              </button>
            )}
          </div>

          <p className="font-sans text-[16px] md:text-[18px] text-muted-foreground max-w-3xl leading-relaxed">
            {community.description || "No description provided."}
          </p>

          <div className="flex items-center gap-2 font-mono text-[14px] text-foreground">
            <div className="w-10 h-10 rounded-[10px] bg-muted border-[2px] border-foreground flex items-center justify-center shadow-[2px_2px_0px_black]">
              <Users className="w-5 h-5 text-foreground" />
            </div>
            <span className="font-bold text-[16px]">{community.member_count}</span>
            {" "}member{community.member_count !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto flex flex-col items-stretch md:items-end gap-3 mt-4 md:mt-0 relative z-20">
          {canManage ? (
            <div className="px-6 py-3 rounded-[1rem] border-[3px] border-foreground bg-background font-heading font-bold text-[15px] text-foreground opacity-80 flex items-center justify-center gap-2 w-full md:w-auto">
              <Shield className="w-5 h-5" />
              You manage every group
            </div>
          ) : isMember ? (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to leave ${community.name}?`)) {
                  leaveMutation.mutate()
                }
              }}
              disabled={leaveMutation.isPending}
              className="px-6 py-3 rounded-[1rem] border-[3px] border-foreground bg-[#FF3B30] shadow-[4px_4px_0px_black] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all font-heading font-bold text-[15px] text-white flex items-center justify-center gap-2 disabled:opacity-50 w-full md:w-auto"
            >
              {leaveMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserMinus className="w-5 h-5" />
              )}
              Leave Group
            </button>
          ) : (
            <button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className="px-6 py-3 rounded-[1rem] border-[3px] border-foreground bg-[#FFD600] shadow-[6px_6px_0px_black] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none transition-all font-heading font-bold text-[16px] text-foreground flex items-center justify-center gap-2 disabled:opacity-50 w-full md:w-auto"
            >
              {joinMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              Join Group
            </button>
          )}

          <div className="flex gap-2 self-end md:self-auto mt-2">
            {canManage && (
              <CommunitySettingsModal community={community} />
            )}

            <button
              onClick={onMobileMenuOpen}
              className="w-12 h-12 rounded-[12px] border-[2px] border-foreground bg-card shadow-[3px_3px_0px_black] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all flex items-center justify-center md:hidden"
              title="Open apps"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
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

  const { communitySidebarOpen, communitySidebarMobileOpen, setCommunitySidebarMobileOpen } =
    useUiStore()

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

  const role = community.membership?.role as string | undefined
  const isMember = !!community.membership
  const canManage = !!community.can_manage

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
            role={role}
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
}: {
  isOpen: boolean
  onClose: () => void
  communityId: string
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
                {members.map((m: any) => (
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
                          {m.role === "hod" && (
                            <span className="text-[10px] bg-[#0057FF] text-white border-[1.5px] border-foreground px-1.5 rounded-[100px] font-bold tracking-widest uppercase">
                              HOD
                            </span>
                          )}
                        </div>
                        <div className="font-sans text-[12px] text-muted-foreground mt-0.5">
                          Joined {new Date(m.joined_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <button
                      disabled={kickMutation.isPending}
                      onClick={() => {
                        if (window.confirm("Remove this member from the group?")) {
                          kickMutation.mutate(m.id)
                        }
                      }}
                      title="Remove member"
                      aria-label="Remove member"
                      className="w-8 h-8 shrink-0 rounded-[8px] border-[2px] border-foreground bg-[#FF3B30] text-white shadow-[2px_2px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
