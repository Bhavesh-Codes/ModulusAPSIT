import {
  Archive, File, FileCode, FileText, Image as ImageIcon, Link2, Music, PlayCircle, Video,
} from "lucide-react"

export function getFileIcon(mimeType: string | null | undefined = "", size = "w-8 h-8") {
  const m = mimeType ?? ""
  if (m.startsWith("image/")) return <ImageIcon className={`${size} text-[#0057FF]`} />
  if (m.startsWith("video/")) return <Video className={`${size} text-[#FF3CAC]`} />
  if (m.startsWith("audio/")) return <Music className={`${size} text-[#FFD600]`} />
  if (m.includes("pdf")) return <FileText className={`${size} text-[#FF3B30]`} />
  if (m.includes("zip") || m.includes("tar") || m.includes("compressed")) return <Archive className={`${size} text-foreground`} />
  if (m.includes("json") || m.includes("javascript") || m.includes("html")) return <FileCode className={`${size} text-[#4285F4]`} />
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
