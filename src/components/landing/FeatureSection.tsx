"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Users, Search,
  FileText, Image as ImageIcon, Link as LinkIcon,
  File, CheckCircle2
} from "lucide-react";

/* ─── Vault Mockup ──────────────────────────────────────────── */
function VaultMockup() {
  const [activeId, setActiveId] = useState<number | null>(null);

  const files = [
    { id: 1, name: "Unit3_Notes.pdf",       icon: FileText,   color: "bg-[#0057FF]" },
    { id: 2, name: "Architecture_Diagram.png", icon: ImageIcon, color: "bg-[#FF3CAC]" },
    { id: 3, name: "Stanford_CS229",         icon: LinkIcon,   color: "bg-[#FF6B00]" },
  ];

  return (
    <div className="w-full h-full min-h-[300px] bg-background rounded-[1.5rem] p-6 border-2 border-foreground flex flex-col gap-4 relative">
      <div className="flex justify-between items-center bg-card border-2 border-foreground p-3 rounded-xl shadow-[3px_3px_0px_var(--shadow-color,black)]">
        <div className="text-sm font-display font-bold">My Vault</div>
        <div className="bg-[#FFD600] text-xs font-bold px-2 py-1 rounded-md border border-foreground">New</div>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1 relative">
        {files.map((f) => (
          <motion.div
            key={f.id}
            layoutId={`vault-card-${f.id}`}
            onClick={() => setActiveId(f.id)}
            className="bg-card border-2 border-foreground rounded-xl p-3 shadow-[3px_3px_0px_var(--shadow-color,black)] cursor-pointer hover:bg-neutral-50 flex flex-col gap-2"
          >
            <div className={`w-8 h-8 rounded-md border border-foreground flex items-center justify-center text-white ${f.color}`}>
              <f.icon className="w-4 h-4" />
            </div>
            <div className="text-xs font-mono font-medium truncate">{f.name}</div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeId && (
          <motion.div
            className="absolute inset-4 bg-card border-2 border-foreground rounded-[1.5rem] shadow-[6px_6px_0px_var(--shadow-color,black)] z-10 p-4 flex flex-col cursor-pointer"
            layoutId={`vault-card-${activeId}`}
            onClick={() => setActiveId(null)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-md border-2 border-foreground flex items-center justify-center text-white ${files.find((f) => f.id === activeId)?.color}`}>
                {(() => { const Icon = files.find(f => f.id === activeId)!.icon; return <Icon className="w-5 h-5" />; })()}
              </div>
              <div className="text-sm font-mono font-bold truncate">
                {files.find((f) => f.id === activeId)?.name}
              </div>
            </div>
            <div className="flex-1 bg-background border-2 border-foreground rounded-xl flex items-center justify-center">
              <div className="w-3/4 space-y-2">
                <div className="h-4 w-full bg-foreground/10 rounded-md" />
                <div className="h-4 w-5/6 bg-foreground/10 rounded-md" />
                <div className="h-4 w-4/6 bg-foreground/10 rounded-md" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Groups Mockup ─────────────────────────────────────────── */
function GroupsMockup() {
  const [joined, setJoined] = useState(false);

  const rows = [
    { icon: FileText, color: "bg-[#0057FF]", label: "Neural Networks – Lecture 3.pdf", tag: "Deep Learning" },
    { icon: LinkIcon, color: "bg-[#FF6B00]", label: "Stanford CS229 Course", tag: "Reference" },
  ];

  return (
    <div className="w-full h-full min-h-[300px] bg-card rounded-[1.5rem] border-2 border-foreground shadow-[6px_6px_0px_var(--shadow-color,black)] overflow-hidden flex flex-col">
      <div className="h-16 bg-[#FFD600] border-b-2 border-foreground px-5 flex items-center justify-between shrink-0">
        <span className="font-display font-bold text-sm text-foreground truncate">AI &amp; Machine Learning</span>
        <span className="text-xs font-mono text-foreground/60 ml-2 shrink-0">12 members</span>
      </div>

      <div className="flex-1 bg-background p-4 flex flex-col gap-3">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 bg-card border-2 border-foreground rounded-xl p-3 shadow-[3px_3px_0px_var(--shadow-color,black)]">
            <span className={`w-8 h-8 shrink-0 rounded-md border border-foreground flex items-center justify-center text-white ${r.color}`}>
              <r.icon className="w-4 h-4" />
            </span>
            <span className="flex-1 text-xs font-sans font-semibold text-foreground truncate">{r.label}</span>
            <span className="text-[9px] font-mono font-bold bg-[#FFD600] text-foreground border border-foreground px-2 py-0.5 rounded-full shrink-0">{r.tag}</span>
          </div>
        ))}
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={() => setJoined(!joined)}
          className={`w-full py-2.5 rounded-xl border-2 border-foreground font-display font-bold transition-all flex items-center justify-center gap-2 ${
            joined
              ? "bg-card text-foreground shadow-[2px_2px_0px_var(--shadow-color,black)] translate-x-[2px] translate-y-[2px]"
              : "bg-[#FFD600] text-foreground shadow-[4px_4px_0px_var(--shadow-color,black)] hover:bg-[#FFD600]/90"
          }`}
        >
          {joined ? <><CheckCircle2 className="w-5 h-5 text-[#00C853]" /> Joined</> : "Join Group"}
        </button>
      </div>
    </div>
  );
}

/* ─── Search Mockup ─────────────────────────────────────────── */
function SearchMockup() {
  const [query, setQuery] = useState("neural");

  const results = [
    { icon: FileText, color: "bg-[#0057FF]", title: "Neural Networks – Lecture 3.pdf", meta: "My Vault · PDF · Deep Learning" },
    { icon: LinkIcon, color: "bg-[#FF6B00]", title: "Stanford CS229 Course", meta: "AI & ML Group · Link · Reference" },
    { icon: ImageIcon, color: "bg-[#FF3CAC]", title: "CNN Architecture Diagram.png", meta: "AI & ML Group · Image · Visual Aid" },
  ];

  const filtered = query.trim()
    ? results.filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.meta.toLowerCase().includes(query.toLowerCase()))
    : results;

  return (
    <div className="w-full h-full min-h-[300px] bg-background rounded-[1.5rem] p-5 border-2 border-foreground flex flex-col gap-4">
      {/* Search bar */}
      <div className="flex items-center gap-2 bg-card border-2 border-foreground rounded-xl px-3 py-2 shadow-[3px_3px_0px_var(--shadow-color,black)]">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, tag or type…"
          className="flex-1 text-sm font-sans bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Results */}
      <div className="flex flex-col gap-2 flex-1">
        {filtered.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 bg-card border-2 border-foreground rounded-xl p-3 shadow-[3px_3px_0px_var(--shadow-color,black)]"
          >
            <span className={`w-8 h-8 shrink-0 rounded-md border border-foreground flex items-center justify-center text-white ${r.color}`}>
              <r.icon className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-sans font-semibold text-foreground truncate">{r.title}</p>
              <p className="text-[10px] font-mono text-muted-foreground">{r.meta}</p>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs font-mono text-muted-foreground text-center mt-4">No results found.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Feature data ───────────────────────────────────────────── */
const features = [
  {
    id: "vault",
    icon: Lock,
    color: "bg-[#0057FF]",
    title: "Personal Vault",
    desc: "Upload files, write notes and save links in folders with tags. Everything stays private until you share it.",
    tags: ["Private by default", "Folders & Tags", "Rich Text Notes"],
    mockup: VaultMockup,
  },
  {
    id: "groups",
    icon: Users,
    color: "bg-[#FFD600]",
    iconFg: "text-foreground",
    title: "Groups",
    desc: "One group for each domain, such as Cybersecurity or Data Science. Members share resources, and everything stays sorted in one shared library.",
    tags: ["Per-domain library", "Shared files", "Tag everything"],
    mockup: GroupsMockup,
  },
  {
    id: "search",
    icon: Search,
    color: "bg-foreground",
    title: "Search",
    desc: "Find any file, note or link by name, tag, type or group — across your vault and every group you belong to.",
    tags: ["By name", "By tag", "By type or group"],
    mockup: SearchMockup,
  },
];

/* ─── Section ────────────────────────────────────────────────── */
export default function FeatureSection() {
  return (
    <section className="py-32 bg-card block w-full">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">

        <div className="text-center mb-24 flex flex-col items-center gap-4">
          <h2 className="font-display font-extrabold text-4xl sm:text-6xl text-foreground">
            Two spaces. One search.
          </h2>
          <p className="font-sans text-xl text-muted-foreground max-w-xl">
            A private vault for your own material and groups for sharing with colleagues.
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feat, idx) => {
            const isEven = idx % 2 === 0;

            const ContentSide = () => (
              <div className="flex-1 flex flex-col gap-6 items-start justify-center">
                <div className={`w-16 h-16 rounded-[1rem] border-[3px] border-foreground shadow-[4px_4px_0px_var(--shadow-color,black)] flex items-center justify-center ${feat.color} ${feat.iconFg ?? "text-white"}`}>
                  <feat.icon className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
                  {feat.title}
                </h3>
                <p className="font-sans text-lg text-muted-foreground max-w-md">
                  {feat.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feat.tags.map(tag => (
                    <div key={tag} className="font-mono text-xs font-bold text-foreground bg-[#FFD600] px-3 py-1.5 rounded-full border-2 border-foreground">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            );

            const MockupSide = () => (
              <div className="flex-[1.2] w-full max-w-xl mx-auto md:max-w-none">
                <feat.mockup />
              </div>
            );

            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`p-8 md:p-12 lg:p-16 bg-card border-[3px] border-foreground rounded-[2rem] shadow-[8px_8px_0px_var(--shadow-color,black)] flex flex-col gap-12 lg:gap-16 relative overflow-hidden ${
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                <ContentSide />
                <MockupSide />
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
