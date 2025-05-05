import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import DueRecord from "@/models/DueRecord"
import Transaction from "@/models/Transaction"
import Balance from "@/models/Balance"
import { verifyAuth } from "@/lib/auth-utils"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await connectToDatabase()

    // Find due record
    const dueRecord = await DueRecord.findOne({ _id: id, userId })

    if (!dueRecord) {
      return NextResponse.json({ error: "Due record not found" }, { status: 404 })
    }

    if (dueRecord.isPaid) {
      return NextResponse.json({ error: "Due record already marked as paid" }, { status: 400 })
    }

    // Mark as paid
    dueRecord.isPaid = true
    dueRecord.paidAt = new Date()
    await dueRecord.save()

    // Create transaction for payment received
    const transaction = await Transaction.create({
      particulars: `Payment received from ${dueRecord.customerName} for ${dueRecord.productOrdered}`,
      amount: dueRecord.amountDue,
      type: "credit",
      userId,
      date: new Date(),
    })

    // Update balances
    let balance = await Balance.findOne({ userId })

    if (!balance) {
      balance = new Balance({
        userId,
        accountBalance: 0,
        totalDueBalance: 0,
      })
    }

    // Update account balance and due balance
    balance.accountBalance += dueRecord.amountDue
    balance.totalDueBalance -= dueRecord.amountDue
    balance.lastUpdated = new Date()
    await balance.save()

    return NextResponse.json(
      {
        dueRecord,
        transaction,
        balance: {
          accountBalance: balance.accountBalance,
          totalDueBalance: balance.totalDueBalance,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Mark paid error:", error)
    return NextResponse.json({ error: "Failed to mark as paid" }, { status: 500 })
  }
}
