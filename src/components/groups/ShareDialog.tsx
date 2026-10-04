"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, FileText, Link2, Loader2, Share2, X } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createVaultLink } from "@/actions/vault"
import { checkShareConflicts, shareToCommunities } from "@/actions/groups"
import { sha256Hex } from "@/lib/hash"
import { formatBytes } from "@/lib/linkUtils"
import { useViewer } from "@/hooks/useViewer"
import {
  currentAcademicYear,
  resourceTypeLabel,
  type CommunityResource,
  type ShareConflict,
  type Subject,
} from "@/types/groups"
import { ClassificationFields, type Classification } from "./ClassificationFields"
import { TagInput } from "./TagInput"
import { btnPrimary, btnSecondary, dialogCls, inputCls, labelCls, selectCls } from "./ui"

export type ShareSource =
  | { kind: "vault"; vaultItemId: string; name: string }
  | { kind: "file"; file: File; name: string }
  | { kind: "link"; title: string; url: string }

interface Entry {
  key: string
  source: ShareSource
  title: string
  /** SHA-256 for new files. undefined while computing, null when not applicable. */
  hash: string | null | undefined
}

interface CommunityOption {
  id: string
  name: string
  membership: { role: string } | null
}

const MAX_FILE_SIZE = 20 * 1024 * 1024
const LAST_KEY = "modulus:last-share"

function makeEntries(sources: ShareSource[]): Entry[] {
  return sources.map((source, i) => ({
    key: `${i}-${Math.random().toString(36).slice(2, 8)}`,
    source,
    title: source.kind === "link" ? source.title : source.name,
    hash: source.kind === "file" ? undefined : null,
  }))
}

const emptyClassification = (): Classification => ({
  subject: null,
  moduleChoice: undefined,
  resourceType: "",
  year: currentAcademicYear(),
})

/**
 * The one dialog for sharing into communities: from the personal vault, or after uploading files / adding
 * a link directly inside a group (those are saved to the personal vault first).
 */
interface ShareDialogProps {
  open: boolean
  onClose: () => void
  sources: ShareSource[]
  lockedCommunityId?: string
  /** Pre-selects this subject (used on a subject page). */
  defaultSubject?: Subject | null
  onShared?: () => void
}

// The body is mounted only while open, so every opening starts from a clean state.
export function ShareDialog(props: ShareDialogProps) {
  return props.open ? <ShareDialogBody {...props} /> : null
}

