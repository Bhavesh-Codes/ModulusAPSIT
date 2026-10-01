export function getUrlDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function getYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0]
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v")
  } catch {
    /* ignore */
  }
  return null
}

export function getYouTubePlaylistId(url: string): string | null {
  try {
    return new URL(url).searchParams.get("list")
  } catch {
    return null
  }
}

export function getGoogleDriveInfo(url: string): { type: "file" | "folder"; id: string } | null {
  try {
    const u = new URL(url)
    if (!u.hostname.includes("drive.google.com")) return null
    const fileMatch = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileMatch) return { type: "file", id: fileMatch[1] }
    const folderMatch = u.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/)
    if (folderMatch) return { type: "folder", id: folderMatch[1] }
    const id = u.searchParams.get("id")
    if (id) return { type: "file", id }
  } catch {
    /* ignore */
  }
  return null
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}
