import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// DEMO MODE: middleware disabled for testing
// To enable auth protection, uncomment the code below

export async function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}

/* PRODUCTION MIDDLEWARE (uncomment when deploying):
import { getToken } from "next-auth/jwt"

const publicPaths = ["/", "/login", "/registro", "/precos", "/funcionalidades"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/")
  ) {
    const token = await getToken({ req: request })
    if ((pathname === "/login" || pathname === "/registro") && token) {
      return NextResponse.redirect(new URL("/copilot", request.url))
    }
    return NextResponse.next()
  }

  const token = await getToken({ req: request })
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}
*/
