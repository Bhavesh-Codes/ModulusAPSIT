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

    const { data: commMembers } = await admin
      .from("community_members")
      .select("user_id")
      .eq("community_id", id)

    const memberUserIds = (commMembers ?? []).map((m: any) => m.user_id)
    let actualCount = memberUserIds.length
    if (memberUserIds.length > 0) {
      const { data: devUsers } = await admin
        .from("users")
        .select("id")
        .in("id", memberUserIds)
        .eq("role", "dev")
      actualCount = memberUserIds.length - (devUsers?.length ?? 0)
    }

    return NextResponse.json({
      ...community,
      member_count: actualCount,
      membership: access.isMember ? { role: access.role } : null,
      effective_role: access.role,
      can_manage: access.canManage,
      can_edit_community: access.permissions.canEditCommunity,
      viewer_id: viewer.userId,
    })
  } catch (e) {
    return errorResponse(e)
  }
}
