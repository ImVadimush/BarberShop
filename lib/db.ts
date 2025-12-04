import { getDb, ObjectId } from "./mongodb"

// Types
export interface Barber {
  _id?: ObjectId
  name: string
  specialty: string
  image_url?: string
  bio?: string
  experience_years?: number
  username: string
  password_hash: string
  created_at: Date
}

export interface Booking {
  _id?: ObjectId
  client_name: string
  client_phone: string
  barber_id: ObjectId
  service_type: string
  booking_date: string
  booking_time: string
  notes?: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  created_at: Date
}

export interface Admin {
  _id?: ObjectId
  username: string
  password_hash: string
  role: "admin" | "barber"
  barber_id?: ObjectId // Link to barber profile if role is "barber"
  two_factor_secret?: string
  two_factor_enabled: boolean
  created_at: Date
}

export interface Message {
  _id?: ObjectId
  from_user_id: ObjectId
  from_username: string
  to_role: "admin"
  subject: string
  message: string
  status: "unread" | "read"
  created_at: Date
}

// Common interface for login
export interface LoginUser {
  _id?: ObjectId
  username: string
  password_hash: string
  role?: string
}

// Barber operations
export async function getBarberByUsername(username: string): Promise<Barber | null> {
  try {
    const db = await getDb()
    return await db.collection<Barber>("barbers").findOne({ username })
  } catch (error) {
    console.error("[v0] Error fetching barber by username:", error)
    return null
  }
}

export async function getBarbers(): Promise<Barber[]> {
  try {
    const db = await getDb()
    return await db.collection<Barber>("barbers").find().sort({ name: 1 }).toArray()
  } catch (error) {
    console.error("[v0] Error fetching barbers:", error)
    return []
  }
}

export async function getBarberById(id: string): Promise<Barber | null> {
  try {
    const db = await getDb()
    return await db.collection<Barber>("barbers").findOne({ _id: new ObjectId(id) })
  } catch (error) {
    console.error("[v0] Error fetching barber by id:", error)
    return null
  }
}

export async function createBarber(data: Omit<Barber, "_id" | "created_at">): Promise<Barber | null> {
  try {
    const db = await getDb()
    const result = await db.collection<Barber>("barbers").insertOne({
      ...data,
      created_at: new Date(),
    })
    return await getBarberById(result.insertedId.toString())
  } catch (error) {
    console.error("[v0] Error creating barber:", error)
    return null
  }
}

export async function updateBarber(id: string, data: Partial<Omit<Barber, "_id" | "created_at">>): Promise<Barber | null> {
  try {
    const db = await getDb()
    await db.collection<Barber>("barbers").updateOne({ _id: new ObjectId(id) }, { $set: data })
    return await getBarberById(id)
  } catch (error) {
    console.error("[v0] Error updating barber:", error)
    return null
  }
}

export async function deleteBarber(id: string): Promise<boolean> {
  try {
    const db = await getDb()
    const result = await db.collection<Barber>("barbers").deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  } catch (error) {
    console.error("[v0] Error deleting barber:", error)
    return false
  }
}

// Booking operations
export async function getBookings() {
  try {
    const db = await getDb()
    const bookings = await db
      .collection<Booking>("bookings")
      .aggregate([
        {
          $lookup: {
            from: "barbers",
            localField: "barber_id",
            foreignField: "_id",
            as: "barber",
          },
        },
        {
          $unwind: {
            path: "$barber",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            barber_name: "$barber.name",
          },
        },
        {
          $project: {
            barber: 0,
          },
        },
        {
          $sort: { booking_date: -1, booking_time: -1 },
        },
      ])
      .toArray()

    return bookings
  } catch (error) {
    console.error("[v0] Error fetching bookings:", error)
    return []
  }
}

export async function getBookingById(id: string) {
  try {
    const db = await getDb()
    const bookings = await db
      .collection<Booking>("bookings")
      .aggregate([
        {
          $match: { _id: new ObjectId(id) },
        },
        {
          $lookup: {
            from: "barbers",
            localField: "barber_id",
            foreignField: "_id",
            as: "barber",
          },
        },
        {
          $unwind: {
            path: "$barber",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            barber_name: "$barber.name",
          },
        },
        {
          $project: {
            barber: 0,
          },
        },
      ])
      .toArray()

    return bookings[0] || null
  } catch (error) {
    console.error("[v0] Error fetching booking by id:", error)
    return null
  }
}

export async function createBooking(data: Omit<Booking, "_id" | "created_at" | "status"> & { barber_id: string }) {
  try {
    const db = await getDb()
    const result = await db.collection<Booking>("bookings").insertOne({
      ...data,
      barber_id: new ObjectId(data.barber_id),
      status: "pending",
      created_at: new Date(),
    })
    return await getBookingById(result.insertedId.toString())
  } catch (error) {
    console.error("[v0] Error creating booking:", error)
    return null
  }
}

export async function updateBooking(id: string, data: Partial<Omit<Booking, "_id" | "created_at">>) {
  try {
    const db = await getDb()
    const updateData: any = { ...data }
    if (data.barber_id) {
      updateData.barber_id = new ObjectId(data.barber_id as any)
    }
    await db.collection<Booking>("bookings").updateOne({ _id: new ObjectId(id) }, { $set: updateData })
    return await getBookingById(id)
  } catch (error) {
    console.error("[v0] Error updating booking:", error)
    return null
  }
}

export async function deleteBooking(id: string): Promise<boolean> {
  try {
    const db = await getDb()
    const result = await db.collection<Booking>("bookings").deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  } catch (error) {
    console.error("[v0] Error deleting booking:", error)
    return false
  }
}

