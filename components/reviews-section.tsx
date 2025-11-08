"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useState, useEffect } from "react"

const reviews = [
  {
    id: 1,
    name: "Marcin Kowalski",
    rating: 5,
    comment: "Najlepszy barber shop w mieście! Profesjonalna obsługa i świetna atmosfera. Polecam każdemu!",
    date: "2024-01-15",
  },
  {
    id: 2,
    name: "Tomasz Nowak",
    rating: 5,
    comment: "Jakub to prawdziwy mistrz swojego fachu. Zawsze wychodzę zadowolony z efektu końcowego.",
    date: "2024-01-10",
  },
  {
    id: 3,
    name: "Piotr Wiśniewski",
    rating: 5,
    comment: "Rewelacyjne miejsce! Nowoczesne wnętrze, profesjonalne podejście i świetne ceny.",
    date: "2024-01-05",
  },
  {
    id: 4,
    name: "Adam Lewandowski",
    rating: 5,
    comment: "Chodzę tu od roku i nie zamienię na żaden inny salon. Najlepsi barberzy w okolicy!",
    date: "2023-12-28",
  },
  {
    id: 5,
    name: "Krzysztof Zieliński",
    rating: 5,
    comment: "Perfekcyjne strzyżenie i golenie brody. Michał wie co robi i zawsze doradzi najlepsze rozwiązanie.",
    date: "2023-12-20",
  },
]

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  return (
    <section id="reviews" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent font-medium tracking-wider uppercase text-sm">Opinie</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Co Mówią Nasi Klienci
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Zadowolenie naszych klientów jest dla nas najważniejsze
          </p>
        </motion.div>

        {/* Reviews Carousel */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Card className="border-2">
                <CardContent className="p-8 md:p-12">
                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: reviews[currentIndex].rating }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                      >
                        <Star className="w-6 h-6 fill-accent text-accent" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-center mb-8">
                    <p className="text-xl md:text-2xl text-foreground leading-relaxed text-pretty font-light italic">
                      "{reviews[currentIndex].comment}"
                    </p>
                  </blockquote>

                  {/* Author */}
                  <div className="text-center">
                    <p className="font-semibold text-lg">{reviews[currentIndex].name}</p>
                    <p className="text-muted-foreground text-sm">
                      {new Date(reviews[currentIndex].date).toLocaleDateString("pl-PL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all ${
                  index === currentIndex ? "bg-accent w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-3"
                }`}
                aria-label={`Go to review ${index + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto"
        >
          {[
            { value: "2500+", label: "Zadowolonych klientów" },
            { value: "10+", label: "Lat doświadczenia" },
            { value: "5.0", label: "Średnia ocen" },
            { value: "100%", label: "Satysfakcji" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl md:text-5xl font-bold font-serif text-accent mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
