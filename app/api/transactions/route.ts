import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import Balance from "@/models/Balance"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const transactions = await Transaction.find({ userId }).sort({ date: -1 })

    // Get balance
    const balance = (await Balance.findOne({ userId })) || { accountBalance: 0 }

    return NextResponse.json(
      {
        transactions,
        balance: balance.accountBalance,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Transactions fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { particulars, amount, type } = await request.json()

    // Validate input
    if (!particulars || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (type !== "credit" && type !== "debit") {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 })
    }

    await connectToDatabase()

    // Create transaction
    const transaction = await Transaction.create({
      particulars,
      amount,
      type,
      userId,
      date: new Date(),
    })

    // Update balance
    let balance = await Balance.findOne({ userId })

    if (!balance) {
      balance = new Balance({
        userId,
        accountBalance: 0,
        totalDueBalance: 0,
      })
    }

    // Update account balance
    if (type === "credit") {
      balance.accountBalance += amount
    } else {
      balance.accountBalance -= amount
    }

    balance.lastUpdated = new Date()
    await balance.save()

    return NextResponse.json(
      {
        transaction,
        balance: balance.accountBalance,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Transaction creation error:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
