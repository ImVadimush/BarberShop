import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export const dynamic = 'force-dynamic' // ✅ DODAJ TĘ LINIĘ

export async function GET(request: Request) {
  try {
    const db = await getDb()

    // Pobierz username z query params
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    // Pobierz użytkownika z bazy
    const user = await db.collection("users").findOne({ username })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Zwróć userId
    return NextResponse.json({
      userId: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone
    })
  } catch (error) {
    console.error("[API] Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}