"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface Barber {
  _id: string
  name: string
  specialty: string
  image_url: string
  bio: string
  experience_years: number
}

export function BarbersSection() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/barbers")
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "Failed to fetch barbers")
        }
        return res.json()
      })
      .then((data) => {
        setBarbers(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error fetching barbers:", error)
        setError(error.message)
        setLoading(false)
      })
  }, [])

  return (
    <section id="barbers" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent font-medium tracking-wider uppercase text-sm">Nasz zespół</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Poznaj Naszych Barberów
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Profesjonaliści z pasją do swojego rzemiosła, gotowi zadbać o Twój wyjątkowy styl
          </p>
        </motion.div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-8 text-center">
            <p className="font-medium">Błąd ładowania barberów</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-sm mt-2 text-muted-foreground">
              Upewnij się, że baza danych MongoDB jest poprawnie skonfigurowana i zawiera dane barberów.
            </p>
          </div>
        )}

        {/* Barbers Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-80 rounded-lg mb-4" />
                <div className="bg-muted h-6 rounded w-3/4 mb-2" />
                <div className="bg-muted h-4 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {barbers.map((barber, index) => (
              <motion.div
                key={barber._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="flex flex-col h-full"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow group flex flex-col h-full p-0">
                  {/* Fixed image container with centered face */}
                  <div className="relative h-80 overflow-hidden bg-black flex-shrink-0">
                    <motion.img
                      src={barber.image_url || "/placeholder.svg?height=400&width=400&query=professional+barber"}
                      alt={barber.name}
                      className="w-full h-full object-cover object-center"
                      style={{ objectPosition: "50% 0%" }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground z-10">
                      {barber.experience_years} lat doświadczenia
                    </Badge>
                  </div>
                  
                  {/* Card content with proper padding */}
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <h3 className="font-serif text-2xl font-bold mb-2">{barber.name}</h3>
                    <p className="text-accent font-medium mb-3">{barber.specialty}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-grow">{barber.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}