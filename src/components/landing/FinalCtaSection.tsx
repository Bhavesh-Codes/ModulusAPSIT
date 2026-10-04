"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

const ctaButton =
  "bg-[#FFD600] border-[3px] border-foreground font-display font-bold text-foreground rounded-[14px] shadow-[6px_6px_0px_var(--shadow-color)] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none hover:bg-[#FFD600]/90 transition-all focus-visible:border-foreground focus-visible:ring-4 focus-visible:ring-foreground/50";

function LargeMemphisShapes() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      {/* Blue triangle */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute top-[8%] left-[4%] md:left-[10%] w-24 h-24 md:w-36 md:h-36"
        fill="#0057FF"
        stroke="var(--foreground)"
        strokeWidth="3"
        initial={reduceMotion ? { opacity: 1, scale: 1, rotate: 10 } : { opacity: 0, scale: 0, rotate: -30 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1, rotate: 10 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease: "backOut", delay: 0.1 }}
      >
        <path d="M50 10 L90 90 L10 90 Z" />
      </motion.svg>

      {/* Pink star */}
      <motion.svg
        viewBox="0 0 24 24"
        className="absolute bottom-[16%] left-[6%] md:left-[14%] w-18 h-18 md:w-26 md:h-26"
        fill="#FF3CAC"
        stroke="var(--foreground)"
        strokeWidth="1.5"
        initial={reduceMotion ? { opacity: 1, scale: 1, rotate: -15 } : { opacity: 0, scale: 0, rotate: 90 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1, rotate: -15 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease: "backOut", delay: 0.2 }}
      >
        <polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          strokeLinejoin="round"
        />
      </motion.svg>

      {/* Green circle */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute top-[10%] right-[6%] md:right-[14%] w-16 h-16 md:w-24 md:h-24"
        fill="#00C853"
        stroke="var(--foreground)"
        strokeWidth="4"
        initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease: "backOut", delay: 0.3 }}
      >
        <circle cx="50" cy="50" r="40" />
      </motion.svg>

      {/* Orange squiggle */}
      <motion.svg
        viewBox="0 0 100 40"
        className="absolute bottom-[18%] right-[4%] md:right-[12%] w-24 h-12 md:w-36 md:h-18"
        fill="none"
        stroke="#FF6B00"
        strokeWidth="6"
        strokeLinecap="round"
        initial={reduceMotion ? { opacity: 1, x: 0, rotate: 15 } : { opacity: 0, x: 50, rotate: -45 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, rotate: 15 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, ease: "backOut", delay: 0.4 }}
      >
        <path d="M0 20 Q 12.5 5, 25 20 T 50 20 T 75 20 T 100 20" />
      </motion.svg>
    </div>
  );
}

export default function FinalCtaSection() {
  return (
    <section className="relative min-h-[calc(100vh-140px)] bg-card flex flex-col items-center justify-center overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24 px-4">
      <LargeMemphisShapes />
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="font-display font-extrabold text-[clamp(2rem,3.8vw,3.5rem)] leading-[1.12] tracking-tight mb-4 sm:mb-6">
          Add your resources.<br />
          Share with your group.<br />
          Find what colleagues share.
        </h2>

        <p className="font-sans text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10">
          Sign in with your college email and add your first file.
        </p>

        <Button asChild className={`${ctaButton} h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl`}>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </section>
  );
}
