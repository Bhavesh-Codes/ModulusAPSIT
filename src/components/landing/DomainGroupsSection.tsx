"use client";

import { motion, useReducedMotion } from "framer-motion";

const groups = [
  { name: "Artificial Intelligence & ML", desc: "Lecture decks, datasets and reading lists for AI and machine learning courses." },
  { name: "Open-Source Technologies & DevOps", desc: "Tooling guides, lab setups and pipeline references." },
  { name: "Application Programming & Full Stack", desc: "Code samples, framework notes and project briefs." },
  { name: "Data Science, Analytics & BI", desc: "Datasets, notebooks and dashboard references." },
  { name: "Network & Cloud Computing", desc: "Lab manuals, topology diagrams and cloud platform guides." },
  { name: "Evolution of Computer Science", desc: "Theory notes, historical readings and syllabus material." },
  { name: "Internet of Everything", desc: "Sensor and device guides, project ideas and reference designs." },
  { name: "Design, Innovation & Entrepreneurship", desc: "Case studies, design briefs and startup resources." },
  { name: "Cybersecurity, Blockchain & Secure Computing", desc: "Security advisories, lab exercises and protocol papers." },
  { name: "Foundations & Multidisciplinary Courses", desc: "Shared material for first-year and cross-discipline courses." },
];

function GroupCard({ name, desc }: { name: string; desc: string }) {
  return (
    <li className="w-72 md:w-80 shrink-0 bg-card border-2 border-foreground rounded-[1.5rem] p-6 shadow-[4px_4px_0px_var(--shadow-color)] flex flex-col gap-2">
      <h3 className="font-display font-bold text-lg text-foreground leading-snug">{name}</h3>
      <p className="font-sans text-sm text-muted-foreground">{desc}</p>
    </li>
  );
}

export default function DomainGroupsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-24 overflow-hidden bg-background border-y-[3px] border-foreground">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 mb-16 text-center">
        <h2 className="font-display font-extrabold text-4xl text-foreground">
          Domain groups for the IT department
        </h2>
        <p className="font-sans text-lg text-muted-foreground mt-4">
          Each group keeps its own shared library.
        </p>
      </div>

      {reduceMotion ? (
        <ul className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-wrap justify-center gap-6">
          {groups.map((g) => (
            <GroupCard key={g.name} {...g} />
          ))}
        </ul>
      ) : (
        // The list is rendered twice and shifted by exactly half its width, so the loop has no seam.
        <motion.div
          className="flex w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        >
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex gap-6 pr-6">
              {groups.map((g) => (
                <GroupCard key={g.name} {...g} />
              ))}
            </ul>
          ))}
        </motion.div>
      )}
    </section>
  );
}
