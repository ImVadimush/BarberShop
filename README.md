# Elite Barber Studio - Hair Salon Management System

Modern, full-stack web application for managing a professional barber shop with booking system, admin panel, and customer-facing website.

## 🚀 Features

### Customer Features
- **Modern Landing Page** - Elegant hero section with smooth animations
- **Service Showcase** - Display of all available services with pricing
- **Team Presentation** - Meet the barbers with photos and bios
- **Online Booking System** - Real-time availability checking and booking
- **Custom Date/Time Picker** - Stylish, user-friendly booking interface
- **Reviews Carousel** - Animated customer testimonials
- **Contact Information** - Dynamic contact details and business hours

### Admin Features
- **Secure Authentication** - JWT-based login system with bcrypt password hashing
- **Dashboard** - Real-time statistics and quick actions
- **Booking Management** - View, edit, and manage all reservations
- **Barber Management** - Add, edit, and remove team members
- **Availability Control** - Block specific dates/times for each barber
- **Rate Limiting** - Protection against brute force attacks

### Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation with Zod
- ✅ Rate limiting on sensitive endpoints
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection
- ✅ Environment variable validation
- ✅ Secure session management

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB with native driver
- **Authentication**: JWT with jose, bcrypt
- **Validation**: Zod
- **Security**: Rate limiting, input sanitization

## 📦 Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd barber-shop
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

\`\`\`env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/barber_shop?retryWrites=true&w=majority

# JWT Secret (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Contact Information (displayed in footer)
NEXT_PUBLIC_CONTACT_ADDRESS=ul. Przykładowa 123, 00-001 Warszawa
NEXT_PUBLIC_CONTACT_PHONE=+48 123 456 789
NEXT_PUBLIC_CONTACT_EMAIL=kontakt@elitebarber.pl

# Business Hours
NEXT_PUBLIC_HOURS_WEEKDAY=9:00 - 20:00
NEXT_PUBLIC_HOURS_SATURDAY=10:00 - 18:00
NEXT_PUBLIC_HOURS_SUNDAY=Nieczynne
\`\`\`

4. **Initialize the database**

Run the initialization script to create collections and seed data:

\`\`\`bash
npm run init-db
\`\`\`

This will:
- Create MongoDB collections with validation schemas
- Set up indexes for optimal performance
- Create an admin user (username: `admin`, password: `admin123`)
- Add sample barbers to the database

5. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔐 Default Credentials

After running the initialization script:

- **Admin Panel**: `/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password immediately in production!

## 📁 Project Structure

\`\`\`
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── dashboard/      # Admin dashboard
│   │   ├── bookings/       # Booking management
│   │   ├── barbers/        # Barber management
│   │   └── login/          # Admin login
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── barbers/        # Barber CRUD operations
│   │   ├── bookings/       # Booking CRUD operations
│   │   └── stats/          # Dashboard statistics
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── hero-section.tsx    # Hero section
│   ├── about-section.tsx   # About section
│   ├── services-section.tsx # Services showcase
│   ├── barbers-section.tsx # Team presentation
│   ├── booking-section.tsx # Booking form
│   ├── reviews-section.tsx # Customer reviews
│   ├── footer.tsx          # Footer with contact info
│   ├── custom-date-picker.tsx # Custom date picker
│   └── custom-time-picker.tsx # Custom time picker
├── lib/
│   ├── mongodb.ts          # MongoDB connection
│   ├── db.ts               # Database operations
│   ├── auth.ts             # Authentication utilities
│   ├── validation.ts       # Input validation schemas
│   └── rate-limit.ts       # Rate limiting middleware
├── scripts/
│   └── init-mongodb.ts     # Database initialization
└── middleware.ts           # Next.js middleware for auth
\`\`\`

## 🎨 Customization

### Contact Information

Update the environment variables in `.env.local` to change:
- Business address
- Phone number
- Email address
- Opening hours

### Barber Information

Barbers can be managed through the admin panel at `/admin/barbers`:
- Add new team members
- Update photos, bios, and specialties
- Set experience years
- Remove barbers

### Services and Pricing

Edit `components/services-section.tsx` to modify:
- Service names
- Descriptions
- Pricing

### Design and Colors

The color scheme is defined in `app/globals.css` using CSS variables:
- `--background` - Main background color
- `--foreground` - Main text color
- `--accent` - Accent color (gold/beige)
- `--primary` - Primary color (dark)
- `--secondary` - Secondary background

## 🔒 Security Best Practices

1. **Change default credentials** immediately after setup
2. **Use strong JWT secret** (minimum 32 characters)
3. **Enable HTTPS** in production
4. **Set secure cookie flags** in production
5. **Regularly update dependencies**
6. **Monitor rate limit logs** for suspicious activity
7. **Backup database** regularly

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Ensure your platform supports:
- Node.js 18+
- Next.js 16
- MongoDB connection

## 📄 License

This project is private and proprietary.

## 🤝 Support

For issues or questions, please contact the development team.

---

Built with ❤️ using Next.js, MongoDB, and modern web technologies.
