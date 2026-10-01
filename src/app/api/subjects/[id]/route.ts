import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getViewer } from "@/lib/server/access"
import { errorResponse } from "@/lib/server/http"
import { getSubjectDetail } from "@/lib/server/subjects"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await getViewer()
    const admin = createAdminClient()
    const { id } = await context.params
    const detail = await getSubjectDetail(admin, id)
    if (!detail) return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    return NextResponse.json({ data: detail })
  } catch (e) {
    return errorResponse(e)
  }
}
