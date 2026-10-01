/** SHA-256 of a file as lowercase hex, computed in the browser. Null if the browser can't do it. */
export async function sha256Hex(file: Blob): Promise<string | null> {
  try {
    if (typeof crypto === "undefined" || !crypto.subtle) return null
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer())
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  } catch {
    return null
  }
}
