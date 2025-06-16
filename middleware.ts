import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.nextUrl.pathname) // Debug log

  const session = await auth.api.getSession({
    headers: request.headers
  })

  const protected_api = ["upload-url"]
  const protected_pages = ["upload"]

  // Protect specific API routes
  for (const apiRoute of protected_api) {
    if (request.nextUrl.pathname.startsWith(`/api/${apiRoute}`)) {
      console.log('Protecting API route:', request.nextUrl.pathname) // Debug log
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
  }

  // Protect specific page routes
  for (const pageRoute of protected_pages) {
    if (request.nextUrl.pathname.startsWith(`/${pageRoute}`)) {
      console.log('Protecting page route:', request.nextUrl.pathname) // Debug log
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  // Keep your existing dashboard protection
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match /upload and any sub-paths
    '/upload/:path*',
    '/upload',
    // Match /api/upload-url and any sub-paths  
    '/api/upload-url/:path*',
    '/api/upload-url',
    // Match dashboard routes
    '/dashboard/:path*',
    '/dashboard'
  ]
}
