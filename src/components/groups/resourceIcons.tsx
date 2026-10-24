import {
  Archive, File, FileCode, FileText, Image as ImageIcon, Link2, Music, PlayCircle, Video,
} from "lucide-react"

export function PptLogo({ className = "w-8 h-8", color = "#F97316" }: { className?: string; color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-64 0 512 512"
      className={className}
      fill={color}
      aria-label="PowerPoint presentation"
    >
      <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM152 256c-13.3 0-24 10.7-24 24l0 144c0 13.3 10.7 24 24 24s24-10.7 24-24l0-24 24 0c39.8 0 72-32.2 72-72s-32.2-72-72-72l-48 0zm48 96l-24 0 0-48 24 0c13.3 0 24 10.7 24 24s-10.7 24-24 24z" />
    </svg>
  )
}

export function WordLogo({ className = "w-8 h-8", color = "#2563EB" }: { className?: string; color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-2 0 16 16"
      className={className}
      fill={color}
      aria-label="Word document"
    >
      <path d="M1.5 14V2c0 -0.275 0.225 -0.5 0.5 -0.5h5v2.5c0 0.553125 0.446875 1 1 1h2.5v9c0 0.275 -0.225 0.5 -0.5 0.5H2c-0.275 0 -0.5 -0.225 -0.5 -0.5zM2 0C0.896875 0 0 0.896875 0 2v12c0 1.103125 0.896875 2 2 2h8c1.103125 0 2 -0.896875 2 -2V4.828125c0 -0.53125 -0.209375 -1.040625 -0.584375 -1.415625l-2.83125 -2.828125C8.209375 0.209375 7.703125 0 7.171875 0H2zm1.71875 7.534375c-0.11875 -0.396875 -0.5375 -0.621875 -0.934375 -0.503125S2.1625 7.56875 2.28125 7.965625l1.5 5c0.09375 0.31875 0.3875 0.534375 0.71875 0.534375s0.621875 -0.21875 0.71875 -0.534375l0.78125 -2.60625 0.78125 2.60625c0.09375 0.31875 0.3875 0.534375 0.71875 0.534375s0.621875 -0.21875 0.71875 -0.534375l1.5 -5c0.11875 -0.396875 -0.10625 -0.815625 -0.503125 -0.934375s-0.815625 0.10625 -0.934375 0.503125l-0.78125 2.60625 -0.78125 -2.60625c-0.09375 -0.31875 -0.3875 -0.534375 -0.71875 -0.534375s-0.621875 0.21875 -0.71875 0.534375l-0.78125 2.60625 -0.78125 -2.60625z" />
    </svg>
  )
}

export function ExcelLogo({ className = "w-8 h-8", color = "#16A34A" }: { className?: string; color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-64 0 512 512"
      className={className}
      fill={color}
      aria-label="Excel spreadsheet"
    >
      <path d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM164 266.7c-7.4-11-22.3-14-33.3-6.7s-14 22.3-6.7 33.3L163.2 352 124 410.7c-7.4 11-4.4 25.9 6.7 33.3s25.9 4.4 33.3-6.7l28-42 28 42c7.4 11 22.3 14 33.3 6.7s14-22.3 6.7-33.3L220.8 352 260 293.3c7.4-11 4.4-25.9-6.7-33.3s-25.9-4.4-33.3 6.7l-28 42-28-42z" />
    </svg>
  )
}

export function PdfLogo({ className = "w-8 h-8", color = "#E11D48" }: { className?: string; color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      className={className}
      fill={color}
      aria-label="PDF document"
    >
      <path d="m2 14.5 1.5 0 0 1.5 -1.5 0c-1.103125 0 -2 -0.896875 -2 -2L0 2C0 0.896875 0.896875 0 2 0l5.171875 0c0.53125 0 1.040625 0.209375 1.415625 0.584375l2.828125 2.828125c0.375 0.375 0.584375 0.884375 0.584375 1.415625l0 4.671875 -1.5 0 0 -4.5 -2.5 0c-0.553125 0 -1 -0.446875 -1 -1l0 -2.5 -5 0c-0.275 0 -0.5 0.225 -0.5 0.5l0 12c0 0.275 0.225 0.5 0.5 0.5zm3.5 -3.5 1 0c0.965625 0 1.75 0.784375 1.75 1.75s-0.784375 1.75 -1.75 1.75l-0.5 0 0 1c0 0.275 -0.225 0.5 -0.5 0.5s-0.5 -0.225 -0.5 -0.5l0 -1.5 0 -2.5c0 -0.275 0.225 -0.5 0.5 -0.5zm1 2.5c0.415625 0 0.75 -0.334375 0.75 -0.75s-0.334375 -0.75 -0.75 -0.75l-0.5 0 0 1.5 0.5 0zm3 -2.5 1 0c0.828125 0 1.5 0.671875 1.5 1.5l0 2c0 0.828125 -0.671875 1.5 -1.5 1.5l-1 0c-0.275 0 -0.5 -0.225 -0.5 -0.5l0 -4c0 -0.275 0.225 -0.5 0.5 -0.5zm1 4c0.275 0 0.5 -0.225 0.5 -0.5l0 -2c0 -0.275 -0.225 -0.5 -0.5 -0.5l-0.5 0 0 3 0.5 0zm2.5 -3.5c0 -0.275 0.225 -0.5 0.5 -0.5l1.5 0c0.275 0 0.5 0.225 0.5 0.5s-0.225 0.5 -0.5 0.5l-1 0 0 1 1 0c0.275 0 0.5 0.225 0.5 0.5s-0.225 0.5 -0.5 0.5l-1 0 0 1.5c0 0.275 -0.225 0.5 -0.5 0.5s-0.5 -0.225 -0.5 -0.5l0 -2 0 -2z" />
    </svg>
  )
}

export function FileLinesLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-2 0 16 16"
      className={className}
      fill="#64748B"
      aria-label="Document file"
    >
      <path d="M2 14.5c-0.275 0 -0.5 -0.225 -0.5 -0.5V2c0 -0.275 0.225 -0.5 0.5 -0.5h5v2.5c0 0.553125 0.446875 1 1 1h2.5v9c0 0.275 -0.225 0.5 -0.5 0.5H2zM2 0C0.896875 0 0 0.896875 0 2v12c0 1.103125 0.896875 2 2 2h8c1.103125 0 2 -0.896875 2 -2V4.828125c0 -0.53125 -0.209375 -1.040625 -0.584375 -1.415625l-2.83125 -2.828125C8.209375 0.209375 7.703125 0 7.171875 0H2zm1.75 8c-0.415625 0 -0.75 0.334375 -0.75 0.75s0.334375 0.75 0.75 0.75h4.5c0.415625 0 0.75 -0.334375 0.75 -0.75s-0.334375 -0.75 -0.75 -0.75H3.75zm0 3c-0.415625 0 -0.75 0.334375 -0.75 0.75s0.334375 0.75 0.75 0.75h4.5c0.415625 0 0.75 -0.334375 0.75 -0.75s-0.334375 -0.75 -0.75 -0.75H3.75z" />
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

  return <FileLinesLogo className={size} />
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
