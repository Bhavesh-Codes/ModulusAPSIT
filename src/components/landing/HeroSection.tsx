"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowDown, FileText, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type FileType = "pdf" | "img" | "link";

const FILE_TYPES = {
  pdf: { label: "PDF", icon: FileText, tile: "bg-[#0057FF]" },
  img: { label: "Image", icon: ImageIcon, tile: "bg-[#FF3CAC]" },
  link: { label: "Link", icon: LinkIcon, tile: "bg-[#FF6B00]" },
} as const;

const ctaButton =
  "bg-[#FFD600] border-[3px] border-foreground font-display font-bold text-foreground rounded-[14px] shadow-[6px_6px_0px_var(--shadow-color)] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none hover:bg-[#FFD600]/90 transition-all focus-visible:border-foreground focus-visible:ring-4 focus-visible:ring-foreground/50";

const tabs = [
  { id: "all", label: "All" },
  { id: "pdf", label: "PDFs" },
  { id: "link", label: "Links" },
  { id: "img", label: "Images" },
] as const;

type TabId = "all" | FileType;

const rows: { type: FileType; title: string; by: string; when: string; tag: string }[] = [
  { type: "pdf", title: "Deep Learning & Neural Networks Notes", by: "Dr. S. Aneesh", when: "2 days ago", tag: "Lecture" },
  { type: "link", title: "Network Protocols & Routing Reference", by: "Prof. J. Jha", when: "3 days ago", tag: "Network" },
  { type: "img", title: "Cloud Virtualization Architecture Diagram", by: "Dr. V. Badgujar", when: "4 days ago", tag: "Cloud" },
  { type: "pdf", title: "Linux Administration & Shell Scripting Guide", by: "Prof. S. Oak", when: "5 days ago", tag: "Lab" },
  { type: "img", title: "ML Algorithms Architecture & Workflow Diagram", by: "Prof. S. Balpande", when: "1 week ago", tag: "Diagram" },
];

