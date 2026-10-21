import {
  Archive, File, FileCode, FileText, Image as ImageIcon, Link2, Music, PlayCircle, Video,
} from "lucide-react"

export function PptLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="26" height="26" rx="5" fill="#D24726" />
      <path d="M3 8C3 5.23858 5.23858 3 8 3H24C26.7614 3 29 5.23858 29 8V9H3V8Z" fill="#B33A1E" opacity="0.6" />
      <path
        d="M10.5 9.5H16C18.2 9.5 19.8 11.1 19.8 13.3C19.8 15.5 18.2 17.1 16 17.1H13.2V22.5H10.5V9.5ZM13.2 14.6H15.7C16.5 14.6 17.1 14 17.1 13.3C17.1 12.6 16.5 12 15.7 12H13.2V14.6Z"
        fill="white"
      />
      <rect x="18" y="18" width="7" height="5" rx="1" fill="#FFE082" />
      <rect x="19" y="19" width="3" height="3" rx="0.5" fill="#D24726" />
    </svg>
  )
}

export function WordLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="26" height="26" rx="5" fill="#2B579A" />
      <path d="M3 8C3 5.23858 5.23858 3 8 3H24C26.7614 3 29 5.23858 29 8V9H3V8Z" fill="#1E3E6D" opacity="0.6" />
      <path
        d="M9 10.5H11.5L13.2 18.2L15 10.5H17L18.8 18.2L20.5 10.5H23L20.5 22H18L16 14.5L14 22H11.5L9 10.5Z"
        fill="white"
      />
    </svg>
  )
}

export function ExcelLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="26" height="26" rx="5" fill="#217346" />
      <path d="M3 8C3 5.23858 5.23858 3 8 3H24C26.7614 3 29 5.23858 29 8V9H3V8Z" fill="#164E30" opacity="0.6" />
      <path
        d="M11 10.5H14L16 14.5L18 10.5H21L17.5 16.2L21 22H18L16 18L14 22H11L14.5 16.2L11 10.5Z"
        fill="white"
      />
    </svg>
  )
}

export function PdfLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="26" height="26" rx="5" fill="#EA4335" />
      <path d="M3 8C3 5.23858 5.23858 3 8 3H24C26.7614 3 29 5.23858 29 8V9H3V8Z" fill="#C5221F" opacity="0.6" />
      <path
        d="M8.5 13H11C12 13 12.8 13.8 12.8 14.8C12.8 15.8 12 16.6 11 16.6H9.7V19H8.5V13ZM9.7 15.5H10.8C11.3 15.5 11.6 15.2 11.6 14.8C11.6 14.4 11.3 14.1 10.8 14.1H9.7V15.5ZM14 13H16.2C17.7 13 18.8 14.2 18.8 16C18.8 17.8 17.7 19 16.2 19H14V13ZM15.2 17.9H16.1C17 17.9 17.6 17.1 17.6 16C17.6 14.9 17 14.1 16.1 14.1H15.2V17.9ZM20.2 13H24V14.1H21.4V15.5H23.5V16.6H21.4V19H20.2V13Z"
        fill="white"
      />
    </svg>
  )
}

export function isPptFile(mimeType?: string | null, filename?: string | null): boolean {
  const m = (mimeType ?? "").toLowerCase()
  const f = (filename ?? "").toLowerCase()
  return (
    m.includes("presentation") ||
    m.includes("powerpoint") ||
    m.includes("pps") ||
    f.endsWith(".ppt") ||
    f.endsWith(".pptx") ||
    f.endsWith(".pps") ||
    f.endsWith(".ppsx") ||
    f.endsWith(".odp") ||
    f.endsWith(".key")
  )
}

export function isWordFile(mimeType?: string | null, filename?: string | null): boolean {
  const m = (mimeType ?? "").toLowerCase()
  const f = (filename ?? "").toLowerCase()
  return (
    m.includes("wordprocessingml") ||
    m.includes("msword") ||
    f.endsWith(".doc") ||
    f.endsWith(".docx") ||
    f.endsWith(".odt")
  )
}

export function isExcelFile(mimeType?: string | null, filename?: string | null): boolean {
  const m = (mimeType ?? "").toLowerCase()
  const f = (filename ?? "").toLowerCase()
  return (
    m.includes("spreadsheetml") ||
    m.includes("ms-excel") ||
    f.endsWith(".xls") ||
    f.endsWith(".xlsx") ||
    f.endsWith(".csv") ||
    f.endsWith(".ods")
  )
}

