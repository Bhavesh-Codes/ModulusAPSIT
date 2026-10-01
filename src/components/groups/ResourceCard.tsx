"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  Archive, BookOpen, Clock, Download, ExternalLink, Eye, Loader2, MoreVertical, Pencil, Pin, PinOff, PlayCircle,
  RotateCcw, Trash2, User,
} from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { removeShare, setShareStatus, setSharePinned } from "@/actions/groups"
import { useVaultWindowStore } from "@/lib/stores/useVaultWindowStore"
import {
  formatBytes, getGoogleDriveInfo, getUrlDomain, getYouTubePlaylistId, getYouTubeVideoId,
} from "@/lib/linkUtils"
import { currentAcademicYear, resourceTypeLabel, type CommunityResource, type ShareStatus } from "@/types/groups"
import { getFileIcon, getLinkIcon } from "./resourceIcons"

const itemCls =
  "flex items-center gap-2 cursor-pointer font-sans text-[13px] font-medium focus:bg-muted px-2 py-1.5 rounded-[0.5rem] outline-none"

export function ResourceCard({
  resource,
  viewerId,
  canManage,
  showSubject = false,
  onEdit,
}: {
  resource: CommunityResource
  viewerId: string | null
  /** HOD/dev */
  canManage: boolean
  showSubject?: boolean
  onEdit: (resource: CommunityResource) => void
}) {
  const queryClient = useQueryClient()
  const openWindow = useVaultWindowStore((s) => s.openWindow)
  const [busy, setBusy] = useState(false)

  const isSharer = !!viewerId && resource.shared_by_user_id === viewerId
  const canEdit = isSharer || canManage
  const isLink = resource.item_type === "link"
  const url = resource.url ?? ""
  const inactive = resource.status !== "current"
  const olderYear = !!resource.academic_year && resource.academic_year < currentAcademicYear()
  const ytPlaylist = isLink ? getYouTubePlaylistId(url) : null
  const ytVideo = isLink ? getYouTubeVideoId(url) : null
  const drive = isLink ? getGoogleDriveInfo(url) : null

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["communityVault", resource.community_id] })
    queryClient.invalidateQueries({ queryKey: ["communitySubjects", resource.community_id] })
  }

  const accessUrl = async (action: "view" | "download") => {
    const res = await fetch(`/api/communities/${resource.community_id}/vault/${resource.id}/download?action=${action}`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to get link")
    return data.url as string
  }

  const open = async () => {
    if (isLink) {
      if (ytPlaylist || ytVideo) {
        openWindow({
          type: "youtube",
          url: ytPlaylist
            ? `https://www.youtube.com/embed/videoseries?list=${ytPlaylist}&autoplay=1`
            : `https://www.youtube.com/embed/${ytVideo}?autoplay=1`,
          title: resource.title,
        })
      } else if (drive) {
        openWindow({
          type: drive.type === "folder" ? "drive_folder" : "drive_file",
          url:
            drive.type === "folder"
              ? `https://drive.google.com/embeddedfolderview?id=${drive.id}#list`
              : `https://drive.google.com/file/d/${drive.id}/preview`,
          title: resource.title,
        })
      } else {
        window.open(url, "_blank", "noopener,noreferrer")
      }
      return
    }
    setBusy(true)
    try {
      const signed = await accessUrl("view")
      const mime = resource.file?.mime_type ?? ""
      if (mime.startsWith("image/") || mime === "application/pdf") {
        openWindow({ type: mime.startsWith("image/") ? "image" : "pdf", url: signed, title: resource.title })
      } else {
        window.open(signed, "_blank", "noopener,noreferrer")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to open")
    } finally {
      setBusy(false)
    }
  }

  const download = async () => {
    setBusy(true)
    try {
      const signed = await accessUrl("download")
      const a = document.createElement("a")
      a.href = signed
      a.download = resource.file?.filename ?? "file"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to download")
    } finally {
      setBusy(false)
    }
  }

  const act = async (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) => {
    setBusy(true)
    const res = await fn()
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error ?? "Something went wrong")
      return
    }
    toast.success(success)
    refresh()
  }

  const status = (s: ShareStatus, msg: string) => act(() => setShareStatus(resource.id, s), msg)

  return (
    <article
      className={`group relative border-[2px] border-foreground rounded-[1.5rem] p-5 bg-card shadow-[4px_4px_0px_black] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none flex flex-col gap-3 ${
        inactive ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={open}
          aria-label={`Open ${resource.title}`}
          className={`w-14 h-14 shrink-0 rounded-[12px] border-[2px] border-foreground bg-background flex items-center justify-center shadow-[3px_3px_0px_black]`}
        >
          {isLink ? getLinkIcon(url) : getFileIcon(resource.file?.mime_type)}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={open}
            disabled={busy}
            title={isLink ? "Open link" : "View file"}
            aria-label={isLink ? "Open link" : "View file"}
            className="w-8 h-8 rounded-[8px] border-[1.5px] border-foreground bg-card hover:bg-[#0057FF] hover:text-white flex items-center justify-center shadow-[2px_2px_0px_black] transition-colors disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLink ? (
              ytPlaylist || ytVideo ? <PlayCircle className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More actions"
                className="w-8 h-8 rounded-[8px] border-[1.5px] border-foreground bg-card hover:bg-background flex items-center justify-center shadow-[2px_2px_0px_black] outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 bg-card border-[2px] border-foreground rounded-[1rem] shadow-[4px_4px_0px_black] p-1.5 z-50"
            >
              {!isLink && (
                <DropdownMenuItem onClick={download} className={itemCls}>
                  <Download className="w-4 h-4 text-[#FFD600]" /> Download
                </DropdownMenuItem>
              )}
              {canEdit && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(resource)} className={itemCls}>
                    <Pencil className="w-4 h-4 text-[#00C853]" /> {canManage ? "Edit / move" : "Edit details"}
                  </DropdownMenuItem>
                  {resource.status !== "current" && (
                    <DropdownMenuItem onClick={() => status("current", "Marked as current")} className={itemCls}>
                      <RotateCcw className="w-4 h-4 text-[#0057FF]" /> Mark as current
                    </DropdownMenuItem>
                  )}
                  {resource.status !== "outdated" && (
                    <DropdownMenuItem onClick={() => status("outdated", "Marked as outdated")} className={itemCls}>
                      <Clock className="w-4 h-4 text-[#FF6B00]" /> Mark outdated
                    </DropdownMenuItem>
                  )}
                  {resource.status !== "archived" && (
                    <DropdownMenuItem onClick={() => status("archived", "Archived")} className={itemCls}>
                      <Archive className="w-4 h-4 text-muted-foreground" /> Archive
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {canManage && (
                <DropdownMenuItem
                  onClick={() =>
                    act(() => setSharePinned(resource.id, !resource.is_pinned), resource.is_pinned ? "Unpinned" : "Pinned")
                  }
                  className={itemCls}
                >
                  {resource.is_pinned ? <PinOff className="w-4 h-4 text-[#FF3CAC]" /> : <Pin className="w-4 h-4 text-[#FF3CAC]" />}
                  {resource.is_pinned ? "Unpin" : "Pin to “Start here”"}
                </DropdownMenuItem>
              )}
              {canEdit && (
                <>
                  <DropdownMenuSeparator className="bg-muted my-1" />
                  <DropdownMenuItem
                    onClick={() => {
                      if (window.confirm(`Unshare “${resource.title}” from this community?`)) {
                        act(() => removeShare(resource.id), "Unshared")
                      }
                    }}
                    className={`${itemCls} text-[#FF3B30] focus:bg-[#FF3B30] focus:text-white`}
                  >
                    <Trash2 className="w-4 h-4" /> Unshare
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="min-w-0 space-y-1.5">
        <h3 className="font-heading font-bold text-[16px] text-foreground leading-snug line-clamp-2" title={resource.title}>
          {resource.is_pinned && <Pin className="inline w-3.5 h-3.5 mr-1 -mt-0.5 text-[#FF3CAC]" aria-label="Pinned" />}
          {resource.title}
        </h3>

        {showSubject && resource.subject && (
          <p className="font-mono text-[11px] text-muted-foreground flex items-center gap-1 min-w-0">
            <BookOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {resource.subject.code ? `${resource.subject.code} · ` : ""}
              {resource.subject.name}
              {resource.module ? ` › Module ${resource.module.number}` : ""}
            </span>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-[100px] border-[1.5px] border-foreground bg-background font-mono text-[10px] font-bold">
            {resourceTypeLabel(resource.resource_type)}
          </span>
          {resource.academic_year && (
            <span
              className={`px-2 py-0.5 rounded-[100px] border-[1.5px] border-foreground font-mono text-[10px] font-bold ${
                olderYear ? "bg-[#FF6B00] text-white" : "bg-background"
              }`}
              title={olderYear ? "From an older academic year" : "Current academic year"}
            >
              {resource.academic_year}
            </span>
          )}
          {inactive && (
            <span className="px-2 py-0.5 rounded-[100px] border-[1.5px] border-foreground bg-muted font-mono text-[10px] font-bold uppercase">
              {resource.status}
            </span>
          )}
        </div>

        {resource.description && (
          <p className="font-sans text-[13px] text-muted-foreground line-clamp-2">{resource.description}</p>
        )}

        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resource.tags.slice(0, 4).map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-[100px] border-[1.2px] border-foreground bg-background font-mono text-[10px] font-bold">
                #{t}
              </span>
            ))}
            {resource.tags.length > 4 && <span className="font-mono text-[10px] text-muted-foreground">+{resource.tags.length - 4}</span>}
          </div>
        )}
      </div>

      <div className="mt-auto pt-3 border-t-[2px] border-dashed border-foreground flex items-center justify-between gap-2 font-sans text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5 min-w-0">
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{resource.uploaded_by_name ? `Uploaded by ${resource.uploaded_by_name}` : "Uploaded"}</span>
        </span>
        <span className="font-mono text-[11px] shrink-0">
          {isLink ? getUrlDomain(url) : formatBytes(resource.file?.size_bytes)} · {new Date(resource.created_at).toLocaleDateString()}
        </span>
      </div>
    </article>
  )
}
