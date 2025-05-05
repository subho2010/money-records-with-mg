import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"

export async function GET() {
  try {
    // Try to connect to the database
    await connectToDatabase()

    return NextResponse.json({
      success: true,
      message: "Successfully connected to MongoDB",
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        error: "Failed to connect to MongoDB. Please check your MONGODB_URI environment variable.",
      },
      { status: 500 },
    )
  }
}
