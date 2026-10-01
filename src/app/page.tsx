"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import FeatureSection from "@/components/landing/FeatureSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import DomainGroupsSection from "@/components/landing/DomainGroupsSection";
import FinalCtaSection from "@/components/landing/FinalCtaSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/vault");
      } else {
        setIsInitializing(false);
      }
    };
    checkSession();
  }, [router, supabase]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-card">
        {/* Simple loader or entirely blank while checking auth */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card text-foreground font-sans selection:bg-[#FFD600] selection:text-foreground overflow-x-clip">
      <LandingNav />
      <main>
        <MotionConfig reducedMotion="user">
          <HeroSection />
          <ProblemSection />
          <FeatureSection />
          <HowItWorksSection />
          <DomainGroupsSection />
          <FinalCtaSection />
        </MotionConfig>
      </main>
      <LandingFooter />
    </div>
  );
}
