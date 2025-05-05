export interface User {
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

export interface Receipt {
  id: string
  userId: string
  customerName: string
  customerContact?: string
  items: {
    name: string
    quantity: number
    price: number
  }[]
  total: number
  paymentMethod: string
  createdAt: string
  receiptNumber: string
}

export interface Transaction {
  id: string
  userId: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
  createdAt: string
}

export interface DueRecord {
  id: string
  userId: string
  customerName: string
  customerContact?: string
  amount: number
  dueDate: string
  description: string
  isPaid: boolean
  paidDate?: string
  createdAt: string
}

export interface Balance {
  id: string
  userId: string
  amount: number
  lastUpdated: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
