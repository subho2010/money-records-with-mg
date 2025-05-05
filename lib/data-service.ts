import type {
  User as UserType,
  Receipt as ReceiptType,
  Transaction as TransactionType,
  DueRecord as DueRecordType,
  Balance as BalanceType,
} from "./types"

// This service will handle all data operations with MongoDB through API calls
class DataService {
  // User operations
  async registerUser(userData: { name: string; email: string; password: string }): Promise<UserType> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to register user")
    }

    const data = await response.json()
    return data.user
  }

  async loginUser(credentials: { email: string; password: string }): Promise<{ user: UserType; token: string }> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to login")
    }

    return await response.json()
  }

  async updateUserProfile(profileData: Partial<UserType>, token: string): Promise<UserType> {
    const response = await fetch("/api/users/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update profile")
    }

    const data = await response.json()
    return data.user
  }

  // Receipt operations
  async createReceipt(receiptData: Partial<ReceiptType>, token: string): Promise<ReceiptType> {
    const response = await fetch("/api/receipts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(receiptData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create receipt")
    }

    const data = await response.json()
    return data.receipt
  }

  async getReceipts(token: string): Promise<ReceiptType[]> {
    const response = await fetch("/api/receipts", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to fetch receipts")
    }

    const data = await response.json()
    return data.receipts
  }

  // Transaction operations
  async createTransaction(transactionData: Partial<TransactionType>, token: string): Promise<TransactionType> {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create transaction")
    }

    const data = await response.json()
    return data.transaction
  }

  async getTransactions(token: string): Promise<TransactionType[]> {
    const response = await fetch("/api/transactions", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to fetch transactions")
    }

    const data = await response.json()
    return data.transactions
  }

  // Due Record operations
  async createDueRecord(dueRecordData: Partial<DueRecordType>, token: string): Promise<DueRecordType> {
    const response = await fetch("/api/due-records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dueRecordData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create due record")
    }

    const data = await response.json()
    return data.dueRecord
  }

  async getDueRecords(token: string): Promise<DueRecordType[]> {
    const response = await fetch("/api/due-records", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to fetch due records")
    }

    const data = await response.json()
    return data.dueRecords
  }

  async markDueRecordAsPaid(dueRecordId: string, token: string): Promise<DueRecordType> {
    const response = await fetch(`/api/due-records/${dueRecordId}/mark-paid`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to mark due record as paid")
    }

    const data = await response.json()
    return data.dueRecord
  }

  // Balance operations
  async getBalance(token: string): Promise<BalanceType> {
    const response = await fetch("/api/balance", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to fetch balance")
    }

    const data = await response.json()
    return data.balance
  }
}

export const dataService = new DataService()
