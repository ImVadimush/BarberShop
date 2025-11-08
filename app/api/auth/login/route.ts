import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long")
}
const secret = new TextEncoder().encode(jwtSecret)

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    const db = await getDb()

    console.log("🔐 [API] Login attempt for:", username)

    let user = null
    let userRole = null

    // 1. SPRAWDŹ W ADMINACH
    user = await db.collection("admins").findOne({ username })
    if (user) {
      userRole = "admin"
      console.log("✅ [API] Found in admins")
    }

    // 2. SPRAWDŹ W BARBERACH
    if (!user) {
      user = await db.collection("barbers").findOne({ username })
      if (user) {
        userRole = "barber"
        console.log("✅ [API] Found in barbers")
      }
    }

    // 3. SPRAWDŹ W USERS
    if (!user) {
      user = await db.collection("users").findOne({ username })
      if (user) {
        userRole = "client"
        console.log("✅ [API] Found in users")
      }
    }

    if (!user) {
      console.log("❌ [API] User not found")
      return NextResponse.json(
        { error: "Nieprawidłowa nazwa użytkownika lub hasło" },
        { status: 401 }
      )
    }

    console.log("🔑 [API] Checking password...")
    // ✅ NAPRAWIONO: Backward compatibility - szukaj zarówno password jak i password_hash
    const hashedPassword = user.password_hash || user.password
    
    if (!hashedPassword) {
      console.log("❌ [API] No password hash found for user")
      return NextResponse.json(
        { error: "Błąd serwera: hasło użytkownika nie znalezione" },
        { status: 500 }
      )
    }
    
    const isPasswordValid = await bcrypt.compare(password, hashedPassword)
    console.log("🔑 [API] Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      console.log("❌ [API] Invalid password")
      return NextResponse.json(
        { error: "Nieprawidłowa nazwa użytkownika lub hasło" },
        { status: 401 }
      )
    }

    const { password_hash, ...userWithoutPassword } = user
    
    let redirectTo = "/"
    
    if (userRole === "admin") {
      redirectTo = "/admin/dashboard"
    } else if (userRole === "barber") {
      redirectTo = `/barber/${user.username}`
    } else if (userRole === "client") {
      redirectTo = `/client/${user.username}`
    }

    const token = await new SignJWT({ 
      userId: user._id.toString(),
      username: user.username,
      role: userRole,
      name: user.name
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret)

    console.log("🎯 [API] Final redirectTo:", redirectTo)
    console.log("🔐 [API] Token generated")

    const response = NextResponse.json({
      message: "Zalogowano pomyślnie",
      user: {
        ...userWithoutPassword,
        userId: user._id.toString(), // ✅ NOWE: userId
        role: userRole
      },
      redirectTo: redirectTo
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    })

    return response

  } catch (error) {
    console.error("❌ [API] Login error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas logowania" },
      { status: 500 }
    )
  }
}