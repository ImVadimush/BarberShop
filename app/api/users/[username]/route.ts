import { NextResponse } from "next/server"
import { getDb, ObjectId } from "@/lib/mongodb"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const db = await getDb()

    const user = await db.collection("users").findOne({ 
      username 
    }, {
      projection: { password: 0 } // Nie zwracaj hasła
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { email, phone } = await request.json()
    const db = await getDb()

    const result = await db.collection("users").updateOne(
      { username },
      { 
        $set: { 
          email, 
          phone,
          updated_at: new Date().toISOString()
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const db = await getDb()

    // Znajdź usera żeby dostać jego ID
    const user = await db.collection("users").findOne({ username })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Usuń usera
    await db.collection("users").deleteOne({ _id: user._id })

    // Usuń też rezerwacje usera
    await db.collection("bookings").deleteMany({ user_id: user._id })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}