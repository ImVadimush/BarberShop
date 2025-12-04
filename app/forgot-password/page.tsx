"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail, AlertCircle, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState("")

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email jest wymagany")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Podaj poprawny adres email")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateEmail()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      // ✅ Security: Zawsze pokazujemy ten sam komunikat
      setEmailSent(true)
      toast({
        title: "Email wysłany",
        description: "Jeśli email istnieje w systemie, otrzymasz link do resetowania hasła",
      })

      // Przekieruj po 3 sekundach
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać emaila",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Resetowanie hasła
          </h1>
          <p className="text-muted-foreground mt-1">Odzyskaj dostęp do Twojego konta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Wpisz swój email
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Email wysłany!</p>
                    <p className="text-sm text-green-600 mt-1">
                      Jeśli email istnieje w systemie, otrzymasz link do resetowania hasła.
                    </p>
                    <p className="text-xs text-green-600 mt-2">Zostaniesz przekierowany za 3 sekundy...</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  Powrót do logowania
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    className={error ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {error && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Wyślemy Ci link do resetowania hasła
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Wysyłanie...
                    </span>
                  ) : (
                    "Wyślij link resetujący"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Powrót do logowania
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}