"use client";

import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Brain,
  Terminal,
  Code2,
  BarChart3,
  Cloud,
  Binary,
  Cpu,
  Lightbulb,
  ShieldCheck,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

const groups: { name: string; desc: string; icon: LucideIcon }[] = [
  { name: "Artificial Intelligence & ML", desc: "Lecture decks, datasets and reading lists for AI and machine learning courses.", icon: Brain },
  { name: "Open-Source Technologies & DevOps", desc: "Tooling guides, lab setups and pipeline references.", icon: Terminal },
  { name: "Application Programming & Full Stack", desc: "Code samples, framework notes and project briefs.", icon: Code2 },
  { name: "Data Science, Analytics & BI", desc: "Datasets, notebooks and dashboard references.", icon: BarChart3 },
  { name: "Network & Cloud Computing", desc: "Lab manuals, topology diagrams and cloud platform guides.", icon: Cloud },
  { name: "Evolution of Computer Science", desc: "Theory notes, historical readings and syllabus material.", icon: Binary },
  { name: "Internet of Everything", desc: "Sensor and device guides, project ideas and reference designs.", icon: Cpu },
  { name: "Design, Innovation & Entrepreneurship", desc: "Case studies, design briefs and startup resources.", icon: Lightbulb },
  { name: "Cybersecurity, Blockchain & Secure Computing", desc: "Security advisories, lab exercises and protocol papers.", icon: ShieldCheck },
  { name: "Foundations & Multidisciplinary Courses", desc: "Shared material for first-year and cross-discipline courses.", icon: GraduationCap },
];

function GroupCard({ name, desc, icon: Icon }: { name: string; desc: string; icon: LucideIcon }) {
  return (
    <li className="w-72 md:w-80 shrink-0 bg-card border-2 border-foreground rounded-[1.25rem] p-5 shadow-[4px_4px_0px_var(--shadow-color)] flex flex-col justify-between gap-3 min-h-[170px] transition-transform hover:-translate-y-1">
      <div>
        <div className="w-10 h-10 rounded-xl border-2 border-foreground bg-secondary flex items-center justify-center text-foreground shadow-[2px_2px_0px_var(--shadow-color)] shrink-0 mb-3">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-display font-bold text-base md:text-lg text-foreground leading-snug">{name}</h3>
        <p className="font-sans text-xs md:text-sm text-muted-foreground leading-relaxed mt-1.5">{desc}</p>
      </div>
    </li>
  );
}

export default function DomainGroupsSection() {
  const reduceMotion = useReducedMotion();
  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + groups.length) % groups.length);
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % groups.length);
  };

  // 3 cards selected cyclically for static display
  const staticCards = [
    groups[startIndex % groups.length],
    groups[(startIndex + 1) % groups.length],
    groups[(startIndex + 2) % groups.length],
  ];

  return (
    <section className="py-12 md:py-16 overflow-hidden bg-[#FFD600] border-y-[3px] border-foreground">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 mb-6 md:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground">
            Domain groups for the IT department
          </h2>
          <p className="font-sans text-base md:text-lg text-foreground/80 mt-2">
            Each group keeps its own shared library.
          </p>
        </div>

        {/* Navigation controls when animation is off */}
        {reduceMotion && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs font-bold text-foreground/70">
              {startIndex + 1} / {groups.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous domain group"
                className="w-10 h-10 rounded-full bg-card border-2 border-foreground shadow-[2px_2px_0px_var(--shadow-color)] flex items-center justify-center text-foreground hover:bg-secondary active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next domain group"
                className="w-10 h-10 rounded-full bg-card border-2 border-foreground shadow-[2px_2px_0px_var(--shadow-color)] flex items-center justify-center text-foreground hover:bg-secondary active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STATIC MODE (animation off): Display 2-3 cards that fit on screen with NO horizontal scrollbar */}
      {reduceMotion ? (
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-4">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {staticCards.map((g, idx) => {
              const Icon = g.icon;
              return (
                <li
                  key={`${g.name}-${idx}`}
                  className={`w-full bg-card border-2 border-foreground rounded-[1.25rem] p-6 shadow-[4px_4px_0px_var(--shadow-color)] flex flex-col justify-between gap-3 min-h-[170px] transition-transform hover:-translate-y-1 ${idx === 1 ? "hidden sm:flex" : idx === 2 ? "hidden lg:flex" : "flex"
                    }`}
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl border-2 border-foreground bg-secondary flex items-center justify-center text-foreground shadow-[2px_2px_0px_var(--shadow-color)] shrink-0 mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground leading-snug">{g.name}</h3>
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed mt-2">{g.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        /* ANIMATION MODE (animation on): Smooth continuous scrolling marquee */
        <div className="relative w-full overflow-hidden py-5">
          <div className="animate-marquee">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1} className="flex items-stretch gap-5 pr-5">
                {groups.map((g) => (
                  <GroupCard key={g.name} {...g} />
                ))}
              </ul>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
