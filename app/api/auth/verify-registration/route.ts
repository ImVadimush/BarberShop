import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    console.log("🔵 [VERIFY-REG] Attempting verification")
    
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email i kod są wymagane" },
        { status: 400 }
      )
    }

    const db = await getDb()

    // Szukaj użytkownika z tym kodem
    const user = await db.collection("users").findOne({
      email,
      verification_token: code,
      verification_token_expires: { $gt: new Date() }
    })

    if (!user) {
      console.log("🔴 [VERIFY-REG] Code invalid or expired")
      return NextResponse.json(
        { error: "Nieprawidłowy kod lub kod wygasł" },
        { status: 400 }
      )
    }

    // Aktywuj konto
    const result = await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          isActive: true,
          verified_at: new Date().toISOString(),
          verification_token: null,
          verification_token_expires: null,
          updated_at: new Date().toISOString()
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Nie udało się aktywować konta" },
        { status: 500 }
      )
    }

    console.log("🟢 [VERIFY-REG] Email verified for:", email)

    return NextResponse.json({
      message: "Email zweryfikowany! Możesz się zalogować.",
      user: {
        username: user.username,
        email: user.email
      }
    })

  } catch (error) {
    console.error("🔴 [VERIFY-REG] Error:", error)
    return NextResponse.json(
      { error: "Błąd podczas weryfikacji" },
      { status: 500 }
    )
  }
}