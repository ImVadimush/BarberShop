import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    console.log("🔵 [REGISTER] Starting registration process")
    
    const body = await request.json()
    console.log("🔵 [REGISTER] Request body:", body)

    const { name, username, email, phone, password, role = "client" } = body

    // Podstawowa walidacja
    if (!name || !username || !email || !phone || !password) {
      console.log("🔴 [REGISTER] Missing required fields")
      return NextResponse.json(
        { error: "Wszystkie pola są wymagane" },
        { status: 400 }
      )
    }

    const db = await getDb()
    console.log("🔵 [REGISTER] Connected to database")

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await db.collection("users").findOne({
      $or: [
        { username },
        { email }
      ]
    })

    if (existingUser) {
      console.log("🔴 [REGISTER] User already exists")
      return NextResponse.json(
        { error: "Użytkownik z taką nazwą lub emailem już istnieje" },
        { status: 400 }
      )
    }

    console.log("🔵 [REGISTER] User doesn't exist, creating...")

    // Hash hasła
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("🔵 [REGISTER] Password hashed")

    // ✅ Generuj verification token - 2 GODZINY ważności
    const verificationToken = generateVerificationToken()
    const verificationTokenExpires = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 godziny

    // Utwórz użytkownika
    const user = {
      name,
      username,
      email,
      phone,
      password_hash: hashedPassword,
      role: "client",
      isActive: false, // Konto nieaktywne do weryfikacji
      status: "pending_verification", // ✅ NOWE: status zamiast tylko isActive
      verified_at: null,
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log("🔵 [REGISTER] User object:", user)

    const result = await db.collection("users").insertOne(user)
    console.log("🟢 [REGISTER] User created successfully, ID:", result.insertedId)

    // ✅ Wyślij email weryfikacyjny (w trybie dev pokaże token w konsoli)
    const emailSent = await sendVerificationEmail(email, verificationToken)
    
    if (!emailSent) {
      console.warn("🟡 [REGISTER] Email verification not sent, but user created")
      // Nie zwracaj błędu - kontynuuj proces
    }

    return NextResponse.json({ 
      message: "Konto utworzone! Sprawdź email aby potwierdzić adres.",
      email: email, // ✅ WAŻNE: Zwracamy email dla frontendu
      debug_token: process.env.NODE_ENV === "development" ? verificationToken : undefined, // ✅ Tylko w dev
      user: {
        id: result.insertedId,
        name,
        username,
        email,
        role: "client",
        verified: false
      }
    })

  } catch (error) {
    console.error("🔴 [REGISTER] Error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas rejestracji: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}