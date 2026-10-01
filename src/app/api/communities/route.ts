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
      // HOD and dev count as members of every community. Dev is shown as 'hod' so it never leaks.
      const role = viewer.isPrivileged ? "hod" : roleByCommunity.get(c.id)
      return {
        ...c,
        membership: role === "hod" || role === "faculty" ? { role } : null,
        can_manage: viewer.isPrivileged,
      }
    })

    return NextResponse.json(result)
  } catch (e) {
    return errorResponse(e)
  }
}
