/**
 * Normalizes authentication error messages into clear, user-friendly text.
 * Especially handles unapproved email attempts which Supabase surfaces as "Database error saving new user",
 * as well as OAuth failures when an unapproved email attempts to register or sign in.
 */

export const UNAPPROVED_EMAIL_MESSAGE =
  "This email is not in the approved list. Please use a valid faculty email address."

export function isUnapprovedEmailError(error: string | null | undefined): boolean {
  if (!error) return false
  const clean = decodeURIComponent(error).trim().toLowerCase()
  return (
    clean === "unapproved_email" ||
    clean.includes("database error saving new user") ||
    clean.includes("saving new user") ||
    clean.includes("not in the approved") ||
    clean.includes("approved list") ||
    clean.includes("faculty email") ||
    clean.includes("valid faculty") ||
    clean.includes("unapproved") ||
    clean.includes("not authorized") ||
    clean === "true" ||
    clean === "oauth_error" ||
    clean === "server_error"
  )
}

export function getFriendlyAuthErrorMessage(error: string | null | undefined): string {
  if (!error) return ""

  const clean = decodeURIComponent(error).trim()
  const lower = clean.toLowerCase()

  if (isUnapprovedEmailError(clean)) {
    return UNAPPROVED_EMAIL_MESSAGE
  }

  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "An account with this email already exists. Please log in instead."
  }

  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password. If you haven't created an account yet, please sign up first."
  }

  if (lower.includes("email not confirmed")) {
    return "Please verify your email address before logging in."
  }

  return clean
}

export function setAuthSource(source: "signup" | "login"): void {
  if (typeof document !== "undefined") {
    document.cookie = `auth_source=${source}; path=/; max-age=300; SameSite=Lax`
  }
}
