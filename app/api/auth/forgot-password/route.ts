import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDb } from "@/lib/mongodb"
import { generateResetToken, sendPasswordResetEmail } from "@/lib/email"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // ✅ Rate limiting - max 3 requests per 15 minutes
    if (!rateLimit(request, 3, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Zbyt wiele prób. Spróbuj za 15 minut." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email jest wymagany" },
        { status: 400 }
      )
    }

    const db = await getDb()

    // Znajdź użytkownika
    const user = await db.collection("users").findOne({ email })

    // ✅ Security: Zwróć ten sam komunikat czy user istnieje czy nie
    if (!user) {
      return NextResponse.json({
        message: "Jeśli email istnieje w systemie, wyślemy link resetujący"
      })
    }

    // Generuj reset token
    const resetToken = generateResetToken()
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 godzina

    // Zapisz token w bazie
    const result = await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          reset_token: resetToken,
          reset_token_expires: resetTokenExpires,
          updated_at: new Date().toISOString()
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Nie udało się wysłać emaila" },
        { status: 500 }
      )
    }

    // Wyślij email
    const emailSent = await sendPasswordResetEmail(email, resetToken)

    if (!emailSent) {
      console.warn("[AUTH] Email not sent, but token stored")
    }

    console.log("[AUTH] Password reset requested for:", email)

    return NextResponse.json({
      message: "Jeśli email istnieje w systemie, wyślemy link resetujący"
    })
  } catch (error) {
    console.error("[AUTH] Error in forgot-password:", error)
    return NextResponse.json(
      { error: "Błąd podczas wysyłania emaila" },
      { status: 500 }
    )
  }
}