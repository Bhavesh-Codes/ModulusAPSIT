import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getViewer } from "@/lib/server/access"
import { errorResponse } from "@/lib/server/http"
import { listCommunitySubjects } from "@/lib/server/subjects"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await getViewer()
    const admin = createAdminClient()
    const { id } = await context.params
    return NextResponse.json({ data: await listCommunitySubjects(admin, id) })
  } catch (e) {
    return errorResponse(e)
  }
}
