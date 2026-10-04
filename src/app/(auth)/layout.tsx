import * as React from "react"
import Link from "next/link"
import Logo from "@/components/landing/Logo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Yellow Header (phones only, replaces large left panel) */}
      <header className="md:hidden w-full bg-[#FFD600] border-b-[3px] border-foreground px-4 py-2.5 flex items-center justify-between shadow-[0_3px_0px_var(--shadow-color)] relative z-20">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <Logo src="/logos/apsit.png" alt="A. P. Shah Institute of Technology" width={253} height={202} className="h-8 w-auto" />
            <Logo src="/logos/it-dept.png" alt="Department of Information Technology" width={113} height={130} className="h-8 w-auto" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-display font-extrabold text-base sm:text-lg text-foreground tracking-tight leading-tight">
              MODULUS
            </span>
            <span className="font-sans text-[10px] text-foreground/85 font-semibold leading-none mt-0.5">
              APSIT · IT Dept
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="font-mono text-xs font-bold bg-card border-2 border-foreground rounded-lg px-3 py-1.5 text-foreground shadow-[2px_2px_0px_var(--shadow-color)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all shrink-0"
        >
          Home
        </Link>
      </header>

      {/* Left Memphis Yellow Panel (desktop/tablet) */}
      <div className="hidden md:flex md:w-1/2 bg-[#FFD600] relative overflow-hidden flex-col justify-center items-center p-8 lg:p-12 border-r-[3px] border-foreground">
        {/* Memphis Shapes */}
        <div className="absolute top-[8%] left-[8%] w-24 h-24 rounded-full border-[3px] border-foreground bg-[#0057FF] shadow-[4px_4px_0px_var(--shadow-color)]" />
        <div className="absolute bottom-[12%] right-[10%] w-32 h-32 rotate-[15deg] border-[3px] border-foreground bg-[#FF3CAC] shadow-[4px_4px_0px_var(--shadow-color)]" />
        <div className="absolute top-[16%] right-[14%] w-16 h-16 rotate-[45deg] border-[3px] border-foreground bg-[#FF6B00] shadow-[3px_3px_0px_var(--shadow-color)]" />
        <div className="absolute bottom-[24%] left-[12%] w-20 h-20 border-[3px] border-foreground bg-[#00C853] rounded-[12px] shadow-[4px_4px_0px_var(--shadow-color)]" />

        {/* Central Neo-brutalist Brand Card */}
        <div className="z-10 bg-card border-[3px] border-foreground shadow-[8px_8px_0px_var(--shadow-color)] rounded-[24px] p-8 lg:p-10 text-center flex flex-col items-center justify-center max-w-[380px] w-full">
          {/* Institution Logos */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <Logo src="/logos/apsit.png" alt="A. P. Shah Institute of Technology" width={253} height={202} className="p-1.5 h-14 w-auto" />
            <Logo src="/logos/it-dept.png" alt="Department of Information Technology" width={113} height={130} className="p-1.5 h-14 w-auto" />
          </div>

          {/* MODULUS Title */}
          <Link href="/" className="inline-block group">
            <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-foreground tracking-tight group-hover:scale-105 transition-transform">
              MODULUS
            </h1>
          </Link>
          <p className="font-sans text-sm text-muted-foreground mt-2 font-medium">
            Academic Resource Hub & Vault
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full md:w-1/2 bg-card md:bg-background flex flex-col justify-center items-center p-4 sm:p-6 md:p-12 min-h-[calc(100vh-68px)] md:min-h-screen relative z-10">
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </div>
    </div>
  )
}

