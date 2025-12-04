"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ArrowLeft, Clock, User, Phone } from "lucide-react"
import { useRouter } from "next/navigation"

interface Booking {
  _id: string
  client_name: string
  client_phone: string
  service_type: string
  booking_date: string
  booking_time: string
  status: string
  notes: string
}

export default function BarberSchedulePage({ params }: { params: Promise<{ username: string }> }) {
  const [username, setUsername] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params
      setUsername(resolvedParams.username)
    }
    fetchParams()
  }, [params])

  useEffect(() => {
    if (!username) return

    fetchSchedule()
  }, [username, selectedDate])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/barber-page/${username}/schedule?date=${selectedDate}`)
      if (!response.ok) {
        throw new Error('Failed to fetch schedule')
      }
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error("Error fetching schedule:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się załadować grafiku",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Zaktualizowano",
          description: "Status rezerwacji został zmieniony",
        })
        fetchSchedule()
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić statusu",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      cancelled: "destructive",
      completed: "outline",
    }

    const labels: Record<string, string> = {
      pending: "Oczekujące",
      confirmed: "Potwierdzone",
      cancelled: "Anulowane",
      completed: "Zakończone",
    }

    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPreviousDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const getNextDay = () => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push(`/barber/${username}`)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Powrót do panelu
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold mb-2">Mój grafik</h1>
        <p className="text-muted-foreground">Zarządzaj swoimi rezerwacjami i grafikiem</p>
      </div>

      {/* Date Navigation */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={getPreviousDay}>
              Poprzedni dzień
            </Button>
            
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Calendar className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">{formatDate(selectedDate)}</h2>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>

            <Button variant="outline" onClick={getNextDay}>
              Następny dzień
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Rezerwacje na {formatDate(selectedDate)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Ładowanie...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Brak rezerwacji na ten dzień</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Godzina</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Usługa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {booking.booking_time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {booking.client_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {booking.client_phone}
                        </div>
                      </TableCell>
                      <TableCell>{booking.service_type}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {booking.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(booking._id, "confirmed")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Potwierdź
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                              >
                                Anuluj
                              </Button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(booking._id, "completed")}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Zakończ
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                              >
                                Anuluj
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}