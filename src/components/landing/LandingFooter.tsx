import Logo from "./Logo";

export default function LandingFooter() {
  return (
    <footer className="w-full bg-card border-t-[3px] border-foreground">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-7 flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
        <div className="flex items-center gap-3">
          <Logo src="/logos/apsit.png" alt="A. P. Shah Institute of Technology" width={253} height={202} />
          <Logo src="/logos/it-dept.png" alt="Department of Information Technology" width={113} height={130} />
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-display font-bold text-lg text-foreground">A. P. Shah Institute of Technology</p>
          <p className="font-sans text-sm text-muted-foreground">Department of Information Technology</p>
        </div>

        <p className="font-mono text-sm text-muted-foreground md:ml-auto">
          MODULUS, developed by Bhavesh Jalalbisht
        </p>
      </div>
    </footer>
  );
}
