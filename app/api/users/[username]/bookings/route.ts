import { NextResponse } from "next/server"
import { getDb, ObjectId } from "@/lib/mongodb"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const db = await getDb()

    console.log("[API] Fetching bookings for username:", username)

    // Znajdź usera
    const user = await db.collection("users").findOne({ username })
    if (!user) {
      console.log("[API] User not found:", username)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[API] User found, ID:", user._id, "Phone:", user.phone)

    // ✅ NAPRAWIONO: Szukaj po:
    // 1. user_id (jako ObjectId)
    // 2. user_id (jako string) - dla nowych rezerwacji
    // 3. client_phone - fallback dla starych rezerwacji
    const bookings = await db.collection("bookings")
      .find({
        $or: [
          { user_id: user._id }, // ObjectId
          { user_id: user._id.toString() }, // String
          { client_phone: user.phone } // Fallback
        ]
      })
      .sort({ booking_date: -1, booking_time: -1 })
      .toArray()

    console.log("[API] Found bookings:", bookings.length)
    
    if (bookings.length > 0) {
      console.log("[API] First booking:", JSON.stringify(bookings[0], null, 2))
    }

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("[API] Error fetching user bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: String(error) },
      { status: 500 }
    )
  }
}