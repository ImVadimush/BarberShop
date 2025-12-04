import { NextResponse } from "next/server"
import { getDb, ObjectId } from "@/lib/mongodb"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ username: string; messageId: string }> }
) {
  try {
    const { username, messageId } = await params
    const db = await getDb()

    // Znajdź barbera
    const barber = await db.collection("barbers").findOne({ username })
    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 })
    }

    // Oznacz wiadomość jako przeczytaną
    const result = await db.collection("messages").updateOne(
      { 
        _id: new ObjectId(messageId), 
        barber_id: barber._id 
      },
      { 
        $set: { status: "read" } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Message marked as read" })
  } catch (error) {
    console.error("Error updating message:", error)
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
  }
}