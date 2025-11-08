// lib/cron.ts
export async function cleanupUnverifiedUsers() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/cleanup-unverified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    
    const data = await response.json()
    console.log(`🟢 [CRON] Cleanup completed: ${data.deleted} users deleted`)
  } catch (error) {
    console.error('🔴 [CRON] Cleanup error:', error)
  }
}