export function isPdfFile(mimeType?: string | null, filename?: string | null): boolean {
  const m = (mimeType ?? "").toLowerCase()
  const f = (filename ?? "").toLowerCase()
  return m.includes("pdf") || f.endsWith(".pdf")
}

export function isImageFile(mimeType?: string | null, filename?: string | null): boolean {
  const m = (mimeType ?? "").toLowerCase()
  const f = (filename ?? "").toLowerCase()
  return m.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp|ico|avif)$/i.test(f)
}

export function isVideoFile(mimeType?: string | null, filename?: string | null): boolean {
  const m = (mimeType ?? "").toLowerCase()
  const f = (filename ?? "").toLowerCase()
  return m.startsWith("video/") || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(f)
}

export function isAudioFile(mimeType?: string | null, filename?: string | null): boolean {
  const m = (mimeType ?? "").toLowerCase()
  const f = (filename ?? "").toLowerCase()
  return m.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(f)
}

export function isCodeFile(mimeType?: string | null, filename?: string | null): boolean {
  const m = (mimeType ?? "").toLowerCase()
  const f = (filename ?? "").toLowerCase()
  return (
    m.includes("json") ||
    m.includes("javascript") ||
    m.includes("typescript") ||
    m.includes("html") ||
    m.includes("xml") ||
    /\.(json|js|jsx|ts|tsx|html|css|py|java|c|cpp|cs|go|rs|php|sh|sql|yaml|yml|md)$/i.test(f)
  )
}

export function isArchiveFile(mimeType?: string | null, filename?: string | null): boolean {
  const m = (mimeType ?? "").toLowerCase()
  const f = (filename ?? "").toLowerCase()
  return m.includes("zip") || m.includes("tar") || m.includes("compressed") || /\.(zip|rar|tar|gz|7z)$/i.test(f)
}

export function getFileIcon(
  mimeType: string | null | undefined = "",
  size = "w-8 h-8",
  filename: string | null | undefined = ""
) {
  const m = (mimeType ?? "").toLowerCase()
  const f = (filename ?? "").toLowerCase()

  if (isPptFile(m, f)) return <PptLogo className={size} />
  if (isWordFile(m, f)) return <WordLogo className={size} />
  if (isExcelFile(m, f)) return <ExcelLogo className={size} />
  if (isPdfFile(m, f)) return <PdfLogo className={size} />

  if (m.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(f))
    return <ImageIcon className={`${size} text-[#0057FF]`} />
  if (m.startsWith("video/") || /\.(mp4|webm|mov|mkv|avi)$/i.test(f))
    return <Video className={`${size} text-[#FF3CAC]`} />
  if (m.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac)$/i.test(f))
    return <Music className={`${size} text-[#FFD600]`} />
  if (m.includes("zip") || m.includes("tar") || m.includes("compressed") || /\.(zip|rar|tar|gz|7z)$/i.test(f))
    return <Archive className={`${size} text-foreground`} />
  if (m.includes("json") || m.includes("javascript") || m.includes("html") || /\.(json|js|jsx|ts|tsx|html|css|py|java|c|cpp)$/i.test(f))
    return <FileCode className={`${size} text-[#4285F4]`} />

  return <File className={`${size} text-muted-foreground`} />
}

export function getLinkIcon(url: string, size = "w-8 h-8") {
  const lower = (url ?? "").toLowerCase()
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return <PlayCircle className={`${size} text-[#FF3B30]`} />
  if (lower.includes("drive.google.com")) {
    return (
      <svg viewBox="0 0 87.3 78" className={size} aria-label="Google Drive">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 52H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
        <path d="M43.65 25L29.9 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 47.5C.4 48.9 0 50.45 0 52h27.5z" fill="#00ac47" />
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H60l5.85 11.5z" fill="#ea4335" />
        <path d="M43.65 25L57.4 0c-1.55 0-3.1.4-4.5 1.2L29.9 0 16.15 25z" fill="#00832d" />
        <path d="M60 52H27.5L13.75 76.8c1.4.8 2.95 1.2 4.5 1.2h50.8c1.55 0 3.1-.4 4.5-1.2z" fill="#2684fc" />
        <path d="M73.4 26.5L59.65 2.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 60 52h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
      </svg>
    )
  }
  return <Link2 className={`${size} text-[#0057FF]`} />
}
