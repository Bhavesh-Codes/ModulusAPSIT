"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { FileText, Link as LinkIcon, Users, Building, Edit2, Check, X, Clock, Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getDisplayRole } from "@/lib/roles"

// Types
interface ProfileStats {
  vaultFileCount: number
  vaultLinkCount: number
  communitiesJoined: number
  communitiesOwned: number
  recentItems: { id: string; title: string; item_type: string; created_at: string; url?: string; files?: { filename: string } }[]
}

interface UserProfile {
  id: string
  name: string
  email: string
  title: string | null
  role: string | null
  profile_pic: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const supabase = createClient()
  const queryClient = useQueryClient()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    const toastId = toast.loading("Uploading profile picture...")
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to upload avatar")

      setProfile(prev => prev ? { ...prev, profile_pic: data.profile_pic } : null)
      toast.success("Profile picture updated successfully!", { id: toastId })
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Fetch Profile Stats
  const { data: stats, isLoading: statsLoading } = useQuery<ProfileStats>({
    queryKey: ["profileStats"],
    queryFn: async () => {
      const res = await fetch("/api/profile/stats")
      if (!res.ok) throw new Error("Failed to fetch stats")
      return res.json()
    },
  })

  // Fetch User Profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        let userRecord = data

        // If no record exists in public.users, create one on the fly (self-heal)
        if (!userRecord) {
          const fallbackData = {
            id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
            email: user.email || "",
            profile_pic: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          }

          const { data: inserted } = await supabase
            .from("users")
            .upsert(fallbackData)
            .select()
            .maybeSingle()

          userRecord = inserted || fallbackData
        }

        const fullProfile: UserProfile = {
          id: user.id,
          name: userRecord.name || user.user_metadata?.full_name || user.user_metadata?.name || "User",
          email: user.email || userRecord.email || "",
          title: userRecord.title || null,
          role: userRecord.role || "faculty",
          profile_pic: userRecord.profile_pic || null,
        }

