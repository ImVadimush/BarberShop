import { NextResponse } from "next/server"
import { clearAuthCookie, getSession } from "@/lib/auth"

export async function POST() {
  try {
    const session = await getSession()
    if (session) {
      console.log("[v0] User logged out:", session.username)
    }

    await clearAuthCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Logout error:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