function ShareDialogBody({ open, onClose, sources, lockedCommunityId, defaultSubject, onShared }: ShareDialogProps) {
  const queryClient = useQueryClient()
  const viewer = useViewer()

  const [entries, setEntries] = useState<Entry[]>(() => makeEntries(sources))
  const [picked, setPicked] = useState<string[]>(lockedCommunityId ? [lockedCommunityId] : [])
  const [cls, setCls] = useState<Classification>(() => ({ ...emptyClassification(), subject: defaultSubject ?? null }))
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [supersedesPick, setSupersedesPick] = useState("")
  const [conflictState, setConflictState] = useState<{ key: string; list: ShareConflict[] } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const prefilled = useRef(!!defaultSubject)

  // ── hash new files in the browser ─────────────────────────────────────────
  useEffect(() => {
    entries.forEach((e) => {
      if (e.source.kind === "file" && e.hash === undefined) {
        const key = e.key
        sha256Hex(e.source.file).then((hash) => {
          setEntries((prev) => prev.map((x) => (x.key === key ? { ...x, hash } : x)))
        })
      }
    })
  }, [entries])

  // ── communities the user may share into ────────────────────────────────────
  const { data: communities = [] } = useQuery<CommunityOption[]>({
    queryKey: ["communities", "modules", ""],
    queryFn: async () => {
      const res = await fetch("/api/communities")
      if (!res.ok) throw new Error("Failed to fetch communities")
      return res.json()
    },
  })
  const shareable = useMemo(() => communities.filter((c) => c.membership), [communities])

  // A member of exactly one community doesn't need to tick anything.
  const selected = useMemo(
    () => (picked.length === 0 && !lockedCommunityId && shareable.length === 1 ? [shareable[0].id] : picked),
    [picked, lockedCommunityId, shareable]
  )

  const toggleCommunity = (id: string) =>
    setPicked(() => (selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]))

  // ── remember last-used subject / module (only if in the selected community) ──
  useEffect(() => {
    if (prefilled.current || !viewer.userId || selected.length === 0) return
    prefilled.current = true
    try {
      const raw = localStorage.getItem(LAST_KEY)
      if (!raw) return
      const last = JSON.parse(raw) as { userId: string; subject: Subject; moduleId: string | null }
      if (last.userId !== viewer.userId || !last.subject?.id) return
      fetch(`/api/subjects/${last.subject.id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          const d = json?.data
          if (!d || d.subject.merged_into_id) return
          // Must belong to the currently selected group
          const inSelected = d.community_ids?.some((c: string) => selected.includes(c))
          if (!inSelected) return
          const moduleOk = last.moduleId === null || d.modules.some((m: { id: string }) => m.id === last.moduleId)
          setCls((prev) =>
            prev.subject
              ? prev
              : { ...prev, subject: d.subject, moduleChoice: moduleOk ? last.moduleId : undefined }
          )
        })
        .catch(() => {})
    } catch {
      /* storage unavailable */
    }
  }, [viewer.userId, selected])

  // Reset subject if community selection changes and current subject is not in it
  useEffect(() => {
    if (!cls.subject || selected.length === 0) return
    fetch(`/api/subjects/${cls.subject.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const d = json?.data
        if (d && !d.community_ids?.some((c: string) => selected.includes(c))) {
          setCls((prev) => ({ ...prev, subject: null, moduleChoice: undefined }))
        }
      })
      .catch(() => {})
  }, [selected, cls.subject])


  // ── tag suggestions ───────────────────────────────────────────────────────
  const { data: tagSuggestions = [] } = useQuery<string[]>({
    queryKey: ["tagSuggestions", selected.join(",")],
    queryFn: async () => {
      const res = await fetch(`/api/tags?community_ids=${selected.join(",")}`)
      if (!res.ok) return []
      return (await res.json()).data
    },
  })

  // ── duplicate check (same item / same file content) ───────────────────────
  const hashesReady = entries.every((e) => e.hash !== undefined)
  const shouldCheck = selected.length > 0 && entries.length > 0 && hashesReady
  const checkKey = JSON.stringify([
    selected,
    entries.map((e) => [e.source.kind === "vault" ? e.source.vaultItemId : null, e.hash]),
  ])
  const checkedThis = conflictState?.key === checkKey
  const checking = shouldCheck && !checkedThis
  const conflicts = shouldCheck && checkedThis ? conflictState.list : []

  useEffect(() => {
    if (!shouldCheck) return
    let cancelled = false
    const t = setTimeout(async () => {
      const res = await checkShareConflicts({
        communityIds: selected,
        items: entries.map((e) => ({
          vault_item_id: e.source.kind === "vault" ? e.source.vaultItemId : null,
          content_hash: e.hash ?? null,
        })),
      })
      if (!cancelled) setConflictState({ key: checkKey, list: res.ok ? res.data : [] })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkKey, shouldCheck])

  // ── "Replaces older item" options ─────────────────────────────────────────
  const communityResources = useQueries({
    queries: selected.map((id) => ({
      queryKey: ["communityVault", id],
      enabled: entries.length === 1 && !!cls.subject,
      queryFn: async (): Promise<CommunityResource[]> => {
        const res = await fetch(`/api/communities/${id}/vault`)
        if (!res.ok) throw new Error("Failed to fetch vault")
        return (await res.json()).data
      },
    })),
  })
  const replaceOptions = useMemo(() => {
    if (entries.length !== 1 || !cls.subject) return []
    return communityResources
      .flatMap((q) => q.data ?? [])
      .filter(
        (r) =>
          r.subject?.id === cls.subject?.id &&
          r.status === "current" &&
          (viewer.isPrivileged || r.shared_by_user_id === viewer.userId)
      )
  }, [communityResources, entries.length, cls.subject, viewer.isPrivileged, viewer.userId])

  const supersedes = replaceOptions.some((r) => r.id === supersedesPick) ? supersedesPick : ""
  const setSupersedes = setSupersedesPick

  // ── validation ────────────────────────────────────────────────────────────
  const communityName = (id: string) => communities.find((c) => c.id === id)?.name ?? "that community"
  const oversize = entries.filter((e) => e.source.kind === "file" && e.source.file.size > MAX_FILE_SIZE)
  const missing: string[] = []
  if (selected.length === 0) missing.push("a community")
  if (!cls.subject) missing.push("a subject")
  if (cls.subject && cls.moduleChoice === undefined) missing.push("a module")
  if (!cls.resourceType) missing.push("a resource type")
  if (entries.some((e) => !e.title.trim())) missing.push("a title for every item")
  const canSubmit =
    missing.length === 0 &&
    oversize.length === 0 &&
    conflicts.length === 0 &&
    hashesReady &&
    !checking &&
    !submitting &&
    entries.length > 0

  const removeEntry = (key: string) => setEntries((prev) => prev.filter((e) => e.key !== key))

  // ── submit ────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!canSubmit || !cls.subject || !cls.resourceType) return
    setSubmitting(true)
    const toastId = toast.loading("Sharing…")
    try {
      // 1. Make sure every item is in the personal vault first.
      const current = [...entries]
      const toShare: { vault_item_id: string; title: string }[] = []
      for (let i = 0; i < current.length; i++) {
        const e = current[i]
        let vaultItemId: string
        if (e.source.kind === "vault") {
          vaultItemId = e.source.vaultItemId
        } else if (e.source.kind === "file") {
          const formData = new FormData()
          formData.append("file", e.source.file, e.source.name)
          if (e.hash) formData.append("content_hash", e.hash)
          const res = await fetch("/api/vault/upload", { method: "POST", body: formData })
          const json = await res.json()
          if (!res.ok) throw new Error(json.error || `Upload of ${e.source.name} failed`)
          vaultItemId = json.vaultItem.id
          current[i] = { ...e, source: { kind: "vault", vaultItemId, name: e.source.name } }
          setEntries([...current])
        } else {
          const link = await createVaultLink({ title: e.source.title, url: e.source.url })
          vaultItemId = link.id
          current[i] = { ...e, source: { kind: "vault", vaultItemId, name: e.source.title } }
          setEntries([...current])
        }
        toShare.push({ vault_item_id: vaultItemId, title: e.title.trim() })
      }

      // 2. Share.
      const res = await shareToCommunities({
        communityIds: selected,
        items: toShare,
        subject_id: cls.subject.id,
        module_id: cls.moduleChoice ?? null,
        resource_type: cls.resourceType,
        academic_year: cls.year,
        description: description.trim() || null,
        tags,
        supersedes_share_id: supersedes || null,
      })
      if (!res.ok) throw new Error(res.error)

      try {
        if (viewer.userId) {
          localStorage.setItem(
            LAST_KEY,
            JSON.stringify({ userId: viewer.userId, subject: cls.subject, moduleId: cls.moduleChoice ?? null })
          )
        }
      } catch {
        /* storage unavailable */
      }

      toast.success(
        res.data.created === 1 ? "Shared." : `Shared ${toShare.length} item(s) to ${selected.length} community(ies).`,
        { id: toastId }
      )
      selected.forEach((id) => queryClient.invalidateQueries({ queryKey: ["communityVault", id] }))
      queryClient.invalidateQueries({ queryKey: ["communitySubjects"] })
      queryClient.invalidateQueries({ queryKey: ["vaultItems"] })
      queryClient.invalidateQueries({ queryKey: ["vaultFolders"] })
      onShared?.()
      onClose()
    } catch (err) {
      toast.error(
        (err instanceof Error ? err.message : "Could not share.") +
          (entries.some((e) => e.source.kind === "vault") ? " Files already uploaded are safe in your vault." : ""),
        { id: toastId }
      )
    } finally {
      setSubmitting(false)
    }
  }

  const hasNewUploads = sources.some((s) => s.kind !== "vault")

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !submitting && onClose()}>
      <DialogContent className={`${dialogCls} max-w-2xl`}>
        <DialogHeader>
          <DialogTitle className="font-heading font-extrabold text-[22px] text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] border-[2px] border-foreground bg-[#FFD600] flex items-center justify-center shadow-[2px_2px_0px_black]">
              <Share2 className="w-4 h-4 text-foreground" />
            </div>
            Share to group
          </DialogTitle>
          {hasNewUploads && (
            <p className="font-sans text-[13px] text-muted-foreground">
              New files are saved to your personal vault first, then shared.
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Items */}
          <div className="space-y-2">
            <Label className={labelCls}>
              {entries.length === 1 ? "Title" : `Titles (${entries.length} items)`} <span className="text-[#FF3B30]">*</span>
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {entries.map((e) => {
                const tooBig = e.source.kind === "file" && e.source.file.size > MAX_FILE_SIZE
                return (
                  <div key={e.key} className="flex items-center gap-2">
                    <div className="w-8 h-8 shrink-0 rounded-[8px] border-[1.5px] border-foreground bg-card flex items-center justify-center">
                      {e.source.kind === "link" ? <Link2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Input
                        value={e.title}
                        onChange={(ev) =>
                          setEntries((prev) => prev.map((x) => (x.key === e.key ? { ...x, title: ev.target.value } : x)))
                        }
                        aria-label="Title"
                        className={`${inputCls} h-9`}
                      />
                      {e.source.kind === "file" && (
                        <p className={`font-mono text-[10px] mt-0.5 ${tooBig ? "text-[#FF3B30]" : "text-muted-foreground"}`}>
                          {formatBytes(e.source.file.size)}
                          {tooBig ? " — over the 20 MB limit" : ""}
                        </p>
                      )}
                    </div>
                    {entries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEntry(e.key)}
                        aria-label="Remove from this share"
                        className="w-8 h-8 shrink-0 rounded-full border-[1.5px] border-foreground flex items-center justify-center hover:bg-[#FF3B30] hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Communities */}
          <div className="space-y-2">
            <Label className={labelCls}>
              Community <span className="text-[#FF3B30]">*</span>
            </Label>
            {lockedCommunityId ? (
              <div className="px-3 py-2 rounded-[0.75rem] border-[2px] border-foreground bg-background font-sans text-[14px] font-medium">
                {communityName(lockedCommunityId)}
              </div>
            ) : shareable.length === 0 ? (
              <p className="font-sans text-[13px] text-muted-foreground">
                You are not a member of any community yet. Join one from the Groups page to share into it.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {shareable.map((c) => {
                  const on = selected.includes(c.id)
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-[0.75rem] border-[2px] border-foreground cursor-pointer font-sans text-[13px] font-medium transition-colors ${
                        on ? "bg-[#FFD600]/40" : "bg-card hover:bg-background"
                      }`}
                    >
                      <input type="checkbox" checked={on} onChange={() => toggleCommunity(c.id)} className="accent-black" />
                      <span className="truncate">{c.name}</span>
                    </label>
                  )
                })}
              </div>
            )}
            {selected.length > 1 && (
              <p className="font-sans text-[12px] text-muted-foreground">
                The same item is shared to each community without making copies.
              </p>
            )}
          </div>

          <ClassificationFields
            value={cls}
            onChange={(patch) => setCls((prev) => ({ ...prev, ...patch }))}
            communityIds={selected}
          />

          <div className="space-y-2">
            <Label className={labelCls}>
              Description <span className="normal-case tracking-normal">(optional)</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="What is this and who is it for?"
              className="border-[2px] border-foreground rounded-[0.75rem] font-sans text-[14px] resize-none"
            />
          </div>

          <TagInput tags={tags} onChange={setTags} suggestions={tagSuggestions} />

          {replaceOptions.length > 0 && (
            <div className="space-y-2">
              <Label className={labelCls}>
                Replaces older item <span className="normal-case tracking-normal">(optional)</span>
              </Label>
              <select value={supersedes} onChange={(e) => setSupersedes(e.target.value)} className={selectCls} aria-label="Replaces older item">
                <option value="">Doesn’t replace anything</option>
                {replaceOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} — {resourceTypeLabel(r.resource_type)}
                    {r.academic_year ? `, ${r.academic_year}` : ""} ({communityName(r.community_id)})
                  </option>
                ))}
              </select>
              {supersedes && (
                <p className="font-sans text-[12px] text-muted-foreground">The older item will be marked as outdated.</p>
              )}
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="rounded-[0.75rem] border-[2px] border-[#FF3B30] bg-[#FF3B30]/10 p-3 space-y-1.5" role="alert">
              <div className="flex items-center gap-2 font-heading font-bold text-[13px] text-foreground">
                <AlertTriangle className="w-4 h-4 text-[#FF3B30]" /> Already shared, so it can’t be shared again
              </div>
              {conflicts.map((c, i) => (
                <p key={i} className="font-sans text-[13px] text-foreground">
                  <strong>{entries[c.itemIndex]?.title ?? "This item"}</strong>{" "}
                  {c.kind === "same_item" ? "is already in" : "(the same file) is already in"}{" "}
                  <strong>{communityName(c.communityId)}</strong> → {c.location}.
                </p>
              ))}
              <p className="font-sans text-[12px] text-muted-foreground">
                Remove that item or untick that community to continue.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 gap-3 flex-col sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-[12px] text-muted-foreground">
            {missing.length > 0 && !submitting ? `Still needed: ${missing.join(", ")}.` : ""}
            {oversize.length > 0 ? " Remove files over 20 MB." : ""}
          </p>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} disabled={submitting} className={btnSecondary}>
              Cancel
            </button>
            <button type="button" onClick={submit} disabled={!canSubmit} className={btnPrimary}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              {submitting ? "Sharing…" : "Share"}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
