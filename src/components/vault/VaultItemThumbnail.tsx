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
  FileLinesLogo,
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

  // 1. YouTube video thumbnail (h-28)
  if (isLink && ytVideoId) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-28 relative overflow-hidden bg-black rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground"
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
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white font-mono text-[9px] pointer-events-none z-10">
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

  // 2. Real Image Thumbnail (h-28)
  if (isImage && thumbnailUrl && !imgFailed) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-28 relative overflow-hidden rounded-t-[1.35rem] bg-muted/40 cursor-pointer group/thumb border-b-[2px] border-foreground flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#88888825_1px,transparent_1px)] [background-size:10px_10px] opacity-70 pointer-events-none" />
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

  // 3. PowerPoint Presentation (PowerPoint Tangerine Orange #F97316)
  if (isPpt) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-28 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-muted/30 dark:bg-muted/15 flex items-center justify-center select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#88888820_1px,transparent_1px)] [background-size:10px_10px] opacity-70 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full bg-[#F97316]/10 blur-xl pointer-events-none" />
        <div className="relative z-10 transition-transform duration-200 group-hover/thumb:scale-110">
          <PptLogo className="w-14 h-14 shrink-0" color="#F97316" />
        </div>
        <div className="absolute bottom-2 left-3 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-[5px] bg-[#F97316] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
            {ext || "PPTX"}
          </span>
        </div>
      </div>
    )
  }

  // 4. PDF Document (Adobe Crimson Red #E11D48)
  if (isPdf) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-28 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-muted/30 dark:bg-muted/15 flex items-center justify-center select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#88888820_1px,transparent_1px)] [background-size:10px_10px] opacity-70 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full bg-[#E11D48]/10 blur-xl pointer-events-none" />
        <div className="relative z-10 transition-transform duration-200 group-hover/thumb:scale-110">
          <PdfLogo className="w-14 h-14 shrink-0" color="#E11D48" />
        </div>
        <div className="absolute bottom-2 left-3 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-[5px] bg-[#E11D48] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
            PDF
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
        className="w-full h-28 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-muted/30 dark:bg-muted/15 flex items-center justify-center select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#88888820_1px,transparent_1px)] [background-size:10px_10px] opacity-70 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full bg-[#2563EB]/10 blur-xl pointer-events-none" />
        <div className="relative z-10 transition-transform duration-200 group-hover/thumb:scale-110">
          <WordLogo className="w-14 h-14 shrink-0" color="#2563EB" />
        </div>
        <div className="absolute bottom-2 left-3 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-[5px] bg-[#2563EB] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
            {ext || "DOCX"}
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
        className="w-full h-28 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-muted/30 dark:bg-muted/15 flex items-center justify-center select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#88888820_1px,transparent_1px)] [background-size:10px_10px] opacity-70 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full bg-[#16A34A]/10 blur-xl pointer-events-none" />
        <div className="relative z-10 transition-transform duration-200 group-hover/thumb:scale-110">
          <ExcelLogo className="w-14 h-14 shrink-0" color="#16A34A" />
        </div>
        <div className="absolute bottom-2 left-3 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-[5px] bg-[#16A34A] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
            {ext || "XLSX"}
          </span>
        </div>
      </div>
    )
  }

  // 7. Code / Developer File
  if (isCode) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-28 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-muted/30 dark:bg-muted/15 flex items-center justify-center select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#88888820_1px,transparent_1px)] [background-size:10px_10px] opacity-70 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full bg-[#0057FF]/10 blur-xl pointer-events-none" />
        <div className="relative z-10 transition-transform duration-200 group-hover/thumb:scale-110">
          <FileCode className="w-14 h-14 text-[#0057FF]" />
        </div>
        <div className="absolute bottom-2 left-3 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-[5px] bg-[#0057FF] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
            {ext || "CODE"}
          </span>
        </div>
      </div>
    )
  }

  // 8. Audio Visualizer
  if (isAudio) {
    return (
      <div
        onClick={onOpen}
        className="w-full h-28 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-muted/30 dark:bg-muted/15 flex items-center justify-center select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#88888820_1px,transparent_1px)] [background-size:10px_10px] opacity-70 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full bg-[#EAB308]/10 blur-xl pointer-events-none" />
        <div className="relative z-10 transition-transform duration-200 group-hover/thumb:scale-110">
          <Music className="w-14 h-14 text-[#EAB308]" />
        </div>
        <div className="absolute bottom-2 left-3 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-[5px] bg-[#EAB308] text-foreground font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-foreground">
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
        className="w-full h-28 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-muted/30 dark:bg-muted/15 flex items-center justify-center select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#88888820_1px,transparent_1px)] [background-size:10px_10px] opacity-70 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full bg-[#FF3CAC]/10 blur-xl pointer-events-none" />
        <div className="relative z-10 transition-transform duration-200 group-hover/thumb:scale-110">
          <Video className="w-14 h-14 text-[#FF3CAC]" />
        </div>
        <div className="absolute bottom-2 left-3 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-[5px] bg-[#FF3CAC] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
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
        className="w-full h-28 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-muted/30 dark:bg-muted/15 flex items-center justify-center select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#88888820_1px,transparent_1px)] [background-size:10px_10px] opacity-70 pointer-events-none" />
        <div className="relative z-10 transition-transform duration-200 group-hover/thumb:scale-110">
          <Archive className="w-14 h-14 text-foreground" />
        </div>
        <div className="absolute bottom-2 left-3 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-[5px] bg-foreground text-background font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black]">
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
        className="w-full h-28 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-muted/30 dark:bg-muted/15 flex items-center justify-center select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#88888820_1px,transparent_1px)] [background-size:10px_10px] opacity-70 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full bg-[#0066da]/10 blur-xl pointer-events-none" />
        <div className="relative z-10 transition-transform duration-200 group-hover/thumb:scale-110">
          {getLinkIcon(safeUrl, "w-14 h-14")}
        </div>
        <div className="absolute bottom-2 left-3 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-[5px] bg-[#0066da] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
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
        className="w-full h-28 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-muted/30 dark:bg-muted/15 flex flex-col items-center justify-center select-none"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#88888820_1px,transparent_1px)] [background-size:10px_10px] opacity-70 pointer-events-none" />
        <div className="absolute w-24 h-24 rounded-full bg-[#0057FF]/10 blur-xl pointer-events-none" />
        <div className="relative z-10 transition-transform duration-200 group-hover/thumb:scale-110 mb-1">
          <ExternalLink className="w-12 h-12 text-[#0057FF]" />
        </div>
        <span className="relative z-10 font-mono text-[10px] font-bold text-foreground/80 truncate max-w-[85%]">
          {domain || "Web Link"}
        </span>
        <div className="absolute bottom-2 left-3 pointer-events-none z-10">
          <span className="px-2 py-0.5 rounded-[5px] bg-[#0057FF] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
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
      className="w-full h-28 relative overflow-hidden rounded-t-[1.35rem] cursor-pointer group/thumb border-b-[2px] border-foreground bg-muted/30 dark:bg-muted/15 flex items-center justify-center select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(#88888820_1px,transparent_1px)] [background-size:10px_10px] opacity-70 pointer-events-none" />
      <div className="relative z-10 transition-transform duration-200 group-hover/thumb:scale-110">
        <FileLinesLogo className="w-14 h-14 text-[#64748B]" />
      </div>
      <div className="absolute bottom-2 left-3 pointer-events-none z-10">
        <span className="px-2 py-0.5 rounded-[5px] bg-[#64748B] text-white font-mono text-[8px] font-extrabold tracking-wider shadow-[1.5px_1.5px_0px_black] border border-black/20">
          {ext || "FILE"}
        </span>
      </div>
    </div>
  )
}