function MemphisShapes({ reduceMotion }: { reduceMotion: boolean | null }) {
  const shouldAnimate = !reduceMotion;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-[0.15]"
    >
      {/* Hollow circle, 3px border, transparent fill */}
      <motion.div
        className="absolute top-[16%] left-[8%] w-16 h-16 rounded-full border-[3px] border-foreground bg-transparent"
        animate={shouldAnimate ? { y: [0, -20, 0], rotate: [0, 45, 0] } : undefined}
        transition={shouldAnimate ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
      />

      {/* Hollow triangle (SVG path M50 10 L90 90 L10 90 Z, viewBox 0 0 100 100, no fill, strokeWidth 4) */}
      <motion.div
        className="absolute top-[6%] right-[14%] w-16 h-16"
        animate={shouldAnimate ? { y: [0, 30, 0], rotate: [0, -20, 0] } : undefined}
        transition={shouldAnimate ? { duration: 8, delay: 1, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full text-foreground" fill="none" stroke="currentColor">
          <path d="M50 10 L90 90 L10 90 Z" fill="none" strokeWidth="4" />
        </svg>
      </motion.div>



      {/* Hollow wavy line (SVG viewBox 0 0 100 40, path M0 20 Q 12.5 5, 25 20 T 50 20 T 75 20 T 100 20, no fill, strokeWidth 4, round caps) */}
      <motion.div
        className="absolute bottom-[6%] right-[8%] w-24 h-8"
        animate={shouldAnimate ? { y: [0, 15, 0], rotate: [0, 10, 0] } : undefined}
        transition={shouldAnimate ? { duration: 7, delay: 0.5, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <svg viewBox="0 0 100 40" className="w-full h-full text-foreground" fill="none" stroke="currentColor">
          <path
            d="M0 20 Q 12.5 5, 25 20 T 50 20 T 75 20 T 100 20"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Hollow star (SVG viewBox 0 0 24 24, polygon 12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2, no fill, strokeWidth 2, round joins) */}
      <motion.div
        className="absolute top-[24%] right-[1%] w-12 h-12"
        animate={shouldAnimate ? { scale: [1, 1.2, 1], rotate: [0, 90, 0] } : undefined}
        transition={shouldAnimate ? { duration: 9, delay: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full text-foreground" fill="none" stroke="currentColor">
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill="none"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* 2×2 checker: two filled squares on one diagonal, two with a 2px border on the other */}
      <motion.div
        className="absolute top-[62%] left-[22%] w-16 h-16 grid grid-cols-2"
        animate={shouldAnimate ? { x: [0, 20, 0], y: [0, -20, 0] } : undefined}
        transition={shouldAnimate ? { duration: 10, delay: 1.5, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <div className="w-8 h-8 bg-foreground" />
        <div className="w-8 h-8 border-2 border-foreground bg-transparent" />
        <div className="w-8 h-8 border-2 border-foreground bg-transparent" />
        <div className="w-8 h-8 bg-foreground" />
      </motion.div>
    </div>
  );
}

function GroupPreview() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const filteredRows = activeTab === "all" ? rows : rows.filter((r) => r.type === activeTab);

  return (
    <div
      className="w-full bg-card border-[3px] border-foreground rounded-[24px] shadow-[12px_12px_0px_black] overflow-hidden"
    >
      <div className="bg-[#FFD600] border-b-[3px] border-foreground px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 shrink-0 bg-foreground rounded-full flex items-center justify-center text-[#FFD600] font-bold font-display text-xs">
          IT
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/70">Domain Expert Groups</div>
          <div className="font-display font-bold text-base sm:text-lg text-foreground leading-tight">
            Information Technology Faculty Library
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-5 pt-4">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`font-mono text-xs font-bold px-3 py-1 rounded-full border-2 border-foreground transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${
                isActive
                  ? "bg-[#FFD600] text-foreground shadow-[2px_2px_0px_var(--shadow-color)]"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <ul className="flex flex-col gap-3 p-5 min-h-[380px]">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredRows.map((r) => {
            const ft = FILE_TYPES[r.type];
            return (
              <motion.li
                key={r.title}
                layout="position"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-3 bg-background border-2 border-foreground rounded-xl p-3"
              >
                <div className={`w-9 h-9 shrink-0 rounded-md border-2 border-foreground flex items-center justify-center text-white ${ft.tile}`}>
                  <ft.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-sans font-medium text-sm text-foreground truncate">{r.title}</div>
                  <div className="font-mono text-[11px] text-muted-foreground truncate">
                    Shared by {r.by} · {r.when}
                  </div>
                </div>
                <span className="hidden sm:inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-foreground bg-card text-foreground">
                  {r.tag}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

export default function HeroSection() {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = !reduceMotion;

  const scrollToHow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("how");
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <section className="relative min-h-screen bg-card flex items-center pt-20 overflow-hidden">
      <MemphisShapes reduceMotion={reduceMotion} />
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 relative z-10 py-16">

        {/* Left Content */}
        <div className="max-w-xl xl:max-w-2xl flex flex-col items-start text-left shrink-0">

          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#FFD600] scale-105 transform -rotate-2" />
            <span className="relative z-10 font-mono text-xs sm:text-sm tracking-[0.2em] uppercase font-bold text-foreground px-1">
              Domain Expert Groups · IT Department
            </span>
          </div>

          <h1 className="font-display font-extrabold text-[clamp(2.5rem,5vw,5rem)] leading-[1.05] tracking-tight mb-8">
            Share{" "}
            <span className="relative inline-block">
              resources
              <svg
                aria-hidden="true"
                viewBox="0 0 200 28"
                preserveAspectRatio="none"
                className="absolute left-[-2%] -bottom-2 sm:-bottom-3 w-[104%] h-3.5 sm:h-5 text-[#EF4444] pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <path d="M 1 15 Q 100 2 199 13" vectorEffect="non-scaling-stroke" />
                <path d="M 6 23.5 Q 102 10.5 194 21" vectorEffect="non-scaling-stroke" />
              </svg>
            </span>{" "}
            within your{" "}
            <span className="relative z-0 inline-block">
              domain groups.
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[0.06em] -z-10 h-[0.3em] rounded-sm bg-[#FFD600] dark:bg-[#FFD600]/40"
              />
            </span>
          </h1>

          <p className="font-sans text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
            A platform for teachers to organise and share their own resources, and discover materials from other faculty—slides, notes, PDFs, images, and links.</p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto">
            <Button asChild className={`${ctaButton} w-full sm:w-auto h-14 px-8 text-lg`}>
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto bg-card border-[3px] border-foreground font-display font-bold text-foreground rounded-[14px] shadow-[6px_6px_0px_var(--shadow-color)] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none transition-all h-14 px-8 text-lg focus-visible:border-foreground focus-visible:ring-4 focus-visible:ring-foreground/50"
            >
              <a href="#how" onClick={scrollToHow}>
                See how it works
                <ArrowDown className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>

          <p className="font-mono text-sm text-muted-foreground font-medium max-w-md">
            Built by a Student of Information Technology Department,<br /> A. P. Shah Institute of Technology.
          </p>
        </div>

        {/* Right: floating group view */}
        <motion.div
          className="hidden lg:block relative z-10 w-[500px]"
          style={{ rotate: "2deg" }}
          animate={shouldAnimate ? { y: [-10, 10, -10] } : undefined}
          transition={shouldAnimate ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          <GroupPreview />
        </motion.div>
      </div>
    </section>
  );
}
