"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Scissors, User, Calendar, Menu, X, Home } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [loggedInUser, setLoggedInUser] = useState<{ username: string; name: string } | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  const navigation = [
    { name: "O Nas", href: "#about" },
    { name: "Usługi", href: "#services" },
    { name: "Barberzy", href: "#barbers" },
    { name: "Opinie", href: "#reviews" },
  ]

  // ✅ Sprawdź zalogowanie
  useEffect(() => {
    const savedUser = localStorage.getItem('lastLoggedInUser')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setLoggedInUser({ username: userData.username, name: userData.name })
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setIsScrolled(currentScrollY > 20)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const handleMobileLinkClick = () => {
    setIsMenuOpen(false)
  }

  const getLinkHref = (href: string) => {
    return isHomePage ? href : `/${href}`
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    } ${
      isScrolled 
        ? "bg-black/70 backdrop-blur-md shadow-xl" 
        : "bg-black/60 backdrop-blur-sm"
    }`}>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <Scissors className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="absolute -inset-2 bg-accent/20 rounded-full blur-md group-hover:blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="text-white">
              <h1 className="font-serif text-2xl font-bold">
                Elite Barber
              </h1>
              <p className="text-xs text-white/70 font-medium tracking-wider">
                PROFESSIONAL STUDIO
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={getLinkHref(item.href)}
                className="relative text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide py-2 group"
              >
                <motion.span
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="block"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-accent/60 transition-all duration-300 group-hover:w-full" />
                </motion.span>
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loggedInUser ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => router.push(`/client/${loggedInUser.username}`)}
                  className="bg-gradient-to-r from-accent to-accent/80 text-white hover:from-accent hover:to-accent/90 flex items-center gap-2 rounded-lg px-5 py-2 shadow-lg hover:shadow-xl transition-all duration-300 border-0 font-medium"
                >
                  <User className="w-4 h-4" />
                  Moje konto
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-accent to-accent/80 text-white hover:from-accent hover:to-accent/90 flex items-center gap-2 rounded-lg px-5 py-2 shadow-lg hover:shadow-xl transition-all duration-300 border-0 font-medium"
                >
                  <User className="w-4 h-4" />
                  Konto
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden pb-6"
            >
              <div className="border-t border-white/10 bg-black/70 backdrop-blur-md pt-6">
                <div className="flex flex-col gap-4">
                  {navigation.map((item, index) => (
                    <Link
                      key={item.name}
                      href={getLinkHref(item.href)}
                      onClick={handleMobileLinkClick}
                      className="text-white/80 hover:text-white transition-colors font-medium py-3 text-left border-b border-white/10 last:border-b-0"
                    >
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="block"
                      >
                        {item.name}
                      </motion.span>
                    </Link>
                  ))}
                  
                  <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                    {loggedInUser ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button 
                          onClick={() => {
                            router.push(`/client/${loggedInUser.username}`)
                            setIsMenuOpen(false)
                          }}
                          className="bg-gradient-to-r from-accent to-accent/80 text-white hover:from-accent hover:to-accent/90 flex items-center gap-2 w-full justify-center border-0 font-medium"
                        >
                          <User className="w-4 h-4" />
                          Moje konto
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button 
                          onClick={() => {
                            router.push("/login")
                            setIsMenuOpen(false)
                          }}
                          className="bg-gradient-to-r from-accent to-accent/80 text-white hover:from-accent hover:to-accent/90 flex items-center gap-2 w-full justify-center border-0 font-medium"
                        >
                          <User className="w-4 h-4" />
                          Konto
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header> 
  )
}