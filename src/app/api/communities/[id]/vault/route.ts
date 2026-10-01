import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getViewer } from "@/lib/server/access"
import { errorResponse } from "@/lib/server/http"
import { RESOURCE_SELECT, toResource } from "@/lib/server/resources"

// Every logged-in user may view everything shared in any community, member or not.
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await getViewer()
    const admin = createAdminClient()
    const { id: communityId } = await context.params

    const { data, error } = await admin
      .from("community_vault_items")
      .select(RESOURCE_SELECT)
      .eq("community_id", communityId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Community Vault GET error:", error)
      return NextResponse.json({ error: "Failed to fetch shared vault items" }, { status: 400 })
    }

    return NextResponse.json({ data: (data ?? []).map(toResource) })
  } catch (e) {
    return errorResponse(e)
  }
}
