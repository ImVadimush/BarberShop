"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Scissors, Sparkles, Radar as Razor, Palette } from "lucide-react"

const services = [
  {
    icon: Scissors,
    title: "Strzyżenie męskie",
    description: "Klasyczne i nowoczesne strzyżenia dopasowane do Twojego stylu",
    price: "od 80 zł",
  },
  {
    icon: Razor,
    title: "Golenie brody",
    description: "Tradycyjne golenie z użyciem gorących ręczników",
    price: "od 60 zł",
  },
  {
    icon: Sparkles,
    title: "Stylizacja",
    description: "Profesjonalna stylizacja włosów i brody",
    price: "od 50 zł",
  },
  {
    icon: Palette,
    title: "Koloryzacja",
    description: "Farbowanie i tonowanie włosów oraz brody",
    price: "od 100 zł",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent font-medium tracking-wider uppercase text-sm">Usługi</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-4 mb-6 text-balance">
            Nasze Usługi
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Kompleksowa oferta usług fryzjerskich dla wymagających mężczyzn
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <motion.div
                    className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4"
                    whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                  >
                    <service.icon className="w-8 h-8 text-accent" />
                  </motion.div>
                  <h3 className="font-semibold text-xl mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed flex-grow">{service.description}</p>
                  <p className="text-accent font-bold text-lg">{service.price}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
