import { NextResponse } from "next/server"
import { getDb, ObjectId } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDb()
    const messages = await db.collection("messages")
      .find({})
      .sort({ created_at: -1 })
      .limit(10)
      .toArray()
    
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { barber_id, title, content } = await request.json()
    const db = await getDb()

    // Get barber name
    const barber = await db.collection("barbers").findOne({ _id: new ObjectId(barber_id) })
    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 })
    }

    const message = {
      barber_id: new ObjectId(barber_id),
      barber_name: barber.name,
      title,
      content,
      status: "sent",
      created_at: new Date().toISOString(),
    }

    await db.collection("messages").insertOne(message)

    return NextResponse.json({ message: "Message sent successfully" })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}