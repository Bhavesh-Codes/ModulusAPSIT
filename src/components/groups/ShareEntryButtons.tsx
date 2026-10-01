"use client"

import { useCallback, useRef, useState } from "react"
import { FolderSync, Link2, Upload } from "lucide-react"
import { useDragAndDrop } from "@/hooks/useDragAndDrop"
import type { Subject } from "@/types/groups"
import { AddLinkDialog } from "./AddLinkDialog"
import { ShareDialog, type ShareSource } from "./ShareDialog"
import { VaultPickerDialog } from "./VaultPickerDialog"

// Upload / Add link / Share from my vault. All three end in the same ShareDialog.
export function ShareEntryButtons({
  communityId,
  defaultSubject,
}: {
  communityId: string
  defaultSubject?: Subject | null
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [sources, setSources] = useState<ShareSource[]>([])
  const [shareOpen, setShareOpen] = useState(false)

  const startShare = useCallback((next: ShareSource[]) => {
    setSources(next)
    setShareOpen(true)
  }, [])

  const fromFiles = useCallback(
    (files: File[]) => startShare(files.map((file) => ({ kind: "file", file, name: file.name }))),
    [startShare]
  )

  // Dropping files anywhere on the page starts a share.
  useDragAndDrop(fromFiles)

  return (
    <>
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <button
          type="button"
          onClick={() => setLinkOpen(true)}
          className="px-5 py-2.5 rounded-[1rem] border-[3px] border-foreground bg-[#0057FF] shadow-[4px_4px_0px_black] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all font-heading font-bold text-[14px] text-white flex items-center gap-2 justify-center"
        >
          <Link2 className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Add Link</span>
        </button>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="px-5 py-2.5 rounded-[1rem] border-[3px] border-foreground bg-card shadow-[4px_4px_0px_black] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all font-heading font-bold text-[14px] text-foreground flex items-center gap-2 justify-center"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="px-5 py-2.5 rounded-[1rem] border-[3px] border-foreground bg-[#FFD600] shadow-[4px_4px_0px_black] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all font-heading font-bold text-[14px] text-foreground flex items-center gap-2 justify-center"
        >
          <FolderSync className="w-4 h-4" />
          <span className="hidden sm:inline">Share from my vault</span>
        </button>
        <input
          ref={fileInput}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) fromFiles(Array.from(e.target.files))
            e.target.value = ""
          }}
        />
      </div>

      <AddLinkDialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        onContinue={(link) => {
          setLinkOpen(false)
          startShare([{ kind: "link", title: link.title, url: link.url }])
        }}
      />
      <VaultPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        communityId={communityId}
        onContinue={(items) => {
          setPickerOpen(false)
          startShare(items.map((i) => ({ kind: "vault", vaultItemId: i.id, name: i.name })))
        }}
      />
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        sources={sources}
        lockedCommunityId={communityId}
        defaultSubject={defaultSubject}
      />
    </>
  )
}
