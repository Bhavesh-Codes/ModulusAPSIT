import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get("url")
    const filename = searchParams.get("filename") || "download"

    if (!fileUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
    }

    // Fetch upstream file (no CORS restriction from server side)
    const upstreamRes = await fetch(fileUrl)
    if (!upstreamRes.ok) {
      return NextResponse.json({ error: "Failed to fetch file from storage" }, { status: upstreamRes.status })
    }

    const contentType = upstreamRes.headers.get("content-type") || "application/octet-stream"
    const asciiFallback = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_")
    const rfc5987Encoded = encodeURIComponent(filename)
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")

    const disposition = `attachment; filename="${asciiFallback}"; filename*=UTF-8''${rfc5987Encoded}`

    return new Response(upstreamRes.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
      },
    })
  } catch (error: any) {
    console.error("Download proxy error:", error)
    return NextResponse.json({ error: error.message || "Download failed" }, { status: 500 })
  }
}
