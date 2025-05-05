// API client for making requests to our backend
import { toast } from "@/hooks/use-toast"

const API_BASE_URL = "/api"

// Helper to get the auth token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json()

  if (!response.ok) {
    const error = data.error || "Something went wrong"
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    })
    throw new Error(error)
  }

  return data
}

// API client methods
const apiClient = {
  // Auth
  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    return handleResponse(response)
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    return handleResponse(response)
  },

  // User profile
  getProfile: async () => {
    const token = getToken()

    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  updateProfile: async (profileData: any) => {
    const token = getToken()

    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })

    return handleResponse(response)
  },

  updatePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    const token = getToken()

    const response = await fetch(`${API_BASE_URL}/users/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    })

    return handleResponse(response)
  },

  // Receipts
  getReceipts: async () => {
    const token = getToken()

    const response = await fetch(`${API_BASE_URL}/receipts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  createReceipt: async (receiptData: any) => {
    const token = getToken()

    const response = await fetch(`${API_BASE_URL}/receipts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(receiptData),
    })

    return handleResponse(response)
  },

  // Transactions
  getTransactions: async () => {
    const token = getToken()

    const response = await fetch(`${API_BASE_URL}/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  createTransaction: async (transactionData: any) => {
    const token = getToken()

    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    })

    return handleResponse(response)
  },

  // Due Records
  getDueRecords: async () => {
    const token = getToken()

    const response = await fetch(`${API_BASE_URL}/due-records`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  createDueRecord: async (dueRecordData: any) => {
    const token = getToken()

    const response = await fetch(`${API_BASE_URL}/due-records`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dueRecordData),
    })

    return handleResponse(response)
  },

  markDueRecordAsPaid: async (id: string) => {
    const token = getToken()

    const response = await fetch(`${API_BASE_URL}/due-records/${id}/mark-paid`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },
}

export default apiClient
