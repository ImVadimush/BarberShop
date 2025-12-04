import { getDb } from "../lib/mongodb"
import { hashPassword } from "../lib/auth"

async function initDatabase() {
  try {
    console.log("Initializing MongoDB database...")

    const db = await getDb()

    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Create collections with validation
    if (!collectionNames.includes("admins")) {
      await db.createCollection("admins", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["username", "password_hash", "role", "created_at"],
            properties: {
              username: { bsonType: "string", minLength: 3, maxLength: 50 },
              password_hash: { bsonType: "string" },
              role: { enum: ["admin", "barber"] },
              created_at: { bsonType: "date" },
            },
          },
        },
      })
      console.log("✓ Created 'admins' collection")
    } else {
      console.log("⚠ 'admins' collection already exists")
    }

    if (!collectionNames.includes("barbers")) {
      await db.createCollection("barbers", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "specialty", "created_at"],
            properties: {
              name: { bsonType: "string", minLength: 2, maxLength: 100 },
              specialty: { bsonType: "string", minLength: 2, maxLength: 200 },
              image_url: { bsonType: "string" },
              bio: { bsonType: "string", maxLength: 1000 },
              experience_years: { bsonType: "int", minimum: 0, maximum: 50 },
              created_at: { bsonType: "date" },
            },
          },
        },
      })
      console.log("✓ Created 'barbers' collection")
    } else {
      console.log("⚠ 'barbers' collection already exists")
    }

    if (!collectionNames.includes("bookings")) {
      await db.createCollection("bookings", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: [
              "client_name",
              "client_phone",
              "barber_id",
              "service_type",
              "booking_date",
              "booking_time",
              "status",
              "created_at",
            ],
            properties: {
              client_name: { bsonType: "string", minLength: 2, maxLength: 100 },
              client_phone: { bsonType: "string" },
              barber_id: { bsonType: "objectId" },
              service_type: { bsonType: "string" },
              booking_date: { bsonType: "string" },
              booking_time: { bsonType: "string" },
              notes: { bsonType: "string", maxLength: 500 },
              status: { enum: ["pending", "confirmed", "cancelled", "completed"] },
              created_at: { bsonType: "date" },
            },
          },
        },
      })
      console.log("✓ Created 'bookings' collection")
    } else {
      console.log("⚠ 'bookings' collection already exists")
    }

    // Create indexes
    await db.collection("admins").createIndex({ username: 1 }, { unique: true })
    await db.collection("barbers").createIndex({ name: 1 })
    await db.collection("bookings").createIndex({ barber_id: 1 })
    await db.collection("bookings").createIndex({ booking_date: 1, booking_time: 1 })
    await db.collection("bookings").createIndex({ status: 1 })

    console.log("✓ Indexes created successfully!")

    const existingAdmin = await db.collection("admins").findOne({ username: "admin" })
    if (!existingAdmin) {
      const adminPasswordHash = await hashPassword("admin123")
      await db.collection("admins").insertOne({
        username: "admin",
        password_hash: adminPasswordHash,
        role: "admin",
        created_at: new Date(),
      })
      console.log("✓ Admin user created (username: admin, password: admin123)")
    } else {
      console.log("⚠ Admin user already exists")
    }

    const existingBarbers = await db.collection("barbers").countDocuments()
    if (existingBarbers === 0) {
      await db.collection("barbers").insertMany([
        {
          name: "Jakub Kowalski",
          specialty: "Klasyczne strzyżenie i stylizacja brody",
          image_url: "/professional-barber-portrait.jpg",
          bio: "Specjalista od klasycznych strzyżeń męskich z 8-letnim doświadczeniem.",
          experience_years: 8,
          created_at: new Date(),
        },
        {
          name: "Michał Nowak",
          specialty: "Nowoczesne fryzury i fade",
          image_url: "/modern-barber-portrait.jpg",
          bio: "Ekspert w nowoczesnych technikach strzyżenia i stylizacji.",
          experience_years: 5,
          created_at: new Date(),
        },
        {
          name: "Piotr Wiśniewski",
          specialty: "Pielęgnacja brody i wąsów",
          image_url: "/beard-specialist-portrait.jpg",
          bio: "Mistrz w sztuce pielęgnacji i stylizacji zarostu.",
          experience_years: 10,
          created_at: new Date(),
        },
      ])
      console.log("✓ Sample barbers created!")
    } else {
      console.log(`⚠ ${existingBarbers} barber(s) already exist in database`)
    }

    console.log("\n✅ Database initialized successfully!")
    console.log("\n📝 Login credentials:")
    console.log("   Username: admin")
    console.log("   Password: admin123")
    console.log("\n⚠️  Remember to change the default password in production!")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error initializing database:", error)
    process.exit(1)
  }
}

initDatabase()
