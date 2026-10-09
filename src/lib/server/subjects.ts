import type { AdminClient } from "@/lib/server/access"
import type { CommunitySubject, SimilarSubject, Subject, SubjectModule, SubjectSearchResult } from "@/types/groups"
import { namesLookSimilar } from "@/lib/subjectSimilarity"

const SUBJECT_COLUMNS = "id, name, short_name, code, semester, scheme, subject_type"

// PostgREST treats , ( ) and * specially inside or() filters, and % _ are LIKE wildcards.
function cleanSearch(q: string): string {
  return q.replace(/[,()*%_\\]/g, " ").trim()
}

export interface SubjectSearchResultWithCommunities extends SubjectSearchResult {
  /** Names of the communities that this subject belongs to. */
  community_names: string[]
  /** True when none of community_ids passed in match this subject. */
  is_other_domain: boolean
}

async function domainMap(admin: AdminClient, subjectIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>()
  if (subjectIds.length === 0) return map
  const { data } = await admin.from("subject_domains").select("subject_id, community_id").in("subject_id", subjectIds)
  for (const row of data ?? []) {
    const list = map.get(row.subject_id) ?? []
    list.push(row.community_id)
    map.set(row.subject_id, list)
  }
  return map
}

/** Subjects (not merged) matching the text. With no text: subjects of the given communities first. */
export async function searchSubjects(
  admin: AdminClient,
  q: string,
  communityIds: string[] = [],
  limit = 25
): Promise<SubjectSearchResult[]> {
  const text = cleanSearch(q)
  let query = admin.from("subjects").select(SUBJECT_COLUMNS).is("merged_into_id", null)

  if (communityIds.length > 0) {
    const { data: links } = await admin.from("subject_domains").select("subject_id").in("community_id", communityIds)
    const ids = Array.from(new Set((links ?? []).map((l) => l.subject_id)))
    if (ids.length === 0) return []
    query = query.in("id", ids)
  }

  if (text) {
    query = query.or(`name.ilike.%${text}%,short_name.ilike.%${text}%,code.ilike.%${text}%`)
  }

  const { data, error } = await query.order("name", { ascending: true }).limit(limit)
  if (error) throw new Error(error.message)

  const subjects = (data ?? []) as Subject[]
  const domains = await domainMap(admin, subjects.map((s) => s.id))
  return subjects.map((s) => ({ ...s, community_ids: domains.get(s.id) ?? [] }))

}

export async function getSubjectDetail(admin: AdminClient, id: string) {
  const { data: subject } = await admin
    .from("subjects")
    .select(`${SUBJECT_COLUMNS}, merged_into_id, created_by`)
    .eq("id", id)
    .maybeSingle()
  if (!subject) return null

  const { data: modules } = await admin
    .from("subject_modules")
    .select("id, subject_id, number, title")
    .eq("subject_id", id)
    .order("number", { ascending: true })

  const domains = await domainMap(admin, [id])

  return {
    subject: subject as Subject & { merged_into_id: string | null; created_by: string | null },
    modules: (modules ?? []) as SubjectModule[],
    community_ids: domains.get(id) ?? [],
  }
}

/** Subjects linked to a community, with the number of shared resources and modules. */
export async function listCommunitySubjects(admin: AdminClient, communityId: string): Promise<CommunitySubject[]> {
  const { data: links } = await admin.from("subject_domains").select("subject_id").eq("community_id", communityId)
  const ids = Array.from(new Set((links ?? []).map((l) => l.subject_id)))
  if (ids.length === 0) return []

  const [{ data: subjects }, { data: shares }, { data: modules }] = await Promise.all([
    admin.from("subjects").select(SUBJECT_COLUMNS).in("id", ids).is("merged_into_id", null).order("name"),
    admin.from("community_vault_items").select("subject_id, status").eq("community_id", communityId).in("subject_id", ids),
    admin.from("subject_modules").select("subject_id").in("subject_id", ids),
  ])

  const resourceCount = new Map<string, number>()
  for (const s of shares ?? []) {
    if (s.status && s.status !== "current") continue
    resourceCount.set(s.subject_id, (resourceCount.get(s.subject_id) ?? 0) + 1)
  }
  const moduleCount = new Map<string, number>()
  for (const m of modules ?? []) moduleCount.set(m.subject_id, (moduleCount.get(m.subject_id) ?? 0) + 1)

  return ((subjects ?? []) as Subject[]).map((s) => ({
    ...s,
    resource_count: resourceCount.get(s.id) ?? 0,
    module_count: moduleCount.get(s.id) ?? 0,
  }))
}

