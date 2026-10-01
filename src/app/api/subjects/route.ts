import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getViewer } from "@/lib/server/access"
import { errorResponse } from "@/lib/server/http"
import { searchSubjects } from "@/lib/server/subjects"

// Search-first lookup for the subject picker.
export async function GET(request: Request) {
  try {
    await getViewer()
    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") ?? ""
    const communityIds = (searchParams.get("community_ids") ?? "").split(",").filter(Boolean)
    const data = await searchSubjects(admin, q, communityIds)
    return NextResponse.json({ data })
  } catch (e) {
    return errorResponse(e)
  }
}
