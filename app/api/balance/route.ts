import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Balance from "@/models/Balance"
import { getUserFromToken } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Find balance for the user
    let balance = await Balance.findOne({ userId: user.id })

    // If no balance exists, create one with zero amount
    if (!balance) {
      balance = await Balance.create({
        userId: user.id,
        amount: 0,
        lastUpdated: new Date(),
      })
    }

    return NextResponse.json({ balance }, { status: 200 })
  } catch (error) {
    console.error("Get balance error:", error)
    return NextResponse.json({ error: "Failed to get balance" }, { status: 500 })
  }
}
