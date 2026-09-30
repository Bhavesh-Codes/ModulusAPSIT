import { Logo } from "@/components/landing/Logo";

export default function LandingFooter() {
  return (
    <footer className="w-full bg-card border-t-[3px] border-foreground py-10">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-6">

          {/* Far left: APSIT logo */}
          <Logo src="/logos/apsit.png" alt="APSIT logo" size={80} />

          {/* Centre: institution info + MODULUS */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 text-center md:text-left flex-1 justify-center">
            {/* Institution info */}
            <div className="flex flex-col gap-1">
              <span className="font-display font-extrabold text-base text-foreground tracking-tight">
                A. P. Shah Institute of Technology
              </span>
              <span className="font-sans text-sm text-muted-foreground">
                Department of Information Technology
              </span>
              <span className="font-sans text-sm text-muted-foreground">
                Parshvanath Charitable Trust
              </span>
            </div>

            {/* Divider */}
            <div className="hidden md:block h-14 w-px bg-foreground/15" aria-hidden="true" />

            {/* MODULUS info */}
            <div className="flex flex-col gap-1">
              <span className="font-display font-extrabold tracking-tighter text-foreground">
                MODULUS
              </span>
              <span className="font-sans text-sm text-muted-foreground">
                Developed by the Dept. of IT
              </span>
              {/* TODO: replace with actual support email */}
              <a
                href="mailto:support@apsit.edu.in"
                className="font-mono text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded"
              >

              </a>
            </div>
          </div>

          {/* Far right: IT Dept logo */}
          <Logo src="/logos/it-dept.png" alt="Department of IT logo" size={64} />

        </div>
      </div>
    </footer>
  );
}
