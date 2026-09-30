"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { logout } from "@/actions/auth"
import { LogOut, User, Sun, Moon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

interface UserProfile {
  name: string | null
  email: string | null
  title: string | null
  role: string | null
  profile_pic?: string | null
}

export default function UserMenu() {
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("name, title, role, profile_pic")
          .eq("id", user.id)
          .maybeSingle()

        setProfile({
          name: data?.name ?? user.user_metadata?.full_name ?? null,
          email: user.email ?? null,
          title: data?.title ?? null,
          role: data?.role ?? null,
          profile_pic: data?.profile_pic ?? null,
        })
      }
    }

    fetchProfile()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [open])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }

  const handleViewProfile = () => {
    setOpen(false)
    router.push("/profile")
  }

  // Derive initials
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ME"

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-8 h-8 rounded-full border-[2px] border-foreground bg-[#FFD600] shadow-[2px_2px_0px_black] font-mono font-bold text-[12px] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all overflow-hidden p-0"
        suppressHydrationWarning
        aria-label="User menu"
        aria-expanded={open}
      >
        {profile?.profile_pic ? (
          <img src={profile.profile_pic} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="leading-none">{initials}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+8px)] w-[240px] bg-card border-[2px] border-foreground shadow-[6px_6px_0px_black] rounded-[16px] overflow-hidden z-[100]"
          >
            {/* Profile Summary */}
            <div className="p-3.5 border-b-[2px] border-border bg-background">
              <p className="font-heading font-bold text-[14px] text-foreground truncate">
                {profile?.name ? `${profile.title ? `${profile.title} ` : ""}${profile.name}` : "Loading…"}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground truncate mt-0.5">
                {profile?.email ?? ""}
              </p>

              {/* Full-width Segmented Theme Switcher */}
              <div className="mt-3 grid grid-cols-2 gap-1.5 p-1 rounded-[10px] border-[2px] border-foreground bg-card shadow-[2px_2px_0px_black]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTheme("light")
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[7px] font-sans font-bold text-[12px] transition-all ${
                    mounted && !isDark
                      ? "bg-[#FFD600] text-foreground border-[1.5px] border-foreground shadow-[1px_1px_0px_black]"
                      : "text-muted-foreground hover:text-foreground border-[1.5px] border-transparent"
                  }`}
                  title="Switch to Light Mode"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTheme("dark")
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[7px] font-sans font-bold text-[12px] transition-all ${
                    mounted && isDark
                      ? "bg-[#FFD600] text-foreground border-[1.5px] border-foreground shadow-[1px_1px_0px_black]"
                      : "text-muted-foreground hover:text-foreground border-[1.5px] border-transparent"
                  }`}
                  title="Switch to Dark Mode"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={handleViewProfile}
                className="w-full flex items-center gap-3 px-4 py-2.5 font-sans font-medium text-[14px] text-foreground hover:bg-[#FFD600] transition-colors text-left"
              >
                <User className="w-4 h-4 shrink-0" />
                View Profile
              </button>

              <div className="h-[2px] bg-muted mx-4 my-1" />

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 font-sans font-medium text-[14px] text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-colors text-left disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {isLoggingOut ? "Signing out…" : "Log Out"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
