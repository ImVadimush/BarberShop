import { type NextRequest, NextResponse } from "next/server"
import { getBookingById, updateBooking, deleteBooking } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { updateBookingSchema, sanitizeString } from "@/lib/validation"
import { ObjectId } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
    }

    const booking = await getBookingById(id)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("[v0] Error fetching booking:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
    }

    const body = await request.json()

    const validation = updateBookingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.errors }, { status: 400 })
    }

    const data = validation.data

    const sanitizedData: any = {}
    if (data.client_name) sanitizedData.client_name = sanitizeString(data.client_name)
    if (data.client_phone) sanitizedData.client_phone = sanitizeString(data.client_phone)
    if (data.service_type) sanitizedData.service_type = sanitizeString(data.service_type)
    if (data.notes) sanitizedData.notes = sanitizeString(data.notes)
    if (data.barber_id) sanitizedData.barber_id = data.barber_id
    if (data.booking_date) sanitizedData.booking_date = data.booking_date
    if (data.booking_time) sanitizedData.booking_time = data.booking_time
    if (data.status) sanitizedData.status = data.status

    const booking = await updateBooking(id, sanitizedData)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    console.log("[v0] Booking updated by:", session.username)

    return NextResponse.json(booking)
  } catch (error) {
    console.error("[v0] Error updating booking:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 })
    }

    await deleteBooking(id)

    console.log("[v0] Booking deleted by:", session.username)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting booking:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}
