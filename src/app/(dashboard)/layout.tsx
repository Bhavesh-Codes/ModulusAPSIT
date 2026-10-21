"use client"

import { ReactNode, useEffect, useState, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FolderArchive, Users } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import UserMenu from "@/components/user-menu"
import { VaultWindowManager } from "@/components/vault/VaultWindowManager"
import { useVaultWindowStore } from "@/lib/stores/useVaultWindowStore"
import { createClient } from "@/lib/supabase/client"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Auto-hide top nav when inside a group or when viewing a document/file window
  const isInsideGroup = /^\/(groups|modules)\/[^/]+/.test(pathname);
  const windows = useVaultWindowStore((state) => state.windows);
  const hasActiveVaultWindow = windows.some((w) => !w.isMinimized);
  const shouldAutoHide = isInsideGroup || hasActiveVaultWindow;

  const [isTopNavVisible, setIsTopNavVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync for event listeners
  const isHoveredRef = useRef(false);
  const isTopNavVisibleRef = useRef(true);
  const shouldAutoHideRef = useRef(shouldAutoHide);
  isHoveredRef.current = isHovered;
  isTopNavVisibleRef.current = isTopNavVisible;
  shouldAutoHideRef.current = shouldAutoHide;

  // Reset / initialize visibility when navigating or when active vault window state changes
  useEffect(() => {
    if (!shouldAutoHide) {
      setIsTopNavVisible(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      return;
    }

    // Inside a group or viewing a document/window: show initially, then auto-hide after 2.5 seconds
    setIsTopNavVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      if (!isHoveredRef.current) {
        setIsTopNavVisible(false);
      }
    }, 2500);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [pathname, shouldAutoHide]);

  // When mouse moves near top edge of window (top 20px), reveal nav
  useEffect(() => {
    if (!shouldAutoHide) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 20) {
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
        setIsTopNavVisible(true);
      } else if (e.clientY > 80 && !isHoveredRef.current && isTopNavVisibleRef.current) {
        if (!hideTimerRef.current) {
          hideTimerRef.current = setTimeout(() => {
            if (!isHoveredRef.current) {
              setIsTopNavVisible(false);
            }
          }, 1500);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [shouldAutoHide]);

  const handleMouseEnter = () => {
    if (!shouldAutoHideRef.current) return;
    setIsHovered(true);
    isHoveredRef.current = true;
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setIsTopNavVisible(true);
  };

  const handleMouseLeave = () => {
    if (!shouldAutoHideRef.current) return;
    setIsHovered(false);
    isHoveredRef.current = false;
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      if (!isHoveredRef.current) {
        setIsTopNavVisible(false);
      }
    }, 1500);
  };

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (!user) {
        setIsAuthenticated(false);
        router.replace("/login");
      } else {
        setIsAuthenticated(true);
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsAuthenticated(false);
        router.replace("/login");
      } else if (session) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (isAuthenticated === false) {
    return (
      <div className="h-screen max-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-foreground border-t-[#FFD600] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="h-screen max-h-screen bg-background text-foreground flex flex-col overflow-hidden relative"
      style={
        {
          "--topnav-height": shouldAutoHide && !isTopNavVisible ? "0px" : "64px",
        } as React.CSSProperties
      }
    >
      {/* Invisible top hover trigger zone when nav is hidden */}
      {shouldAutoHide && !isTopNavVisible && (
        <div
          onMouseEnter={handleMouseEnter}
          onTouchStart={handleMouseEnter}
          className="fixed top-0 left-0 right-0 h-4 z-[260] pointer-events-auto"
          aria-hidden="true"
        />
      )}

      {/* Global Top Nav adhering to UI System */}
      <header
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={() => {
          if (shouldAutoHide) {
            setIsTopNavVisible(true);
            setIsHovered(true);
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          }
        }}
        onBlur={(e) => {
          if (shouldAutoHide && !e.currentTarget.contains(e.relatedTarget as Node)) {
            handleMouseLeave();
          }
        }}
        className={`h-[64px] shrink-0 bg-card border-b-[2px] border-foreground px-4 sm:px-6 flex items-center justify-between z-[250] shadow-[0px_2px_0px_black] transition-all duration-300 ease-in-out ${
          shouldAutoHide
            ? isTopNavVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-full -mt-[64px] opacity-0 pointer-events-none"
            : ""
        }`}
      >
        <div className="flex items-center gap-8">
          <Link href="/vault" className="font-heading font-extrabold text-[18px] sm:text-[24px] text-foreground tracking-tight hover:opacity-80 transition-opacity">
            MODULUS
          </Link>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3">
          {/* Chunky tap-friendly chips so Groups/Vault are clear and easy to hit on touch screens */}
          <Link
            href="/groups"
            title="Groups"
            aria-label="Groups"
            className={`flex items-center justify-center gap-1.5 h-[40px] sm:h-[38px] px-2 sm:px-3 rounded-[10px] border-[2px] border-foreground font-sans font-bold text-[12px] sm:text-[13.5px] leading-none whitespace-nowrap shadow-[2px_2px_0px_black] transition-all hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              pathname.startsWith('/groups') || pathname.startsWith('/group') || pathname.startsWith('/modules')
                ? 'bg-[#FFD600] text-foreground'
                : 'bg-card text-foreground hover:bg-[#FFD600]/20'
            }`}
          >
            <Users className="w-[18px] h-[18px] shrink-0" strokeWidth={2.25} />
            <span>Groups</span>
          </Link>

          <Link
            href="/vault"
            title="Vault"
            aria-label="Vault"
            className={`flex items-center justify-center gap-1.5 h-[40px] sm:h-[38px] px-2 sm:px-3 rounded-[10px] border-[2px] border-foreground font-sans font-bold text-[12px] sm:text-[13.5px] leading-none whitespace-nowrap shadow-[2px_2px_0px_black] transition-all hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              pathname.startsWith('/vault')
                ? 'bg-[#FFD600] text-foreground'
                : 'bg-card text-foreground hover:bg-[#FFD600]/20'
            }`}
          >
            <FolderArchive className="w-[18px] h-[18px] shrink-0" strokeWidth={2.25} />
            <span>Vault</span>
          </Link>
          <UserMenu />
        </nav>
      </header>

      {/* Main App Content Pane */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
        <VaultWindowManager />
      </main>

      <Toaster
        toastOptions={{
          style: {
            background: 'var(--card)',
            border: '2px solid var(--foreground)',
            color: 'var(--card-foreground)',
            boxShadow: '4px 4px 0px #000000',
            borderRadius: '12px',
            fontFamily: 'inherit', // picks up standard sans
          },
        }}
      />
    </div>
  )
}
