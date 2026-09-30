"use client";

import { motion } from "framer-motion";

const groups = [
  { name: "Artificial Intelligence & ML", desc: "Papers, lecture notes, datasets" },
  { name: "Open-Source Tech & DevOps", desc: "Tools, CI/CD guides, repos" },
  { name: "Application Programming & Full Stack", desc: "Code samples, tutorials, docs" },
  { name: "Data Science, Analytics & BI", desc: "Notebooks, dashboards, references" },
  { name: "Network & Cloud Computing", desc: "Architecture diagrams, vendor docs" },
  { name: "Evolution of Computer Science", desc: "Foundational papers, history" },
  { name: "Internet of Everything", desc: "Protocols, hardware guides, demos" },
  { name: "Design, Innovation & Entrepreneurship", desc: "Case studies, prototypes" },
  { name: "Cybersecurity, Blockchain & Secure Computing", desc: "CVEs, whitepapers, tools" },
  { name: "Foundations & Multidisciplinary Courses", desc: "Core maths, physics, electives" },
];

// Render twice so the strip loops seamlessly
const doubledGroups = [...groups, ...groups];

export default function DomainGroupsSection() {
  return (
    <section className="py-24 overflow-hidden border-y-[3px] border-foreground bg-[#FFD600]">

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 mb-14 text-center">
        <h2 className="font-display font-extrabold text-4xl text-foreground">
          Domain groups for the IT department.
        </h2>
      </div>

      {/* Infinite marquee — Framer Motion, same as original testimonials */}
      <div className="relative flex whitespace-nowrap overflow-hidden">
        <motion.div
          className="flex gap-5 px-3"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 36,
              ease: "linear",
            },
          }}
          style={{ width: "fit-content" }}
        >
          {doubledGroups.map((g, i) => (
            <div
              key={i}
              className="shrink-0 w-64 bg-card border-[3px] border-foreground rounded-[1.5rem] p-5 shadow-[4px_4px_0px_var(--shadow-color,black)] flex flex-col gap-2 whitespace-normal"
            >
              <p className="font-display font-bold text-sm text-foreground leading-snug">
                {g.name}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {g.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
