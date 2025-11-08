import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { BarbersSection } from "@/components/barbers-section"
import { ServicesSection } from "@/components/services-section"
import { BookingSection } from "@/components/booking-section"
import { ReviewsSection } from "@/components/reviews-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main>
      <Header />
      <div id="home">
        <HeroSection />
      </div>
      <div id="about">
        <AboutSection />
      </div>
      <div id="services">
        <ServicesSection />
      </div>
      <div id="barbers">
        <BarbersSection />
      </div>
      <div id="booking">
        <BookingSection />
      </div>
      <div id="reviews">
        <ReviewsSection />
      </div>
      <Footer />
    </main>
  )
}