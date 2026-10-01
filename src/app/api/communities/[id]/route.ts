import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getViewer, getCommunityAccess } from "@/lib/server/access"
import { errorResponse } from "@/lib/server/http"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const viewer = await getViewer()
    const admin = createAdminClient()
    const { id } = await context.params

    const { data: community, error } = await admin.from("communities").select("*").eq("id", id).maybeSingle()
    if (error || !community) return NextResponse.json({ error: "Community not found" }, { status: 404 })

    const access = await getCommunityAccess(admin, viewer, id)

    return NextResponse.json({
      ...community,
      membership: access.role ? { role: access.role } : null,
      can_manage: viewer.isPrivileged,
      viewer_id: viewer.userId,
    })
  } catch (e) {
    return errorResponse(e)
  }
}
