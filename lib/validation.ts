import { z } from "zod"

// Barber validation schemas
export const createBarberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  specialty: z.string().min(2).max(200),
  image_url: z.string().optional().or(z.literal("")),
  bio: z.string().max(1000).optional().or(z.literal("")),
  experience_years: z.number().int().min(0).max(50).optional(),
  username: z.string().min(3, "Username must be at least 3 characters").max(50), // DODANE
  password: z.string().min(6, "Password must be at least 6 characters").max(100), // DODANE
})

export const updateBarberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  specialty: z.string().min(2).max(200).optional(),
  image_url: z.string().optional().or(z.literal("")),
  bio: z.string().max(1000).optional().or(z.literal("")),
  experience_years: z.number().int().min(0).max(50).optional(),
  username: z.string().min(3, "Username must be at least 3 characters").max(50).optional(), // DODANE
  password: z.string().min(6, "Password must be at least 6 characters").max(100).optional(), // DODANE
})

// Booking validation schemas
export const createBookingSchema = z.object({
  client_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  client_phone: z.string().regex(/^[+]?[\d\s()-]{9,20}$/, "Invalid phone number"),
  barber_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid barber ID"),
  service_type: z.string().min(2).max(100),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  booking_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  notes: z.string().max(500).optional().or(z.literal("")),
})

export const updateBookingSchema = createBookingSchema.partial().extend({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
})

// Auth validation schemas
export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
})

// Sanitize string inputs to prevent XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim()
}