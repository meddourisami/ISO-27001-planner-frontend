import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const { pathname } = url

  // Public routes
  const isPublicPath = pathname.startsWith("/login") || pathname.startsWith("/public")

  // Check for access token in cookies or Authorization header
  const accessToken =
    req.cookies.get("accessToken")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    ""

  // Redirect if user is not authenticated and trying to access protected routes
  if (!accessToken && !isPublicPath) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("from", pathname) // optional: track where user came from
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Apply middleware to all routes except Next.js internals and static files
export const config = {
  matcher: [
    /*
      Exclude:
      - Static files (_next)
      - Images/icons
    */
    "/((?!_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
}