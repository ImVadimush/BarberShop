"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, Loader } from "lucide-react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")

      if (!token) {
        setStatus("error")
        setMessage("Brak tokenu weryfikacyjnego")
        return
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage(data.message)
          toast({
            title: "Email zweryfikowany! 🎉",
            description: "Możesz się teraz zalogować",
          })

          setTimeout(() => {
            router.push("/login")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.error || "Nie udało się zweryfikować emaila")
          toast({
            title: "Błąd weryfikacji",
            description: data.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        setStatus("error")
        setMessage("Błąd podczas weryfikacji emaila")
        toast({
          title: "Błąd",
          description: "Nie udało się zweryfikować emaila",
          variant: "destructive",
        })
      }
    }

    verifyEmail()
  }, [searchParams, router, toast])

  return (
    <div className="min-h-screen bg-secondary py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Weryfikacja emaila
          </h1>
          <p className="text-muted-foreground mt-1">Aktywacja Twojego konta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status === "loading" && <Loader className="w-5 h-5 animate-spin text-accent" />}
              {status === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
              {status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
              {status === "loading" && "Weryfikowanie..."}
              {status === "success" && "Email zweryfikowany"}
              {status === "error" && "Błąd weryfikacji"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-foreground">{message}</p>

            {status === "loading" && (
              <p className="text-sm text-muted-foreground">
                Proszę czekać...
              </p>
            )}

            {status === "success" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Zostaniesz przekierowany za 3 sekundy...
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  Przejdź do logowania
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Link weryfikacyjny może być wygasły lub nieprawidłowy.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push("/login")}
                    variant="outline"
                    className="flex-1"
                  >
                    Powrót
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    className="flex-1 bg-accent hover:bg-accent/90"
                  >
                    Do strony głównej
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}