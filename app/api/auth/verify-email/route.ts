import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: "Token weryfikacyjny jest wymagany" },
        { status: 400 }
      )
    }

    const db = await getDb()

    // Znajdź użytkownika z tym tokenem
    const user = await db.collection("users").findOne({
      verification_token: token,
      verification_token_expires: { $gt: new Date() } // Token wciąż ważny
    })

    if (!user) {
      return NextResponse.json(
        { error: "Token weryfikacyjny jest nieprawidłowy lub wygasł" },
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

    console.log("[AUTH] Email verified for user:", user.username)

    return NextResponse.json({
      message: "Email zweryfikowany! Możesz się teraz zalogować.",
      username: user.username
    })
  } catch (error) {
    console.error("[AUTH] Error verifying email:", error)
    return NextResponse.json(
      { error: "Błąd podczas weryfikacji emaila" },
      { status: 500 }
    )
  }
}