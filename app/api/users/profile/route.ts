import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const user = await User.findById(userId).select("-password")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      name,
      storeName,
      storeAddress,
      storeContact,
      storeCountryCode,
      emailVerified,
      phoneVerified,
      profilePhoto,
    } = await request.json()

    await connectToDatabase()

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if profile is complete
    const profileComplete = !!(
      name &&
      storeName &&
      storeAddress &&
      storeContact &&
      /^\d{10}$/.test(storeContact) &&
      emailVerified &&
      phoneVerified
    )

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        storeName,
        storeAddress,
        storeContact,
        storeCountryCode,
        emailVerified,
        phoneVerified,
        profileComplete,
        profilePhoto,
      },
      { new: true },
    ).select("-password")

    return NextResponse.json({ user: updatedUser }, { status: 200 })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
