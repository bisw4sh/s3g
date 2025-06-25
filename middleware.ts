import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.nextUrl.pathname)

  const session = await auth.api.getSession({
    headers: request.headers
  })

  const protected_api = ["upload-url", "me"]
  const protected_pages = ["upload"]

  for (const apiRoute of protected_api) {
    if (request.nextUrl.pathname.startsWith(`/api/${apiRoute}`)) {
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
  }

  for (const pageRoute of protected_pages) {
    if (request.nextUrl.pathname.startsWith(`/${pageRoute}`)) {
      if (!session) {
        return NextResponse.redirect(new URL('/signin', request.url))
      }
    }
  }

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|auth|public).*)',
    '/upload/:path*',
    '/upload',
    '/api/upload-url/:path*',
    '/api/upload-url',
    '/dashboard/:path*',
    '/dashboard',
    '/api/me/:path*'
  ]
}
