"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Scissors, Lock, User, Mail, Phone, UserPlus, LogIn, AlertCircle, Home, ArrowLeft } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [countdown, setCountdown] = useState(0)
  
  const [loginData, setLoginData] = useState({
    usernameOrEmail: "",
    password: "",
  })

  const [loginError, setLoginError] = useState("")

  const [registerData, setRegisterData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "client"
  })

  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState("")

  // ✅ ZMIENIONE: Stan dla weryfikacji kodu - teraz pojawia się po rejestracji
  const [showVerification, setShowVerification] = useState(false)
  const [registrationEmail, setRegistrationEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationError, setVerificationError] = useState("")

  // ZAPAMIĘTYWANIE KONTA - sprawdź localStorage przy ładowaniu
  useEffect(() => {
    const savedUser = localStorage.getItem('lastLoggedInUser')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setLoginData({
          usernameOrEmail: userData.username,
          password: ""
        })
      } catch (error) {
        localStorage.removeItem('lastLoggedInUser')
      }
    }
  }, [])

  // Counter dla przycisku powrotu
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Automatyczne generowanie username z imienia i nazwiska
  useEffect(() => {
    if (registerData.name.trim() && !showVerification) {
      const generatedUsername = registerData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      setRegisterData(prev => ({ ...prev, username: generatedUsername }))
    }
  }, [registerData.name, showVerification])

  // Walidacja formularza rejestracji
  const validateRegisterForm = () => {
    const errors: Record<string, string> = {}

    if (!registerData.name.trim()) {
      errors.name = "Imię i nazwisko jest wymagane"
    } else if (registerData.name.trim().length < 2) {
      errors.name = "Imię i nazwisko musi mieć co najmniej 2 znaki"
    }

    if (!registerData.email.trim()) {
      errors.email = "Email jest wymagany"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      errors.email = "Podaj poprawny adres email"
    }

    if (!registerData.phone.trim()) {
      errors.phone = "Numer telefonu jest wymagany"
    } else if (!/^[+]?[\d\s()-]{9,20}$/.test(registerData.phone)) {
      errors.phone = "Podaj poprawny numer telefonu"
    }

    if (!registerData.password) {
      errors.password = "Hasło jest wymagane"
    } else if (registerData.password.length < 8) {
      errors.password = "Hasło musi mieć co najmniej 8 znaków"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerData.password)) {
      errors.password = "Hasło musi zawierać małą literę, dużą literę i cyfrę"
    }

    if (!registerData.confirmPassword) {
      errors.confirmPassword = "Potwierdzenie hasła jest wymagane"
    } else if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = "Hasła nie są identyczne"
    }

    return errors
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError("")

    try {
      console.log("🟡 [LOGIN] Attempting login with:", loginData.usernameOrEmail)
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginData.usernameOrEmail,
          email: loginData.usernameOrEmail,
          password: loginData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // ✅ Sprawdź czy konto jest aktywne
        if (!data.user.isActive) {
          setLoginError("Konto nie zostało aktywowane. Sprawdź email.")
          toast({
            title: "Konto nieaktywne",
            description: "Potwierdź email aby się zalogować",
            variant: "destructive"
          })
          return
        }

        // Zapisz dane użytkownika
        localStorage.setItem('lastLoggedInUser', JSON.stringify({
          username: data.user.username,
          email: data.user.email,
          phone: data.user.phone,
          name: data.user.name,
          role: data.user.role
        }))
        
        toast({
          title: "Zalogowano pomyślnie! 🎉",
          description: `Witaj ${data.user.name}!`,
        })
        
        if (data.redirectTo) {
          router.push(data.redirectTo)
        } else {
          if (data.user.role === "admin") {
            router.push("/admin/dashboard")
          } else if (data.user.role === "barber") {
            router.push(`/barber/${data.user.username}`)
          } else {
            router.push(`/client/${data.user.username}`)
          }
        }
      } else {
        setLoginError(data.error || "Nieprawidłowe dane logowania")
        toast({
          title: "Błąd logowania",
          description: data.error || "Nieprawidłowe dane logowania",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("🔴 [LOGIN] Error:", error)
      setLoginError("Wystąpił błąd podczas logowania")
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas logowania",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  setApiError("")
  
  const errors = validateRegisterForm()
  setRegisterErrors(errors)

  if (Object.keys(errors).length > 0) {
    toast({
      title: "Popraw błędy w formularzu",
      description: "Sprawdź wszystkie pola i popraw oznaczone na czerwono",
      variant: "destructive",
    })
    return
  }

  setLoading(true)

  try {
    console.log("🟡 [REGISTER] Registering user:", registerData.username)
    console.log("🟡 [REGISTER] Sending data:", {
      name: registerData.name,
      username: registerData.username,
      email: registerData.email,
      phone: registerData.phone,
      role: "client"
    })
    
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: registerData.name,
        username: registerData.username,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
        role: "client"
      }),
    })

    const data = await response.json()
    console.log("🟡 [REGISTER] Response:", data)

    if (response.ok) {
      // ✅ Pokaż panel weryfikacji
      setRegistrationEmail(registerData.email)
      setVerificationCode("")
      setVerificationError("")
      setShowVerification(true)
      
      // ✅ W trybie development pokaż token w konsoli i toascie
      if (data.debug_token) {
        console.log("🟢 [DEV] Verification token:", data.debug_token)
        toast({
          title: "Konto utworzone! 🎉",
          description: `DEV MODE: Twój kod: ${data.debug_token}`,
        })
      } else {
        toast({
          title: "Konto utworzone! 🎉",
          description: "Wysłaliśmy kod na Twój email",
        })
      }
      
      setApiError("")
    } else {
      setApiError(data.error || "Nie udało się utworzyć konta")
      toast({
        title: "Błąd rejestracji",
        description: data.error || "Nie udało się utworzyć konta",
        variant: "destructive",
      })
    }
  } catch (error) {
    console.error("🔴 [REGISTER] Error:", error)
    setApiError("Wystąpił błąd podczas rejestracji")
    toast({
      title: "Błąd",
      description: "Wystąpił błąd podczas rejestracji",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

  // Handler weryfikacji kodu
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setVerificationError("")

    try {
      console.log("🔵 [VERIFY] Verifying code for:", registrationEmail)
      
      const response = await fetch("/api/auth/verify-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registrationEmail,
          code: verificationCode
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Email zweryfikowany! 🎉",
          description: "Możesz się teraz zalogować"
        })
        
        // Resetuj wszystko i przejdź do logowania
        setRegisterData({
          name: "",
          username: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          role: "client"
        })
        setRegisterErrors({})
        setShowVerification(false)
        setVerificationCode("")
        setRegistrationEmail("")
        
        // Przełącz na login z email'em prefilled
        setLoginData({
          usernameOrEmail: data.user?.email || registrationEmail,
          password: ""
        })
        setActiveTab("login")
      } else {
        setVerificationError(data.error || "Nieprawidłowy kod")
        toast({
          title: "Błąd weryfikacji",
          description: data.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("🔴 [VERIFY] Error:", error)
      setVerificationError("Błąd podczas weryfikacji")
      toast({
        title: "Błąd",
        description: "Błąd podczas weryfikacji",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // ✅ NOWE: Funkcja do powrotu do formularza rejestracji
  const handleBackToRegister = () => {
    setShowVerification(false)
    setVerificationCode("")
    setVerificationError("")
  }

  const handleBackToHome = () => {
    setCountdown(3)
    setTimeout(() => {
      router.push("/")
    }, 3000)
  }

  const getFieldClassName = (fieldName: string) => {
    return registerErrors[fieldName] ? "border-red-500 focus:border-red-500" : ""
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Scissors className="w-10 h-10 text-accent" />
            <span className="font-serif text-3xl font-bold">Elite Barber</span>
          </div>
          <p className="text-muted-foreground">Panel Dostępu</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-center">
              {showVerification 
                ? "Potwierdzenie Emaila" 
                : activeTab === "login" 
                  ? "Logowanie" 
                  : "Rejestracja"
              }
            </CardTitle>
            <CardDescription className="text-center">
              {showVerification
                ? "Wpisz kod z emaila"
                : activeTab === "login" 
                  ? "Wprowadź swoje dane aby uzyskać dostęp" 
                  : "Utwórz nowe konto"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* ===== WERYFIKACJA EMAILA ===== */}
            {showVerification ? (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={handleBackToRegister}
                  className="mb-2 -ml-2"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Wróć do rejestracji
                </Button>

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  {verificationError && (
                    <Alert variant="destructive">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        {verificationError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="verify-code">
                      Kod weryfikacyjny
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Wysłaliśmy 6-cyfrowy kod na adres <strong>{registrationEmail}</strong>
                    </p>
                    <Input
                      id="verify-code"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                        setVerificationCode(value)
                        setVerificationError("")
                      }}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-mono"
                      required
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Kod ważny przez 15 minut
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    size="lg"
                    disabled={loading || verificationCode.length !== 6}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Weryfikowanie...
                      </span>
                    ) : (
                      "Potwierdź kod"
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              /* ===== TABY LOGOWANIA/REJESTRACJI ===== */
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Logowanie</TabsTrigger>
                  <TabsTrigger value="register">Rejestracja</TabsTrigger>
                </TabsList>

                {/* ===== TAB: LOGOWANIE ===== */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {loginError && (
                      <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          {loginError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="login-username">
                        <User className="w-4 h-4 inline mr-2" />
                        Nazwa użytkownika lub Email
                      </Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Login lub email"
                        value={loginData.usernameOrEmail}
                        onChange={(e) => {
                          setLoginData({ ...loginData, usernameOrEmail: e.target.value })
                          setLoginError("")
                        }}
                        required
                        autoComplete="username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Hasło
                      </Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => {
                          setLoginData({ ...loginData, password: e.target.value })
                          setLoginError("")
                        }}
                        required
                        autoComplete="current-password"
                      />
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => router.push("/forgot-password")}
                          className="text-xs text-accent hover:text-accent/80 transition-colors"
                        >
                          Zapomniałeś hasła?
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      size="lg"
                      disabled={loading}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Logowanie...
                        </span>
                      ) : (
                        "Zaloguj się"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* ===== TAB: REJESTRACJA ===== */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {apiError && (
                      <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          {apiError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="register-name">
                        <User className="w-4 h-4 inline mr-2" />
                        Imię i nazwisko *
                      </Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Jan Kowalski"
                        value={registerData.name}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, name: e.target.value })
                          if (registerErrors.name) {
                            setRegisterErrors(prev => ({ ...prev, name: "" }))
                          }
                          setApiError("")
                        }}
                        className={getFieldClassName("name")}
                        required
                      />
                      {registerErrors.name && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {registerErrors.name}
                        </div>
                      )}
                    </div>

                    <input
                      type="hidden"
                      name="username"
                      value={registerData.username}
                      required
                    />

                    <div className="space-y-2">
                      <Label htmlFor="register-email">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email *
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="jan@example.com"
                        value={registerData.email}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, email: e.target.value })
                          if (registerErrors.email) {
                            setRegisterErrors(prev => ({ ...prev, email: "" }))
                          }
                          setApiError("")
                        }}
                        className={getFieldClassName("email")}
                        required
                      />
                      {registerErrors.email && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {registerErrors.email}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-phone">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Numer telefonu *
                      </Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="+48 123 456 789"
                        value={registerData.phone}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, phone: e.target.value })
                          if (registerErrors.phone) {
                            setRegisterErrors(prev => ({ ...prev, phone: "" }))
                          }
                          setApiError("")
                        }}
                        className={getFieldClassName("phone")}
                        required
                      />
                      {registerErrors.phone && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {registerErrors.phone}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Hasło *
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, password: e.target.value })
                          if (registerErrors.password) {
                            setRegisterErrors(prev => ({ ...prev, password: "" }))
                          }
                          setApiError("")
                        }}
                        className={getFieldClassName("password")}
                        required
                      />
                      {registerErrors.password && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {registerErrors.password}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Hasło musi mieć co najmniej 8 znaków, zawierać małą literę, dużą literę i cyfrę
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">
                        <Lock className="w-4 h-4 inline mr-2" />
                        Potwierdź hasło *
                      </Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.confirmPassword}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, confirmPassword: e.target.value })
                          if (registerErrors.confirmPassword) {
                            setRegisterErrors(prev => ({ ...prev, confirmPassword: "" }))
                          }
                          setApiError("")
                        }}
                        className={getFieldClassName("confirmPassword")}
                        required
                      />
                      {registerErrors.confirmPassword && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {registerErrors.confirmPassword}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      size="lg"
                      disabled={loading}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Tworzenie konta...
                        </span>
                      ) : (
                        "Utwórz konto"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className={`transition-all duration-300 ${
              countdown > 0 
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            disabled={countdown > 0}
          >
            <Home className="w-4 h-4 mr-2" />
            {countdown > 0 ? `Powrót za ${countdown}s...` : "Powrót do strony głównej"}
          </Button>
        </div>
      </div>
    </div>
  )
}