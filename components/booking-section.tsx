"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Calendar, Clock, User, Phone, Scissors, AlertCircle, LogIn, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CustomDatePicker } from "./custom-date-picker"
import { CustomTimePicker } from "./custom-time-picker"
import { useRouter } from "next/navigation"

interface Barber {
  _id: string
  name: string
  specialty: string
}

interface LoggedInUser {
  userId: string
  username: string
  email: string
  phone: string
  name: string
  role: string
}

const services = ["Strzyżenie męskie", "Golenie brody", "Stylizacja", "Koloryzacja", "Strzyżenie + Broda"]

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]

export function BookingSection() {
  const { toast } = useToast()
  const router = useRouter()
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(false)
  const [blockedTimes, setBlockedTimes] = useState<string[]>([])
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    barber_id: "",
    service_type: "",
    booking_date: "",
    booking_time: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // ✅ NOWE: Sprawdź zalogowanie przy montowaniu
  useEffect(() => {
    const savedUser = localStorage.getItem('lastLoggedInUser')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setLoggedInUser(userData)
        // Pre-fill dane zalogowanego użytkownika
        setFormData(prev => ({
          ...prev,
          client_name: userData.name,
          client_phone: userData.phone
        }))
      } catch (error) {
        console.error("[v0] Error parsing user data:", error)
      }
    }
  }, [])

  const fetchBarbers = async () => {
    try {
      const response = await fetch("/api/barbers")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setBarbers(data)
    } catch (error) {
      console.error("[v0] Error fetching barbers:", error)
      toast({
        title: "Błąd ładowania",
        description: "Nie udało się załadować listy barberów",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchBarbers()
  }, [])

  useEffect(() => {
    const fetchAvailability = async () => {
      if (formData.barber_id && formData.booking_date) {
        try {
          const response = await fetch(
            `/api/bookings/availability?barber_id=${formData.barber_id}&date=${formData.booking_date}`
          )
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          setBlockedTimes(data.blockedTimes || [])
        } catch (error) {
          console.error("[v0] Error fetching availability:", error)
          setBlockedTimes([])
        }
      } else {
        setBlockedTimes([])
      }
    }

    fetchAvailability()
  }, [formData.barber_id, formData.booking_date])

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const newErrors = validateForm()
      setErrors(newErrors)
    }
  }, [formData, blockedTimes, touched])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.client_name.trim()) {
      newErrors.client_name = "Imię i nazwisko jest wymagane"
    } else if (formData.client_name.trim().length < 2) {
      newErrors.client_name = "Imię i nazwisko musi mieć co najmniej 2 znaki"
    }

    if (!formData.client_phone.trim()) {
      newErrors.client_phone = "Numer telefonu jest wymagany"
    } else {
      const phoneRegex = /^[+]?[\d\s()-]{9,20}$/
      if (!phoneRegex.test(formData.client_phone)) {
        newErrors.client_phone = "Podaj poprawny numer telefonu"
      }
    }

    if (!formData.barber_id) {
      newErrors.barber_id = "Wybierz barbera"
    }

    if (!formData.service_type) {
      newErrors.service_type = "Wybierz usługę"
    }

    if (!formData.booking_date) {
      newErrors.booking_date = "Wybierz datę rezerwacji"
    } else {
      const selectedDate = new Date(formData.booking_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.booking_date = "Data nie może być z przeszłości"
      }
    }

    if (!formData.booking_time) {
      newErrors.booking_time = "Wybierz godzinę rezerwacji"
    } else if (blockedTimes.includes(formData.booking_time)) {
      newErrors.booking_time = "Ten termin jest już zajęty"
    }

    return newErrors
  }

  const isFormComplete = () => {
    return (
      formData.client_name?.trim() !== "" &&
      formData.client_phone?.trim() !== "" &&
      formData.barber_id !== "" &&
      formData.service_type !== "" &&
      formData.booking_date !== "" &&
      formData.booking_time !== "" &&
      !blockedTimes.includes(formData.booking_time)
    )
  }

  const canSubmit = isFormComplete() && Object.keys(errors).length === 0

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ✅ NOWE: Sprawdź zalogowanie
    if (!loggedInUser) {
      setShowLoginModal(true)
      return
    }
    
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)
    setTouched(allTouched)

    const newErrors = validateForm()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Popraw błędy w formularzu",
        description: "Sprawdź wszystkie pola i popraw oznaczone na czerwono",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const bookingDateObj = new Date(formData.booking_date)
      const isoDate = bookingDateObj.toISOString().split('T')[0]

      // ✅ NAPRAWIONO: Pobierz userId z API
      let userId = null
      if (loggedInUser?.username) {
        try {
          const userResponse = await fetch(`/api/users/me?username=${loggedInUser.username}`)
          if (userResponse.ok) {
            const userData = await userResponse.json()
            userId = userData.userId
          }
        } catch (error) {
          console.error("[v0] Error fetching userId:", error)
        }
      }

      const payload = {
        client_name: formData.client_name.trim(),
        client_phone: formData.client_phone.trim(),
        barber_id: formData.barber_id,
        service_type: formData.service_type,
        booking_date: isoDate,
        booking_time: formData.booking_time,
        notes: formData.notes.trim(),
        user_id: userId, // ✅ userId z API
      }

      console.log("[v0] Sending payload:", JSON.stringify(payload, null, 2))

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response data:", JSON.stringify(responseData, null, 2))

      if (response.ok) {
        toast({
          title: "Rezerwacja potwierdzona! 🎉",
          description: "Skontaktujemy się z Tobą wkrótce.",
        })
        setFormData({
          client_name: loggedInUser.name,
          client_phone: loggedInUser.phone,
          barber_id: "",
          service_type: "",
          booking_date: "",
          booking_time: "",
          notes: "",
        })
        setTouched({})
        setErrors({})
        setBlockedTimes([])
      } else {
        console.error("[v0] Booking failed with status:", response.status)
        console.error("[v0] Booking failed with details:", responseData)
        
        let errorMessage = "Nie udało się utworzyć rezerwacji"
        
        if (responseData?.error) {
          errorMessage = responseData.error
        } else if (responseData?.message) {
          errorMessage = responseData.message
        }

        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("[v0] Error creating booking:", error)
      toast({
        title: "Błąd rezerwacji",
        description: error instanceof Error ? error.message : "Nie udało się utworzyć rezerwacji. Spróbuj ponownie.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getFieldClassName = (fieldName: string) => {
    return touched[fieldName] && errors[fieldName] ? "border-red-500 focus:border-red-500" : ""
  }

  return (
    <>
      {/* ✅ NOWE: Modal logowania */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Wymagane logowanie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Aby zarezerwować wizytę, musisz być zalogowany na swoje konto.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push("/login")}
                  className="flex-1 bg-accent hover:bg-accent/90"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Zaloguj się
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1"
                >
                  Anuluj
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <section id="booking" className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <span className="text-accent font-medium tracking-wider uppercase text-sm">Rezerwacja</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
                Umów Wizytę
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">
                Zarezerwuj termin online i ciesz się profesjonalną obsługą w naszym salonie. Wybierz swojego ulubionego
                barbera i usługę, a my zadbamy o resztę.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Elastyczne terminy</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Dostępność od poniedziałku do soboty, 9:00 - 20:00
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Szybka obsługa</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Punktualność i profesjonalizm w każdej wizycie
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Scissors className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Najwyższa jakość</h3>
                    <p className="text-muted-foreground leading-relaxed">Premium produkty i profesjonalne narzędzia</p>
                  </div>
                </div>
              </div>

              {/* ✅ NOWE: Pokaż informację czy zalogowany */}
              {loggedInUser && (
                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>✓ Zalogowany jako:</strong> {loggedInUser.name}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Right Column - Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">Formularz rezerwacji</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Imię i nazwisko */}
                    <div className="space-y-2">
                      <Label htmlFor="client_name">
                        <User className="w-4 h-4 inline mr-2" />
                        Imię i nazwisko *
                      </Label>
                      <Input
                        id="client_name"
                        placeholder="Jan Kowalski"
                        value={formData.client_name}
                        onChange={(e) => handleInputChange("client_name", e.target.value)}
                        onBlur={() => handleBlur("client_name")}
                        className={getFieldClassName("client_name")}
                        disabled={!!loggedInUser} // ✅ NOWE: Zablokuj pole jeśli zalogowany
                        required
                      />
                      {touched.client_name && errors.client_name && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {errors.client_name}
                        </div>
                      )}
                    </div>

                    {/* Numer telefonu */}
                    <div className="space-y-2">
                      <Label htmlFor="client_phone">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Numer telefonu *
                      </Label>
                      <Input
                        id="client_phone"
                        type="tel"
                        placeholder="+48 123 456 789"
                        value={formData.client_phone}
                        onChange={(e) => handleInputChange("client_phone", e.target.value)}
                        onBlur={() => handleBlur("client_phone")}
                        className={getFieldClassName("client_phone")}
                        disabled={!!loggedInUser} // ✅ NOWE: Zablokuj pole jeśli zalogowany
                        required
                      />
                      {touched.client_phone && errors.client_phone && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {errors.client_phone}
                        </div>
                      )}
                    </div>

                    {/* Barber i usługa */}
                    <div className="flex sm:flex-row flex-col gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="barber_id">Wybierz barbera *</Label>
                        <Select
                          value={formData.barber_id}
                          onValueChange={(value) => handleSelectChange("barber_id", value)}
                          required
                        >
                          <SelectTrigger 
                            id="barber_id" 
                            className={getFieldClassName("barber_id")}
                          >
                            <SelectValue placeholder="Wybierz barbera" />
                          </SelectTrigger>
                          <SelectContent>
                            {barbers.map((barber) => (
                              <SelectItem key={barber._id} value={barber._id}>
                                {barber.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {touched.barber_id && errors.barber_id && (
                          <div className="flex items-center gap-1 text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.barber_id}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <Label htmlFor="service_type">Rodzaj usługi *</Label>
                        <Select
                          value={formData.service_type}
                          onValueChange={(value) => handleSelectChange("service_type", value)}
                          required
                        >
                          <SelectTrigger 
                            id="service_type" 
                            className={getFieldClassName("service_type")}
                          >
                            <SelectValue placeholder="Wybierz usługę" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service} value={service}>
                                {service}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {touched.service_type && errors.service_type && (
                          <div className="flex items-center gap-1 text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.service_type}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Data i godzina */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="booking_date">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Data *
                        </Label>
                        <div className={getFieldClassName("booking_date")}>
                          <CustomDatePicker
                            value={formData.booking_date}
                            onChange={(date) => handleInputChange("booking_date", date)}
                            onBlur={() => handleBlur("booking_date")}
                            minDate={new Date()}
                          />
                        </div>
                        {touched.booking_date && errors.booking_date && (
                          <div className="flex items-center gap-1 text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.booking_date}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="booking_time">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Godzina *
                        </Label>
                        <div className={getFieldClassName("booking_time")}>
                          <CustomTimePicker
                            value={formData.booking_time}
                            onChange={(time) => handleInputChange("booking_time", time)}
                            onBlur={() => handleBlur("booking_time")}
                            availableTimes={timeSlots}
                            disabledTimes={blockedTimes}
                          />
                        </div>
                        {touched.booking_time && errors.booking_time && (
                          <div className="flex items-center gap-1 text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {errors.booking_time}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dodatkowe uwagi */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Dodatkowe uwagi (opcjonalnie)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Dodatkowe informacje..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>

                    {/* Przycisk submit */}
                    <Button
                      type="submit"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300"
                      size="lg"
                      disabled={loading || !canSubmit}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Rezerwowanie...
                        </span>
                      ) : (
                        "Zarezerwuj wizytę"
                      )}
                    </Button>

                    {/* Komunikat o wymaganych polach */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        * Pola oznaczone gwiazdką są wymagane
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}