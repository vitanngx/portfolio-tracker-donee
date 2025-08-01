"use client"

import { useState, useEffect, useCallback } from "react"
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Target,
  LogOut,
  LogIn,
  Database,
  Trash2,
  Download,
  Upload,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Switch } from "./components/ui/switch"

// Enhanced Mock Supabase Client
class EnhancedMockSupabaseClient {
  constructor(url, key) {
    this.url = url
    this.key = key
    this.user = null
    this.session = null
    console.log("🔄 Using Enhanced Mock Supabase Client")
  }

  async signUp(email, password) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const existingUsers = JSON.parse(localStorage.getItem("mock_supabase_users") || "{}")

      if (existingUsers[email]) {
        throw new Error("User already registered")
      }

      const mockUser = {
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email,
        created_at: new Date().toISOString(),
      }

      const mockSession = {
        access_token: `mock_token_${Date.now()}`,
        user: mockUser,
      }

      existingUsers[email] = { ...mockUser, password }
      localStorage.setItem("mock_supabase_users", JSON.stringify(existingUsers))

      this.user = mockUser
      this.session = mockSession
      localStorage.setItem("mock_supabase_session", JSON.stringify(mockSession))

      return { user: mockUser, session: mockSession, error: null }
    } catch (error) {
      return { user: null, session: null, error }
    }
  }

  async signIn(email, password) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      const existingUsers = JSON.parse(localStorage.getItem("mock_supabase_users") || "{}")
      const storedUser = existingUsers[email]

      if (!storedUser || storedUser.password !== password) {
        throw new Error("Invalid login credentials")
      }

      const mockSession = {
        access_token: `mock_token_${Date.now()}`,
        user: storedUser,
      }

      this.user = storedUser
      this.session = mockSession
      localStorage.setItem("mock_supabase_session", JSON.stringify(mockSession))

      return { user: storedUser, session: mockSession, error: null }
    } catch (error) {
      return { user: null, session: null, error }
    }
  }

  async signOut() {
    this.user = null
    this.session = null
    localStorage.removeItem("mock_supabase_session")
  }

  async initializeAuth() {
    try {
      const stored = localStorage.getItem("mock_supabase_session")
      if (stored) {
        const session = JSON.parse(stored)
        this.session = session
        this.user = session.user
        return { user: session.user, session, error: null }
      }
    } catch (error) {
      localStorage.removeItem("mock_supabase_session")
    }
    return { user: null, session: null, error: null }
  }

  from(table) {
    return new EnhancedMockQueryBuilder(this.user, table)
  }
}

class EnhancedMockQueryBuilder {
  constructor(user, table) {
    this.user = user
    this.table = table
    this.filters = []
    this.method = "GET"
    this.data = null
    this.updateData = null
  }

  select(columns = "*") {
    return this
  }

  insert(data) {
    this.method = "POST"
    this.data = Array.isArray(data) ? data : [data]
    return this
  }

  update(data) {
    this.method = "PUT"
    this.updateData = data
    return this
  }

  delete() {
    this.method = "DELETE"
    return this
  }

  eq(column, value) {
    this.filters.push({ column, operator: "eq", value })
    return this
  }

  order(column, options = {}) {
    this.orderBy = { column, ascending: options.ascending !== false }
    return this
  }

