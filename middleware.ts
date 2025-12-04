import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log(`🛡️ [MIDDLEWARE] Checking: ${pathname}`)

  // ✅ NOWE: Security headers na wszystkich responsach
  const response = NextResponse.next()

  // ✅ HSTS - enforce HTTPS
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  )

  // ✅ CSP - Content Security Policy (naprawiono dla Vercel)
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://va.vercel-scripts.com; frame-ancestors 'none';"
  )

  // ✅ X-Frame-Options - clickjacking protection
  response.headers.set("X-Frame-Options", "DENY")

  // ✅ X-Content-Type-Options - MIME type sniffing protection
  response.headers.set("X-Content-Type-Options", "nosniff")

  // ✅ X-XSS-Protection
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // ✅ Referrer-Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // ✅ Permissions-Policy
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  )

  // ✅ CORS - tylko trusted domains
  const origin = request.headers.get("origin")
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    "https://yourdomain.com",
    "https://www.yourdomain.com",
  ]

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    )
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-CSRF-Token"
    )
    response.headers.set("Access-Control-Allow-Credentials", "true")
  }

  // ============= ORYGINALNY AUTH MIDDLEWARE =============

  // Allow API auth routes without authentication
  if (pathname.startsWith("/api/auth")) {
    return response
  }

  // Allow barber API routes
  if (pathname.startsWith("/api/barber-page")) {
    return response
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("auth-token")?.value

    console.log(`🛡️ [MIDDLEWARE] Admin route, token:`, token ? "exists" : "missing")

    if (!token) {
      console.log("🛡️ [MIDDLEWARE] No token, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const session = await verifyToken(token)

    if (!session) {
      console.log("🛡️ [MIDDLEWARE] Invalid token, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Check if user is an admin
    if (session.role !== "admin") {
      console.log("🛡️ [MIDDLEWARE] Not an admin, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    console.log("🛡️ [MIDDLEWARE] Admin access granted")
  }

  // Protect barber routes
  if (pathname.startsWith("/barber")) {
    const token = request.cookies.get("auth-token")?.value

    console.log(`🛡️ [MIDDLEWARE] Barber route, token:`, token ? "exists" : "missing")

    if (!token) {
      console.log("🛡️ [MIDDLEWARE] No token, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const session = await verifyToken(token)

    if (!session) {
      console.log("🛡️ [MIDDLEWARE] Invalid token, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Check if user is a barber
    if (session.role !== "barber") {
      console.log("🛡️ [MIDDLEWARE] Not a barber, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    console.log("🛡️ [MIDDLEWARE] Barber access granted")
  }

  // Protect client routes  
  if (pathname.startsWith("/client")) {
    const token = request.cookies.get("auth-token")?.value

    console.log(`🛡️ [MIDDLEWARE] Client route, token:`, token ? "exists" : "missing")

    if (!token) {
      console.log("🛡️ [MIDDLEWARE] No token, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const session = await verifyToken(token)

    if (!session) {
      console.log("🛡️ [MIDDLEWARE] Invalid token, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Check if user is a client
    if (session.role !== "client") {
      console.log("🛡️ [MIDDLEWARE] Not a client, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    console.log("🛡️ [MIDDLEWARE] Client access granted")
  }

  // Redirect to appropriate dashboard if already logged in and trying to access login page
  if (pathname === "/login") {
    const token = request.cookies.get("auth-token")?.value

    if (token) {
      const session = await verifyToken(token)
      if (session) {
        if (session.role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url))
        } else if (session.role === "barber") {
          return NextResponse.redirect(new URL(`/barber/${session.username}`, request.url))
        } else if (session.role === "client") {
          return NextResponse.redirect(new URL(`/client/${session.username}`, request.url))
        }
      }
    }
  }

  // Redirect /admin to /admin/dashboard
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/barber/:path*", 
    "/client/:path*",
    "/login",
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
}