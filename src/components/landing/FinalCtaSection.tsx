"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FinalCtaSection() {
  return (
    <section className="relative min-h-[70vh] bg-card flex flex-col items-center justify-center overflow-hidden py-24 px-4">
      {/* Two subtle corner accents */}
      <motion.svg
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 0.12, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-8 left-8 w-20 h-20 pointer-events-none"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="44" fill="none" stroke="var(--foreground)" strokeWidth="6" />
      </motion.svg>

      <motion.svg
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 0.12, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        className="absolute bottom-8 right-8 w-16 h-16 pointer-events-none"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <rect x="8" y="8" width="84" height="84" fill="none" stroke="var(--foreground)" strokeWidth="6" rx="12" />
      </motion.svg>

      <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
        <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,4.5rem)] leading-[1.1] tracking-tight">
          Your notes. Your groups.<br />Your domain&apos;s knowledge.
        </h2>

        <p className="font-sans text-xl md:text-2xl text-muted-foreground">
          Sign in with your college email and add your first file.
        </p>

        <Button
          asChild
          className="bg-[#FFD600] border-[3px] border-foreground font-display font-bold text-foreground rounded-[14px] shadow-[6px_6px_0px_var(--shadow-color,black)] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none hover:bg-[#FFD600]/90 transition-all h-16 px-10 text-xl focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </section>
  );
}