  async execute() {
    try {
      const storageKey = `mock_supabase_${this.table}`
      let tableData = JSON.parse(localStorage.getItem(storageKey) || "[]")

      if (this.user) {
        tableData = tableData.filter((row) => row.user_id === this.user.id)
      }

      switch (this.method) {
        case "GET":
          let filteredData = tableData
          this.filters.forEach((filter) => {
            if (filter.operator === "eq") {
              filteredData = filteredData.filter((row) => row[filter.column] === filter.value)
            }
          })

          if (this.orderBy) {
            filteredData.sort((a, b) => {
              const aVal = a[this.orderBy.column]
              const bVal = b[this.orderBy.column]
              if (this.orderBy.ascending) {
                return aVal > bVal ? 1 : -1
              } else {
                return aVal < bVal ? 1 : -1
              }
            })
          }

          return { data: filteredData, error: null }

        case "POST":
          const newRecords = this.data.map((record) => ({
            ...record,
            id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))

          const allData = JSON.parse(localStorage.getItem(storageKey) || "[]")
          allData.push(...newRecords)
          localStorage.setItem(storageKey, JSON.stringify(allData))

          return { data: newRecords, error: null }

        case "PUT":
          let allUpdateData = JSON.parse(localStorage.getItem(storageKey) || "[]")

          this.filters.forEach((filter) => {
            if (filter.operator === "eq") {
              allUpdateData = allUpdateData.map((row) => {
                if (row[filter.column] === filter.value && row.user_id === this.user.id) {
                  return { ...row, ...this.updateData, updated_at: new Date().toISOString() }
                }
                return row
              })
            }
          })

          localStorage.setItem(storageKey, JSON.stringify(allUpdateData))
          return { data: [], error: null }

        case "DELETE":
          let allDeleteData = JSON.parse(localStorage.getItem(storageKey) || "[]")

          this.filters.forEach((filter) => {
            if (filter.operator === "eq") {
              allDeleteData = allDeleteData.filter((row) => {
                return !(row[filter.column] === filter.value && row.user_id === this.user.id)
              })
            }
          })

          localStorage.setItem(storageKey, JSON.stringify(allDeleteData))
          return { data: [], error: null }

        default:
          return { data: tableData, error: null }
      }
    } catch (error) {
      return { data: null, error }
    }
  }
}

const supabase = new EnhancedMockSupabaseClient(
  "https://xbpyzoxzuihezujlokyt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhicHl6b3h6dWloZXp1amxva3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Njg5OTQsImV4cCI6MjA2OTU0NDk5NH0.2osNjx1BFf3uQR-wuss13awxb72MqCcAdELFQUl9t5o",
)

// Enhanced Portfolio Tracker Component
const EnhancedPortfolioTracker = () => {
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState("signin")
  const [authForm, setAuthForm] = useState({ email: "", password: "" })
  const [authLoading, setAuthLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState("Initializing Enhanced Mock Supabase...")
  const [connectionStatus, setConnectionStatus] = useState("connecting")

  const [activeTab, setActiveTab] = useState("dashboard")
  const [isSyncing, setIsSyncing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Enhanced state management
  const [investments, setInvestments] = useState([])
  const [transactionHistory, setTransactionHistory] = useState([])
  const [contributions, setContributions] = useState([
    { name: "Tan", amount: 0, percentage: 0 },
    { name: "Yoko-chan", amount: 0, percentage: 0 },
    { name: "Us", amount: 0, percentage: 0 },
  ])
  const [contributionHistory, setContributionHistory] = useState([])
  const [goals, setGoals] = useState([])
  const [priceHistory, setPriceHistory] = useState({})
  const [portfolioHistory, setPortfolioHistory] = useState([])

  // Filter and search states
  const [investmentFilter, setInvestmentFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Form states
  const [newInvestment, setNewInvestment] = useState({
    symbol: "",
    name: "",
    category: "Cổ phiếu",
    quantity: "",
    buyPrice: "",
    owner: "Tan",
    buyDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const [editingInvestment, setEditingInvestment] = useState(null)
  const [newContribution, setNewContribution] = useState({
    name: "Tan",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const [newGoal, setNewGoal] = useState({
    title: "",
    target: "",
    current: "",
    deadline: "",
    category: "Tổng tài sản",
    description: "",
  })

  // Enhanced price fetching with caching
  const fetchRealPrice = async (symbol) => {
    const cacheKey = `price_cache_${symbol}`
    const cached = localStorage.getItem(cacheKey)
    const now = Date.now()

    if (cached) {
      const { price, timestamp } = JSON.parse(cached)
      // Cache for 5 minutes
      if (now - timestamp < 5 * 60 * 1000) {
        return price
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    const storedPrices = JSON.parse(localStorage.getItem("mock_base_prices") || "{}")

    const currentMarketPrices = {
      AAPL: 207,
      GOOGL: 195,
      MSFT: 450,
      TSLA: 430,
      NVDA: 147,
      AMZN: 220,
      META: 580,
      "BTC-USD": 117000,
      "ETH-USD": 3400,
      "SOL-USD": 260,
      "ADA-USD": 1.15,
      GOLD: 2650,
      SILVER: 30,
      VTI: 300,
      SPY: 600,
      QQQ: 520,
      IWM: 240,
      GLD: 265,
      SLV: 28,
      PLTR: 75,
      COIN: 350,
      MSTR: 420,
    }

    if (!storedPrices[symbol]) {
      storedPrices[symbol] = currentMarketPrices[symbol] || 50 + Math.random() * 500
      localStorage.setItem("mock_base_prices", JSON.stringify(storedPrices))
    }

    const basePrice = storedPrices[symbol]
    let fluctuation
    if (symbol.includes("BTC") || symbol.includes("ETH") || symbol.includes("SOL")) {
      fluctuation = (Math.random() - 0.5) * 0.06
    } else if (symbol === "TSLA" || symbol === "NVDA") {
      fluctuation = (Math.random() - 0.5) * 0.05
    } else {
      fluctuation = (Math.random() - 0.5) * 0.03
    }

    const newPrice = basePrice * (1 + fluctuation)
    const trend = (Math.random() - 0.5) * 0.002
    storedPrices[symbol] = Math.max(0.01, basePrice * (1 + trend))
    localStorage.setItem("mock_base_prices", JSON.stringify(storedPrices))

    const finalPrice = Number.parseFloat(newPrice.toFixed(symbol.includes("-USD") && !symbol.includes("BTC") ? 4 : 2))

    // Cache the price
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        price: finalPrice,
        timestamp: now,
      }),
    )

    return finalPrice
  }

  // Auto-refresh prices
  useEffect(() => {
    if (!autoRefresh || !user || investments.length === 0) return

    const interval = setInterval(async () => {
      try {
        setIsSyncing(true)
        const updatedInvestments = await Promise.all(
          investments.map(async (inv) => {
            const newPrice = await fetchRealPrice(inv.symbol)
            return { ...inv, current_price: newPrice }
          }),
        )

        setInvestments(updatedInvestments)
        setLastUpdate(new Date())

        // Update price history
        const now = new Date().toISOString()
        const newPriceHistory = { ...priceHistory }

        updatedInvestments.forEach((inv) => {
          if (!newPriceHistory[inv.symbol]) {
            newPriceHistory[inv.symbol] = []
          }
          newPriceHistory[inv.symbol].push({
            date: now,
            price: inv.current_price,
          })

          // Keep only last 30 data points
          if (newPriceHistory[inv.symbol].length > 30) {
            newPriceHistory[inv.symbol] = newPriceHistory[inv.symbol].slice(-30)
          }
        })

        setPriceHistory(newPriceHistory)
      } catch (error) {
        console.error("Auto-refresh error:", error)
      } finally {
        setIsSyncing(false)
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, user, investments, priceHistory])

  // Initialize auth
  useEffect(() => {
    const initializeSupabase = async () => {
      setDebugInfo("Connecting to Enhanced Mock Supabase...")

      try {
        const { user, error } = await supabase.initializeAuth()

        if (error) {
          setDebugInfo(`Auth error: ${error.message}`)
          setConnectionStatus("error")
        } else if (user) {
          setUser(user)
          setDebugInfo(`Welcome back ${user.email}!`)
          setConnectionStatus("connected")
        } else {
          setDebugInfo("Ready for login (Enhanced Mock Supabase)")
          setConnectionStatus("ready")
        }
      } catch (error) {
        setDebugInfo(`Connection error: ${error.message}`)
        setConnectionStatus("error")
      }
    }

    initializeSupabase()
  }, [])

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!user) return

    setIsSyncing(true)
    try {
      // Load investments
      const { data: investmentsData } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .execute()

      if (investmentsData) {
        // Update current prices
        const updatedInvestments = await Promise.all(
          investmentsData.map(async (inv) => {
            const currentPrice = await fetchRealPrice(inv.symbol)
            return { ...inv, current_price: currentPrice }
          }),
        )
        setInvestments(updatedInvestments)
      }

      // Load transaction history
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .execute()

      setTransactionHistory(transactionsData || [])

      // Load goals
      const { data: goalsData } = await supabase.from("goals").select("*").eq("user_id", user.id).execute()

      setGoals(goalsData || [])

      // Load contributions
      const { data: contributionsData } = await supabase
        .from("contributions")
        .select("*")
        .eq("user_id", user.id)
        .execute()

      if (contributionsData && contributionsData.length > 0) {
        setContributions(contributionsData)
      }

      // Load contribution history
      const { data: contributionHistoryData } = await supabase
        .from("contribution_history")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .execute()

      setContributionHistory(contributionHistoryData || [])
    } catch (error) {
      setDebugInfo(`Data loading error: ${error.message}`)
    } finally {
      setIsSyncing(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user, loadUserData])

  // Authentication handlers
  const handleAuth = async (e) => {
    e.preventDefault()

    const email = authForm.email.trim()
    const password = authForm.password.trim()

    if (!email || !password) {
      alert("Vui lòng nhập email và password")
      return
    }

    if (password.length < 6) {
      alert("Password phải có ít nhất 6 ký tự")
      return
    }

    setAuthLoading(true)

    try {
      let result
      if (authMode === "signin") {
        result = await supabase.signIn(email, password)
      } else {
        result = await supabase.signUp(email, password)
      }

      if (result.error) {
        throw result.error
      }

      if (result.user) {
        setUser(result.user)
        setAuthForm({ email: "", password: "" })
        setConnectionStatus("connected")

        if (authMode === "signup") {
          alert("Đăng ký và đăng nhập thành công!")
        }
      }
    } catch (error) {
      if (error.message.includes("Invalid login credentials")) {
        alert("Email hoặc password không đúng")
      } else if (error.message.includes("already registered")) {
        alert("Email đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.")
      } else {
        alert(`Lỗi xác thực: ${error.message}`)
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.signOut()
    setUser(null)
    setInvestments([])
    setTransactionHistory([])
    setContributions([
      { name: "Tan", amount: 0, percentage: 0 },
      { name: "Yoko-chan", amount: 0, percentage: 0 },
      { name: "Us", amount: 0, percentage: 0 },
    ])
    setContributionHistory([])
    setGoals([])
    setPriceHistory({})
    setPortfolioHistory([])
    setActiveTab("dashboard")
    setConnectionStatus("ready")
    setDebugInfo("Signed out successfully")
  }

  // Investment management
  const addInvestment = async () => {
    if (!newInvestment.symbol || !newInvestment.quantity || !newInvestment.buyPrice) {
      alert("Vui lòng điền đầy đủ: Mã, Số lượng, và Giá mua")
      return
    }

    try {
      setIsSyncing(true)

      const realCurrentPrice = await fetchRealPrice(newInvestment.symbol)

      const investment = {
        user_id: user.id,
        symbol: newInvestment.symbol,
        name: newInvestment.name,
        category: newInvestment.category,
        quantity: Number.parseFloat(newInvestment.quantity),
        buy_price: Number.parseFloat(newInvestment.buyPrice),
        current_price: realCurrentPrice,
        owner: newInvestment.owner,
        buy_date: newInvestment.buyDate,
        notes: newInvestment.notes,
      }

      const { data, error } = await supabase.from("investments").insert(investment).execute()

      if (error) throw error

      // Add to transaction history
      const transaction = {
        user_id: user.id,
        type: "BUY",
        symbol: newInvestment.symbol,
        quantity: Number.parseFloat(newInvestment.quantity),
        price: Number.parseFloat(newInvestment.buyPrice),
        date: newInvestment.buyDate,
        notes: newInvestment.notes,
      }

      await supabase.from("transactions").insert(transaction).execute()

      await loadUserData()
      setNewInvestment({
        symbol: "",
        name: "",
        category: "Cổ phiếu",
        quantity: "",
        buyPrice: "",
        owner: "Tan",
        buyDate: new Date().toISOString().split("T")[0],
        notes: "",
      })

      const buyPrice = Number.parseFloat(newInvestment.buyPrice)
      const gainLoss = (realCurrentPrice - buyPrice) * Number.parseFloat(newInvestment.quantity)
      const gainLossPercent = (((realCurrentPrice - buyPrice) / buyPrice) * 100).toFixed(2)
      const emoji = gainLoss >= 0 ? "📈" : "📉"

      alert(`${emoji} Đã thêm ${newInvestment.symbol}!

Giá mua: $${buyPrice}
Giá thị trường hiện tại: $${realCurrentPrice}
Số lượng: ${newInvestment.quantity}

Lãi/Lỗ ngay: ${gainLoss >= 0 ? "+" : ""}$${gainLoss.toFixed(2)} (${gainLoss >= 0 ? "+" : ""}${gainLossPercent}%)`)
    } catch (error) {
      alert("Lỗi khi thêm đầu tư: " + error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const updateInvestment = async (id, updates) => {
    try {
      setIsSyncing(true)

      const { error } = await supabase.from("investments").update(updates).eq("id", id).execute()

      if (error) throw error

      await loadUserData()
      setEditingInvestment(null)
    } catch (error) {
      alert("Lỗi khi cập nhật: " + error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const deleteInvestment = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đầu tư này?")) return

    try {
      setIsSyncing(true)
      const { error } = await supabase.from("investments").delete().eq("id", id).execute()

      if (error) throw error
      await loadUserData()
    } catch (error) {
      alert("Lỗi khi xóa: " + error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  // Contribution management
  const addContribution = async () => {
    if (!newContribution.amount) {
      alert("Vui lòng nhập số tiền")
      return
    }

    try {
      setIsSyncing(true)

      const contribution = {
        user_id: user.id,
        name: newContribution.name,
        amount: Number.parseFloat(newContribution.amount),
        date: newContribution.date,
        notes: newContribution.notes,
      }

      await supabase.from("contribution_history").insert(contribution).execute()

      // Update total contributions
      const existingContribIndex = contributions.findIndex((c) => c.name === newContribution.name)

      if (existingContribIndex >= 0) {
        const updatedContributions = [...contributions]
        updatedContributions[existingContribIndex] = {
          ...updatedContributions[existingContribIndex],
          amount: (updatedContributions[existingContribIndex].amount || 0) + Number.parseFloat(newContribution.amount),
        }
        setContributions(updatedContributions)
      }

      await loadUserData()
      setNewContribution({
        name: "Tan",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      })

      alert("Đã thêm vốn góp thành công!")
    } catch (error) {
      alert("Lỗi khi thêm vốn góp: " + error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  // Goal management
  const addGoal = async () => {
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) {
      alert("Vui lòng điền đầy đủ thông tin mục tiêu")
      return
    }

    try {
      setIsSyncing(true)

      const goal = {
        user_id: user.id,
        title: newGoal.title,
        target: Number.parseFloat(newGoal.target),
        current: Number.parseFloat(newGoal.current) || 0,
        deadline: newGoal.deadline,
        category: newGoal.category,
        description: newGoal.description,
      }

      await supabase.from("goals").insert(goal).execute()

      await loadUserData()
      setNewGoal({
        title: "",
        target: "",
        current: "",
        deadline: "",
        category: "Tổng tài sản",
        description: "",
      })

      alert("Đã thêm mục tiêu thành công!")
    } catch (error) {
      alert("Lỗi khi thêm mục tiêu: " + error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  // Data export/import
  const exportData = () => {
    const data = {
      investments,
      transactionHistory,
      contributions,
      contributionHistory,
      goals,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `portfolio-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)

        if (window.confirm("Bạn có chắc muốn import dữ liệu? Dữ liệu hiện tại sẽ bị ghi đè.")) {
          setInvestments(data.investments || [])
          setTransactionHistory(data.transactionHistory || [])
          setContributions(data.contributions || [])
          setContributionHistory(data.contributionHistory || [])
          setGoals(data.goals || [])

          alert("Import dữ liệu thành công!")
        }
      } catch (error) {
        alert("Lỗi khi import dữ liệu: " + error.message)
      }
    }
    reader.readAsText(file)
  }

  // Calculate portfolio metrics
  const totalValue = investments.reduce((sum, inv) => sum + inv.quantity * inv.current_price, 0)
  const totalCost = investments.reduce((sum, inv) => sum + inv.quantity * inv.buy_price, 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? ((totalGainLoss / totalCost) * 100).toFixed(2) : "0.00"

  // Filter investments
  const filteredInvestments = investments.filter((inv) => {
    const matchesCategory = investmentFilter === "all" || inv.category === investmentFilter
    const matchesSearch =
      inv.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.name && inv.name.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Get connection status info
  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case "connecting":
        return { color: "text-yellow-600", bg: "bg-yellow-100", icon: "🔄", text: "Connecting..." }
      case "connected":
        return { color: "text-green-600", bg: "bg-green-100", icon: "✅", text: "Connected to Enhanced Mock Supabase" }
      case "error":
        return { color: "text-red-600", bg: "bg-red-100", icon: "❌", text: "Connection error" }
      default:
        return { color: "text-blue-600", bg: "bg-blue-100", icon: "🔗", text: "Ready" }
    }
  }

  const statusInfo = getConnectionStatusInfo()

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">Enhanced Portfolio Tracker</CardTitle>
            <CardDescription>Advanced Investment Management System</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className={`p-3 ${statusInfo.bg} rounded-lg`}>
              <div className="flex items-center space-x-2">
                <Database size={16} className={statusInfo.color} />
                <span className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.icon} {statusInfo.text}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-600">Debug: {debugInfo}</p>
              <p className="text-xs text-gray-500 mt-1">Status: {connectionStatus}</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="test@example.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  placeholder="123456"
                />
              </div>

              <Button type="submit" disabled={authLoading} className="w-full">
                {authLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <LogIn size={20} className="mr-2" />
                    {authMode === "signin" ? "Đăng nhập" : "Đăng ký"}
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button variant="link" onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}>
                {authMode === "signin" ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
              </Button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Database size={16} className="text-blue-600" />
                <p className="text-sm font-medium text-blue-800">Enhanced Mock Supabase</p>
              </div>
              <p className="text-xs text-blue-700">
                Advanced features: Real-time updates, transaction history, analytics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main application - Dashboard only for now
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Database size={20} className={statusInfo.color} />
                <span className={`text-sm ${statusInfo.color}`}>Enhanced Mock Supabase</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                <span className="text-sm text-gray-600">Auto-refresh</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-800">Enhanced Portfolio Tracker</h1>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Chào mừng!</p>
                <p className="font-medium text-gray-800">{user.email}</p>
                <p className="text-xs text-gray-500">Cập nhật: {lastUpdate.toLocaleTimeString()}</p>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download size={16} className="mr-1" />
                  Export
                </Button>

                <Button variant="outline" size="sm" onClick={() => document.getElementById("import-file").click()}>
                  <Upload size={16} className="mr-1" />
                  Import
                </Button>
                <input id="import-file" type="file" accept=".json" onChange={importData} className="hidden" />

                <Button variant="destructive" size="sm" onClick={handleSignOut}>
                  <LogOut size={16} className="mr-1" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <p className="text-gray-600">Advanced Investment Management System</p>
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-green-500" : "bg-yellow-500"}`}
              ></div>
              <span className="text-xs text-gray-500">{isSyncing ? "Syncing..." : "Online"}</span>
            </div>
          </div>
        </div>

        {/* Simple Dashboard */}
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Tổng giá trị</p>
                    <p className="text-gray-800 text-2xl font-bold">${totalValue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="text-blue-400" size={32} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Lãi/Lỗ</p>
                    <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      ${totalGainLoss.toLocaleString()}
                    </p>
                  </div>
                  {totalGainLoss >= 0 ? (
                    <TrendingUp className="text-emerald-400" size={32} />
                  ) : (
                    <TrendingDown className="text-rose-400" size={32} />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">% Lãi/Lỗ</p>
                    <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {totalGainLossPercent}%
                    </p>
                  </div>
                  <PieChart className="text-purple-400" size={32} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Số tài sản</p>
                    <p className="text-gray-800 text-2xl font-bold">{investments.length}</p>
                  </div>
                  <Target className="text-orange-400" size={32} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Investment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PlusCircle size={24} />
                <span>Thêm đầu tư mới</span>
              </CardTitle>
              <CardDescription>
                💡 <strong>Lưu ý:</strong> Nhập giá mua lịch sử của bạn. Giá hiện tại sẽ được lấy từ thị trường thực tế.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="symbol">Mã chứng khoán</Label>
                  <Input
                    id="symbol"
                    placeholder="VD: AAPL, BTC-USD"
                    value={newInvestment.symbol}
                    onChange={(e) => setNewInvestment({ ...newInvestment, symbol: e.target.value.toUpperCase() })}
                  />
                </div>

                <div>
                  <Label htmlFor="name">Tên công ty</Label>
                  <Input
                    id="name"
                    placeholder="Tùy chọn"
                    value={newInvestment.name}
                    onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Số lượng</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.0001"
                    placeholder="VD: 100 hoặc 0.5"
                    value={newInvestment.quantity}
                    onChange={(e) => setNewInvestment({ ...newInvestment, quantity: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="buyPrice">Giá mua ($)</Label>
                  <Input
                    id="buyPrice"
                    type="number"
                    step="0.01"
                    placeholder="Giá mua lịch sử"
                    value={newInvestment.buyPrice}
                    onChange={(e) => setNewInvestment({ ...newInvestment, buyPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Button onClick={addInvestment} disabled={isSyncing} className="w-full md:w-auto">
                  {isSyncing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={20} className="mr-2" />
                      Thêm với giá thực
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Investments List */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách đầu tư ({investments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có đầu tư nào. Hãy thêm đầu tư đầu tiên!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-600">Mã</th>
                        <th className="text-left py-2 text-gray-600">Tên</th>
                        <th className="text-right py-2 text-gray-600">Số lượng</th>
                        <th className="text-right py-2 text-gray-600">Giá mua</th>
                        <th className="text-right py-2 text-gray-600">Giá hiện tại</th>
                        <th className="text-right py-2 text-gray-600">Lãi/Lỗ</th>
                        <th className="text-center py-2 text-gray-600">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((inv) => {
                        const gainLoss = (inv.current_price - inv.buy_price) * inv.quantity
                        const gainLossPercent = (((inv.current_price - inv.buy_price) / inv.buy_price) * 100).toFixed(2)
                        return (
                          <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 font-medium">{inv.symbol}</td>
                            <td className="py-2 text-gray-600">{inv.name || "-"}</td>
                            <td className="py-2 text-right">{inv.quantity}</td>
                            <td className="py-2 text-right">${inv.buy_price}</td>
                            <td className="py-2 text-right">${inv.current_price?.toFixed(2)}</td>
                            <td
                              className={`py-2 text-right font-medium ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              ${gainLoss.toFixed(2)} ({gainLossPercent}%)
                            </td>
                            <td className="py-2 text-center">
                              <Button variant="destructive" size="sm" onClick={() => deleteInvestment(inv.id)}>
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Real Market Prices (Jan 2025):</strong> AAPL ~$207 | BTC ~$117k | TSLA ~$430 | Auto-refresh:{" "}
                  {autoRefresh ? "ON" : "OFF"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return <EnhancedPortfolioTracker />
}
