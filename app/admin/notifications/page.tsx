"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Send, User, Calendar, Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Barber {
  _id: string
  name: string
  username: string
}

interface Message {
  _id: string
  title: string
  content: string
  barber_id: string
  barber_name: string
  status: 'sent' | 'read'
  created_at: string
}

export default function AdminNotificationsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  const [formData, setFormData] = useState({
    barber_id: "",
    title: "",
    content: ""
  })

  useEffect(() => {
    fetchBarbers()
    fetchMessages()
  }, [])

  const fetchBarbers = async () => {
    try {
      const response = await fetch("/api/barbers")
      if (response.ok) {
        const data = await response.json()
        setBarbers(data)
      }
    } catch (error) {
      console.error("Error fetching barbers:", error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/admin/messages")
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Wiadomość wysłana",
          description: "Wiadomość została pomyślnie wysłana do barbera",
        })
        setFormData({ barber_id: "", title: "", content: "" })
        fetchMessages() // Refresh messages list
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać wiadomości",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header z przyciskiem powrotu */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">Wiadomości</h1>
          <p className="text-muted-foreground">Wyślij wiadomości do barberów i śledź ich status</p>
        </div>
        <Button 
          onClick={() => router.push("/admin/dashboard")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót do dashboardu
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Send Message Form */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Wyślij wiadomość</CardTitle>
            <CardDescription>
              Wybierz barbera i napisz wiadomość
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barber">Wybierz barbera</Label>
                <Select value={formData.barber_id} onValueChange={(value) => setFormData({...formData, barber_id: value})}>
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Tytuł wiadomości</Label>
                <Input
                  id="title"
                  placeholder="Wprowadź tytuł wiadomości"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Treść wiadomości</Label>
                <Textarea
                  id="content"
                  placeholder="Napisz wiadomość do barbera..."
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={sending || !formData.barber_id || !formData.title || !formData.content}
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Wysyłanie..." : "Wyślij wiadomość"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Messages History */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Historia wiadomości</CardTitle>
            <CardDescription>
              Ostatnie wiadomości wysłane do barberów
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted h-20 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Brak wysłanych wiadomości</p>
                <Button 
                  onClick={() => router.push("/admin/dashboard")}
                  variant="outline"
                  className="mt-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Powrót do dashboardu
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{message.title}</h3>
                        <p className="text-sm text-muted-foreground">Do: {message.barber_name}</p>
                      </div>
                      <Badge variant={message.status === 'read' ? 'default' : 'secondary'}>
                        {message.status === 'read' ? 'Przeczytane' : 'Wysłane'}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{message.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(message.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}