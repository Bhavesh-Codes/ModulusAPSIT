"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getFriendlyAuthErrorMessage, setAuthSource } from "@/lib/auth-errors"

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type SignupFormValues = z.infer<typeof signupSchema>

function SignupFormContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const redirectTarget = searchParams.get("redirectTo")
  const loginUrl = redirectTarget
    ? `/login?redirectTo=${encodeURIComponent(redirectTarget)}`
    : "/login"

  const emailParam = searchParams.get("email") || ""
  const passwordParam = searchParams.get("password") || ""

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: emailParam,
      password: passwordParam,
    },
  })

  useEffect(() => {
    if (emailParam) form.setValue("email", emailParam)
    if (passwordParam) form.setValue("password", passwordParam)

    // Check for auth errors returned from OAuth or redirect
    const hashString = typeof window !== "undefined" && window.location.hash.startsWith("#")
      ? window.location.hash.substring(1)
      : ""
    const hashParams = new URLSearchParams(hashString)

    const err = searchParams.get("error") || hashParams.get("error")
    const errDesc = searchParams.get("error_description") || hashParams.get("error_description")

    if (err || errDesc) {
      const friendlyMsg = getFriendlyAuthErrorMessage(errDesc || err)
      setErrorText(friendlyMsg)
      // Clean up error params from the URL bar without reloading
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href)
        url.searchParams.delete("error")
        url.searchParams.delete("error_description")
        url.searchParams.delete("error_code")
        url.hash = ""
        window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ""))
      }
    }
  }, [emailParam, form, passwordParam, searchParams])

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true)
    setErrorText(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      }
    })

    if (signUpError) {
      setErrorText(getFriendlyAuthErrorMessage(signUpError.message))
      setIsLoading(false)
    } else {
      router.push("/setup")
      router.refresh()
    }
  }

  async function onGoogleSignIn() {
    setIsLoading(true)
    setErrorText(null)
    // Mark OAuth origin as signup so callback knows where to redirect on error
    setAuthSource("signup")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      setErrorText(getFriendlyAuthErrorMessage(error.message))
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card p-5 sm:p-8 rounded-[20px] sm:rounded-[24px] border-[3px] border-foreground shadow-[5px_5px_0px_var(--shadow-color)] w-full">
      <div className="mb-6">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight">
          Faculty Registration
        </h2>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          Register to upload notes and manage subject vaults.
        </p>
      </div>

      <div className="space-y-6">
        <Button
          variant="secondary"
          className="w-full h-12 bg-card border-2 border-foreground text-foreground font-display font-bold text-sm sm:text-base shadow-[3px_3px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-secondary active:translate-x-[3px] active:translate-y-[3px] transition-all rounded-[12px] flex items-center justify-center cursor-pointer px-3"
          onClick={onGoogleSignIn}
          type="button"
          disabled={isLoading}
        >
          <svg className="mr-2 h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          <span className="truncate">Register with Google(College ID)</span>
        </Button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t-2 border-foreground/15" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-3 font-mono font-bold tracking-wider text-muted-foreground uppercase">
              OR REGISTER WITH DETAILS
            </span>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="font-display font-bold text-xs uppercase tracking-wider text-foreground">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Kiran Deshpande"
              {...form.register("name")}
              className={`h-12 rounded-[12px] border-2 border-foreground bg-background px-3.5 text-foreground font-sans placeholder:text-muted-foreground/80 placeholder:font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:border-foreground focus-visible:shadow-[3px_3px_0px_var(--shadow-color)] transition-all ${form.formState.errors.name ? "border-[#FF3B30] focus-visible:ring-[#FF3B30]" : ""
                }`}
            />
            {form.formState.errors.name && (
              <p className="font-sans text-xs font-semibold text-[#FF3B30] mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-display font-bold text-xs uppercase tracking-wider text-foreground">
              Institutional / College Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. faculty.name@apsit.edu.in"
              {...form.register("email")}
              className={`h-12 rounded-[12px] border-2 border-foreground bg-background px-3.5 text-foreground font-sans placeholder:text-muted-foreground/80 placeholder:font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:border-foreground focus-visible:shadow-[3px_3px_0px_var(--shadow-color)] transition-all ${form.formState.errors.email ? "border-[#FF3B30] focus-visible:ring-[#FF3B30]" : ""
                }`}
            />
            {form.formState.errors.email && (
              <p className="font-sans text-xs font-semibold text-[#FF3B30] mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="font-display font-bold text-xs uppercase tracking-wider text-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                {...form.register("password")}
                className={`h-12 rounded-[12px] border-2 border-foreground bg-background px-3.5 pr-11 text-foreground font-sans placeholder:text-muted-foreground/80 placeholder:font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:border-foreground focus-visible:shadow-[3px_3px_0px_var(--shadow-color)] transition-all ${form.formState.errors.password ? "border-[#FF3B30] focus-visible:ring-[#FF3B30]" : ""
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="font-sans text-xs font-semibold text-[#FF3B30] mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          {errorText && (
            <div className="bg-[#FF3B30] text-white p-3.5 rounded-[12px] text-[14px] font-sans border-[2px] border-foreground flex items-start gap-2.5 shadow-[3px_3px_0px_black]">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="leading-snug font-medium">{errorText}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-[#FFD600] border-2 border-foreground text-foreground font-display font-bold text-base rounded-[12px] shadow-[4px_4px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-[#FFD600]/90 transition-all focus-visible:ring-2 focus-visible:ring-foreground active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer mt-3"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register Faculty Account
          </Button>
        </form>
      </div>

      <div className="mt-8 pt-5 border-t border-foreground/15 text-center font-sans text-sm text-muted-foreground">
        Already registered ?{" "}
        <Link href={loginUrl} className="text-foreground font-bold hover:underline underline-offset-4">
          Sign in here
        </Link>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-card p-8 rounded-[24px] border-[2px] border-foreground shadow-[4px_4px_0px_black] min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-foreground border-t-[#FFD600] rounded-full animate-spin" />
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  )
}
