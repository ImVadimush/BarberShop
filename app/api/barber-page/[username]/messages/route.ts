import { NextResponse } from "next/server"
import { getDb, ObjectId } from "@/lib/mongodb"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const db = await getDb()

    // Najpierw znajdź barbera po username
    const barber = await db.collection("barbers").findOne({ username })
    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 })
    }

    // Pobierz wiadomości dla tego barbera
    const messages = await db.collection("messages")
      .find({ barber_id: barber._id })
      .sort({ created_at: -1 })
      .toArray()

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching barber messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}