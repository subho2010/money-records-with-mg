import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Receipt from "@/models/Receipt"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const receipts = await Receipt.find({ userId }).sort({ createdAt: -1 })

    return NextResponse.json({ receipts }, { status: 200 })
  } catch (error) {
    console.error("Receipts fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const receiptData = await request.json()

    await connectToDatabase()

    // Create receipt
    const receipt = await Receipt.create({
      ...receiptData,
      userId,
      createdAt: new Date(),
    })

    return NextResponse.json({ receipt }, { status: 201 })
  } catch (error) {
    console.error("Receipt creation error:", error)
    return NextResponse.json({ error: "Failed to create receipt" }, { status: 500 })
  }
}
