"use client"

import { Button } from "@/components/ui/button"
import { 
  Scissors, 
  LogOut, 
  Menu, 
  MessageSquare, 
  LayoutDashboard, 
  Calendar, 
  Users,
  Home
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export function AdminHeader() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session")
        setIsAuthenticated(response.ok)
      } catch (error) {
        console.error("[v0] Auth check failed:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      toast({
        title: "Wylogowano",
        description: "Do zobaczenia!",
      })
      router.push("/login")
    } catch (error) {
      console.error("[v0] Logout error:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się wylogować",
        variant: "destructive",
      })
    }
  }

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-accent" />
            <div>
              <h1 className="font-serif text-xl font-bold">Elite Barber</h1>
              <p className="text-xs text-muted-foreground">Panel Administracyjny</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/admin/dashboard")} className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push("/admin/bookings")} className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Rezerwacje
            </Button>
            <Button variant="ghost" onClick={() => router.push("/admin/barbers")} className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Barberzy
            </Button>
            <Button variant="ghost" onClick={() => router.push("/admin/notifications")} className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Wiadomości
            </Button>
            <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Strona główna
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Wyloguj
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/admin/dashboard")} className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/bookings")} className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Rezerwacje
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/barbers")} className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Barberzy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/notifications")} className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Wiadomości
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/")} className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Strona główna
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Wyloguj
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}