"use client"

import { useState } from "react"
import { Link2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { btnPrimary, btnSecondary, dialogCls, inputCls, labelCls } from "./ui"

// Collects a title and URL; the ShareDialog that follows saves the link to the vault and shares it.
export function AddLinkDialog({
  open,
  onClose,
  onContinue,
}: {
  open: boolean
  onClose: () => void
  onContinue: (link: { title: string; url: string }) => void
}) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({})

  const close = () => {
    setTitle("")
    setUrl("")
    setErrors({})
    onClose()
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: { title?: string; url?: string } = {}
    if (!title.trim()) next.title = "Title is required"
    if (!url.trim()) next.url = "URL is required"
    else {
      try {
        new URL(url.trim())
      } catch {
        next.url = "Enter a valid URL (include https://)"
      }
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return
    onContinue({ title: title.trim(), url: url.trim() })
    setTitle("")
    setUrl("")
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className={`${dialogCls} max-w-md`}>
        <DialogHeader>
          <DialogTitle className="font-heading font-extrabold text-[22px] text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] border-[2px] border-foreground bg-[#0057FF] flex items-center justify-center shadow-[2px_2px_0px_black]">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            Add external link
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5 mt-3">
          <div className="space-y-2">
            <Label className={labelCls}>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="e.g. NPTEL OS lecture series" className={inputCls} />
            {errors.title && <p className="font-sans text-[12px] text-[#FF3B30]">{errors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label className={labelCls}>URL</Label>
            <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className={inputCls} />
            {errors.url && <p className="font-sans text-[12px] text-[#FF3B30]">{errors.url}</p>}
          </div>
          <DialogFooter className="gap-3 pt-2">
            <button type="button" onClick={close} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary}>
              Continue
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
