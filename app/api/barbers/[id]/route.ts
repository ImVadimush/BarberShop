import { type NextRequest, NextResponse } from "next/server"
import { getBarberById, updateBarber, deleteBarber, getBarberByUsername } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { updateBarberSchema, sanitizeString } from "@/lib/validation"
import { ObjectId } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid barber ID" }, { status: 400 })
    }

    const barber = await getBarberById(id)

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 })
    }

    // Nie zwracaj hash'a hasła
    const { password_hash, ...safeBarber } = barber
    return NextResponse.json(safeBarber)
  } catch (error) {
    console.error("[v0] Error fetching barber:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch barber" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid barber ID" }, { status: 400 })
    }

    const body = await request.json()
    console.log("[v0] Updating barber", id, "with data:", body)

    const validation = updateBarberSchema.safeParse(body)
    if (!validation.success) {
      console.log("[v0] Validation errors:", validation.error.errors)
      return NextResponse.json({ 
        error: "Invalid input", 
        details: validation.error.errors 
      }, { status: 400 })
    }

    const data = validation.data
    console.log("[v0] Validated data:", data)

    // Sprawdź czy nowy username nie jest już używany przez innego barbera
    if (data.username) {
      const existingBarber = await getBarberByUsername(data.username)
      if (existingBarber && existingBarber._id?.toString() !== id) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 })
      }
    }

    const sanitizedData: any = {}
    if (data.name !== undefined) sanitizedData.name = sanitizeString(data.name)
    if (data.specialty !== undefined) sanitizedData.specialty = sanitizeString(data.specialty)
    if (data.bio !== undefined) sanitizedData.bio = sanitizeString(data.bio)
    if (data.image_url !== undefined) sanitizedData.image_url = data.image_url
    if (data.experience_years !== undefined) sanitizedData.experience_years = data.experience_years
    if (data.username !== undefined) sanitizedData.username = sanitizeString(data.username)
    
    // Hash new password if provided
    if (data.password) {
      sanitizedData.password_hash = await hashPassword(data.password)
    }

    console.log("[v0] Sanitized update data:", sanitizedData)

    const barber = await updateBarber(id, sanitizedData)

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 })
    }

    console.log("[v0] Barber updated by:", session.username)

    // Nie zwracaj hash'a hasła
    const { password_hash, ...safeBarber } = barber
    return NextResponse.json(safeBarber)
  } catch (error) {
    console.error("[v0] Error updating barber:", error)
    return NextResponse.json({ 
      error: "Failed to update barber",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid barber ID" }, { status: 400 })
    }

    await deleteBarber(id)

    console.log("[v0] Barber deleted by:", session.username)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting barber:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to delete barber" }, { status: 500 })
  }
}