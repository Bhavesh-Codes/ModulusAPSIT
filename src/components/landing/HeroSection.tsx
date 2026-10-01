"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FILE_TYPES, type FileType } from "./fileTypes";
import { ctaButton } from "./styles";

const tabs = ["All", "PDFs", "Links", "Images"];

const rows: { type: FileType; title: string; by: string; when: string; tag: string }[] = [
  { type: "pdf", title: "Unit 4 – Neural Networks (Slides)", by: "Prof. R. Nair", when: "2 days ago", tag: "Lecture" },
  { type: "link", title: "Open datasets for classroom use", by: "Prof. S. Varma", when: "3 days ago", tag: "Datasets" },
  { type: "img", title: "CNN architecture diagram", by: "Prof. A. Pillai", when: "5 days ago", tag: "Diagram" },
  { type: "pdf", title: "Machine Learning Question Bank", by: "Prof. K. Rao", when: "1 week ago", tag: "Exam" },
];

function GroupPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative z-10 w-full max-w-[520px] lg:w-[500px] bg-card border-[3px] border-foreground rounded-[24px] shadow-[10px_10px_0px_var(--shadow-color)] overflow-hidden"
    >
      <div className="bg-[#FFD600] border-b-[3px] border-foreground px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 shrink-0 bg-foreground rounded-full flex items-center justify-center text-[#FFD600] font-bold font-display text-xs">
          AI
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/70">Domain Expert Group</div>
          <div className="font-display font-bold text-base sm:text-lg text-foreground leading-tight">
            Artificial Intelligence &amp; Machine Learning
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-5 pt-4">
        {tabs.map((t, i) => (
          <span
            key={t}
            className={`font-mono text-xs font-bold px-3 py-1 rounded-full border-2 border-foreground ${
              i === 0 ? "bg-[#FFD600] text-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      <ul className="flex flex-col gap-3 p-5">
        {rows.map((r) => {
          const ft = FILE_TYPES[r.type];
          return (
            <li
              key={r.title}
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  const scrollToHow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("how");
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <section className="relative min-h-screen bg-card flex items-center pt-20 overflow-hidden">
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
            Your domain&rsquo;s knowledge,{" "}
            <span className="relative z-0 inline-block">
              organised.
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[0.06em] -z-10 h-[0.3em] rounded-sm bg-[#FFD600] dark:bg-[#FFD600]/40"
              />
            </span>
          </h1>

          <p className="font-sans text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
            Keep your own notes in a private vault. Share PDFs, images and links with the faculty in your
            domain group. Find any of it later by name, tag or type.
          </p>

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
            Built by the Department of Information Technology, A. P. Shah Institute of Technology.
          </p>
        </div>

        {/* Right: static group view */}
        <GroupPreview />
      </div>
    </section>
  );
}
