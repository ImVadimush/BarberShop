import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDb } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password, confirmPassword } = body

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Wszystkie pola są wymagane" },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Hasła nie są identyczne" },
        { status: 400 }
      )
    }

    // Walidacja hasła
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Hasło musi mieć co najmniej 8 znaków" },
        { status: 400 }
      )
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: "Hasło musi zawierać małą literę, dużą literę i cyfrę" },
        { status: 400 }
      )
    }

    const db = await getDb()

    // Znajdź użytkownika z tym tokenem
    const user = await db.collection("users").findOne({
      reset_token: token,
      reset_token_expires: { $gt: new Date() } // Token wciąż ważny
    })

    if (!user) {
      return NextResponse.json(
        { error: "Token resetujący jest nieprawidłowy lub wygasł" },
        { status: 400 }
      )
    }

    // Hash nowe hasło
    const hashedPassword = await bcrypt.hash(password, 12)

    // Zaktualizuj hasło i usuń token
    const result = await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password_hash: hashedPassword,
          reset_token: null,
          reset_token_expires: null,
          updated_at: new Date().toISOString()
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Nie udało się zmienić hasła" },
        { status: 500 }
      )
    }

    console.log("[AUTH] Password reset for user:", user.username)

    return NextResponse.json({
      message: "Hasło zostało zmienione. Możesz się teraz zalogować.",
      username: user.username
    })
  } catch (error) {
    console.error("[AUTH] Error resetting password:", error)
    return NextResponse.json(
      { error: "Błąd podczas resetowania hasła" },
      { status: 500 }
    )
  }
}