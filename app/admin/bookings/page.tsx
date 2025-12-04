"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2, Calendar, Phone, User, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Booking {
  _id: string
  client_name: string
  client_phone: string
  barber_id: string
  barber_name: string
  service_type: string
  booking_date: string
  booking_time: string
  status: string
  notes: string
  created_at: string
}

interface Barber {
  _id: string
  name: string
}

export default function BookingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialog, setEditDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    barber_id: "",
    service_type: "",
    booking_date: "",
    booking_time: "",
    status: "pending",
    notes: "",
  })

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error("[v0] Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBarbers = async () => {
    try {
      const response = await fetch("/api/barbers")
      const data = await response.json()
      setBarbers(data)
    } catch (error) {
      console.error("[v0] Error fetching barbers:", error)
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchBarbers()
  }, [])

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking)
    setFormData({
      client_name: booking.client_name,
      client_phone: booking.client_phone,
      barber_id: booking.barber_id,
      service_type: booking.service_type,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      status: booking.status,
      notes: booking.notes || "",
    })
    setEditDialog(true)
  }

  const handleUpdate = async () => {
    if (!selectedBooking) return

    try {
      const response = await fetch(`/api/bookings/${selectedBooking._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Zaktualizowano",
          description: "Rezerwacja została zaktualizowana",
        })
        setEditDialog(false)
        fetchBookings()
      }
    } catch (error) {
      console.error("[v0] Error updating booking:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować rezerwacji",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedBooking) return

    try {
      const response = await fetch(`/api/bookings/${selectedBooking._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Usunięto",
          description: "Rezerwacja została usunięta",
        })
        setDeleteDialog(false)
        fetchBookings()
      }
    } catch (error) {
      console.error("[v0] Error deleting booking:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć rezerwacji",
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/admin/dashboard")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Powrót do panelu admina
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold mb-2">Zarządzanie rezerwacjami</h1>
        <p className="text-muted-foreground">Przeglądaj i zarządzaj wszystkimi rezerwacjami</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Lista rezerwacji</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Ładowanie...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Brak rezerwacji</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Klient</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Barber</TableHead>
                    <TableHead>Usługa</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Godzina</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.client_name}</TableCell>
                      <TableCell>{booking.client_phone}</TableCell>
                      <TableCell>{booking.barber_name}</TableCell>
                      <TableCell>{booking.service_type}</TableCell>
                      <TableCell>{new Date(booking.booking_date).toLocaleDateString("pl-PL")}</TableCell>
                      <TableCell>{booking.booking_time}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(booking)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Edytuj rezerwację</DialogTitle>
            <DialogDescription>Zaktualizuj szczegóły rezerwacji</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-client-name">
                  <User className="w-4 h-4 inline mr-2" />
                  Imię i nazwisko
                </Label>
                <Input
                  id="edit-client-name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-client-phone">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefon
                </Label>
                <Input
                  id="edit-client-phone"
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-barber">Barber</Label>
              <Select
                value={formData.barber_id}
                onValueChange={(value) => setFormData({ ...formData, barber_id: value })}
              >
                <SelectTrigger id="edit-barber">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber._id} value={barber._id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-service">Usługa</Label>
              <Input
                id="edit-service"
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Data
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.booking_date}
                  onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-time">Godzina</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.booking_time}
                  onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Oczekujące</SelectItem>
                  <SelectItem value="confirmed">Potwierdzone</SelectItem>
                  <SelectItem value="cancelled">Anulowane</SelectItem>
                  <SelectItem value="completed">Zakończone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Anuluj
            </Button>
            <Button onClick={handleUpdate} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Potwierdź usunięcie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć tę rezerwację? Ta akcja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
