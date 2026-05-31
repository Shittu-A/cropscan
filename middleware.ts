import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/server'

// Define protected and public routes
const PROTECTED_ROUTES = ['/scan', '/history']
const PUBLIC_ROUTES = ['/', '/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if current path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if current path is explicitly public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route)

  // Update session and get supabase client
  const { supabase, response } = updateSession(request)

  // Refresh session if expired
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  const isAuthenticated = !!user && !error

  // Handle protected routes - redirect to auth if not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle auth page - redirect to scan if already authenticated
  if (pathname === '/auth' && isAuthenticated) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/scan'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return response
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
