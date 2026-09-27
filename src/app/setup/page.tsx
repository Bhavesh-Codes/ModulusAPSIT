"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight, ArrowLeft, Check, ShieldCheck, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

const setupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  title: z.string().optional(),
})

type SetupFormValues = z.infer<typeof setupSchema>

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
}

export default function SetupPage() {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [userRole, setUserRole] = useState<string>("faculty")
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: "",
      title: "",
    },
  })

  // Pre-fill form with existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("users")
        .select("name, title, role")
        .eq("id", user.id)
        .maybeSingle()

      if (data) {
        form.reset({
          name: data.name || user.user_metadata?.full_name || "",
          title: data.title ?? "",
        })
        if (data.role) setUserRole(data.role)
      } else {
        form.reset({
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "",
          title: "",
        })
      }
      setIsFetching(false)
    }

    loadProfile()
  }, [form, router, supabase])

  const handleSkip = () => {
    router.push("/profile")
  }

  const handleNext = async () => {
    const isValid = await form.trigger(["name", "title"])
    if (isValid) {
      // Save the profile data when moving to step 2
      const data = form.getValues()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const cleanTitle = data.title && data.title.trim() !== "" ? data.title.trim() : null
        const cleanName = data.name.trim()
        await supabase
          .from("users")
          .update({ name: cleanName, title: cleanTitle })
          .eq("id", user.id)
      }
      setDirection(1)
      setStep(2)
    }
  }

  const handleBack = () => {
    setDirection(-1)
    setStep(1)
  }

  const handleFinish = () => {
    toast.success("Profile setup complete!")
    router.push("/profile")
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-foreground border-t-[#FFD600] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Memphis Background */}
      <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full border-[2px] border-foreground bg-[#FFD600] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-40 h-40 rotate-[12deg] border-[2px] border-foreground bg-[#0057FF] pointer-events-none" />
      <div className="absolute top-[20%] right-[15%] w-16 h-16 rotate-[45deg] border-[2px] border-foreground bg-[#FF3CAC] pointer-events-none" />

      <div className="w-full max-w-2xl bg-card border-[3px] border-foreground shadow-[8px_8px_0px_black] rounded-[32px] p-8 md:p-12 relative z-10">
        {/* Header row: role badge left, skip button right — wraps safely on mobile */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border-[2px] border-foreground bg-[#FFD600] font-mono text-[10px] font-bold shadow-[2px_2px_0px_black] uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{userRole}</span>
          </div>
          <button
            onClick={handleSkip}
            type="button"
            className="px-4 py-2 flex items-center justify-center gap-1.5 rounded-[0.875rem] border-[2px] border-foreground bg-card shadow-[3px_3px_0px_black] font-heading font-bold text-[13px] text-foreground hover:bg-background hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all whitespace-nowrap"
          >
            Do it later →
          </button>
        </div>

        <div className="mb-8">
          <h1 className="font-heading font-extrabold text-[32px] text-foreground leading-tight mb-1">
            Faculty Profile
          </h1>
          <p className="font-sans text-[15px] text-muted-foreground">
            Configure how your designation and name appear across the portal.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`h-3 w-12 rounded-full border-[2px] border-foreground transition-colors duration-300 ${
                step >= i ? "bg-[#FFD600]" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="min-h-[280px] relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="absolute inset-0"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (Optional)</Label>
                    <select
                      id="title"
                      {...form.register("title")}
                      className="w-full px-3.5 py-2.5 rounded-[12px] border-[2px] border-foreground bg-card font-sans font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD600] shadow-[2px_2px_0px_black]"
                    >
                      <option value="">None (No Title)</option>
                      <option value="Prof.">Prof.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                    <p className="font-sans text-[12px] text-muted-foreground">
                      Select &quot;None&quot; if you prefer your name without an academic prefix.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Bhavesh Best"
                      {...form.register("name")}
                      className={`rounded-[12px] border-[2px] border-foreground shadow-[2px_2px_0px_black] ${
                        form.formState.errors.name ? "border-[#FF3B30]" : ""
                      }`}
                    />
                    {form.formState.errors.name && (
                      <p className="font-sans text-[13px] text-[#FF3B30]">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-20 h-20 rounded-[20px] border-[3px] border-foreground bg-[#0057FF]/10 flex items-center justify-center mb-6 shadow-[4px_4px_0px_black]">
                      <Users className="w-10 h-10 text-[#0057FF]" />
                    </div>
                    <h2 className="font-heading font-extrabold text-[24px] text-foreground mb-2">
                      Your Groups
                    </h2>
                    <p className="font-sans text-[15px] text-muted-foreground max-w-sm">
                      This section will show the communities and modules you&apos;re part of. Coming soon!
                    </p>
                    <div className="mt-6 px-4 py-2 rounded-[12px] border-[2px] border-dashed border-border bg-muted/50">
                      <span className="font-mono text-[12px] text-muted-foreground/70">🚧 Under Construction</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex justify-between items-center pt-6 border-t-[2px] border-border">
          {step > 1 ? (
            <button
              onClick={handleBack}
              type="button"
              className="px-5 py-2.5 flex items-center justify-center gap-2 rounded-[0.875rem] border-[2px] border-foreground bg-card shadow-[3px_3px_0px_black] font-heading font-bold text-[14px] text-foreground hover:bg-background hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div /> // Spacer
          )}

          {step < 2 ? (
            <Button onClick={handleNext} type="button">
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Check className="mr-1 h-4 w-4" />
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
