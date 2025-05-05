"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TestConnectionPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/test-db", {
        method: "GET",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to connect to MongoDB")
      }

      setSuccess("Successfully connected to MongoDB! Your environment variables are working correctly.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to MongoDB")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-start mb-6">
        <Link href="/">
          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test MongoDB Connection</CardTitle>
            <CardDescription>Verify that your MongoDB connection is working properly</CardDescription>
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
                <CheckCircle className="h-4 w-4 text-green-800 mr-2" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This will test your MongoDB connection using the MONGODB_URI environment
                  variable you've set up in your Vercel project.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={testConnection} disabled={loading} className="w-full">
              {loading ? "Testing Connection..." : "Test MongoDB Connection"}
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/migrate">
            <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
              Proceed to Data Migration
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