/** Existing subjects that share the code or look like the same name. */
export async function findSimilarSubjects(
  admin: AdminClient,
  name: string,
  code: string | null,
  excludeId?: string
): Promise<SimilarSubject[]> {
  const { data } = await admin.from("subjects").select(SUBJECT_COLUMNS).is("merged_into_id", null).limit(2000)
  const out: SimilarSubject[] = []
  const wantedCode = code?.trim().toLowerCase()
  for (const s of (data ?? []) as Subject[]) {
    if (s.id === excludeId) continue
    if (wantedCode && s.code && s.code.trim().toLowerCase() === wantedCode) {
      out.push({ ...s, reason: "same_code" })
    } else if (name.trim() && namesLookSimilar(name, s.name)) {
      out.push({ ...s, reason: "similar_name" })
    }
  }
  return out.slice(0, 5)
}

/**
 * When searching within specific communities, also finds subjects in OTHER communities
 * that closely match the query. Used to show the "this subject is in another group" hint.
 * Returns { inDomain, otherDomain } where otherDomain items carry community_names.
 */
export async function searchSubjectsAcrossDomains(
  admin: AdminClient,
  q: string,
  communityIds: string[]
): Promise<{ inDomain: SubjectSearchResultWithCommunities[]; otherDomain: SubjectSearchResultWithCommunities[] }> {
  // Only do cross-domain search when we have both a query and a community filter
  if (!q.trim() || communityIds.length === 0) {
    const inDomain = await searchSubjects(admin, q, communityIds)
    return {
      inDomain: inDomain.map((s) => ({ ...s, community_names: [], is_other_domain: false })),
      otherDomain: [],
    }
  }

  const text = cleanSearch(q)

  // 1. Fetch in-domain subjects (existing logic)
  const inDomainRaw = await searchSubjects(admin, q, communityIds)
  const inDomainIds = new Set(inDomainRaw.map((s) => s.id))

  // 2. Fetch cross-domain matches with the same text, unconstrained to community
  let crossQuery = admin
    .from("subjects")
    .select(SUBJECT_COLUMNS)
    .is("merged_into_id", null)

  if (text) {
    crossQuery = crossQuery.or(`name.ilike.%${text}%,short_name.ilike.%${text}%,code.ilike.%${text}%`)
  }

  const { data: crossData } = await crossQuery.order("name", { ascending: true }).limit(10)
  const crossSubjects = ((crossData ?? []) as Subject[]).filter((s) => !inDomainIds.has(s.id))

  // 3. For the cross-domain subjects, fetch their community memberships + community names
  let otherDomain: SubjectSearchResultWithCommunities[] = []
  if (crossSubjects.length > 0) {
    const crossIds = crossSubjects.map((s) => s.id)
    const { data: domainLinks } = await admin
      .from("subject_domains")
      .select("subject_id, community_id, communities(name)")
      .in("subject_id", crossIds)

    // Build map: subject_id → { community_ids[], community_names[] }
    const communityMap = new Map<string, { ids: string[]; names: string[] }>()
    for (const link of domainLinks ?? []) {
      const entry = communityMap.get(link.subject_id) ?? { ids: [], names: [] }
      entry.ids.push(link.community_id)
      const communityName = Array.isArray(link.communities)
        ? (link.communities[0] as { name: string } | undefined)?.name
        : (link.communities as { name: string } | null)?.name
      if (communityName) entry.names.push(communityName)
      communityMap.set(link.subject_id, entry)
    }

    otherDomain = crossSubjects.map((s) => {
      const entry = communityMap.get(s.id) ?? { ids: [], names: [] }
      return {
        ...s,
        community_ids: entry.ids,
        community_names: entry.names,
        is_other_domain: true,
      }
    })
  }

  return {
    inDomain: inDomainRaw.map((s) => ({ ...s, community_names: [], is_other_domain: false })),
    otherDomain,
  }
}

