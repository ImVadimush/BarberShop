"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Lock, AlertCircle, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  const [resetDone, setResetDone] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
    }
  }, [token])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = "Hasło jest wymagane"
    } else if (formData.password.length < 8) {
      newErrors.password = "Hasło musi mieć co najmniej 8 znaków"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Hasło musi zawierać małą literę, dużą literę i cyfrę"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Potwierdzenie hasła jest wymagane"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Hasła nie są identyczne"
    }

    return newErrors
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleChange = (field: string, value: string) => {
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

    const newErrors = validateForm()
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)
    setTouched(allTouched)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Popraw błędy w formularzu",
        description: "Sprawdź wszystkie pola",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResetDone(true)
        toast({
          title: "Hasło zmienione! 🎉",
          description: "Możesz się teraz zalogować",
        })

        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        toast({
          title: "Błąd",
          description: data.error || "Nie udało się zmienić hasła",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić hasła",
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
    <div className="min-h-screen bg-secondary py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Reset hasła
          </h1>
          <p className="text-muted-foreground mt-1">Ustaw nowe hasło do Twojego konta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Nowe hasło
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!tokenValid ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    Brak tokenu resetowania. Sprawdź czy link jest poprawny.
                  </p>
                </div>
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
              </div>
            ) : resetDone ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Hasło zostało zmienione!</p>
                    <p className="text-sm text-green-600 mt-1">Zostaniesz przekierowany za 3 sekundy...</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  Przejdź do logowania
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Nowe hasło
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={getFieldClassName("password")}
                  />
                  {touched.password && errors.password && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Minimum 8 znaków, zawierające małą i dużą literę oraz cyfrę
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Potwierdź hasło
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={getFieldClassName("confirmPassword")}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Zmiana hasła...
                    </span>
                  ) : (
                    "Zmień hasło"
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