// Admin operations
export async function getAdminByUsername(username: string): Promise<Admin | null> {
  try {
    const db = await getDb()
    return await db.collection<Admin>("admins").findOne({ username })
  } catch (error) {
    console.error("[v0] Error fetching admin by username:", error)
    return null
  }
}

export async function createAdmin(username: string, password_hash: string, role: "admin" | "barber" = "admin"): Promise<ObjectId | null> {
  try {
    const db = await getDb()
    const result = await db.collection<Admin>("admins").insertOne({
      username,
      password_hash,
      role,
      two_factor_enabled: false,
      created_at: new Date(),
    })
    return result.insertedId
  } catch (error) {
    console.error("[v0] Error creating admin:", error)
    return null
  }
}

export async function updateAdmin2FA(username: string, secret: string, enabled: boolean): Promise<boolean> {
  try {
    const db = await getDb()
    const result = await db.collection<Admin>("admins").updateOne(
      { username },
      {
        $set: {
          two_factor_secret: secret,
          two_factor_enabled: enabled,
        },
      },
    )
    return result.modifiedCount === 1
  } catch (error) {
    console.error("[v0] Error updating admin 2FA:", error)
    return false
  }
}

export async function getAdminById(id: string): Promise<Admin | null> {
  try {
    const db = await getDb()
    return await db.collection<Admin>("admins").findOne({ _id: new ObjectId(id) })
  } catch (error) {
    console.error("[v0] Error fetching admin by id:", error)
    return null
  }
}

export async function createMessage(data: Omit<Message, "_id" | "created_at" | "status">): Promise<ObjectId | null> {
  try {
    const db = await getDb()
    const result = await db.collection<Message>("messages").insertOne({
      ...data,
      status: "unread",
      created_at: new Date(),
    })
    return result.insertedId
  } catch (error) {
    console.error("[v0] Error creating message:", error)
    return null
  }
}

export async function getMessages(role: "admin"): Promise<Message[]> {
  try {
    const db = await getDb()
    return await db.collection<Message>("messages").find({ to_role: role }).sort({ created_at: -1 }).toArray()
  } catch (error) {
    console.error("[v0] Error fetching messages:", error)
    return []
  }
}

export async function markMessageAsRead(id: string): Promise<boolean> {
  try {
    const db = await getDb()
    const result = await db.collection<Message>("messages").updateOne({ _id: new ObjectId(id) }, { $set: { status: "read" } })
    return result.modifiedCount === 1
  } catch (error) {
    console.error("[v0] Error marking message as read:", error)
    return false
  }
}

export async function getBookingsByBarberId(barber_id: string): Promise<Booking[]> {
  try {
    const db = await getDb()
    return await db
      .collection<Booking>("bookings")
      .find({ barber_id: new ObjectId(barber_id) })
      .sort({ booking_date: -1, booking_time: -1 })
      .toArray()
  } catch (error) {
    console.error("[v0] Error fetching bookings by barber id:", error)
    return []
  }
}

export async function getAllAdmins(): Promise<Admin[]> {
  try {
    const db = await getDb()
    return await db
      .collection<Admin>("admins")
      .find()
      .project({ password_hash: 0, two_factor_secret: 0 }) // Don't expose sensitive data
      .toArray()
  } catch (error) {
    console.error("[v0] Error fetching all admins:", error)
    return []
  }
}

export async function updateAdminRole(id: string, role: "admin" | "barber", barber_id?: string): Promise<boolean> {
  try {
    const db = await getDb()
    const updateData: any = { role }
    if (barber_id) {
      updateData.barber_id = new ObjectId(barber_id)
    }
    const result = await db.collection<Admin>("admins").updateOne({ _id: new ObjectId(id) }, { $set: updateData })
    return result.modifiedCount === 1
  } catch (error) {
    console.error("[v0] Error updating admin role:", error)
    return false
  }
}

export async function deleteAdmin(id: string): Promise<boolean> {
  try {
    const db = await getDb()
    const result = await db.collection<Admin>("admins").deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount === 1
  } catch (error) {
    console.error("[v0] Error deleting admin:", error)
    return false
  }
}

// Stats operations
export async function getBookingStats() {
  try {
    const db = await getDb()

    const [totalBookings, pendingBookings, confirmedBookings, totalBarbers] = await Promise.all([
      db.collection("bookings").countDocuments(),
      db.collection("bookings").countDocuments({ status: "pending" }),
      db.collection("bookings").countDocuments({ status: "confirmed" }),
      db.collection("barbers").countDocuments(),
    ])

    return {
      total: totalBookings,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      barbers: totalBarbers,
    }
  } catch (error) {
    console.error("[v0] Error fetching booking stats:", error)
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      barbers: 0,
    }
  }
}

export async function getBookingsByBarberAndDate(barber_id: string, date: string): Promise<Booking[]> {
  try {
    const db = await getDb()
    return await db
      .collection<Booking>("bookings")
      .find({
        barber_id: new ObjectId(barber_id),
        booking_date: date,
        status: { $in: ["pending", "confirmed"] }, // Only count active bookings
      })
      .toArray()
  } catch (error) {
    console.error("[v0] Error fetching bookings by barber and date:", error)
    return []
  }
}

// Helper function to check if admin exists and create default one if not
export async function ensureDefaultAdmin(): Promise<boolean> {
  try {
    const existingAdmin = await getAdminByUsername("admin")
    if (!existingAdmin) {
      const { hashPassword } = await import("@/lib/auth")
      const password_hash = await hashPassword("admin123")
      await createAdmin("admin", password_hash, "admin")
      console.log("[v0] Default admin created: admin / admin123")
    }
    return true
  } catch (error) {
    console.error("[v0] Error ensuring default admin:", error)
    return false
  }
}