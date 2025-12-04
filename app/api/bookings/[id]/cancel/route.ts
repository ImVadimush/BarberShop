import { NextResponse } from "next/server"
import { getDb, ObjectId } from "@/lib/mongodb"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()

    // Sprawdź czy rezerwacja istnieje
    const booking = await db.collection("bookings").findOne({ 
      _id: new ObjectId(id) 
    })

    if (!booking) {
      return NextResponse.json({ error: "Rezerwacja nie znaleziona" }, { status: 404 })
    }

    // ✅ NAPRAWIONO: Anuluj rezerwację + dodaj cancelled_at
    const result = await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: "cancelled",
          cancelled_at: new Date(), // ✅ NOWE: Zapisz czas anulowania
          updated_at: new Date().toISOString()
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Rezerwacja nie znaleziona" }, { status: 404 })
    }

    return NextResponse.json({ message: "Rezerwacja anulowana pomyślnie" })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json({ error: "Nie udało się anulować rezerwacji" }, { status: 500 })
  }
}