import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getViewer } from "@/lib/server/access"
import { errorResponse } from "@/lib/server/http"

// Existing tags to suggest first: those used in the chosen communities and in the user's own vault.
export async function GET(request: Request) {
  try {
    const viewer = await getViewer()
    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)
    const communityIds = (searchParams.get("community_ids") ?? "").split(",").filter(Boolean)

    const counts = new Map<string, number>()
    const add = (tags: unknown) => {
      if (!Array.isArray(tags)) return
      for (const t of tags) if (typeof t === "string" && t.trim()) counts.set(t, (counts.get(t) ?? 0) + 1)
    }

    if (communityIds.length > 0) {
      const { data } = await admin.from("community_vault_items").select("tags").in("community_id", communityIds)
      for (const row of data ?? []) add(row.tags)
    }
    const { data: mine } = await admin.from("vault_items").select("tags").eq("owner_id", viewer.userId)
    for (const row of mine ?? []) add(row.tags)

    const data = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 60)
      .map(([tag]) => tag)
    return NextResponse.json({ data })
  } catch (e) {
    return errorResponse(e)
  }
}
