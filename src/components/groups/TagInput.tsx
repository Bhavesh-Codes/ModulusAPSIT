"use client"

import { useState } from "react"
import { Plus, Tag, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { inputCls, labelCls } from "./ui"

// Tag editor that offers tags already in use first.
export function TagInput({
  tags,
  onChange,
  suggestions = [],
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
}) {
  const [input, setInput] = useState("")

  const add = (raw: string) => {
    const t = raw.trim().replace(/^#+/, "")
    if (t && !tags.includes(t)) onChange([...tags, t])
    setInput("")
  }

  const needle = input.trim().replace(/^#+/, "").toLowerCase()
  const shown = suggestions
    .filter((s) => !tags.includes(s) && (!needle || s.toLowerCase().includes(needle)))
    .slice(0, 8)

  return (
    <div className="space-y-2">
      <Label className={`${labelCls} flex items-center gap-1`}>
        <Tag className="w-3.5 h-3.5" /> Tags <span className="normal-case tracking-normal">(optional)</span>
      </Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add(input)
            }
          }}
          placeholder="Type a tag and press Enter…"
          className={`${inputCls} flex-1`}
        />
        <button
          type="button"
          onClick={() => add(input)}
          aria-label="Add tag"
          className="px-3 py-2 rounded-[0.75rem] border-[2px] border-foreground bg-background shadow-[3px_3px_0px_black] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
        >
          <Plus className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {shown.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] text-muted-foreground">{needle ? "Matches:" : "In use:"}</span>
          {shown.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="px-2.5 py-0.5 rounded-[100px] border-[1.5px] border-foreground bg-background font-mono text-[11px] font-bold text-foreground hover:bg-[#FFD600] transition-colors"
            >
              #{s}
            </button>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-[100px] border-[1.5px] border-foreground bg-[#FFD600] shadow-[2px_2px_0px_black] font-mono text-[12px] font-medium text-foreground"
            >
              #{t}
              <button
                type="button"
                onClick={() => onChange(tags.filter((x) => x !== t))}
                aria-label={`Remove tag ${t}`}
                className="ml-1 hover:opacity-60"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
