import { NextResponse } from "next/server"
import { getBarberByUsername, getBookingsByBarberId } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const barber = await getBarberByUsername(username)
    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 })
    }

    const bookings = await getBookingsByBarberId(barber._id!.toString())

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching barber bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}