"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { Copy, Users, Search, CheckCircle2, FileText, Image as ImageIcon, Link as LinkIcon, Files } from "lucide-react";
type FileType = "pdf" | "img" | "link";

const FILE_TYPES = {
  pdf: { label: "PDF", icon: FileText, tile: "bg-[#0057FF]" },
  img: { label: "Image", icon: ImageIcon, tile: "bg-[#FF3CAC]" },
  link: { label: "Link", icon: LinkIcon, tile: "bg-[#FF6B00]" },
} as const;

// Individual Mini Mockups

function VaultMockup() {
  const [activeId, setActiveId] = useState<number | null>(null);

  const files: { id: number; name: string; type: FileType }[] = [
    { id: 1, name: "Lab_Manual_Unit3.pdf", type: "pdf" },
    { id: 2, name: "Syllabus_Diagram.png", type: "img" },
    { id: 3, name: "Reading_List_Links", type: "link" },
  ];
  const active = files.find((f) => f.id === activeId);
  const ActiveIcon = active ? FILE_TYPES[active.type].icon : null;

  return (
    <div className="w-full h-full min-h-[300px] bg-background rounded-[1.5rem] p-6 border-2 border-foreground flex flex-col gap-4 relative">
      <div className="flex justify-between items-center bg-card border-2 border-foreground p-3 rounded-xl shadow-[3px_3px_0px_var(--shadow-color)]">
        <div className="text-sm font-display font-bold">My Vault</div>
        <div className="bg-[#FFD600] text-xs font-bold px-2 py-1 rounded-md border border-foreground">New</div>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1 relative">
        {files.map((f) => {
          const ft = FILE_TYPES[f.type];
          return (
            <motion.button
              type="button"
              key={f.id}
              layoutId={`vault-card-${f.id}`}
              onClick={() => setActiveId(f.id)}
              aria-label={`Preview ${f.name}`}
              className="bg-card border-2 border-foreground rounded-xl p-3 shadow-[3px_3px_0px_var(--shadow-color)] cursor-pointer hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/50 flex flex-col items-start gap-2 text-left"
            >
              <div className={`w-8 h-8 rounded-md border border-foreground flex items-center justify-center text-white ${ft.tile}`}>
                <ft.icon className="w-4 h-4" />
              </div>
              <div className="w-full text-xs font-mono font-medium truncate">{f.name}</div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {active && ActiveIcon && (
          <motion.div
            role="button"
            tabIndex={0}
            aria-label="Close preview"
            className="absolute inset-4 bg-card border-2 border-foreground rounded-[1.5rem] shadow-[6px_6px_0px_var(--shadow-color)] z-10 p-4 flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/50"
            layoutId={`vault-card-${active.id}`}
            onClick={() => setActiveId(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveId(null);
              }
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-md border-2 border-foreground flex items-center justify-center text-white ${FILE_TYPES[active.type].tile}`}>
                <ActiveIcon className="w-5 h-5" />
              </div>
              <div className="text-sm font-mono font-bold truncate">{active.name}</div>
            </div>
            <div className="flex-1 bg-background border-2 border-foreground rounded-xl flex items-center justify-center relative overflow-hidden">
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

function GroupMockup() {
  const [joined, setJoined] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const handleJoin = () => {
    if (joined) return;
    setJoined(true);
    const colors = ["#FFD600", "#0057FF", "#FF3CAC", "#00C853", "#FF6B00"];
    const burst = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 100,
      y: -Math.random() * 100 - 50,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(burst);
  };

  const members = [
    { initials: "SA", bg: "bg-[#FFD600]" },
    { initials: "SB", bg: "bg-card" },
    { initials: "AA", bg: "bg-[#FF3CAC]" },
  ];

  const shared: { type: FileType; title: string; by: string; tag: string }[] = [
    { type: "pdf", title: "Deep Learning & Neural Networks.pdf", by: "Dr. S. Aneesh", tag: "Lecture" },
    { type: "link", title: "AIML Benchmark Datasets & Model Zoo", by: "Prof. A. Aher", tag: "AIML" },
    { type: "img", title: "ML Algorithms Architecture.png", by: "Prof. S. Balpande", tag: "Diagram" },
  ];

  return (
    <div className="w-full h-full min-h-[300px] bg-card rounded-[1.5rem] border-2 border-foreground shadow-[6px_6px_0px_var(--shadow-color)] overflow-hidden flex flex-col relative">
      <div className="h-24 bg-[#00C853] border-b-2 border-foreground px-6 pt-6 relative flex items-end">
        <div className="absolute top-4 right-4 flex -space-x-1.5" aria-label="Group members">
          {members.map((m) => (
            <div
              key={m.initials}
              className={`w-8 h-8 rounded-full border-2 border-foreground flex items-center justify-center font-mono text-[10px] font-bold ${m.bg}`}
            >
              {m.initials}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-foreground bg-card flex items-center justify-center font-mono text-[10px] font-bold">
            +5
          </div>
        </div>
      </div>
      <div className="px-6 pb-6 pt-4 flex-1 flex flex-col">
        <div className="font-display font-extrabold text-xl mb-1">AI &amp; Machine Learning</div>
        <div className="text-sm font-sans text-muted-foreground">Domain Expert Group · IT Department</div>

        <ul className="mt-4 flex flex-col gap-2">
          {shared.map((s) => {
            const ft = FILE_TYPES[s.type];
            return (
              <li key={s.title} className="flex items-center gap-2 bg-background border-2 border-foreground rounded-xl p-2">
                <div className={`w-7 h-7 shrink-0 rounded border border-foreground flex items-center justify-center text-white ${ft.tile}`}>
                  <ft.icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-sans font-medium truncate">{s.title}</div>
                  <div className="text-[10px] font-mono text-muted-foreground truncate">Shared by {s.by}</div>
                </div>
                <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-foreground bg-card">
                  {s.tag}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto pt-4 relative">
          <button
            onClick={handleJoin}
            className={`w-full py-2.5 rounded-xl border-2 border-foreground font-display font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/50 ${
              joined
                ? "bg-card text-foreground shadow-[2px_2px_0px_var(--shadow-color)] translate-x-[2px] translate-y-[2px]"
                : "bg-[#FFD600] text-foreground shadow-[4px_4px_0px_var(--shadow-color)] hover:bg-[#FFD600]/90"
            } flex items-center justify-center gap-2`}
          >
            {joined ? <><CheckCircle2 className="w-5 h-5 text-[#00C853]" /> Joined</> : "Join Group"}
          </button>

          {confetti.map((c) => (
            <motion.div
              key={c.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{ x: c.x, y: c.y, scale: 1, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute left-1/2 bottom-8 w-3 h-3 rounded-full border border-foreground pointer-events-none"
              style={{ backgroundColor: c.color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search mockup: types two queries in a loop and filters a small sample pool.
// ---------------------------------------------------------------------------

type FilterId = "all" | FileType;
type Source = "My Vault" | "AI & ML Group" | "Network & Cloud Group";
interface Item { id: string; type: FileType; name: string; source: Source; tag: string }

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pdf", label: "PDFs" },
  { id: "link", label: "Links" },
  { id: "img", label: "Images" },
];

// Pool order matters: only the first three matches are shown, so rows swap as the query narrows.
const QUERIES: { text: string; filter: FilterId; pool: Item[] }[] = [
  {
    text: "unit 4 question bank",
    filter: "pdf",
    pool: [
      { id: "a", type: "pdf", name: "Unit_3_Lab_Manual.pdf", source: "My Vault", tag: "#lab" },
      { id: "b", type: "pdf", name: "Unit_4_Lecture_Slides.pdf", source: "AI & ML Group", tag: "#slides" },
      { id: "c", type: "pdf", name: "Unit_4_Question_Bank.pdf", source: "My Vault", tag: "#exam" },
      { id: "d", type: "pdf", name: "Unit_4_Question_Bank_Answers.pdf", source: "AI & ML Group", tag: "#exam" },
      { id: "e", type: "link", name: "Unit 4 Question Bank – shared folder", source: "AI & ML Group", tag: "#questions" },
      { id: "f", type: "img", name: "Unit_2_Syllabus_Diagram.png", source: "My Vault", tag: "#syllabus" },
    ],
  },
  {
    text: "#networking",
    filter: "img",
    pool: [
      { id: "h", type: "pdf", name: "Neural_Network_Basics.pdf", source: "AI & ML Group", tag: "#deeplearning" },
      { id: "i", type: "pdf", name: "Internet_of_Things_Overview.pdf", source: "My Vault", tag: "#iot" },
      { id: "g", type: "img", name: "Network_Topologies_Cheatsheet.png", source: "My Vault", tag: "#networking" },
      { id: "j", type: "link", name: "OSI_Model_Reference_Links", source: "Network & Cloud Group", tag: "#networking" },
      { id: "k", type: "pdf", name: "Packet_Tracer_Lab_Guide.pdf", source: "Network & Cloud Group", tag: "#networking" },
      { id: "m", type: "img", name: "Topology_Diagram_Collection.png", source: "Network & Cloud Group", tag: "#networking" },
    ],
  },
];

const MAX_RESULTS = 3;
const MIN_NEEDLE = 3;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Whitespace in the query also matches the _ - . separators used in file names.
const needleRegExp = (needle: string) =>
  new RegExp(needle.split(/\s+/).map(escapeRegExp).join("[\\s_\\-.]+"), "i");

function Highlight({ text, needle }: { text: string; needle: string }) {
  const m = needle ? needleRegExp(needle).exec(text) : null;
  if (!m) return <>{text}</>;
  return (
    <>
      {text.slice(0, m.index)}
      <mark className="bg-[#FFD600] text-foreground rounded-sm px-0.5 -mx-0.5">{m[0]}</mark>
      {text.slice(m.index + m[0].length)}
    </>
  );
}

type Phase = "typing" | "filtered" | "clearing";

function SearchMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const active = inView && !reduceMotion;

  const [qi, setQi] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [filter, setFilter] = useState<FilterId>("all");

  useEffect(() => {
    if (!active) return;
    const query = QUERIES[qi];
    let delay: number;
    let next: () => void;

    if (phase === "typing") {
      if (typed < query.text.length) {
        delay = 90;
        next = () => setTyped(typed + 1);
      } else {
        delay = 1500;
        next = () => {
          setFilter(query.filter);
          setPhase("filtered");
        };
      }
    } else if (phase === "filtered") {
      delay = 2200;
      next = () => {
        setTyped(0);
        setFilter("all");
        setPhase("clearing");
      };
    } else {
      delay = 600;
      next = () => {
        setQi((qi + 1) % QUERIES.length);
        setPhase("typing");
      };
    }

    const id = setTimeout(next, delay);
    return () => clearTimeout(id);
  }, [active, qi, typed, phase]);

  // With reduced motion, show the first query fully typed and never advance.
  const shownQuery = QUERIES[reduceMotion ? 0 : qi];
  const shownText = reduceMotion ? shownQuery.text : shownQuery.text.slice(0, typed);
  const shownFilter: FilterId = reduceMotion ? "all" : filter;

  const needle = shownText.replace(/^#/, "").trim();
  const results =
    needle.length >= MIN_NEEDLE
      ? shownQuery.pool
          .filter((it) => {
            const re = needleRegExp(needle);
            return (re.test(it.name) || re.test(it.tag)) && (shownFilter === "all" || it.type === shownFilter);
          })
          .slice(0, MAX_RESULTS)
      : [];

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="w-full h-full min-h-[300px] bg-background rounded-[1.5rem] p-4 sm:p-6 border-2 border-foreground flex flex-col gap-4"
    >
      {/* Search bar */}
      <div className="flex items-center gap-3 bg-card border-2 border-foreground rounded-xl px-3 py-2.5 shadow-[3px_3px_0px_var(--shadow-color)]">
        <Search className="w-4 h-4 shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0 flex items-center font-mono text-sm h-5 overflow-hidden whitespace-pre">
          {shownText ? (
            <span>{shownText}</span>
          ) : (
            <span className="text-muted-foreground">Search name, tag, type…</span>
          )}
          {!reduceMotion && (
            <motion.span
              className="ml-0.5 inline-block w-[2px] h-4 bg-foreground"
              animate={{ opacity: active ? [1, 1, 0, 0] : 1 }}
              transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
            />
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <span
            key={f.id}
            className={`font-mono text-[11px] font-bold px-3 py-1 rounded-full border-2 border-foreground transition-colors duration-300 ${
              f.id === shownFilter ? "bg-[#FFD600] text-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {f.label}
          </span>
        ))}
      </div>

      {/* Results */}
      <ul className="relative flex flex-col gap-2 min-h-[13.5rem]">
        <AnimatePresence mode="popLayout" initial={false}>
          {results.map((it, i) => {
            const ft = FILE_TYPES[it.type];
            return (
              <motion.li
                key={it.id}
                layout="position"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.25, delay: i * 0.08 } }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                className="flex items-center gap-3 bg-card border-2 border-foreground rounded-xl p-2.5 overflow-hidden"
              >
                <div className={`w-8 h-8 shrink-0 rounded-md border-2 border-foreground flex items-center justify-center text-white ${ft.tile}`}>
                  <ft.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-sans font-medium text-xs sm:text-sm truncate">
                    <Highlight text={it.name} needle={needle} />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-foreground bg-secondary truncate min-w-0">
                      {it.source}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full border border-foreground/40 bg-card text-muted-foreground whitespace-nowrap shrink-0">
                      <Highlight text={it.tag} needle={needle} />
                    </span>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

const features = [
  {
    id: "vault",
    title: "Personal Vault",
    desc: "Your private space for every note, PDF, image and link. Organise with folders and tags. Nothing is visible to anyone until you share it.",
    tags: ["20MB/file", "Rich Text Notes", "Folders & Tags"],
    icon: Copy,
    color: "bg-[#0057FF]",
    mockup: VaultMockup,
  },
  {
    id: "groups",
    title: "Groups",
    desc: "One group for each domain, such as Cybersecurity or Data Science. Members share resources and everything stays sorted in one shared library.",
    tags: ["One per domain", "Shared Library", "Faculty Only"],
    icon: Users,
    color: "bg-[#00C853]",
    mockup: GroupMockup,
  },
  {
    id: "search",
    title: "Search",
    desc: "Find any file, note or link by name, tag, type or group, across your vault and every group you belong to.",
    tags: ["Name", "Tags", "File type", "Group"],
    icon: Search,
    color: "bg-[#7C3AED]",
    mockup: SearchMockup,
  },
];

const fileKinds = [
  { label: "PDF", icon: FileText },
  { label: "Images", icon: ImageIcon },
  { label: "Links", icon: LinkIcon },
  { label: "Documents", icon: Files },
];

export default function FeatureSection() {
  return (
    <section className="py-32 bg-card block w-full">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">

        <div className="text-center mb-24 flex flex-col items-center gap-4">
          <h2 className="font-display font-extrabold text-4xl sm:text-6xl text-foreground">
            Two spaces. One search.
          </h2>
          <p className="font-sans text-lg text-muted-foreground max-w-xl">
            A private vault for your own material and groups for sharing with colleagues.
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feat, idx) => {
            const isEven = idx % 2 === 0;
            const Mockup = feat.mockup;

            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`p-8 md:p-12 lg:p-16 bg-card border-[3px] border-foreground rounded-[2rem] shadow-[8px_8px_0px_var(--shadow-color)] flex flex-col gap-12 lg:gap-16 relative overflow-hidden ${
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                <div className="flex-1 flex flex-col gap-6 items-start justify-center">
                  <div className={`w-16 h-16 rounded-[1rem] border-[3px] border-foreground shadow-[4px_4px_0px_var(--shadow-color)] flex items-center justify-center ${feat.color} text-white`}>
                    <feat.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
                    {feat.title}
                  </h3>
                  <p className="font-sans text-lg text-muted-foreground max-w-md">
                    {feat.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {feat.tags.map((tag) => (
                      <div key={tag} className="font-mono text-xs font-bold text-foreground bg-[#FFD600] px-3 py-1.5 rounded-full border-2 border-foreground">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-[1.2] w-full max-w-xl mx-auto md:max-w-none">
                  <Mockup />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Keep and share</p>
          <ul className="flex flex-wrap justify-center gap-3">
            {fileKinds.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="flex items-center gap-2 bg-card border-2 border-foreground rounded-full px-4 py-2 font-mono text-sm font-bold shadow-[3px_3px_0px_var(--shadow-color)]"
              >
                <Icon className="w-4 h-4" />
                {label}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}
