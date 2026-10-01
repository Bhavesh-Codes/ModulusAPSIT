"use client";

import { useState } from "react";
import Link from "next/link";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { ctaButton } from "./styles";

export default function LandingNav() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 80);
  });

  // The scrolled "border" is a 2px foreground shadow rather than a border-color,
  // so it stays visible in dark mode.
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-[background-color,box-shadow] duration-300 ${
        isScrolled
          ? "bg-card shadow-[0_2px_0_0_var(--foreground)]"
          : "bg-transparent shadow-[0_2px_0_0_transparent]"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Logo src="/logos/apsit.png" alt="A. P. Shah Institute of Technology" width={253} height={202} />
          <Logo src="/logos/it-dept.png" alt="Department of Information Technology" width={113} height={130} />
          <span aria-hidden="true" className="hidden sm:block h-8 w-px bg-foreground/30" />
          <Link
            href="/"
            className="relative z-10 rounded-full hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/50"
          >
            <span className="block font-display font-extrabold text-base sm:text-2xl tracking-tighter text-foreground px-2 py-0.5 sm:py-1 bg-[#FFD600] rounded-full border-2 border-foreground">
              MODULUS
            </span>
          </Link>
        </div>

        <Button asChild className={`${ctaButton} h-12 px-8 text-base`}>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </nav>
  );
}
