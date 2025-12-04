"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { CheckCircle, Clock, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
  _id: string
  title: string
  content: string
  barber_name: string
  status: 'sent' | 'read'
  created_at: string
}

export default function BarberMessagesPage({ params }: { params: Promise<{ username: string }> }) {
  const [username, setUsername] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
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

    fetchMessages()
  }, [username])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/barber-page/${username}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        
        // Automatycznie oznacz nieprzeczytane wiadomości jako przeczytane
        markUnreadAsRead(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const markUnreadAsRead = async (messages: Message[]) => {
    const unreadMessages = messages.filter(msg => msg.status === 'sent')
    
    for (const message of unreadMessages) {
      try {
        await fetch(`/api/barber-page/${username}/messages/${message._id}`, {
          method: 'PATCH'
        })
      } catch (error) {
        console.error("Error marking message as read:", error)
      }
    }
    
    // Refresh messages to show updated status
    if (unreadMessages.length > 0) {
      setTimeout(fetchMessages, 500)
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
          <h1 className="font-serif text-3xl font-bold mb-2">Moje wiadomości</h1>
          <p className="text-muted-foreground">Wiadomości od administratora</p>
        </div>
        <Button 
          onClick={() => router.push(`/barber/${username}`)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót do dashboardu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Otrzymane wiadomości</CardTitle>
          <CardDescription>
            Przeglądaj wiadomości od administratora salonu
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
              <p>Brak wiadomości</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message._id} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{message.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Od: Administrator • {formatDate(message.created_at)}
                      </p>
                    </div>
                    <Badge variant={message.status === 'read' ? 'default' : 'secondary'} className="flex items-center gap-1">
                      {message.status === 'read' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {message.status === 'read' ? 'Przeczytane' : 'Nowa'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}