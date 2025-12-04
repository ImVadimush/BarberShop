"use client"

import { motion } from "framer-motion"
import { Award, Clock, Users, Star } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    icon: Award,
    title: "Doświadczenie",
    description: "Ponad 10 lat w branży fryzjerskiej",
  },
  {
    icon: Users,
    title: "Profesjonaliści",
    description: "Zespół wykwalifikowanych barberów",
  },
  {
    icon: Clock,
    title: "Wygoda",
    description: "Elastyczne godziny otwarcia",
  },
  {
    icon: Star,
    title: "Jakość",
    description: "Najwyższej klasy produkty i narzędzia",
  },
]

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
              <motion.img
                src="/professional-barber-cutting-hair-in-modern-salon.jpg"
                alt="Professional barber at work"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Floating Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground p-6 rounded-lg shadow-xl"
            >
              <div className="text-4xl font-bold font-serif mb-1">2500+</div>
              <div className="text-sm font-medium">Zadowolonych klientów</div>
            </motion.div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <span className="text-accent font-medium tracking-wider uppercase text-sm">O nas</span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight text-balance">
              Dlaczego warto nas wybrać?
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">
              Elite Barber Studio to miejsce, gdzie tradycja spotyka się z nowoczesnością. Oferujemy kompleksowe usługi
              fryzjerskie dla mężczyzn, które podkreślą Twój indywidualny styl i charakter.
            </p>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed text-pretty">
              Nasz zespół składa się z pasjonatów, którzy nieustannie podnoszą swoje kwalifikacje, aby zapewnić Ci
              najlepsze doświadczenie i rezultaty.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                      <feature.icon className="w-10 h-10 text-accent mb-4" />
                    </motion.div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
