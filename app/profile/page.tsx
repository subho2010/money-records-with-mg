"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, AlertTriangle, User, Upload, Check, X } from "lucide-react"
import { PhoneInput } from "@/components/phone-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageViewer } from "@/components/image-viewer"
import apiClient from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: string
  storeName?: string
  storeAddress?: string
  storeContact?: string
  storeCountryCode?: string
  profileComplete?: boolean
  emailVerified?: boolean
  phoneVerified?: boolean
  profilePhoto?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [storeName, setStoreName] = useState("")
  const [storeAddress, setStoreAddress] = useState("")
  const [storeContact, setStoreContact] = useState("")
  const [storeCountryCode, setStoreCountryCode] = useState("+91")
  const [contactError, setContactError] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showProfileAlert, setShowProfileAlert] = useState(false)
  const [redirectFrom, setRedirectFrom] = useState<string | null>(null)

  // OTP verification states
  const [emailOtp, setEmailOtp] = useState("")
  const [phoneOtp, setPhoneOtp] = useState("")
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [emailOtpVerified, setEmailOtpVerified] = useState(false)
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false)
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState("")
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState("")

  // Profile photo
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchUserProfile = async () => {
      try {
        const { user: userData } = await apiClient.getProfile()
        setUser(userData)
        setName(userData.name)
        setEmail(userData.email)
        setStoreName(userData.storeName || "")
        setStoreAddress(userData.storeAddress || "")
        setStoreContact(userData.storeContact || "")
        setStoreCountryCode(userData.storeCountryCode || "+91")
        setEmailOtpVerified(userData.emailVerified || false)
        setPhoneOtpVerified(userData.phoneVerified || false)
        setProfilePhoto(userData.profilePhoto || null)
      } catch (err) {
        console.error("Failed to fetch profile:", err)
        // If there's an error fetching the profile, redirect to login
        localStorage.removeItem("token")
        localStorage.removeItem("currentUser")
        router.push("/login")
      }
    }

    fetchUserProfile()

    // Check if redirected from another page
    const urlParams = new URLSearchParams(window.location.search)
    const from = urlParams.get("from")
    if (from) {
      setRedirectFrom(from)
      setShowProfileAlert(true)
    }
  }, [router])

  const validateContact = (contact: string): boolean => {
    if (!contact) {
      setContactError("Contact number is required")
      return false
    }
    if (!/^\d{10}$/.test(contact)) {
      setContactError("Contact number must be exactly 10 digits")
      return false
    }
    setContactError("")
    return true
  }

  const handlePhoneChange = (value: string, countryCode: string) => {
    setStoreContact(value)
    setStoreCountryCode(countryCode)

    if (value.length !== 10) {
      setContactError("Contact number must be exactly 10 digits")
    } else {
      setContactError("")
    }

    // Reset verification if phone number changes
    if (phoneOtpVerified) {
      setPhoneOtpVerified(false)
    }
  }

  const isProfileComplete = (): boolean => {
    return !!(
      name &&
      storeName &&
      storeAddress &&
      storeContact &&
      /^\d{10}$/.test(storeContact) &&
      emailOtpVerified &&
      phoneOtpVerified
    )
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!user) return

    // Validate contact number
    if (!validateContact(storeContact)) {
      setLoading(false)
      return
    }

    // Validate required fields
    if (!name || !storeName || !storeAddress) {
      setError("All fields are required to complete your profile")
      setLoading(false)
      return
    }

    // Check if email and phone are verified
    if (!emailOtpVerified) {
      setError("Please verify your email address")
      setLoading(false)
      return
    }

    if (!phoneOtpVerified) {
      setError("Please verify your phone number")
      setLoading(false)
      return
    }

    try {
      // Update profile via API
      const { user: updatedUser } = await apiClient.updateProfile({
        name,
        storeName,
        storeAddress,
        storeContact,
        storeCountryCode,
        emailVerified: emailOtpVerified,
        phoneVerified: phoneOtpVerified,
        profilePhoto,
      })

      // Update local storage
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setUser(updatedUser)

      setSuccess("Profile updated successfully")

      // Redirect back to the original page if profile is now complete
      if (updatedUser.profileComplete && redirectFrom) {
        setTimeout(() => {
          router.push(redirectFrom)
        }, 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!user) return

    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields")
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      setLoading(false)
      return
    }

    // Validate password strength
    if (newPassword.length <= 7) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter")
      setLoading(false)
      return
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter")
      setLoading(false)
      return
    }

    // Check for at least one digit
    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one digit")
      setLoading(false)
      return
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
      setError("Password must contain at least one special character")
      setLoading(false)
      return
    }

    try {
      // Update password via API
      await apiClient.updatePassword({
        currentPassword,
        newPassword,
      })

      setSuccess("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  // Email verification
  const sendEmailOtp = () => {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedEmailOtp(otp)
    setEmailOtpSent(true)

    // In a real app, you would send this OTP via email
    toast({
      title: "Email OTP",
      description: `For demo purposes, your email OTP is: ${otp}`,
    })
  }

  const verifyEmailOtp = () => {
    if (emailOtp === generatedEmailOtp) {
      setEmailOtpVerified(true)
      setSuccess("Email verified successfully")
      setError("")
    } else {
      setError("Incorrect OTP. Please check and try again.")
    }
  }

  // Phone verification
  const sendPhoneOtp = () => {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedPhoneOtp(otp)
    setPhoneOtpSent(true)

    // In a real app, you would send this OTP via SMS
    toast({
      title: "Phone OTP",
      description: `For demo purposes, your phone OTP is: ${otp}`,
    })
  }

  const verifyPhoneOtp = () => {
    if (phoneOtp === generatedPhoneOtp) {
      setPhoneOtpVerified(true)
      setSuccess("Phone number verified successfully")
      setError("")
    } else {
      setError("Incorrect OTP. Please check and try again.")
    }
  }

  // Profile photo handling
  const handleProfilePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePhoto(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProfilePhoto = () => {
    setProfilePhoto(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Link href="/">
          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {showProfileAlert && (
          <Alert className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-800" />
            <AlertDescription>
              Please complete your profile details before accessing{" "}
              {redirectFrom === "/create" ? "receipt creation" : "accounts"}.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="relative cursor-pointer group" onClick={handleProfilePhotoClick}>
                {profilePhoto ? (
                  <div className="relative">
                    <img
                      src={profilePhoto || "/placeholder.svg"}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsImageViewerOpen(true)
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    <button
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeProfilePhoto()
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-200 rounded-full p-4 h-20 w-20 flex items-center justify-center group-hover:bg-gray-300">
                    <User className="h-12 w-12 text-gray-600" />
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <p className="text-sm text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security & Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Update Profile</CardTitle>
                <CardDescription>
                  All fields are required before you can create receipts or access accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="backdrop-blur-sm bg-white/30 border border-gray-200 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          // Reset verification if email changes
                          if (emailOtpVerified) {
                            setEmailOtpVerified(false)
                          }
                        }}
                        required
                        className="backdrop-blur-sm bg-white/30 border border-gray-200 shadow-sm"
                        disabled={emailOtpVerified}
                      />
                      {!emailOtpVerified ? (
                        <Button type="button" onClick={sendEmailOtp} disabled={!email || !email.includes("@")}>
                          Send OTP
                        </Button>
                      ) : (
                        <Button type="button" variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <Check className="mr-2 h-4 w-4" /> Verified
                        </Button>
                      )}
                    </div>

                    {emailOtpSent && !emailOtpVerified && (
                      <div className="mt-2 flex space-x-2">
                        <Input
                          placeholder="Enter OTP sent to your email"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value)}
                          className="backdrop-blur-sm bg-white/30 border border-gray-200 shadow-sm"
                        />
                        <Button type="button" onClick={verifyEmailOtp}>
                          Verify
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeName">
                      Store/Enterprise Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="storeName"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                      className="backdrop-blur-sm bg-white/30 border border-gray-200 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeAddress">
                      Store Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="storeAddress"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      required
                      className="backdrop-blur-sm bg-white/30 border border-gray-200 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeContact">
                      Store Contact Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <PhoneInput
                          value={storeContact}
                          countryCode={storeCountryCode}
                          onChange={handlePhoneChange}
                          placeholder="10-digit number"
                          className={phoneOtpVerified ? "opacity-75" : ""}
                        />
                      </div>
                      {!phoneOtpVerified ? (
                        <Button
                          type="button"
                          onClick={sendPhoneOtp}
                          disabled={!storeContact || storeContact.length !== 10}
                        >
                          Send OTP
                        </Button>
                      ) : (
                        <Button type="button" variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <Check className="mr-2 h-4 w-4" /> Verified
                        </Button>
                      )}
                    </div>

                    {contactError && <p className="text-sm text-red-500">{contactError}</p>}

                    {phoneOtpSent && !phoneOtpVerified && (
                      <div className="mt-2 flex space-x-2">
                        <Input
                          placeholder="Enter OTP sent to your phone"
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value)}
                          className="backdrop-blur-sm bg-white/30 border border-gray-200 shadow-sm"
                        />
                        <Button type="button" onClick={verifyPhoneOtp}>
                          Verify
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={loading || !emailOtpVerified || !phoneOtpVerified}>
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="backdrop-blur-sm bg-white/30 border border-gray-200 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="backdrop-blur-sm bg-white/30 border border-gray-200 shadow-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Password must be at least 8 characters long and contain at least one uppercase letter, one
                      lowercase letter, one digit, and one special character.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="backdrop-blur-sm bg-white/30 border border-gray-200 shadow-sm"
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {profilePhoto && (
        <ImageViewer
          src={profilePhoto || "/placeholder.svg"}
          alt="Profile Photo"
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}
    </div>
  )
}
