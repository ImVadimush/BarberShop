import { type NextRequest, NextResponse } from "next/server"
import { getDb, ObjectId } from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    console.log("[v0] Fetching bookings...")
    const bookings = await getBookings()
    console.log("[v0] Bookings fetched:", bookings.length)
    
    return NextResponse.json(bookings || [])
  } catch (error) {
    console.error("[v0] Error fetching bookings:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Received booking request")

    const body = await request.json()
    console.log("[v0] Request body:", JSON.stringify(body, null, 2))

    const { client_name, client_phone, barber_id, service_type, booking_date, booking_time, notes } = body

    // Podstawowa walidacja
    if (!client_name || !client_phone || !barber_id || !service_type || !booking_date || !booking_time) {
      console.log("[v0] Missing fields!")
      return NextResponse.json({ 
        error: "Wszystkie wymagane pola muszą być wypełnione" 
      }, { status: 400 })
    }

    const db = await getDb()

    // Sprawdź czy barber istnieje
    let barberObjectId
    try {
      barberObjectId = new ObjectId(barber_id)
    } catch (error) {
      console.log("[v0] Invalid barber_id:", barber_id)
      return NextResponse.json({ error: "Nieprawidłowy identyfikator barbera" }, { status: 400 })
    }

    const barber = await db.collection("barbers").findOne({ _id: barberObjectId })
    if (!barber) {
      console.log("[v0] Barber not found for id:", barberObjectId)
      return NextResponse.json({ error: "Barber nie został znaleziony" }, { status: 404 })
    }

    console.log("[v0] Barber found:", barber.name)

    // Sprawdź czy użytkownik już istnieje po numerze telefonu
    let user = await db.collection("users").findOne({ 
      phone: client_phone 
    })

    let userId: ObjectId
    let userCreated = false

    if (!user) {
      // Jeśli użytkownik nie istnieje, utwórz nowe konto
      const generatedUsername = client_name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      const existingUserWithUsername = await db.collection("users").findOne({
        username: generatedUsername
      })

      const finalUsername = existingUserWithUsername 
        ? `${generatedUsername}-${Date.now().toString().slice(-4)}` 
        : generatedUsername

      const tempPassword = Math.random().toString(36).slice(-8) + "A1!"
      const hashedPassword = await bcrypt.hash(tempPassword, 12)

      const newUser = {
        name: client_name,
        username: finalUsername,
        email: `${finalUsername}@barbershop.com`,
        phone: client_phone,
        password: hashedPassword,
        role: "client",
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const userResult = await db.collection("users").insertOne(newUser)
      userId = userResult.insertedId
      userCreated = true

      console.log("[v0] New user created:", finalUsername)
    } else {
      userId = user._id
      console.log("[v0] Existing user found:", user.username)
    }

    // Walidacja daty - PARSE jako Date tylko do walidacji, ale przechowujemy jako STRING
    const selectedDate = new Date(booking_date + "T00:00:00Z")
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    console.log("[v0] Booking date:", booking_date, "Selected date:", selectedDate, "Today:", today)

    if (selectedDate < today) {
      console.log("[v0] Date is in the past")
      return NextResponse.json({ error: "Nie można rezerwować terminów z przeszłości" }, { status: 400 })
    }

    // Sprawdź czy czas nie minął dla dzisiejszej rezerwacji
    const todayString = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const isToday = booking_date === todayString
    
    if (isToday) {
      const [bookingHours, bookingMinutes] = booking_time.split(":").map(Number)
      const now = new Date()
      const currentHours = now.getHours()
      const currentMinutes = now.getMinutes()
      
      const currentTimeInMinutes = currentHours * 60 + currentMinutes
      const bookingTimeInMinutes = bookingHours * 60 + bookingMinutes

      console.log("[v0] Booking is today. Current time:", `${currentHours}:${String(currentMinutes).padStart(2, '0')}`, "Booking time:", booking_time)
      console.log("[v0] Current minutes:", currentTimeInMinutes, "Booking minutes:", bookingTimeInMinutes)

      if (bookingTimeInMinutes <= currentTimeInMinutes) {
        console.log("[v0] Time is in the past")
        return NextResponse.json({ error: "Nie można rezerwować minionych godzin na dzisiaj" }, { status: 400 })
      }
    }

    // Sprawdź dostępność terminu - porównujemy booking_date jako STRING
    const existingBooking = await db.collection("bookings").findOne({
      barber_id: barberObjectId,
      booking_date: booking_date, // STRING YYYY-MM-DD
      booking_time,
      status: { $in: ["pending", "confirmed"] }
    })

    if (existingBooking) {
      console.log("[v0] Time slot is already booked")
      return NextResponse.json({ error: "Ten termin jest już zajęty" }, { status: 409 })
    }

    // ✅ NAPRAWIONO: booking_date jako STRING, created_at jako Date object
    const booking = {
      _id: new ObjectId(),
      client_name,
      client_phone,
      barber_id: barberObjectId,
      barber_name: barber.name,
      service_type,
      booking_date: booking_date, // STRING w formacie YYYY-MM-DD!
      booking_time,
      notes: notes || "",
      status: "pending",
      created_at: new Date() // Date object
    }

    console.log("🟡 [API] About to insert booking:")
    console.log("🟡 [API] Booking object:", JSON.stringify(booking, null, 2))
    console.log("🟡 [API] Booking keys:", Object.keys(booking))
    console.log("🟡 [API] Booking types:", Object.entries(booking).map(([k, v]) => `${k}: ${typeof v}`))

    const bookingResult = await db.collection("bookings").insertOne(booking)
    console.log("[v0] Booking created successfully with ID:", bookingResult.insertedId)

    return NextResponse.json({ 
      message: "Rezerwacja utworzona pomyślnie",
      booking: {
        id: bookingResult.insertedId,
        ...booking
      },
      userCreated
    }, { status: 201 })

  } catch (error) {
    console.error("[v0] ERROR in POST /api/bookings:")
    console.error("[v0] Error name:", (error as any).name)
    console.error("[v0] Error message:", (error as any).message)
    console.error("[v0] Error code:", (error as any).code)
    console.error("[v0] Full error:", error)
    
    // Lepsze logowanie błędów MongoDB
    if (error instanceof Error && 'code' in error) {
      console.error("[v0] MongoDB error code:", (error as any).code)
      console.error("[v0] MongoDB error details:", JSON.stringify((error as any).errInfo, null, 2))
      console.error("[v0] MongoDB error context:", (error as any).messageWithContext)
      console.error("[v0] MongoDB full errInfo:", (error as any).errInfo)
      
      // Wyciągnij schemaRulesNotSatisfied
      const schemaRules = (error as any).errInfo?.details?.schemaRulesNotSatisfied
      if (schemaRules) {
        console.error("[v0] Schema rules not satisfied:", JSON.stringify(schemaRules, null, 2))
      }
    }
    
    return NextResponse.json({ 
      error: error instanceof Error 
        ? error.message 
        : "Wystąpił błąd podczas tworzenia rezerwacji"
    }, { status: 500 })
  }
}

async function getBookings() {
  try {
    const db = await getDb()
    const bookings = await db.collection("bookings")
      .find({})
      .sort({ created_at: -1 })
      .toArray()
    return bookings
  } catch (error) {
    console.error("[v0] Error in getBookings:", error)
    throw error
  }
}