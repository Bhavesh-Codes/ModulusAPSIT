"use client"

import { useQuery } from "@tanstack/react-query"
import type { CommunityResource, CommunityRole, CommunitySubject } from "@/types/groups"

export interface CommunityInfo {
  id: string
  name: string
  description: string | null
  banner_url?: string | null
  member_count: number
  membership: { role: CommunityRole } | null
  /** HOD/dev */
  can_manage: boolean
  viewer_id: string
}

export function useCommunity(id: string) {
  return useQuery<CommunityInfo>({
    queryKey: ["community", id],
    queryFn: async () => {
      const res = await fetch(`/api/communities/${id}`)
      if (!res.ok) throw new Error("Failed to fetch community")
      return res.json()
    },
  })
}

export function useCommunityResources(id: string) {
  return useQuery<CommunityResource[]>({
    queryKey: ["communityVault", id],
    queryFn: async () => {
      const res = await fetch(`/api/communities/${id}/vault`)
      if (!res.ok) throw new Error("Failed to fetch vault")
      return (await res.json()).data
    },
  })
}

export function useCommunitySubjects(id: string) {
  return useQuery<CommunitySubject[]>({
    queryKey: ["communitySubjects", id],
    queryFn: async () => {
      const res = await fetch(`/api/communities/${id}/subjects`)
      if (!res.ok) throw new Error("Failed to fetch subjects")
      return (await res.json()).data
    },
  })
}
