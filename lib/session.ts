"use client"

import { useState, useEffect } from 'react'

interface Session {
  authenticated: boolean
  user?: {
    username: string
    role: string
    userId?: string
  }
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          setSession(data)
        } else {
          setSession({ authenticated: false })
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        setSession({ authenticated: false })
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  return { session, loading }
}