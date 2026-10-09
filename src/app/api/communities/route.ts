import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getViewer } from "@/lib/server/access"
import { errorResponse } from "@/lib/server/http"

export async function GET(request: Request) {
  try {
    const viewer = await getViewer()
    const admin = createAdminClient()

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.replace(/[%_\\]/g, " ").trim()

    let query = admin.from("communities").select("*").order("name", { ascending: true })
    if (q) query = query.ilike("name", `%${q}%`)

    const { data: communities, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data: memberships } = await admin
      .from("community_members")
      .select("community_id, role")
      .eq("user_id", viewer.userId)

    const roleByCommunity = new Map<string, string>()
    for (const m of memberships ?? []) roleByCommunity.set(m.community_id, m.role)

    const result = (communities ?? []).map((c) => {
      let role: "owner" | "curator" | "member" | "viewer"
      if (viewer.isAdmin || c.owner_id === viewer.userId) {
        role = "owner"
      } else if (roleByCommunity.has(c.id)) {
        const raw = roleByCommunity.get(c.id)
        const lower = (raw ?? "").toLowerCase()
        if (lower === "owner") role = "owner"
        else if (lower === "curator" || lower === "hod") role = "curator"
        else role = "member"
      } else {
        role = "viewer"
      }

      const isActualMember = role === "owner" || role === "curator" || role === "member"

      return {
        ...c,
        membership: isActualMember ? { role } : null,
        effective_role: role,
        can_manage: role === "owner" || role === "curator",
        can_edit_community: role === "owner",
      }
    })

    return NextResponse.json(result)
  } catch (e) {
    return errorResponse(e)
  }
}