        setProfile(fullProfile)
        setEditForm(fullProfile)
      } catch (err) {
        console.error("Failed to load profile:", err)
      }
    }
    loadProfile()
  }, [supabase])

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!profile?.id) throw new Error("No user ID")
      
      const cleanTitle = updates.title && updates.title.trim() !== "" ? updates.title.trim() : null
      const cleanName = updates.name && updates.name.trim() !== "" ? updates.name.trim() : profile.name

      const { error } = await supabase
        .from("users")
        .update({
          name: cleanName,
          title: cleanTitle,
        })
        .eq("id", profile.id)

      if (error) throw error
      return { name: cleanName, title: cleanTitle }
    },
    onSuccess: (updatedData) => {
      setProfile((prev) => prev ? { ...prev, ...updatedData } : null)
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile")
    }
  })

  const handleSave = () => {
    updateProfileMutation.mutate(editForm)
  }

  const handleCancel = () => {
    setEditForm(profile || {})
    setIsEditing(false)
  }

  if (!profile) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-foreground border-t-[#FFD600] rounded-full animate-spin" />
      </div>
    )
  }

  const initials = profile.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "ME"

  return (
    <div className="h-full max-w-7xl mx-auto p-6 lg:p-8 flex flex-col box-border">
      <div className="shrink-0 mb-6">
        <h1 className="font-heading font-extrabold text-[32px] md:text-[40px] text-foreground tracking-tight uppercase leading-none">
          Your Profile
        </h1>
        <p className="font-sans font-medium text-[15px] text-muted-foreground mt-1.5">
          Manage your personal details and view your activity.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 pb-2 relative z-10">
        
        {/* LEFT PANEL - Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 h-full flex flex-col"
        >
          <div className="bg-card border-[3px] border-foreground rounded-[24px] shadow-[6px_6px_0px_black] p-6 lg:p-7 overflow-hidden relative flex-1 flex flex-col justify-between">
            {/* Decorative bg shapes */}
            <div className="absolute top-[-20%] right-[-10%] w-36 h-36 rounded-full border-[2px] border-foreground bg-[#FFD600]/20 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-5">
                <div className="relative group">
                  <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full border-[3.5px] border-foreground bg-[#FFD600] shadow-[4px_4px_0px_black] overflow-hidden flex items-center justify-center text-[34px] lg:text-[40px] font-mono font-bold relative">
                    {profile.profile_pic ? (
                      <img src={profile.profile_pic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      initials
                    )}
                    {isEditing && (
                      <label className="absolute inset-0 bg-foreground/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-[11px] font-bold">
                        {isUploadingAvatar ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                          <>
                            <Camera className="w-6 h-6 mb-1" />
                            Change
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                      </label>
                    )}
                  </div>
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-3 rounded-[14px] border-[2px] border-foreground bg-background hover:bg-[#FFD600] hover:shadow-[3px_3px_0px_black] hover:-translate-y-1 transition-all"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="p-3 rounded-[14px] border-[2px] border-foreground bg-[#FF3B30] text-white hover:bg-red-600 transition-all font-bold"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="px-4 py-2.5 flex items-center gap-2 rounded-[14px] border-[2px] border-foreground bg-[#0057FF] text-white hover:bg-blue-600 transition-all font-bold"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : <><Check className="w-4 h-4" /> Save</>}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[12px] font-extrabold text-muted-foreground/75 uppercase tracking-wider mb-1 block">
                    {isEditing ? "Title & Full Name" : "Faculty Member"}
                  </label>
                  {!isEditing ? (
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-heading font-extrabold text-[24px] lg:text-[28px] text-foreground leading-tight">
                        {profile.title ? `${profile.title} ` : ""}{profile.name}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] border-[2px] border-foreground bg-[#FFD600] font-mono text-[11px] font-bold shadow-[2px_2px_0px_black] text-foreground uppercase tracking-wider">
                        {getDisplayRole(profile.role)}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <select
                          value={editForm.title || ""}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-[120px] px-3 py-2 rounded-[10px] border-[2px] border-foreground bg-card font-sans font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD600]"
                        >
                          <option value="">No Title</option>
                          <option value="Prof.">Prof.</option>
                          <option value="Dr.">Dr.</option>
                        </select>
                        <input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Full Name"
                          className="flex-1 px-3 py-2 rounded-[10px] border-[2px] border-foreground bg-card font-sans font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD600] transition-shadow"
                        />
                      </div>
                      <div className="pt-1">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] border-[2px] border-foreground bg-[#FFD600] font-mono text-[11px] font-bold shadow-[2px_2px_0px_black] text-foreground uppercase tracking-wider">
                          {getDisplayRole(profile.role)}
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="font-mono text-[14px] text-muted-foreground mt-2">{profile.email}</p>
                </div>
              </div>
            </div>

            <div className="my-4 border-t-[2px] border-dashed border-border/80 relative z-10" />

            {/* Enriched Stats inside identity card */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <MiniStatCard icon={<FileText className="w-4 h-4" />} value={stats?.vaultFileCount} label="Vault Files" color="bg-[#FF3CAC]" />
              <MiniStatCard icon={<LinkIcon className="w-4 h-4" />} value={stats?.vaultLinkCount} label="Vault Links" color="bg-[#FFD600]" />
              <MiniStatCard icon={<Users className="w-4 h-4" />} value={stats?.communitiesJoined} label="Joined Comm." color="bg-[#0057FF]" textColor="text-white" />
              <MiniStatCard icon={<Building className="w-4 h-4" />} value={stats?.communitiesOwned} label="Owned Comm." color="bg-[#00D4FF]" />
            </div>
          </div>
        </motion.div>

        {/* RIGHT PANEL - Full-height Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 h-full flex flex-col"
        >
          <div className="bg-card border-[3px] border-foreground rounded-[24px] shadow-[6px_6px_0px_black] p-6 lg:p-7 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b-[2px] border-border shrink-0">
              <div className="p-2 bg-[#FFD600] rounded-lg border-[2px] border-foreground">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-[20px]">Recent Vault Uploads</h3>
            </div>

            {statsLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-background border-[2px] border-border rounded-xl" />
                ))}
              </div>
            ) : stats?.recentItems && stats.recentItems.length > 0 ? (
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {stats.recentItems.map((item) => {
                  const displayName = item.item_type === "link" ? (item.title || "Untitled Link") : (item.files?.filename || item.title || "Unknown File")
                  const handleClick = async () => {
                    if (item.item_type === "link" && item.url) {
                      window.open(item.url, "_blank", "noopener,noreferrer")
                    } else if (item.item_type === "file") {
                      try {
                        const res = await fetch(`/api/vault/items/${item.id}/download?action=view`)
                        if (!res.ok) throw new Error("Failed to open file")
                        const { url } = await res.json()
                        window.open(url, "_blank")
                      } catch (err) {
                        console.error(err)
                      }
                    }
                  }

                  return (
                  <div
                    key={item.id}
                    onClick={handleClick}
                    className="flex justify-between items-center p-4 border-[2px] border-foreground rounded-[12px] bg-background hover:bg-card hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_black] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {item.item_type === "file" ? 
                        <FileText className="w-5 h-5 shrink-0 text-[#0057FF]" /> : 
                        <LinkIcon className="w-5 h-5 shrink-0 text-[#FF3CAC]" />
                      }
                      <p className="font-sans font-bold text-[15px] truncate">{displayName}</p>
                    </div>
                    <span className="font-mono text-[12px] text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )})}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-[2px] border-dashed border-border rounded-[16px] p-8">
                <FileText className="w-12 h-12 text-muted mb-3" />
                <p className="font-sans text-[15px] text-muted-foreground/70 font-medium">No recent items in your vault.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}


function MiniStatCard({ icon, value, label, color, textColor = "text-foreground" }: { icon: React.ReactNode, value?: number, label: string, color: string, textColor?: string }) {
  return (
    <div className={`p-4 rounded-[18px] border-[2.5px] border-foreground shadow-[3px_3px_0px_black] flex flex-col justify-between h-24 lg:h-28 ${color}`}>
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-full bg-card/25 flex items-center justify-center border-[1.5px] border-foreground shadow-[1.5px_1.5px_0px_black] ${textColor}`}>
          {icon}
        </div>
        <p className={`font-mono font-extrabold text-[24px] lg:text-[28px] leading-none ${textColor}`}>{value !== undefined ? value : "—"}</p>
      </div>
      <div>
        <p className={`font-sans font-extrabold text-[11px] lg:text-[12px] uppercase tracking-wide opacity-95 ${textColor}`}>{label}</p>
      </div>
    </div>
  )
}

