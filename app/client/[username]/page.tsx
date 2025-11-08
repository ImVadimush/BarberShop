"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  User, Mail, Phone, Calendar, LogOut, Trash2, Edit, X, Check, 
  Scissors, Clock, AlertCircle
} from "lucide-react"

interface UserData {
  _id: string
  name: string
  username: string
  email: string
  phone: string
  role: string
}

interface Booking {
  _id: string
  client_name: string
  service_type: string
  booking_date: string
  booking_time: string
  barber_id: string
  barber_name: string
  status: string
  cancelled_at?: Date
  price?: number
}

export default function ClientProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const [username, setUsername] = useState("")
  const [userData, setUserData] = useState<UserData | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    email: "",
    phone: ""
  })
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params
      setUsername(resolvedParams.username)
    }
    fetchParams()
  }, [params])

  useEffect(() => {
    if (!username) return

    fetchUserData()
    fetchBookings()
  }, [username])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${username}`)
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        setEditData({
          email: data.email,
          phone: data.phone
        })
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/users/${username}/bookings`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Bookings fetched:", data)
        setBookings(data)
      } else {
        console.error("[v0] Error fetching bookings:", response.status)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/users/${username}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        toast({
          title: "Dane zaktualizowane! 🎉",
          description: "Twoje dane zostały pomyślnie zaktualizowane",
        })
        setEditing(false)
        fetchUserData()
      } else {
        throw new Error("Failed to update")
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować danych",
        variant: "destructive",
      })
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH"
      })

      if (response.ok) {
        toast({
          title: "Rezerwacja anulowana! ✅",
          description: "Rezerwacja została pomyślnie anulowana",
        })
        fetchBookings()
      } else {
        throw new Error("Failed to cancel")
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się anulować rezerwacji",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`/api/users/${username}`, {
        method: "DELETE"
      })

      if (response.ok) {
        localStorage.removeItem('lastLoggedInUser')
        toast({
          title: "Konto usunięte",
          description: "Twoje konto zostało pomyślnie usunięte",
        })
        router.push("/")
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć konta",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('lastLoggedInUser')
    setTimeout(() => {
      router.push("/")
    }, 100)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pl-PL', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Potwierdzona'
      case 'pending': return 'Oczekująca'
      case 'cancelled': return 'Anulowana'
      default: return status
    }
  }

  // ✅ NAPRAWIONO: Oblicz kiedy rezerwacja będzie usunięta (od cancelled_at, nie booking_date)
  const getDeleteInHours = (booking: Booking) => {
    if (booking.status !== 'cancelled') return null
    
    // cancelled_at jest stringiem ISO lub Date
    const cancelledTime = new Date((booking as any).cancelled_at || new Date())
    const deleteTime = new Date(cancelledTime.getTime() + 12 * 60 * 60 * 1000) // +12 godzin
    
    const now = new Date()
    const diffMs = deleteTime.getTime() - now.getTime()
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
    
    if (diffHours <= 0) {
      return "już została usunięta"
    }
    
    if (diffHours < 24) {
      return `za ${diffHours}h`
    }
    
    const diffDays = Math.ceil(diffHours / 24)
    return `za ${diffDays}d`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                {userData?.name}
              </h1>
              <p className="text-muted-foreground mt-1">Profil klienta</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => router.push("/")}
                variant="outline"
              >
                Powrót do strony głównej
              </Button>
              <Button 
                onClick={() => router.push("/#booking")}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Nowa rezerwacja
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Wyloguj
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Moje dane
              </CardTitle>
              <CardDescription>Zarządzaj swoimi danymi osobowymi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Imię i nazwisko</Label>
                  <p className="text-foreground font-medium mt-1">{userData?.name}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Nazwa użytkownika</Label>
                  <p className="text-foreground font-medium mt-1">@{userData?.username}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </Label>
                  {editing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-foreground mt-1">{userData?.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Numer telefonu
                  </Label>
                  {editing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-foreground mt-1">{userData?.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {editing ? (
                  <>
                    <Button 
                      onClick={handleSaveChanges}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Zapisz
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditing(false)
                        setEditData({
                          email: userData?.email || "",
                          phone: userData?.phone || ""
                        })
                      }}
                    >
                      Anuluj
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setEditing(true)}
                    variant="outline"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edytuj
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rezerwacje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Moje rezerwacje
              </CardTitle>
              <CardDescription>Historia i zarządzanie rezerwacjami</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Brak rezerwacji</p>
                  <Button 
                    onClick={() => router.push("/#booking")}
                    className="mt-4 bg-accent hover:bg-accent/90"
                  >
                    <Scissors className="w-4 h-4 mr-2" />
                    Umów wizytę
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings
                    .filter(booking => booking.status !== 'completed') // Filtruj completed, ale pokazuj cancelled
                    .map((booking) => (
                    <div key={booking._id} className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-foreground">{booking.service_type}</h3>
                            <Badge className={`${getStatusColor(booking.status)} text-white text-xs`}>
                              {getStatusText(booking.status)}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(booking.booking_date)} • {booking.booking_time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Scissors className="w-3 h-3" />
                              <span>{booking.barber_name}</span>
                            </div>
                            {/* ✅ NAPRAWIONO: Pokazuj czas usuwania od cancelled_at */}
                            {booking.status === 'cancelled' && getDeleteInHours(booking) && (
                              <div className="flex items-center gap-2 text-xs text-red-500 mt-2">
                                <AlertCircle className="w-3 h-3" />
                                <span>Zostanie usunięta {getDeleteInHours(booking)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelBooking(booking._id)}
                          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Anuluj
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usuwanie konta */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Niebezpieczna strefa
              </CardTitle>
              <CardDescription>Tej operacji nie można cofnąć</CardDescription>
            </CardHeader>
            <CardContent>
              {!deleteConfirm ? (
                <Button 
                  variant="destructive"
                  onClick={() => setDeleteConfirm(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Usuń konto
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-red-600">Czy na pewno chcesz usunąć konto? Wszystkie dane zostaną trwale usunięte.</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Tak, usuń
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setDeleteConfirm(false)}
                    >
                      Anuluj
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}