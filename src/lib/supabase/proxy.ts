import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          supabaseResponse = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const normalizedPath =
    pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname

  const isPublicRoute =
    normalizedPath === "" ||
    normalizedPath === "/" ||
    normalizedPath === "/login" ||
    normalizedPath === "/signup" ||
    normalizedPath === "/reset" ||
    normalizedPath.startsWith("/api/auth")

  // Unauthenticated users trying to access protected resources
  if (!user) {
    if (!isPublicRoute) {
      // If accessing a protected API route, return 401 JSON instead of redirecting
      if (normalizedPath.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // If accessing a protected page, redirect to /login
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("redirectTo", normalizedPath)
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((c) => {
        redirectResponse.cookies.set(c.name, c.value, c)
      })
      return redirectResponse
    }
  }

  // Authenticated users trying to access login or signup pages
  if (user && (normalizedPath === "/login" || normalizedPath === "/signup")) {
    const url = request.nextUrl.clone()
    url.pathname = "/vault"
    url.searchParams.delete("redirectTo")
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, c)
    })
    return redirectResponse
  }

  return supabaseResponse
}
