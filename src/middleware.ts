import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/(women|men|kids)',
  '/products/(.*)',
  '/collections/(.*)',
  '/api/webhooks/clerk',
  '/sign-in(.*)',
  '/sign-up(.*)'
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, request) => {
  // Handle Admin routes
  if (isAdminRoute(request)) {
    const authObject = await auth()
    
    // If not signed in, redirect to sign in
    if (!authObject.userId) {
      await auth.protect()
    }
    
    // Fetch user from clerkClient to read current publicMetadata
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(authObject.userId!)
      const role = user.publicMetadata?.role
      
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.error('Error fetching user for admin verification:', error)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Handle other protected routes (like /checkout, /account)
  if (!isPublicRoute(request) && !isAdminRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
