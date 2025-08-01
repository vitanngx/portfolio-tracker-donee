"use client"

import { useState, useEffect, useCallback } from "react"
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Users,
  Target,
  LogOut,
  LogIn,
  Database,
  Edit2,
  Trash2,
  Filter,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  TrendingUpIcon,
} from "lucide-react"
import {
  PieChart as RechartsPieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

// Mock Supabase Client (Enhanced)
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
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

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

  // Enhanced price fetching with real APIs
  const fetchRealPrice = async (symbol) => {
    const cacheKey = `price_cache_${symbol}`
    const cached = localStorage.getItem(cacheKey)
    const now = Date.now()

    if (cached) {
      const { price, timestamp } = JSON.parse(cached)
      // Cache for 2 minutes for real-time data
      if (now - timestamp < 2 * 60 * 1000) {
        return price
      }
    }

    try {
      let price = null

      // Vietnamese stocks (VN30, TCB, VCB, etc.)
      if (isVietnameseStock(symbol)) {
        price = await fetchVietnameseStockPrice(symbol)
      }
      // Cryptocurrencies
      else if (isCrypto(symbol)) {
        price = await fetchCryptoPrice(symbol)
      }
      // US stocks and other international assets
      else {
        price = await fetchInternationalStockPrice(symbol)
      }

      if (price !== null) {
        // Cache the price
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            price: price,
            timestamp: now,
          }),
        )
        return price
      }

      // Fallback to mock data if API fails
      return await fetchMockPrice(symbol)
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error)
      return await fetchMockPrice(symbol)
    }
  }

  // Check if symbol is Vietnamese stock
  const isVietnameseStock = (symbol) => {
    const vnStocks = [
      "VN30",
      "TCB",
      "VCB",
      "BID",
      "CTG",
      "VPB",
      "MBB",
      "STB",
      "HDB",
      "TPB",
      "VHM",
      "VIC",
      "VRE",
      "KDH",
      "NVL",
      "DXG",
      "PDR",
      "DIG",
      "KBC",
      "HDG",
      "HPG",
      "HSG",
      "NKG",
      "POM",
      "SMC",
      "TVN",
      "VGC",
      "VCA",
      "VNS",
      "VSC",
      "GAS",
      "PLX",
      "PVD",
      "PVS",
      "PVT",
      "BSR",
      "OIL",
      "PVC",
      "PVB",
      "PVG",
      "VNM",
      "MSN",
      "MWG",
      "FRT",
      "PNJ",
      "DGW",
      "FPT",
      "CMG",
      "ELC",
      "VGI",
      "SSI",
      "VND",
      "HCM",
      "VCI",
      "CTS",
      "ORS",
      "AGR",
      "SHS",
      "MBS",
      "BSI",
    ]
    return vnStocks.includes(symbol.toUpperCase())
  }

  // Check if symbol is cryptocurrency
  const isCrypto = (symbol) => {
    return (
      symbol.includes("-USD") ||
      symbol.includes("USDT") ||
      ["BTC", "ETH", "BNB", "SOL", "ADA", "DOT", "AVAX", "MATIC", "LINK", "UNI"].includes(symbol.toUpperCase())
    )
  }

  // Fetch Vietnamese stock prices from SSI API
  const fetchVietnameseStockPrice = async (symbol) => {
    try {
      // SSI API (free tier)
      const ssiResponse = await fetch(
        `https://fc-data.ssi.com.vn/api/v2/Market/Securities?market=HOSE,HNX,UPCOM&pageIndex=1&pageSize=1000`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      )

      if (ssiResponse.ok) {
        const data = await ssiResponse.json()
        const stock = data.data?.find((item) => item.symbol === symbol.toUpperCase())
        if (stock && stock.closePrice) {
          return stock.closePrice / 1000 // Convert from VND to thousands VND for easier display
        }
      }

      // Fallback to VietstockFinance API
      const vietstockResponse = await fetch(
        `https://finance.vietstock.vn/data/financeinfo?Code=${symbol.toUpperCase()}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      )

      if (vietstockResponse.ok) {
        const data = await vietstockResponse.json()
        if (data.Price) {
          return data.Price / 1000 // Convert from VND to thousands VND
        }
      }

      // Mock data for Vietnamese stocks if APIs fail
      const vnMockPrices = {
        VN30: 1250,
        TCB: 25.5,
        VCB: 85.2,
        BID: 45.8,
        CTG: 32.1,
        VPB: 28.9,
        MBB: 22.4,
        VHM: 65.3,
        VIC: 78.9,
        HPG: 28.7,
        GAS: 95.4,
        VNM: 82.1,
        MSN: 145.6,
        FPT: 125.8,
        SSI: 35.2,
      }

      return vnMockPrices[symbol.toUpperCase()] || 50 + Math.random() * 100
    } catch (error) {
      console.error(`Error fetching Vietnamese stock ${symbol}:`, error)
      return 50 + Math.random() * 100
    }
  }

  // Fetch cryptocurrency prices from multiple APIs
  const fetchCryptoPrice = async (symbol) => {
    try {
      // Clean symbol for crypto APIs
      let cleanSymbol = symbol.toUpperCase()
      if (cleanSymbol.includes("-USD")) {
        cleanSymbol = cleanSymbol.replace("-USD", "")
      }
      if (cleanSymbol.includes("USDT")) {
        cleanSymbol = cleanSymbol.replace("USDT", "")
      }

      // Try CoinGecko API first (free, reliable)
      const coinGeckoIds = {
        BTC: "bitcoin",
        ETH: "ethereum",
        BNB: "binancecoin",
        SOL: "solana",
        ADA: "cardano",
        DOT: "polkadot",
        AVAX: "avalanche-2",
        MATIC: "matic-network",
        LINK: "chainlink",
        UNI: "uniswap",
      }

      const coinId = coinGeckoIds[cleanSymbol]
      if (coinId) {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`, {
          headers: {
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data[coinId]?.usd) {
            return data[coinId].usd
          }
        }
      }

      // Fallback to Binance API
      const binanceSymbol = `${cleanSymbol}USDT`
      const binanceResponse = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`)

      if (binanceResponse.ok) {
        const data = await binanceResponse.json()
        if (data.price) {
          return Number.parseFloat(data.price)
        }
      }

      // Fallback to CoinCap API
      const coinCapResponse = await fetch(`https://api.coincap.io/v2/assets/${cleanSymbol.toLowerCase()}`)

      if (coinCapResponse.ok) {
        const data = await coinCapResponse.json()
        if (data.data?.priceUsd) {
          return Number.parseFloat(data.data.priceUsd)
        }
      }

      // Mock crypto prices if all APIs fail
      const cryptoMockPrices = {
        BTC: 43000 + Math.random() * 4000,
        ETH: 2500 + Math.random() * 500,
        BNB: 300 + Math.random() * 50,
        SOL: 100 + Math.random() * 20,
        ADA: 0.5 + Math.random() * 0.2,
        DOT: 7 + Math.random() * 2,
        AVAX: 35 + Math.random() * 10,
        MATIC: 0.8 + Math.random() * 0.3,
        LINK: 15 + Math.random() * 5,
        UNI: 6 + Math.random() * 2,
      }

      return cryptoMockPrices[cleanSymbol] || 1 + Math.random() * 10
    } catch (error) {
      console.error(`Error fetching crypto ${symbol}:`, error)
      return 1 + Math.random() * 100
    }
  }

  // Fetch international stock prices
  const fetchInternationalStockPrice = async (symbol) => {
    try {
      // Try Alpha Vantage API (free tier: 5 calls per minute)
      const alphaVantageKey = "demo" // Replace with your API key
      const alphaResponse = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaVantageKey}`,
      )

      if (alphaResponse.ok) {
        const data = await alphaResponse.json()
        const quote = data["Global Quote"]
        if (quote && quote["05. price"]) {
          return Number.parseFloat(quote["05. price"])
        }
      }

      // Fallback to Yahoo Finance API (unofficial)
      const yahooResponse = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)

      if (yahooResponse.ok) {
        const data = await yahooResponse.json()
        const result = data.chart?.result?.[0]
        if (result?.meta?.regularMarketPrice) {
          return result.meta.regularMarketPrice
        }
      }

      // Mock international stock prices
      const intlMockPrices = {
        AAPL: 175 + Math.random() * 20,
        GOOGL: 140 + Math.random() * 15,
        MSFT: 380 + Math.random() * 30,
        TSLA: 200 + Math.random() * 40,
        NVDA: 500 + Math.random() * 100,
        AMZN: 150 + Math.random() * 20,
        META: 350 + Math.random() * 50,
        SPY: 450 + Math.random() * 30,
        QQQ: 380 + Math.random() * 25,
        VTI: 220 + Math.random() * 15,
      }

      return intlMockPrices[symbol.toUpperCase()] || 100 + Math.random() * 200
    } catch (error) {
      console.error(`Error fetching international stock ${symbol}:`, error)
      return 100 + Math.random() * 200
    }
  }

  // Fallback mock price function
  const fetchMockPrice = async (symbol) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const storedPrices = JSON.parse(localStorage.getItem("mock_base_prices") || "{}")

    if (!storedPrices[symbol]) {
      if (isVietnameseStock(symbol)) {
        storedPrices[symbol] = 20 + Math.random() * 100
      } else if (isCrypto(symbol)) {
        storedPrices[symbol] = symbol.includes("BTC") ? 43000 : symbol.includes("ETH") ? 2500 : 1 + Math.random() * 100
      } else {
        storedPrices[symbol] = 50 + Math.random() * 500
      }
      localStorage.setItem("mock_base_prices", JSON.stringify(storedPrices))
    }

    const basePrice = storedPrices[symbol]
    const fluctuation = (Math.random() - 0.5) * 0.02 // 2% fluctuation
    const newPrice = basePrice * (1 + fluctuation)

    storedPrices[symbol] = Math.max(0.01, newPrice)
    localStorage.setItem("mock_base_prices", JSON.stringify(storedPrices))

    return Number.parseFloat(newPrice.toFixed(symbol.includes("VN") || isVietnameseStock(symbol) ? 1 : 2))
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
  }, [autoRefresh, user, investments])

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

  // Main application
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

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <PieChart size={16} />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center space-x-2">
              <TrendingUp size={16} />
              <span>Đầu tư</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 size={16} />
              <span>Phân tích</span>
            </TabsTrigger>
            <TabsTrigger value="contributions" className="flex items-center space-x-2">
              <Users size={16} />
              <span>Vốn góp</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center space-x-2">
              <Target size={16} />
              <span>Mục tiêu</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Phân bổ tài sản</CardTitle>
                </CardHeader>
                <CardContent>
                  {investments.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={investments.map((inv, index) => ({
                            name: inv.symbol,
                            value: inv.quantity * inv.current_price,
                            fill: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", "#FF9FF3", "#54A0FF"][
                              index % 7
                            ],
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Giá trị"]} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                      <div className="text-center">
                        <PieChart size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>Chưa có dữ liệu đầu tư</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vốn góp</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contributions.map((contrib, index) => {
                      const totalContrib = contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
                      const percentage = totalContrib > 0 ? ((contrib.amount || 0) / totalContrib) * 100 : 0
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: ["#FF6B6B", "#4ECDC4", "#45B7D1"][index % 3] }}
                            ></div>
                            <span className="font-medium text-gray-800">{contrib.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-800">${(contrib.amount || 0).toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      )
                    })}
                    {contributions.every((c) => (c.amount || 0) === 0) && (
                      <div className="text-center text-gray-500 py-8">
                        <Users size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>Chưa có dữ liệu vốn góp</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goals Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Tiến độ mục tiêu</CardTitle>
              </CardHeader>
              <CardContent>
                {goals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {goals.slice(0, 4).map((goal) => {
                      // Tự động cập nhật tiến độ
                      let currentProgress = goal.current || 0

                      if (goal.category === "Tổng tài sản") {
                        currentProgress = totalValue
                      } else if (goal.category === "Đầu tư") {
                        currentProgress = totalValue
                      } else if (goal.category === "Thu nhập thụ động") {
                        const estimatedYearlyReturn = totalValue * 0.05
                        currentProgress = estimatedYearlyReturn / 12
                      }

                      const progress = (currentProgress / goal.target) * 100
                      const isCompleted = currentProgress >= goal.target

                      return (
                        <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-800">{goal.title}</h4>
                            <div className="flex items-center space-x-1">
                              <Badge variant={isCompleted ? "default" : "secondary"}>
                                {isCompleted ? "Hoàn thành" : "Đang thực hiện"}
                              </Badge>
                              {goal.category === "Tổng tài sản" && <span className="text-blue-500 text-xs">📊</span>}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>
                              ${currentProgress.toLocaleString()} / ${goal.target?.toLocaleString()}
                            </span>
                            <span>{goal.deadline}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${isCompleted ? "bg-green-500" : "bg-blue-500"}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-sm font-medium text-gray-600 mt-1">
                            {progress.toFixed(1)}% {isCompleted && "🎉"}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Target size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Chưa có mục tiêu nào. Hãy tạo mục tiêu đầu tiên!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-6">
            {/* Add Investment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PlusCircle size={24} />
                  <span>Thêm đầu tư mới</span>
                </CardTitle>
                <CardDescription>
                  💡 <strong>Lưu ý:</strong> Nhập giá mua lịch sử của bạn. Giá hiện tại sẽ được lấy từ thị trường thực
                  tế.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="symbol">Mã chứng khoán</Label>
                    <Input
                      id="symbol"
                      placeholder="VD: AAPL, BTC-USD, TCB, VN30"
                      value={newInvestment.symbol}
                      onChange={(e) => setNewInvestment({ ...newInvestment, symbol: e.target.value.toUpperCase() })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      🇺🇸 US: AAPL, GOOGL, TSLA | 🇻🇳 VN: TCB, VCB, VN30 | 🪙 Crypto: BTC-USD, ETH-USD
                    </p>
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
                    <Label htmlFor="category">Loại đầu tư</Label>
                    <Select
                      value={newInvestment.category}
                      onValueChange={(value) => setNewInvestment({ ...newInvestment, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cổ phiếu">Cổ phiếu</SelectItem>
                        <SelectItem value="Cổ phiếu Việt Nam">Cổ phiếu Việt Nam</SelectItem>
                        <SelectItem value="Tiền điện tử">Tiền điện tử</SelectItem>
                        <SelectItem value="ETF">ETF</SelectItem>
                        <SelectItem value="Vàng">Vàng</SelectItem>
                        <SelectItem value="Bất động sản">Bất động sản</SelectItem>
                      </SelectContent>
                    </Select>
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

                  <div>
                    <Label htmlFor="buyDate">Ngày mua</Label>
                    <Input
                      id="buyDate"
                      type="date"
                      value={newInvestment.buyDate}
                      onChange={(e) => setNewInvestment({ ...newInvestment, buyDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="owner">Chủ sở hữu</Label>
                    <Select
                      value={newInvestment.owner}
                      onValueChange={(value) => setNewInvestment({ ...newInvestment, owner: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tan">Tan</SelectItem>
                        <SelectItem value="Yoko-chan">Yoko-chan</SelectItem>
                        <SelectItem value="Us">Us</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 lg:col-span-1">
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Input
                      id="notes"
                      placeholder="Ghi chú tùy chọn"
                      value={newInvestment.notes}
                      onChange={(e) => setNewInvestment({ ...newInvestment, notes: e.target.value })}
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

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <Filter size={16} />
                    <Label>Bộ lọc:</Label>
                  </div>

                  <Select value={investmentFilter} onValueChange={setInvestmentFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="Cổ phiếu">Cổ phiếu</SelectItem>
                      <SelectItem value="Tiền điện tử">Tiền điện tử</SelectItem>
                      <SelectItem value="ETF">ETF</SelectItem>
                      <SelectItem value="Vàng">Vàng</SelectItem>
                      <SelectItem value="Bất động sản">Bất động sản</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Tìm kiếm theo mã hoặc tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />

                  <Button
                    variant="outline"
                    onClick={async () => {
                      setIsSyncing(true)
                      try {
                        const updatedInvestments = await Promise.all(
                          investments.map(async (inv) => {
                            const newPrice = await fetchRealPrice(inv.symbol)
                            return { ...inv, current_price: newPrice }
                          }),
                        )
                        setInvestments(updatedInvestments)
                        setLastUpdate(new Date())
                      } catch (error) {
                        alert("Lỗi khi cập nhật giá: " + error.message)
                      } finally {
                        setIsSyncing(false)
                      }
                    }}
                    disabled={isSyncing}
                  >
                    <RefreshCw size={16} className={`mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                    Cập nhật giá
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Investments List */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách đầu tư ({filteredInvestments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredInvestments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {investments.length === 0
                      ? "Chưa có đầu tư nào. Hãy thêm đầu tư đầu tiên!"
                      : "Không tìm thấy đầu tư nào phù hợp với bộ lọc."}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-600">Mã</th>
                          <th className="text-left py-2 text-gray-600">Tên</th>
                          <th className="text-left py-2 text-gray-600">Loại</th>
                          <th className="text-right py-2 text-gray-600">Số lượng</th>
                          <th className="text-right py-2 text-gray-600">Giá mua</th>
                          <th className="text-right py-2 text-gray-600">Giá hiện tại</th>
                          <th className="text-right py-2 text-gray-600">Lãi/Lỗ</th>
                          <th className="text-left py-2 text-gray-600">Ngày mua</th>
                          <th className="text-center py-2 text-gray-600">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInvestments.map((inv) => {
                          const gainLoss = (inv.current_price - inv.buy_price) * inv.quantity
                          const gainLossPercent = (((inv.current_price - inv.buy_price) / inv.buy_price) * 100).toFixed(
                            2,
                          )
                          return (
                            <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 font-medium">{inv.symbol}</td>
                              <td className="py-2 text-gray-600">{inv.name || "-"}</td>
                              <td className="py-2">
                                <Badge variant="outline">{inv.category}</Badge>
                              </td>
                              <td className="py-2 text-right">{inv.quantity}</td>
                              <td className="py-2 text-right">${inv.buy_price}</td>
                              <td className="py-2 text-right">${inv.current_price?.toFixed(2)}</td>
                              <td
                                className={`py-2 text-right font-medium ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                ${gainLoss.toFixed(2)} ({gainLossPercent}%)
                              </td>
                              <td className="py-2 text-gray-600">{inv.buy_date}</td>
                              <td className="py-2 text-center">
                                <div className="flex space-x-2 justify-center">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" onClick={() => setEditingInvestment(inv)}>
                                        <Edit2 size={14} />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Chỉnh sửa đầu tư</DialogTitle>
                                        <DialogDescription>Cập nhật thông tin đầu tư {inv.symbol}</DialogDescription>
                                      </DialogHeader>
                                      {editingInvestment && (
                                        <div className="space-y-4">
                                          <div>
                                            <Label>Số lượng</Label>
                                            <Input
                                              type="number"
                                              step="0.0001"
                                              value={editingInvestment.quantity}
                                              onChange={(e) =>
                                                setEditingInvestment({
                                                  ...editingInvestment,
                                                  quantity: Number.parseFloat(e.target.value),
                                                })
                                              }
                                            />
                                          </div>
                                          <div>
                                            <Label>Giá mua</Label>
                                            <Input
                                              type="number"
                                              step="0.01"
                                              value={editingInvestment.buy_price}
                                              onChange={(e) =>
                                                setEditingInvestment({
                                                  ...editingInvestment,
                                                  buy_price: Number.parseFloat(e.target.value),
                                                })
                                              }
                                            />
                                          </div>
                                          <div>
                                            <Label>Ngày mua</Label>
                                            <Input
                                              type="date"
                                              value={editingInvestment.buy_date}
                                              onChange={(e) =>
                                                setEditingInvestment({
                                                  ...editingInvestment,
                                                  buy_date: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                          <div>
                                            <Label>Ghi chú</Label>
                                            <Textarea
                                              value={editingInvestment.notes || ""}
                                              onChange={(e) =>
                                                setEditingInvestment({
                                                  ...editingInvestment,
                                                  notes: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                          <div className="flex space-x-2">
                                            <Button
                                              onClick={() =>
                                                updateInvestment(editingInvestment.id, {
                                                  quantity: editingInvestment.quantity,
                                                  buy_price: editingInvestment.buy_price,
                                                  buy_date: editingInvestment.buy_date,
                                                  notes: editingInvestment.notes,
                                                })
                                              }
                                              disabled={isSyncing}
                                            >
                                              {isSyncing ? "Đang cập nhật..." : "Cập nhật"}
                                            </Button>
                                            <Button variant="outline" onClick={() => setEditingInvestment(null)}>
                                              Hủy
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>

                                  <Button variant="destructive" size="sm" onClick={() => deleteInvestment(inv.id)}>
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
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

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử giao dịch</CardTitle>
              </CardHeader>
              <CardContent>
                {transactionHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có giao dịch nào</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-600">Ngày</th>
                          <th className="text-left py-2 text-gray-600">Loại</th>
                          <th className="text-left py-2 text-gray-600">Mã</th>
                          <th className="text-right py-2 text-gray-600">Số lượng</th>
                          <th className="text-right py-2 text-gray-600">Giá</th>
                          <th className="text-left py-2 text-gray-600">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactionHistory.slice(0, 10).map((transaction) => (
                          <tr key={transaction.id} className="border-b border-gray-100">
                            <td className="py-2">{transaction.date}</td>
                            <td className="py-2">
                              <Badge variant={transaction.type === "BUY" ? "default" : "destructive"}>
                                {transaction.type}
                              </Badge>
                            </td>
                            <td className="py-2 font-medium">{transaction.symbol}</td>
                            <td className="py-2 text-right">{transaction.quantity}</td>
                            <td className="py-2 text-right">${transaction.price}</td>
                            <td className="py-2 text-gray-600">{transaction.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUpIcon size={20} />
                    <span>Hiệu suất danh mục đầu tư</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={portfolioHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="cost" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Risk Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle size={20} />
                    <span>Phân tích rủi ro</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Đa dạng hóa danh mục</span>
                      <Badge variant={investments.length >= 5 ? "default" : "destructive"}>
                        {investments.length >= 5 ? "Tốt" : "Cần cải thiện"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Tỷ lệ tiền điện tử</span>
                      <span className="text-sm text-gray-600">
                        {(
                          (investments.filter((inv) => inv.category === "Tiền điện tử").length / investments.length) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Mức độ tập trung</span>
                      <Badge variant="outline">Trung bình</Badge>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Khuyến nghị:</strong> Xem xét đa dạng hóa thêm các loại tài sản khác nhau để giảm rủi
                        ro.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Hiệu suất theo loại tài sản</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(
                        investments.reduce((acc, inv) => {
                          if (!acc[inv.category]) {
                            acc[inv.category] = { value: 0, cost: 0, count: 0 }
                          }
                          acc[inv.category].value += inv.quantity * inv.current_price
                          acc[inv.category].cost += inv.quantity * inv.buy_price
                          acc[inv.category].count += 1
                          return acc
                        }, {}),
                      ).map(([category, data]) => ({
                        category,
                        value: data.value,
                        cost: data.cost,
                        gainLoss: data.value - data.cost,
                        count: data.count,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Giá trị hiện tại" />
                      <Bar dataKey="cost" fill="#82ca9d" name="Giá gốc" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {investments
                      .map((inv) => ({
                        ...inv,
                        gainLossPercent: ((inv.current_price - inv.buy_price) / inv.buy_price) * 100,
                      }))
                      .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
                      .slice(0, 5)
                      .map((inv, index) => (
                        <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                    ? "bg-gray-400"
                                    : index === 2
                                      ? "bg-orange-500"
                                      : "bg-blue-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{inv.symbol}</p>
                              <p className="text-sm text-gray-600">{inv.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${inv.gainLossPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {inv.gainLossPercent >= 0 ? "+" : ""}
                              {inv.gainLossPercent.toFixed(2)}%
                            </p>
                            <p className="text-sm text-gray-600">
                              ${((inv.current_price - inv.buy_price) * inv.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contributions Tab */}
          <TabsContent value="contributions" className="space-y-6">
            {/* Add Contribution Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users size={24} />
                  <span>Thêm vốn góp</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="contrib-name">Người góp</Label>
                    <Select
                      value={newContribution.name}
                      onValueChange={(value) => setNewContribution({ ...newContribution, name: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tan">Tan</SelectItem>
                        <SelectItem value="Yoko-chan">Yoko-chan</SelectItem>
                        <SelectItem value="Us">Us</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contrib-amount">Số tiền ($)</Label>
                    <Input
                      id="contrib-amount"
                      type="number"
                      placeholder="Số tiền"
                      value={newContribution.amount}
                      onChange={(e) => setNewContribution({ ...newContribution, amount: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contrib-date">Ngày góp</Label>
                    <Input
                      id="contrib-date"
                      type="date"
                      value={newContribution.date}
                      onChange={(e) => setNewContribution({ ...newContribution, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contrib-notes">Ghi chú</Label>
                    <Input
                      id="contrib-notes"
                      placeholder="Ghi chú tùy chọn"
                      value={newContribution.notes}
                      onChange={(e) => setNewContribution({ ...newContribution, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button onClick={addContribution} disabled={isSyncing}>
                    {isSyncing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <PlusCircle size={20} className="mr-2" />
                        Thêm vốn góp
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contribution Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan vốn góp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contributions.map((contrib, index) => {
                    const totalAmount = contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
                    const percentage = totalAmount > 0 ? ((contrib.amount || 0) / totalAmount) * 100 : 0
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: ["#FF6B6B", "#4ECDC4", "#45B7D1"][index % 3] }}
                          ></div>
                          <span className="font-medium text-gray-800">{contrib.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-800">${(contrib.amount || 0).toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newAmount = prompt(`Cập nhật số tiền cho ${contrib.name}:`, contrib.amount || 0)
                              if (newAmount !== null) {
                                const amount = Number.parseFloat(newAmount)
                                if (!isNaN(amount) && amount >= 0) {
                                  const updatedContributions = contributions.map((c) =>
                                    c.name === contrib.name ? { ...c, amount } : c,
                                  )
                                  setContributions(updatedContributions)
                                }
                              }
                            }}
                          >
                            <Edit2 size={14} />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Contribution History */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử đóng góp</CardTitle>
              </CardHeader>
              <CardContent>
                {contributionHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có lịch sử đóng góp</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-600">Ngày</th>
                          <th className="text-left py-2 text-gray-600">Người góp</th>
                          <th className="text-right py-2 text-gray-600">Số tiền</th>
                          <th className="text-left py-2 text-gray-600">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contributionHistory.map((contrib) => (
                          <tr key={contrib.id} className="border-b border-gray-100">
                            <td className="py-2">{contrib.date}</td>
                            <td className="py-2 font-medium">{contrib.name}</td>
                            <td className="py-2 text-right">${contrib.amount.toLocaleString()}</td>
                            <td className="py-2 text-gray-600">{contrib.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Biểu đồ vốn góp theo thời gian</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={contributionHistory.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            {/* Add Goal Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target size={24} />
                  <span>Thêm mục tiêu mới</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal-title">Tiêu đề mục tiêu</Label>
                    <Input
                      id="goal-title"
                      placeholder="VD: Mua nhà, Nghỉ hưu sớm"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="goal-category">Loại mục tiêu</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tổng tài sản">Tổng tài sản</SelectItem>
                        <SelectItem value="Thu nhập thụ động">Thu nhập thụ động</SelectItem>
                        <SelectItem value="Tiết kiệm">Tiết kiệm</SelectItem>
                        <SelectItem value="Đầu tư">Đầu tư</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="goal-target">Mục tiêu ($)</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      placeholder="VD: 100000"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="goal-current">Hiện tại ($)</Label>
                    <Input
                      id="goal-current"
                      type="number"
                      placeholder="VD: 25000"
                      value={newGoal.current}
                      onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="goal-deadline">Thời hạn</Label>
                    <Input
                      id="goal-deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="goal-description">Mô tả</Label>
                    <Textarea
                      id="goal-description"
                      placeholder="Mô tả chi tiết về mục tiêu"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button onClick={addGoal} disabled={isSyncing}>
                    {isSyncing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <PlusCircle size={20} className="mr-2" />
                        Thêm mục tiêu
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Goals List */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách mục tiêu</CardTitle>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có mục tiêu nào. Hãy thêm mục tiêu đầu tiên!</p>
                ) : (
                  <div className="space-y-4">
                    {goals.map((goal) => {
                      // Tự động cập nhật tiến độ dựa trên loại mục tiêu
                      let currentProgress = goal.current || 0

                      if (goal.category === "Tổng tài sản") {
                        currentProgress = totalValue // Sử dụng tổng giá trị đầu tư
                      } else if (goal.category === "Đầu tư") {
                        currentProgress = totalValue // Sử dụng tổng giá trị đầu tư
                      } else if (goal.category === "Thu nhập thụ động") {
                        // Có thể tính toán thu nhập ước tính từ cổ tức/lãi suất
                        const estimatedYearlyReturn = totalValue * 0.05 // Giả sử 5% yearly return
                        currentProgress = estimatedYearlyReturn / 12 // Thu nhập hàng tháng
                      }
                      // Với "Tiết kiệm" thì vẫn dùng giá trị thủ công từ goal.current

                      const progress = (currentProgress / goal.target) * 100
                      const isCompleted = currentProgress >= goal.target
                      const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))

                      return (
                        <div key={goal.id} className="p-6 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-medium text-gray-800 text-lg">{goal.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline">{goal.category}</Badge>
                                {goal.category === "Tổng tài sản" && (
                                  <Badge variant="secondary" className="text-xs">
                                    📊 Tự động từ portfolio
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {goal.category === "Tiết kiệm" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const amount = prompt("Thêm tiến độ ($):")
                                    if (amount) {
                                      const addAmount = Number.parseFloat(amount)
                                      if (!isNaN(addAmount)) {
                                        setGoals(
                                          goals.map((g) =>
                                            g.id === goal.id
                                              ? { ...g, current: Math.min((g.current || 0) + addAmount, g.target) }
                                              : g,
                                          ),
                                        )
                                      }
                                    }
                                  }}
                                >
                                  + Tiến độ
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm("Bạn có chắc muốn xóa mục tiêu này?")) {
                                    setGoals(goals.filter((g) => g.id !== goal.id))
                                  }
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>

                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>
                              ${currentProgress.toLocaleString()} / ${goal.target?.toLocaleString()}
                              {goal.category === "Tổng tài sản" && (
                                <span className="text-blue-600 ml-2">(Cập nhật tự động từ portfolio)</span>
                              )}
                            </span>
                            <span className={daysLeft > 0 ? "text-blue-600" : "text-red-600"}>
                              {daysLeft > 0 ? `${daysLeft} ngày còn lại` : "Đã quá hạn"}
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${isCompleted ? "bg-green-500" : "bg-blue-500"}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className={`text-sm font-medium ${isCompleted ? "text-green-600" : "text-gray-600"}`}>
                              {progress.toFixed(1)}% {isCompleted && "🎉 Hoàn thành!"}
                            </span>
                            <span className="text-xs text-gray-500">Deadline: {goal.deadline}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function App() {
  return <EnhancedPortfolioTracker />
}
