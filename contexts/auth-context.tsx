"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { dataService } from "@/lib/data-service"
import type { User, AuthState } from "@/lib/types"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (token && user) {
      setAuthState({
        user: JSON.parse(user),
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await dataService.loginUser({ email, password })

      // Save to localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })

      router.push("/")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      await dataService.registerUser({ name, email, password })
      router.push("/login")
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })

    router.push("/login")
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!authState.token) throw new Error("Not authenticated")

      const updatedUser = await dataService.updateUserProfile(userData, authState.token)

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser))

      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }))
    } catch (error) {
      console.error("Update user error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
