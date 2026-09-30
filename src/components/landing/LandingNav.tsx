"use client";

import { useState } from "react";
import Link from "next/link";
import { useScroll, useMotionValueEvent, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/landing/Logo";

export default function LandingNav() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 80);
  });

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 w-full ${
        isScrolled ? "border-b-2 border-foreground" : "border-transparent"
      }`}
      initial={false}
      animate={{
        backgroundColor: isScrolled ? "var(--card)" : "rgba(0, 0, 0, 0)",
        borderColor: isScrolled ? "var(--foreground)" : "rgba(0, 0, 0, 0)",
      }}
    >
      <div className="w-full px-5 md:px-12 h-20 flex items-center justify-between">
        {/* Left: Logos + divider + MODULUS pill */}
        <div className="flex items-center gap-3">
          <Logo src="/logos/apsit.png" alt="APSIT" size={40} />
          <div className="h-8 w-px bg-foreground/20" aria-hidden="true" />
          <Logo src="/logos/it-dept.png" alt="IT Dept" size={40} />
          <div className="h-8 w-px bg-foreground/20 hidden sm:block" aria-hidden="true" />
          <Link
            href="/"
            className="hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded-full"
            aria-label="MODULUS home"
          >
            <span className="font-display font-extrabold text-lg tracking-tighter text-foreground px-2.5 py-1 bg-[#FFD600] rounded-full border-2 border-foreground hidden sm:inline-block">
              MODULUS
            </span>
          </Link>
        </div>

        {/* Right: single Login button, visible on all sizes */}
        <Button
          asChild
          variant="outline"
          className="bg-card border-2 border-foreground font-display font-bold text-foreground rounded-[14px] shadow-[3px_3px_0px_var(--shadow-color,black)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all h-10 px-6 focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </motion.nav>
  );
}
