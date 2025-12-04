import { type NextRequest, NextResponse } from "next/server"
import { getBarbers, createBarber } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { createBarberSchema, sanitizeString } from "@/lib/validation"
import { hashPassword } from "@/lib/auth"

export async function GET() {
  try {
    const barbers = await getBarbers()
    // Nie zwracaj hash'y haseł dla bezpieczeństwa
    const safeBarbers = barbers.map(({ password_hash, ...barber }) => barber)
    return NextResponse.json(safeBarbers || [])
  } catch (error) {
    console.error("[v0] Error fetching barbers:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch barbers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Creating barber with data:", body)

    const validation = createBarberSchema.safeParse(body)
    if (!validation.success) {
      console.log("[v0] Validation errors:", validation.error.errors)
      return NextResponse.json({ 
        error: "Invalid input", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    const data = validation.data

    // Sprawdź czy username już istnieje
    const existingBarber = await getBarberByUsername(data.username)
    if (existingBarber) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    // Hash password
    const password_hash = await hashPassword(data.password)

    const sanitizedData = {
      name: sanitizeString(data.name),
      specialty: sanitizeString(data.specialty),
      image_url: data.image_url || "",
      bio: data.bio || "",
      experience_years: data.experience_years || 0,
      username: sanitizeString(data.username),
      password_hash: password_hash,
    }

    console.log("[v0] Sanitized data:", sanitizedData)

    const barber = await createBarber(sanitizedData)

    console.log("[v0] Barber created by:", session.username)

    // Nie zwracaj hash'a hasła
    const { password_hash: _, ...safeBarber } = barber
    return NextResponse.json(safeBarber, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating barber:", error)
    return NextResponse.json({ 
      error: "Failed to create barber",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}