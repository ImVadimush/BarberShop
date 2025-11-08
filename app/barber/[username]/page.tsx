"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, CheckCircle, Scissors, LogOut, MessageSquare } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface BarberStats {
  total: number
  pending: number
  confirmed: number
  today: number
}

export default function BarberDashboardPage({ params }: { params: Promise<{ username: string }> }) {
  const [username, setUsername] = useState("")
  const router = useRouter()
  const [stats, setStats] = useState<BarberStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    today: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params
      setUsername(resolvedParams.username)
    }
    fetchParams()
  }, [params])

  useEffect(() => {
    if (!username) return

    fetch(`/api/barber-page/${username}/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching barber stats:", error)
        setLoading(false)
      })
  }, [username])

  const handleLogout = async () => {
  try {
    
    // 1. Wywołaj API logout żeby wyczyścić cookie
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    })

    if (response.ok) {
      
      // 2. Wyczyść localStorage
      localStorage.removeItem('lastLoggedInUser')
      
      // 3. Przekieruj na login
      router.push("/login")
      router.refresh()
    } else {
      throw new Error("Logout API failed")
    }
    
  } catch (error) {
    // Fallback - wyczyść localStorage i przekieruj
    localStorage.removeItem('lastLoggedInUser')
    router.push("/login")
    router.refresh()
  }
}

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header z przyciskiem wylogowania */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">Witaj, {username}!</h1>
          <p className="text-muted-foreground">Twój panel barbera - Elite Barber Studio</p>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Wyloguj się
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wszystkie rezerwacje</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Łączna liczba twoich rezerwacji</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Na dziś</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{loading ? "..." : stats.today}</div>
            <p className="text-xs text-muted-foreground mt-1">Rezerwacje na dzisiejszy dzień</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Oczekujące</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{loading ? "..." : stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Wymagają potwierdzenia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Potwierdzone</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{loading ? "..." : stats.confirmed}</div>
            <p className="text-xs text-muted-foreground mt-1">Zaplanowane wizyty</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Szybkie akcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push(`/barber/${username}/schedule`)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              size="lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Mój grafik
            </Button>
            <Button 
              onClick={() => router.push(`/barber/${username}/bookings`)} 
              variant="outline" 
              size="lg"
            >
              <Scissors className="w-5 h-5 mr-2" />
              Moje rezerwacje
            </Button>
            <Button 
              onClick={() => router.push(`/barber/${username}/messages`)} 
              variant="outline" 
              size="lg"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Wiadomości
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}