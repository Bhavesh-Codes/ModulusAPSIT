import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { isUnapprovedEmailError } from '@/lib/auth-errors'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const errorCode = searchParams.get('error_code')

  const cookieStore = await cookies()
  const authSource = searchParams.get('from') || cookieStore.get('auth_source')?.value || 'login'
  const redirectPath = authSource === 'signup' ? '/signup' : '/login'

  // If Supabase OAuth returned an error directly in query params
  if (error || errorDescription) {
    const isUnapproved =
      isUnapprovedEmailError(errorDescription) ||
      isUnapprovedEmailError(error) ||
      errorCode === '500'

    const errorParam = isUnapproved ? 'unapproved_email' : encodeURIComponent(errorDescription || error || 'auth_error')
    const response = NextResponse.redirect(`${origin}${redirectPath}?error=${errorParam}`)
    response.cookies.delete('auth_source')
    return response
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      const response = NextResponse.redirect(`${origin}/dashboard`)
      response.cookies.delete('auth_source')
      return response
    }

    const isUnapproved = isUnapprovedEmailError(exchangeError.message)
    const errorParam = isUnapproved ? 'unapproved_email' : encodeURIComponent(exchangeError.message)
    const response = NextResponse.redirect(`${origin}${redirectPath}?error=${errorParam}`)
    response.cookies.delete('auth_source')
    return response
  }

  // Fallback if neither code nor error was provided
  const response = NextResponse.redirect(`${origin}${redirectPath}?error=unapproved_email`)
  response.cookies.delete('auth_source')
  return response
}

