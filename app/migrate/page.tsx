"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function MigratePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    users: number
    receipts: number
    transactions: number
    dueRecords: number
  } | null>(null)

  const migrateData = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Get data from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const receipts = JSON.parse(localStorage.getItem("receipts") || "[]")
      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
      const dueRecords = JSON.parse(localStorage.getItem("dueRecords") || "[]")

      // Send data to migration API
      const response = await fetch("/api/migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          users,
          receipts,
          transactions,
          dueRecords,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Migration failed")
      }

      setSuccess("Data migration completed successfully!")
      setStats(result.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed")
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
            <CardTitle>Data Migration Tool</CardTitle>
            <CardDescription>Migrate your data from localStorage to MongoDB</CardDescription>
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

            {stats && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Migration Statistics:</h3>
                <ul className="space-y-1 text-sm">
                  <li>Users: {stats.users} migrated</li>
                  <li>Receipts: {stats.receipts} migrated</li>
                  <li>Transactions: {stats.transactions} migrated</li>
                  <li>Due Records: {stats.dueRecords} migrated</li>
                </ul>
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-4">
                This tool will migrate all your existing data from localStorage to MongoDB. Make sure you have set up
                your MongoDB connection before proceeding.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> This process cannot be undone. It's recommended to perform this migration
                  only once to avoid duplicate data.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={migrateData} disabled={loading} className="w-full">
              {loading ? "Migrating..." : "Start Migration"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
