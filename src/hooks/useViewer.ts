"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface ViewerInfo {
  userId: string | null
  role: string | null
  /** HOD or dev. */
  isPrivileged: boolean
}

export function useViewer(): ViewerInfo & { isLoading: boolean } {
  const { data, isLoading } = useQuery<ViewerInfo>({
    queryKey: ["viewer"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { userId: null, role: null, isPrivileged: false }
      const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle()
      const role = (profile?.role as string | undefined) ?? "faculty"
      const lower = role.toLowerCase()
      return { userId: user.id, role, isPrivileged: lower === "hod" || lower === "dev" }
    },
  })
  return { userId: data?.userId ?? null, role: data?.role ?? null, isPrivileged: data?.isPrivileged ?? false, isLoading }
}
