import { FileText, Image as ImageIcon, Link as LinkIcon } from "lucide-react";

export type FileType = "pdf" | "img" | "link";

// Shared icon + tile colour per resource type, used by every landing mockup.
export const FILE_TYPES = {
  pdf: { label: "PDF", icon: FileText, tile: "bg-[#0057FF]" },
  img: { label: "Image", icon: ImageIcon, tile: "bg-[#FF3CAC]" },
  link: { label: "Link", icon: LinkIcon, tile: "bg-[#FF6B00]" },
} as const;
