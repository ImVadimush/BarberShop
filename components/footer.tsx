import { Scissors, MapPin, Phone, Mail, Clock, Facebook, Instagram } from "lucide-react"
import Link from "next/link"

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

export function Footer() {
  const contactInfo = {
    address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "ul. Przykładowa 123, 00-001 Warszawa",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+48 123 456 789",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "kontakt@elitebarber.pl",
    hoursWeekday: process.env.NEXT_PUBLIC_HOURS_WEEKDAY || "9:00 - 20:00",
    hoursSaturday: process.env.NEXT_PUBLIC_HOURS_SATURDAY || "10:00 - 18:00",
    hoursSunday: process.env.NEXT_PUBLIC_HOURS_SUNDAY || "Nieczynne",
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="w-8 h-8 text-accent" />
              <span className="font-serif text-2xl font-bold">Elite Barber</span>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed mb-6">
              Profesjonalny salon fryzjerski oferujący najwyższej jakości usługi dla wymagających mężczyzn.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-accent/10 hover:bg-accent rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-accent/10 hover:bg-accent rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-accent/10 hover:bg-accent rounded-full flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Szybkie linki</h3>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  O nas
                </a>
              </li>
              <li>
                <a href="#services" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Usługi
                </a>
              </li>
              <li>
                <a href="#barbers" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Nasz zespół
                </a>
              </li>
              <li>
                <a href="#booking" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Rezerwacja
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontakt</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80">
                  {contactInfo.address.split(", ")[0]}
                  <br />
                  {contactInfo.address.split(", ")[1]}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                  className="text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  {contactInfo.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Godziny otwarcia</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-primary-foreground/80">
                  <div className="font-medium mb-1">Poniedziałek - Piątek</div>
                  <div>{contactInfo.hoursWeekday}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-primary-foreground/80">
                  <div className="font-medium mb-1">Sobota</div>
                  <div>{contactInfo.hoursSaturday}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-primary-foreground/80">
                  <div className="font-medium mb-1">Niedziela</div>
                  <div>{contactInfo.hoursSunday}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-primary-foreground/60 text-sm">
          <p>© {new Date().getFullYear()} Elite Barber Studio. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  )
}
