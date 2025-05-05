import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import Receipt from "@/models/Receipt"
import Transaction from "@/models/Transaction"
import DueRecord from "@/models/DueRecord"
import Balance from "@/models/Balance"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { users, receipts, transactions, dueRecords } = await request.json()

    // Connect to database
    await connectToDatabase()

    // Stats to track migration
    const stats = {
      users: 0,
      receipts: 0,
      transactions: 0,
      dueRecords: 0,
    }

    // Map to store old ID to new MongoDB ID mapping
    const userIdMap = new Map()

    // Migrate users
    for (const user of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: user.email })

      if (!existingUser) {
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10)

        // Create new user with MongoDB ID
        const newUser = await User.create({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          storeName: user.storeName,
          storeAddress: user.storeAddress,
          storeContact: user.storeContact,
          storeCountryCode: user.storeCountryCode,
          profileComplete: user.profileComplete,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          profilePhoto: user.profilePhoto,
        })

        // Map old ID to new MongoDB ID
        userIdMap.set(user.id, newUser._id)
        stats.users++
      } else {
        // Map existing user's ID
        userIdMap.set(user.id, existingUser._id)
      }
    }

    // Migrate receipts
    for (const receipt of receipts) {
      // Get MongoDB user ID
      const userId = userIdMap.get(receipt.userId)

      if (userId) {
        // Check if receipt already exists
        const existingReceipt = await Receipt.findOne({
          receiptNumber: receipt.receiptNumber,
          userId: userId,
        })

        if (!existingReceipt) {
          await Receipt.create({
            ...receipt,
            userId: userId,
            date: receipt.date ? new Date(receipt.date) : new Date(),
            createdAt: receipt.createdAt ? new Date(receipt.createdAt) : new Date(),
          })
          stats.receipts++
        }
      }
    }

    // Migrate transactions
    for (const transaction of transactions) {
      // Get MongoDB user ID
      const userId = userIdMap.get(transaction.userId)

      if (userId) {
        // Create transaction
        await Transaction.create({
          particulars: transaction.particulars,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date ? new Date(transaction.date) : new Date(),
          userId: userId,
        })
        stats.transactions++
      }
    }

    // Migrate due records
    for (const dueRecord of dueRecords) {
      // Get MongoDB user ID
      const userId = userIdMap.get(dueRecord.userId)

      if (userId) {
        await DueRecord.create({
          ...dueRecord,
          userId: userId,
          expectedPaymentDate: dueRecord.expectedPaymentDate ? new Date(dueRecord.expectedPaymentDate) : new Date(),
          createdAt: dueRecord.createdAt ? new Date(dueRecord.createdAt) : new Date(),
          paidAt: dueRecord.paidAt ? new Date(dueRecord.paidAt) : undefined,
        })
        stats.dueRecords++
      }
    }

    // Calculate and update balances for each user
    for (const [oldUserId, newUserId] of userIdMap.entries()) {
      // Calculate account balance from transactions
      const transactions = await Transaction.find({ userId: newUserId })
      let accountBalance = 0

      for (const transaction of transactions) {
        if (transaction.type === "credit") {
          accountBalance += transaction.amount
        } else {
          accountBalance -= transaction.amount
        }
      }

      // Calculate due balance
      const dueRecords = await DueRecord.find({
        userId: newUserId,
        isPaid: false,
      })

      let totalDueBalance = 0
      for (const dueRecord of dueRecords) {
        totalDueBalance += dueRecord.amountDue
      }

      // Update or create balance record
      await Balance.findOneAndUpdate(
        { userId: newUserId },
        {
          accountBalance,
          totalDueBalance,
          lastUpdated: new Date(),
        },
        { upsert: true, new: true },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Data migration completed successfully",
      stats,
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Migration failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
