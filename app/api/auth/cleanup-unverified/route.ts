// app/api/auth/cleanup-unverified/route.ts
import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    console.log("🔵 [CLEANUP] Cleaning up unverified users")
    
    const db = await getDb()
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    
    // Znajdź niezweryfikowane konta starsze niż 2 godziny
    const unverifiedUsers = await db.collection("users").find({
      isActive: false,
      status: "pending_verification", 
      created_at: { $lt: twoHoursAgo.toISOString() }
    }).toArray()

    console.log(`🔵 [CLEANUP] Found ${unverifiedUsers.length} unverified users to delete`)

    if (unverifiedUsers.length > 0) {
      const result = await db.collection("users").deleteMany({
        isActive: false,
        status: "pending_verification",
        created_at: { $lt: twoHoursAgo.toISOString() }
      })

      console.log(`🟢 [CLEANUP] Deleted ${result.deletedCount} unverified users`)
    }

    return NextResponse.json({
      message: `Cleaned up ${unverifiedUsers.length} unverified users`,
      deleted: unverifiedUsers.length
    })

  } catch (error) {
    console.error("🔴 [CLEANUP] Error:", error)
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    )
  }
}