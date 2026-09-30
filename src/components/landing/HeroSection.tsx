"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Link2, Image as ImageIcon, File } from "lucide-react";

const mockRows = [
  {
    icon: FileText,
    iconBg: "bg-[#0057FF]",
    title: "Lecture Notes – Unit 3: Neural Networks",
    meta: "Shared by Prof. Mehta · 2 days ago",
    tag: "Deep Learning",
  },
  {
    icon: Link2,
    iconBg: "bg-[#FF6B00]",
    title: "Stanford CS229 – Machine Learning Course",
    meta: "Shared by Prof. Sharma · 5 days ago",
    tag: "Reference",
  },
  {
    icon: ImageIcon,
    iconBg: "bg-[#00C853]",
    title: "CNN Architecture Diagram",
    meta: "Shared by Prof. Kulkarni · 1 week ago",
    tag: "Visual Aid",
  },
  {
    icon: File,
    iconBg: "bg-[#7C3AED]",
    title: "Assignment 2 – Submission Template",
    meta: "Shared by Prof. Joshi · 1 week ago",
    tag: "Assignment",
  },
];

const tabs = ["All", "PDFs", "Links", "Images"];

function GroupViewCard() {
  return (
    <div className="hidden lg:block relative z-10 w-[480px] shrink-0">
      <div
        className="bg-card border-[3px] border-foreground rounded-[24px] shadow-[12px_12px_0px_var(--shadow-color,black)] overflow-hidden flex flex-col"
        style={{ transform: "rotate(1.5deg)" }}
      >
        {/* Card header */}
        <div className="h-14 bg-[#FFD600] border-b-[3px] border-foreground px-5 flex items-center justify-between shrink-0">
          <span className="font-display font-bold text-base text-foreground truncate">
            Artificial Intelligence &amp; Machine Learning
          </span>
          <span className="text-xs font-mono text-foreground/60 ml-2 shrink-0">12 members</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-1 border-b border-foreground/10">
          {tabs.map((t, i) => (
            <span
              key={t}
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border border-foreground ${
                i === 0
                  ? "bg-foreground text-card"
                  : "bg-transparent text-muted-foreground"
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="flex flex-col divide-y divide-foreground/10 bg-background">
          {mockRows.map((row, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`w-8 h-8 shrink-0 rounded-md border border-foreground flex items-center justify-center text-white ${row.iconBg}`}
              >
                <row.icon className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-sans font-semibold text-foreground truncate">
                  {row.title}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {row.meta}
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold bg-[#FFD600] text-foreground border border-foreground px-2 py-0.5 rounded-full shrink-0">
                {row.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-card flex items-center pt-20 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 relative z-10 py-16">

        {/* Left content */}
        <div className="max-w-xl xl:max-w-2xl flex flex-col items-start text-left shrink-0">

          {/* Badge */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#FFD600] scale-105 transform -rotate-1" />
            <span className="relative z-10 font-mono text-sm tracking-[0.15em] uppercase font-bold text-foreground px-1">
              Domain Expert Groups · IT Department
            </span>
          </div>

          <h1 className="font-display font-extrabold text-[clamp(2.75rem,5vw,5rem)] leading-[1.05] tracking-tight mb-8">
            Your domain&apos;s knowledge,{" "}
            <span className="relative inline-block">
              organised
              <svg
                className="absolute w-full h-[14px] -bottom-[2px] left-0 pointer-events-none"
                viewBox="0 0 200 20"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect x="0" y="6" width="200" height="10" fill="#FFD600" rx="2" />
              </svg>
            </span>
            .
          </h1>

          <p className="font-sans text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
            Keep your own notes in a private vault. Share PDFs, images and
            links with the faculty in your domain group. Find any of it later
            by name, tag or type.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10 w-full sm:w-auto">
            <Button
              asChild
              className="bg-[#FFD600] border-[3px] border-foreground font-display font-bold text-foreground rounded-[14px] shadow-[6px_6px_0px_var(--shadow-color,black)] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none hover:bg-[#FFD600]/90 transition-all h-14 px-8 text-lg focus-visible:ring-2 focus-visible:ring-foreground"
            >
              <Link href="/login">Login</Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="bg-card border-[3px] border-foreground font-display font-bold text-foreground rounded-[14px] shadow-[6px_6px_0px_var(--shadow-color,black)] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none transition-all h-14 px-8 text-lg focus-visible:ring-2 focus-visible:ring-foreground"
            >
              <a href="#how">See how it works</a>
            </Button>
          </div>

          {/* Attribution */}
          <p className="font-mono text-sm text-muted-foreground">
            Built by the Department of Information Technology,{" "}
            <span className="font-semibold text-foreground">
              A. P. Shah Institute of Technology.
            </span>
          </p>
        </div>

        {/* Right: group view card */}
        <GroupViewCard />
      </div>
    </section>
  );
}
