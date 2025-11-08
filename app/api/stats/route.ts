import { NextResponse } from "next/server"
import { getBookingStats } from "@/lib/db"
import { getSession } from "@/lib/auth"

export const dynamic = 'force-dynamic' // ✅ DODAJ TĘ LINIĘ

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await getBookingStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error fetching stats:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}