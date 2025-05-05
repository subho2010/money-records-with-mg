import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function verifyAuth(request: Request | NextRequest): Promise<string | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }

    return decoded.id
  } catch (error) {
    console.error("Auth verification error:", error)
    return null
  }
}

export async function getUserFromToken(request: Request | NextRequest): Promise<{ id: string } | null> {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split(" ")[1]

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string }

    return { id: decoded.id, email: decoded.email }
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}
