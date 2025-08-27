import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token

    // Admin routes protection
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!token || !(token as any).isAdmin) {
        return NextResponse.rewrite(new URL('/auth/signin', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to non-admin routes
        if (!req.nextUrl.pathname.startsWith('/admin')) {
          return true
        }
        
        // For admin routes, check if user is admin
        return !!(token && (token as any).isAdmin)
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}