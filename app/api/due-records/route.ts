import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import DueRecord from "@/models/DueRecord"
import Balance from "@/models/Balance"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const dueRecords = await DueRecord.find({ userId }).sort({ expectedPaymentDate: 1 })

    return NextResponse.json({ dueRecords }, { status: 200 })
  } catch (error) {
    console.error("Due records fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch due records" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dueRecordData = await request.json()

    await connectToDatabase()

    // Create due record
    const dueRecord = await DueRecord.create({
      ...dueRecordData,
      userId,
      createdAt: new Date(),
    })

    // Update total due balance
    let balance = await Balance.findOne({ userId })

    if (!balance) {
      balance = new Balance({
        userId,
        accountBalance: 0,
        totalDueBalance: 0,
      })
    }

    balance.totalDueBalance += dueRecord.amountDue
    balance.lastUpdated = new Date()
    await balance.save()

    return NextResponse.json({ dueRecord }, { status: 201 })
  } catch (error) {
    console.error("Due record creation error:", error)
    return NextResponse.json({ error: "Failed to create due record" }, { status: 500 })
  }
}
