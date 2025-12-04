import { NextResponse } from "next/server"
import { getBarberByUsername, getBookingsByBarberId, getBookingsByBarberAndDate } from "@/lib/db"

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

    const allBookings = await getBookingsByBarberId(barber._id!.toString())
    
    const today = new Date().toISOString().split('T')[0]
    const todayBookings = await getBookingsByBarberAndDate(barber._id!.toString(), today)

    const stats = {
      total: allBookings.length,
      pending: allBookings.filter(b => b.status === "pending").length,
      confirmed: allBookings.filter(b => b.status === "confirmed").length,
      today: todayBookings.length,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching barber stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}