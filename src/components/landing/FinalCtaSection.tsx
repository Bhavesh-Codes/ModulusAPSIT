"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ctaButton } from "./styles";

export default function FinalCtaSection() {
  return (
    <section className="relative min-h-[70vh] bg-card flex flex-col items-center justify-center overflow-hidden py-32 px-4">
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="font-display font-extrabold text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.1] tracking-tight mb-6">
          Your notes.<br />
          Your groups.<br />
          Your domain&rsquo;s knowledge.
        </h2>

        <p className="font-sans text-xl md:text-2xl text-muted-foreground mb-12">
          Sign in with your college email and add your first file.
        </p>

        <Button asChild className={`${ctaButton} h-16 px-10 text-xl`}>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </section>
  );
}
