"use client"

import { useState } from "react"
import {
  Archive,
  ExternalLink,
  FileCode,
  FileText,
  Image as ImageIcon,
  Music,
  Play,
  PlayCircle,
  Video,
} from "lucide-react"
import {
  ExcelLogo,
  getFileIcon,
  getLinkIcon,
  isArchiveFile,
  isAudioFile,
  isCodeFile,
  isExcelFile,
  isImageFile,
  isPdfFile,
  isPptFile,
  isVideoFile,
  isWordFile,
  PdfLogo,
  PptLogo,
  WordLogo,
} from "@/components/groups/resourceIcons"
import { formatBytes, getGoogleDriveInfo, getUrlDomain, getYouTubeVideoId } from "@/lib/linkUtils"

interface VaultItemThumbnailProps {
  itemType?: string | null
  mimeType?: string | null
  filename?: string | null
  url?: string | null
  title?: string | null
  thumbnailUrl?: string | null
  sizeBytes?: number | null
  onOpen?: () => void
}

export function VaultItemThumbnail({
  itemType = "file",
  mimeType = "",
  filename = "",
  url = "",
  title = "",
  thumbnailUrl,
  sizeBytes,
  onOpen,
}: VaultItemThumbnailProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const isLink = itemType === "link"
  const safeFilename = filename || ""
  const safeMime = mimeType || ""
  const safeUrl = url || ""

  const isImage = !isLink && isImageFile(safeMime, safeFilename)
  const isPdf = !isLink && isPdfFile(safeMime, safeFilename)
  const isPpt = !isLink && isPptFile(safeMime, safeFilename)
  const isWord = !isLink && isWordFile(safeMime, safeFilename)
  const isExcel = !isLink && isExcelFile(safeMime, safeFilename)
  const isCode = !isLink && isCodeFile(safeMime, safeFilename)
  const isAudio = !isLink && isAudioFile(safeMime, safeFilename)
  const isVideo = !isLink && isVideoFile(safeMime, safeFilename)
  const isArchive = !isLink && isArchiveFile(safeMime, safeFilename)

  const ytVideoId = isLink ? getYouTubeVideoId(safeUrl) : null
  const driveInfo = isLink ? getGoogleDriveInfo(safeUrl) : null
  const domain = isLink ? getUrlDomain(safeUrl) : ""

  const ext = safeFilename.includes(".")
    ? safeFilename.split(".").pop()?.toUpperCase()
    : null

  // 1. YouTube video thumbnail (compact h-24)
  if (isLink && ytVideoId) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-24 relative overflow-hidden bg-black rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground"
      >
        <img
          src={`https://img.youtube.com/vi/${ytVideoId}/mqdefault.jpg`}
          alt={title || "YouTube thumbnail"}
          loading="lazy"
          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(255,0,0,0.5)] group-hover/thumb:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-white translate-x-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white font-mono text-[9px] pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#FF0000] font-bold text-white tracking-wider">
            YOUTUBE
          </span>
          <span className="bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-white/90">
            Watch
          </span>
        </div>
      </div>
    )
  }

  // 2. Real Image Thumbnail (compact h-24)
  if (isImage && thumbnailUrl && !imgFailed) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-24 relative overflow-hidden rounded-t-[1.35rem] bg-muted/40 cursor-pointer group/thumb border-b-[2px] border-foreground flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#88888825_1px,transparent_1px)] [background-size:10px_10px] opacity-70" />
        <img
          src={thumbnailUrl}
          alt={safeFilename || "Image preview"}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300 relative z-10"
        />
        <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/10 transition-colors pointer-events-none z-10" />
        <div className="absolute bottom-2 left-3 z-20 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[4px] border-[1.5px] border-foreground bg-background/95 backdrop-blur-sm font-mono text-[9px] font-bold text-foreground shadow-[1.5px_1.5px_0px_black]">
            {ext || "IMG"}
          </span>
        </div>
      </div>
    )
  }

  // 3. PowerPoint Presentation (Distinct Widescreen 16:9 Presentation Canvas in vibrant Microsoft Orange #EA580C)
  if (isPpt) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-24 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-gradient-to-br from-[#EA580C]/20 via-[#FFF7ED] dark:via-[#1F1208] to-[#EA580C]/30 flex items-center justify-center px-4 select-none"
      >
        {/* Horizontal 16:9 slide presentation canvas */}
        <div className="w-[148px] h-[70px] bg-[#18181B] text-white rounded-[6px] border-[1.5px] border-[#EA580C] shadow-[2.5px_2.5px_0px_#EA580C] flex flex-col justify-between p-2 relative overflow-hidden group-hover/thumb:translate-x-[1px] group-hover/thumb:translate-y-[1px] group-hover/thumb:shadow-none transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <PptLogo className="w-4 h-4 shrink-0" />
              <div className="h-1.5 bg-[#EA580C] rounded-full w-12" />
            </div>
            <span className="font-mono text-[7px] text-[#EA580C] font-bold uppercase tracking-wider">16:9</span>
          </div>

          {/* Slide layout: chart/presentation blocks */}
          <div className="flex items-end gap-1.5 h-4 px-1 py-0.5">
            <div className="w-3 h-2 bg-[#EA580C] rounded-sm" />
            <div className="w-3 h-3.5 bg-white/70 rounded-sm" />
            <div className="w-3 h-2.5 bg-white/40 rounded-sm" />
            <div className="w-3 h-4 bg-[#EA580C]/80 rounded-sm" />
            <div className="space-y-1 ml-1 flex-1">
              <div className="h-1 bg-white/40 rounded-full w-full" />
              <div className="h-1 bg-white/20 rounded-full w-3/4" />
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[7px] text-white/60 border-t border-white/10 pt-0.5">
            <span className="text-[#EA580C] font-bold">SLIDE DECK</span>
            <span className="uppercase">{ext || "PPTX"}</span>
          </div>
        </div>

        <div className="absolute bottom-1.5 left-3 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#EA580C] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
            SLIDES
          </span>
        </div>
      </div>
    )
  }

  // 4. PDF Document (Distinct Vertical Page in Adobe Red #DC2626)
  if (isPdf) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-24 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-gradient-to-br from-[#DC2626]/12 via-[#F8FAFC] dark:via-[#1A1214] to-[#DC2626]/20 flex items-center justify-center px-4 select-none"
      >
        {/* Mini 8.5x11 Document Page preview */}
        <div className="w-[100px] h-[72px] bg-white dark:bg-[#1E1E1E] rounded-[5px] border-[1.5px] border-[#DC2626] shadow-[2.5px_2.5px_0px_#DC2626] flex flex-col justify-between p-1.5 relative overflow-hidden group-hover/thumb:translate-x-[1px] group-hover/thumb:translate-y-[1px] group-hover/thumb:shadow-none transition-all">
          <div className="flex items-center gap-1.5 pb-1 border-b border-[#DC2626]/20">
            <PdfLogo className="w-3.5 h-3.5 shrink-0" />
            <div className="h-1.5 bg-[#DC2626] rounded-full w-10" />
          </div>

          {/* Structured text paragraph lines */}
          <div className="space-y-0.5 py-0.5">
            <div className="h-0.5 bg-foreground/30 rounded-full w-full" />
            <div className="h-0.5 bg-foreground/20 rounded-full w-5/6" />
            <div className="h-0.5 bg-foreground/20 rounded-full w-full" />
            <div className="h-0.5 bg-foreground/15 rounded-full w-3/4" />
          </div>

          <div className="flex items-center justify-between font-mono text-[7px] text-[#DC2626] font-bold">
            <span>DOC</span>
            <span>PDF</span>
          </div>
        </div>

        <div className="absolute bottom-1.5 left-3 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#DC2626] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
            PDF DOC
          </span>
        </div>
      </div>
    )
  }

  // 5. Word Document (Microsoft Blue #2563EB)
  if (isWord) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-24 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-gradient-to-br from-[#2563EB]/12 via-[#EFF6FF] dark:via-[#101827] to-[#2563EB]/20 flex items-center justify-center px-4 select-none"
      >
        <div className="w-[100px] h-[72px] bg-white dark:bg-[#1E1E1E] rounded-[5px] border-[1.5px] border-[#2563EB] shadow-[2.5px_2.5px_0px_#2563EB] flex flex-col justify-between p-1.5 relative overflow-hidden group-hover/thumb:translate-x-[1px] group-hover/thumb:translate-y-[1px] group-hover/thumb:shadow-none transition-all">
          <div className="flex items-center gap-1.5 pb-1 border-b border-[#2563EB]/20">
            <WordLogo className="w-3.5 h-3.5 shrink-0" />
            <div className="h-1.5 bg-[#2563EB] rounded-full w-10" />
          </div>
          <div className="space-y-0.5 py-0.5">
            <div className="h-0.5 bg-foreground/30 rounded-full w-full" />
            <div className="h-0.5 bg-foreground/20 rounded-full w-5/6" />
            <div className="h-0.5 bg-foreground/15 rounded-full w-3/4" />
          </div>
          <div className="flex items-center justify-between font-mono text-[7px] text-[#2563EB] font-bold">
            <span>WORD</span>
            <span>{ext || "DOCX"}</span>
          </div>
        </div>

        <div className="absolute bottom-1.5 left-3 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#2563EB] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
            WORD
          </span>
        </div>
      </div>
    )
  }

  // 6. Excel Spreadsheet (Microsoft Green #16A34A)
  if (isExcel) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-24 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-gradient-to-br from-[#16A34A]/12 via-[#F0FDF4] dark:via-[#0E2015] to-[#16A34A]/20 flex items-center justify-center px-4 select-none"
      >
        <div className="w-[124px] h-[72px] bg-white dark:bg-[#1E1E1E] rounded-[5px] border-[1.5px] border-[#16A34A] shadow-[2.5px_2.5px_0px_#16A34A] flex flex-col justify-between p-1.5 relative overflow-hidden group-hover/thumb:translate-x-[1px] group-hover/thumb:translate-y-[1px] group-hover/thumb:shadow-none transition-all">
          <div className="flex items-center gap-1.5 pb-0.5">
            <ExcelLogo className="w-3.5 h-3.5 shrink-0" />
            <div className="h-1.5 bg-[#16A34A] rounded-full w-12" />
          </div>
          <div className="grid grid-cols-3 gap-0.5 border border-[#16A34A]/30 rounded p-0.5 bg-[#16A34A]/5">
            <div className="h-2 bg-[#16A34A]/30 rounded-[1px]" />
            <div className="h-2 bg-[#16A34A]/30 rounded-[1px]" />
            <div className="h-2 bg-[#16A34A]/30 rounded-[1px]" />
            <div className="h-2 bg-foreground/10 rounded-[1px]" />
            <div className="h-2 bg-foreground/10 rounded-[1px]" />
            <div className="h-2 bg-foreground/10 rounded-[1px]" />
          </div>
          <div className="flex items-center justify-between font-mono text-[7px] text-[#16A34A] font-bold">
            <span>SHEET</span>
            <span>{ext || "XLSX"}</span>
          </div>
        </div>

        <div className="absolute bottom-1.5 left-3 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#16A34A] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
            SHEET
          </span>
        </div>
      </div>
    )
  }

  // 7. Code / Developer File (Dark Editor #0F172A)
  if (isCode) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-24 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center px-4 select-none"
      >
        <div className="w-[130px] h-[70px] bg-[#0A0F1D] rounded-[5px] border-[1.5px] border-white/20 shadow-[2.5px_2.5px_0px_#0057FF] flex flex-col justify-between p-1.5 relative overflow-hidden group-hover/thumb:translate-x-[1px] group-hover/thumb:translate-y-[1px] group-hover/thumb:shadow-none transition-all">
          <div className="flex items-center gap-1 pb-0.5 border-b border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5F56]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#27C93F]" />
            <span className="font-mono text-[8px] text-white/50 ml-auto">.{ext?.toLowerCase() || "code"}</span>
          </div>
          <div className="space-y-0.5 font-mono text-[8px] leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-[#FF7B72]">const</span>
              <span className="text-[#79C0FF]">modulus</span>
              <span className="text-white">=</span>
              <span className="text-[#A5D6FF]">true</span>
            </div>
            <div className="h-0.5 bg-white/15 rounded-full w-3/4" />
          </div>
          <div className="flex items-center justify-between font-mono text-[7px] text-[#79C0FF]">
            <span>UTF-8</span>
            <span>DEV</span>
          </div>
        </div>

        <div className="absolute bottom-1.5 left-3 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#0057FF] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
            CODE
          </span>
        </div>
      </div>
    )
  }

  // 8. Audio Visualizer (Amber #EAB308)
  if (isAudio) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-24 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-gradient-to-br from-[#EAB308]/20 via-[#FEFCE8] dark:via-[#1F1D08] to-[#EA580C]/20 flex items-center justify-center px-4 select-none"
      >
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-card border-[1.5px] border-foreground rounded-[8px] shadow-[2px_2px_0px_black]">
          <div className="w-6 h-6 rounded-[6px] bg-[#EAB308] border-[1px] border-foreground flex items-center justify-center">
            <Music className="w-3.5 h-3.5 text-foreground" />
          </div>
          <div className="flex items-end gap-1 h-5 px-1">
            <div className="w-1 h-2 bg-[#EA580C] rounded-full" />
            <div className="w-1 h-4 bg-[#EAB308] rounded-full" />
            <div className="w-1 h-3 bg-foreground rounded-full" />
            <div className="w-1 h-5 bg-[#FF3CAC] rounded-full" />
            <div className="w-1 h-3 bg-[#0057FF] rounded-full" />
          </div>
        </div>

        <div className="absolute bottom-1.5 left-3 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#EAB308] text-foreground font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-foreground">
            AUDIO
          </span>
        </div>
      </div>
    )
  }

  // 9. Video file
  if (isVideo) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-24 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-gradient-to-br from-[#FF3CAC]/25 via-black to-[#0057FF]/35 flex items-center justify-center select-none"
      >
        <div className="w-9 h-9 rounded-full bg-[#FF3CAC] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(255,60,172,0.6)] group-hover/thumb:scale-110 transition-transform">
          <Play className="w-4 h-4 fill-white translate-x-0.5" />
        </div>
        <div className="absolute bottom-1.5 left-3 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#FF3CAC] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
            VIDEO
          </span>
        </div>
      </div>
    )
  }

  // 10. Archive / Zip
  if (isArchive) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-24 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-gradient-to-br from-muted/50 via-card to-muted/80 flex items-center justify-center px-4 select-none"
      >
        <div className="w-11 h-11 rounded-[10px] border-[1.5px] border-foreground bg-card flex items-center justify-center shadow-[2px_2px_0px_black] group-hover/thumb:translate-x-[1px] group-hover/thumb:translate-y-[1px] group-hover/thumb:shadow-none transition-all">
          <Archive className="w-5 h-5 text-foreground" />
        </div>
        <div className="absolute bottom-1.5 left-3 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-foreground text-background font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black]">
            {ext || "ARCHIVE"}
          </span>
        </div>
      </div>
    )
  }

  // 11. Google Drive Link
  if (isLink && driveInfo) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-24 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-gradient-to-br from-[#2684fc]/15 via-white dark:via-[#161C24] to-[#00ac47]/15 flex items-center justify-center px-4 select-none"
      >
        <div className="w-11 h-11 rounded-[10px] border-[1.5px] border-foreground bg-card flex items-center justify-center shadow-[2px_2px_0px_black] p-2 group-hover/thumb:translate-x-[1px] group-hover/thumb:translate-y-[1px] group-hover/thumb:shadow-none transition-all">
          {getLinkIcon(safeUrl, "w-6 h-6")}
        </div>
        <div className="absolute bottom-1.5 left-3 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#0066da] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black]">
            DRIVE
          </span>
        </div>
      </div>
    )
  }

  // 12. Generic Web Link
  if (isLink) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-24 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-gradient-to-br from-[#0057FF]/10 via-card to-[#0057FF]/20 flex flex-col items-center justify-center px-4 select-none"
      >
        <div className="w-10 h-10 rounded-[8px] border-[1.5px] border-foreground bg-card flex items-center justify-center shadow-[2px_2px_0px_black] group-hover/thumb:translate-x-[1px] group-hover/thumb:translate-y-[1px] group-hover/thumb:shadow-none transition-all">
          <ExternalLink className="w-5 h-5 text-[#0057FF]" />
        </div>
        <span className="font-mono text-[10px] font-bold text-foreground/80 mt-1 truncate max-w-[85%]">
          {domain || "Web Link"}
        </span>
        <div className="absolute bottom-1.5 left-3 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#0057FF] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black]">
            LINK
          </span>
        </div>
      </div>
    )
  }

  // 13. Default Generic File Fallback
  return (
    <div
      onClick={onOpen}
      className="w-full h-24 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-gradient-to-br from-muted/30 via-card to-muted/60 flex items-center justify-center px-4 select-none"
    >
      <div className="w-10 h-10 rounded-[8px] border-[1.5px] border-foreground bg-card flex items-center justify-center shadow-[2px_2px_0px_black] group-hover/thumb:translate-x-[1px] group-hover/thumb:translate-y-[1px] group-hover/thumb:shadow-none transition-all">
        {getFileIcon(safeMime, "w-5 h-5", safeFilename)}
      </div>
      <div className="absolute bottom-1.5 left-3 pointer-events-none">
        <span className="px-1.5 py-0.5 rounded-[4px] bg-foreground text-background font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black]">
          {ext || "FILE"}
        </span>
      </div>
    </div>
  )
}
