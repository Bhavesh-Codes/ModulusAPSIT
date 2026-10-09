"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

import { isPlatformAdmin } from "@/lib/roles"

export interface ViewerInfo {
  userId: string | null
  role: string | null
  platformRole: "admin" | "user"
  isAdmin: boolean
  /** HOD, dev, or admin. Maintained for backward compatibility. */
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
      if (!user) return { userId: null, role: null, platformRole: "user", isAdmin: false, isPrivileged: false }
      const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle()
      const role = (profile?.role as string | undefined) ?? "faculty"
      const isAdmin = isPlatformAdmin(role)
      return {
        userId: user.id,
        role,
        platformRole: isAdmin ? "admin" : "user",
        isAdmin,
        isPrivileged: isAdmin,
      }
    },
  })
  return {
    userId: data?.userId ?? null,
    role: data?.role ?? null,
    platformRole: data?.platformRole ?? "user",
    isAdmin: data?.isAdmin ?? false,
    isPrivileged: data?.isPrivileged ?? false,
    isLoading,
  }
}
