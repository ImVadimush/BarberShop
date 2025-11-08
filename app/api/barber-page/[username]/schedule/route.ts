import { NextResponse } from "next/server"
import { getBarberByUsername, getBookingsByBarberAndDate } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const barber = await getBarberByUsername(username)
    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 })
    }

    const bookings = await getBookingsByBarberAndDate(barber._id!.toString(), date)

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching barber schedule:", error)
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 })
  }
}