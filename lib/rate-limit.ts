import type { NextRequest } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })
  },
  5 * 60 * 1000,
)

export function rateLimit(request: NextRequest, maxRequests = 10, windowMs = 60000): boolean {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const key = `${ip}-${request.nextUrl.pathname}`

  const now = Date.now()
  const record = store[key]

  if (!record || record.resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}
