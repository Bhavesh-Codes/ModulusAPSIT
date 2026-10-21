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

    // Collect all unique user IDs to ensure avatars are accurately retrieved
    const userIds = new Set<string>()
    for (const row of data ?? []) {
      if (row.shared_by_user_id) userIds.add(row.shared_by_user_id)
      const vi = Array.isArray(row.vault_items) ? row.vault_items[0] : row.vault_items
      if (vi?.owner_id) userIds.add(vi.owner_id)
    }

    const userProfileMap = new Map<string, { id: string; name?: string | null; profile_pic?: string | null }>()
    if (userIds.size > 0) {
      const { data: userProfiles } = await admin
        .from("users")
        .select("id, name, profile_pic")
        .in("id", Array.from(userIds))

      for (const u of userProfiles ?? []) {
        userProfileMap.set(u.id, u)
      }

      // Check auth metadata for users missing profile_pic in public.users
      for (const uId of userIds) {
        const existing = userProfileMap.get(uId)
        if (!existing || !existing.profile_pic) {
          try {
            const { data: authUser } = await admin.auth.admin.getUserById(uId)
            const metaPic = authUser?.user?.user_metadata?.avatar_url || authUser?.user?.user_metadata?.picture || null
            if (metaPic) {
              if (existing) {
                existing.profile_pic = metaPic
              } else {
                userProfileMap.set(uId, { id: uId, profile_pic: metaPic })
              }
              await admin.from("users").update({ profile_pic: metaPic }).eq("id", uId)
            }
          } catch {
            // Ignore auth lookup errors
          }
        }
      }
    }

    return NextResponse.json({
      data: (data ?? []).map((row) => toResource(row, userProfileMap)),
    })
  } catch (e) {
    return errorResponse(e)
  }
}
