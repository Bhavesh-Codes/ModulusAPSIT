"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, ChevronRight, File, Folder, FolderSync, Link2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatBytes } from "@/lib/linkUtils"
import type { VaultFolder } from "@/types/vault"
import { getFileIcon } from "./resourceIcons"
import { btnPrimary, btnSecondary, dialogCls } from "./ui"

interface PickerItem {
  id: string
  item_type: string | null
  title: string | null
  folder_id: string | null
  files: { filename: string; mime_type: string; size_bytes: number } | null
  community_vault_items?: { community_id: string }[]
}

// Pick files and links from the personal vault. Group vaults have no folders, so only items are selectable.
export function VaultPickerDialog({
  open,
  onClose,
  communityId,
  onContinue,
}: {
  open: boolean
  onClose: () => void
  communityId: string
  onContinue: (items: { id: string; name: string }[]) => void
}) {
  const [stack, setStack] = useState<{ id: string; name: string }[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const currentFolderId = stack.length ? stack[stack.length - 1].id : null

  const { data: items = [], isLoading: itemsLoading } = useQuery<PickerItem[]>({
    queryKey: ["vaultItems", "picker"],
    enabled: open,
    queryFn: async () => {
      const res = await fetch("/api/vault/items")
      if (!res.ok) throw new Error("Failed to fetch personal vault")
      return (await res.json()).data
    },
  })
  const { data: folders = [], isLoading: foldersLoading } = useQuery<VaultFolder[]>({
    queryKey: ["vaultFolders"],
    enabled: open,
    queryFn: async () => {
      const res = await fetch("/api/vault/folders")
      if (!res.ok) throw new Error("Failed to fetch folders")
      return (await res.json()).data
    },
  })

  const here = items.filter((i) => (i.folder_id || null) === currentFolderId)
  const subFolders = folders.filter((f) => (f.parent_id || null) === currentFolderId)
  const nameOf = (i: PickerItem) => (i.item_type === "link" ? i.title || "Link" : i.files?.filename || "File")
  const alreadyShared = (i: PickerItem) => !!i.community_vault_items?.some((c) => c.community_id === communityId)

  const close = () => {
    setSelected([])
    setStack([])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className={`${dialogCls} max-w-2xl flex flex-col h-[85vh]`}>
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-heading font-extrabold text-[22px] text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] border-[2px] border-foreground bg-[#FFD600] flex items-center justify-center shadow-[2px_2px_0px_black]">
              <FolderSync className="w-4 h-4 text-foreground" />
            </div>
            Share from my vault
          </DialogTitle>
          <p className="font-sans text-[14px] text-muted-foreground">Choose files and links, then add the details.</p>
        </DialogHeader>

        <div className="flex items-center gap-2 bg-background p-2 rounded-[0.75rem] border-[2px] border-foreground overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setStack([])}
            className={`font-mono text-[12px] px-2 py-1 rounded-[4px] ${stack.length === 0 ? "bg-foreground text-background" : "hover:bg-muted"}`}
          >
            ROOT
          </button>
          {stack.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2 shrink-0">
              <ChevronRight className="w-3 h-3" />
              <button
                type="button"
                onClick={() => setStack((prev) => prev.slice(0, i + 1))}
                className={`font-mono text-[12px] px-2 py-1 rounded-[4px] ${i === stack.length - 1 ? "bg-foreground text-background" : "hover:bg-muted"}`}
              >
                {f.name}
              </button>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
          {itemsLoading || foldersLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : here.length === 0 && subFolders.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <File className="w-10 h-10 mx-auto opacity-30" />
              <p className="font-sans text-[14px] text-muted-foreground">Nothing here. Go back or upload to your vault.</p>
            </div>
          ) : (
            <>
              {subFolders.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setStack((prev) => [...prev, { id: f.id, name: f.name }])}
                  className="w-full flex items-center gap-3 p-3 rounded-[1rem] border-[2px] border-foreground bg-card hover:bg-background text-left shadow-[2px_2px_0px_black]"
                >
                  <div className="w-10 h-10 rounded-[8px] bg-[#FFD600] border-[1.5px] border-foreground flex items-center justify-center">
                    <Folder className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="flex-1 font-heading font-bold text-[14px] truncate">{f.name}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
              {here.map((item) => {
                const on = selected.includes(item.id)
                const shared = alreadyShared(item)
                return (
                  <button
                    type="button"
                    key={item.id}
                    disabled={shared}
                    onClick={() => setSelected((prev) => (on ? prev.filter((x) => x !== item.id) : [...prev, item.id]))}
                    aria-pressed={on}
                    className={`w-full flex items-center gap-3 p-3 rounded-[1rem] border-[2px] text-left shadow-[2px_2px_0px_black] transition-colors disabled:opacity-50 ${
                      on ? "border-[#0057FF] bg-[#0057FF]/10" : "border-foreground bg-card hover:bg-background"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-[4px] border-[2px] border-foreground flex items-center justify-center shrink-0 ${on ? "bg-[#0057FF]" : "bg-card"}`}
                    >
                      {on && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                    </span>
                    <div className="w-10 h-10 rounded-[8px] bg-card border-[1.5px] border-foreground flex items-center justify-center shrink-0">
                      {item.item_type === "link" ? <Link2 className="w-5 h-5 text-[#0057FF]" /> : getFileIcon(item.files?.mime_type, "w-5 h-5")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold text-[14px] truncate">{nameOf(item)}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {item.item_type === "link" ? "Link" : formatBytes(item.files?.size_bytes)}
                        {shared ? " · already in this community" : ""}
                      </div>
                    </div>
                  </button>
                )
              })}
            </>
          )}
        </div>

        <div className="pt-3 border-t-[2px] border-border flex items-center justify-between shrink-0">
          <span className="font-heading font-bold text-[14px]">
            {selected.length > 0 ? `${selected.length} selected` : <span className="text-muted-foreground">Select items to share</span>}
          </span>
          <div className="flex gap-3">
            <button type="button" onClick={close} className={btnSecondary}>
              Cancel
            </button>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => {
                const picked = items.filter((i) => selected.includes(i.id)).map((i) => ({ id: i.id, name: nameOf(i) }))
                setSelected([])
                setStack([])
                onContinue(picked)
              }}
              className={btnPrimary}
            >
              Continue
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
