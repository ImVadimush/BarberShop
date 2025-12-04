import { type NextRequest, NextResponse } from "next/server"
import { getBookingsByBarberAndDate } from "@/lib/db"

export const dynamic = 'force-dynamic' // ✅ DODAJ TĘ LINIĘ

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const barber_id = searchParams.get("barber_id")
    const date = searchParams.get("date")

    if (!barber_id || !date) {
      return NextResponse.json({ error: "Missing barber_id or date" }, { status: 400 })
    }

    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      return NextResponse.json({ error: "Cannot book past dates" }, { status: 400 })
    }

    const bookings = await getBookingsByBarberAndDate(barber_id, date)
    const blockedTimes = bookings.map((booking) => booking.booking_time)

    const now = new Date()
    const isToday = selectedDate.toDateString() === now.toDateString()
    const currentHour = now.getHours()

    const allBlockedTimes = [...blockedTimes]

    if (isToday) {
      // Block all times before current hour + 1 (need at least 1 hour notice)
      const timeSlots = [
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
      ]
      timeSlots.forEach((time) => {
        const hour = Number.parseInt(time.split(":")[0])
        if (hour <= currentHour) {
          allBlockedTimes.push(time)
        }
      })
    }

    return NextResponse.json({ blockedTimes: [...new Set(allBlockedTimes)] })
  } catch (error) {
    console.error("[v0] Error fetching availability:", error)
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}