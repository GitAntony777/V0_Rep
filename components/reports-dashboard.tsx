"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Users, ShoppingCart, Euro, Download, Filter } from "lucide-react"
import { usePeriod } from "@/contexts/period-context"

interface ReportsDashboardProps {
  userRole?: "admin" | "employee" | null
}

interface SalesData {
  period: string
  sales: number
  orders: number
}

interface ProductSales {
  name: string
  sales: number
  quantity: number
}

interface CustomerStats {
  id: string
  name: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function ReportsDashboard({ userRole }: ReportsDashboardProps) {
  const { getActivePeriodName } = usePeriod()
  const [orders, setOrders] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [dateRange, setDateRange] = useState("30")
  const [reportType, setReportType] = useState("overview")

  // Φόρτωση δεδομένων
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("orders")
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders))
      }

      const savedCustomers = localStorage.getItem("customers")
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers))
      }

      const savedProducts = localStorage.getItem("products")
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts))
      }
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }, [])

  // Υπολογισμός στατιστικών
  const calculateStats = () => {
    const now = new Date()
    const daysAgo = new Date(now.getTime() - Number.parseInt(dateRange) * 24 * 60 * 60 * 1000)

    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.orderDate)
      return orderDate >= daysAgo
    })

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.amount || 0), 0)
    const totalOrders = filteredOrders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const completedOrders = filteredOrders.filter((order) => order.status === "Παραδόθηκε")
    const pendingOrders = filteredOrders.filter((order) => order.status === "Εκκρεμότητες" || order.status === "Νέα")

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      completionRate: totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0,
    }
  }

  // Δεδομένα για γραφήματα
  const getSalesData = (): SalesData[] => {
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayOrders = orders.filter((order) => order.orderDate?.split("T")[0] === dateStr)
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.amount || 0), 0)

      last7Days.push({
        period: date.toLocaleDateString("el-GR", { weekday: "short", day: "numeric" }),
        sales: dayRevenue,
        orders: dayOrders.length,
      })
    }
    return last7Days
  }

  const getTopProducts = (): ProductSales[] => {
    const productSales: { [key: string]: { sales: number; quantity: number } } = {}

    orders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          if (!productSales[item.productName]) {
            productSales[item.productName] = { sales: 0, quantity: 0 }
          }
          productSales[item.productName].sales += item.total || 0
          productSales[item.productName].quantity += item.quantity || 0
        })
      }
    })

    return Object.entries(productSales)
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        quantity: data.quantity,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
  }

  const getTopCustomers = (): CustomerStats[] => {
    const customerStats: { [key: string]: CustomerStats } = {}

    orders.forEach((order) => {
      if (!customerStats[order.customerId]) {
        customerStats[order.customerId] = {
          id: order.customerId,
          name: order.customer,
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: order.orderDate,
        }
      }

      customerStats[order.customerId].totalOrders += 1
      customerStats[order.customerId].totalSpent += order.amount || 0

      if (new Date(order.orderDate) > new Date(customerStats[order.customerId].lastOrder)) {
        customerStats[order.customerId].lastOrder = order.orderDate
      }
    })

    return Object.values(customerStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
  }

  const stats = calculateStats()
  const salesData = getSalesData()
  const topProducts = getTopProducts()
  const topCustomers = getTopCustomers()

  const exportReport = () => {
    const reportData = {
      period: getActivePeriodName(),
      dateRange: `${dateRange} ημέρες`,
      stats,
      topProducts,
      topCustomers,
      generatedAt: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `report-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Αναφορές & Στατιστικά</h1>
          <p className="text-gray-600 mt-2">Αναλυτικές αναφορές για την περίοδο: {getActivePeriodName()}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Εξαγωγή Αναφοράς
          </Button>
        </div>
      </div>

      {/* Φίλτρα */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Φίλτρα Αναφοράς
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <Label htmlFor="dateRange">Χρονικό Διάστημα</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Τελευταίες 7 ημέρες</SelectItem>
                  <SelectItem value="30">Τελευταίες 30 ημέρες</SelectItem>
                  <SelectItem value="90">Τελευταίες 90 ημέρες</SelectItem>
                  <SelectItem value="365">Τελευταίος χρόνος</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportType">Τύπος Αναφοράς</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Γενική Επισκόπηση</SelectItem>
                  <SelectItem value="sales">Πωλήσεις</SelectItem>
                  <SelectItem value="products">Προϊόντα</SelectItem>
                  <SelectItem value="customers">Πελάτες</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Κύρια Στατιστικά */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Συνολικά Έσοδα</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Τελευταίες {dateRange} ημέρες</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Συνολικές Παραγγελίες</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedOrders} ολοκληρωμένες, {stats.pendingOrders} εκκρεμείς
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Μέση Αξία Παραγγελίας</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ανά παραγγελία</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ποσοστό Ολοκλήρωσης</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Παραδομένες παραγγελίες</p>
          </CardContent>
        </Card>
      </div>

      {/* Γραφήματα */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Γράφημα Πωλήσεων */}
        <Card>
          <CardHeader>
            <CardTitle>Πωλήσεις Τελευταίων 7 Ημερών</CardTitle>
            <CardDescription>Ημερήσια έσοδα και αριθμός παραγγελιών</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="Έσοδα (€)" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Παραγγελίες" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Κορυφαία Προϊόντα */}
        <Card>
          <CardHeader>
            <CardTitle>Κορυφαία Προϊόντα</CardTitle>
            <CardDescription>Τα 5 προϊόντα με τις περισσότερες πωλήσεις</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sales"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`€${Number(value).toFixed(2)}`, "Πωλήσεις"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Κορυφαίοι Πελάτες */}
      <Card>
        <CardHeader>
          <CardTitle>Κορυφαίοι Πελάτες</CardTitle>
          <CardDescription>Οι 10 πελάτες με τις περισσότερες αγορές</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Πελάτης</TableHead>
                  <TableHead>Παραγγελίες</TableHead>
                  <TableHead>Συνολικό Ποσό</TableHead>
                  <TableHead>Μέση Αξία</TableHead>
                  <TableHead>Τελευταία Παραγγελία</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Δεν υπάρχουν δεδομένα πελατών
                    </TableCell>
                  </TableRow>
                ) : (
                  topCustomers.map((customer, index) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell>€{customer.totalSpent.toFixed(2)}</TableCell>
                      <TableCell>€{(customer.totalSpent / customer.totalOrders).toFixed(2)}</TableCell>
                      <TableCell>{new Date(customer.lastOrder).toLocaleDateString("el-GR")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Λεπτομερή Στατιστικά Προϊόντων */}
      {topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Λεπτομερή Στατιστικά Προϊόντων</CardTitle>
            <CardDescription>Αναλυτικά στοιχεία για τα κορυφαία προϊόντα</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Προϊόν</TableHead>
                    <TableHead>Ποσότητα Πωλήσεων</TableHead>
                    <TableHead>Συνολικά Έσοδα</TableHead>
                    <TableHead>Μέση Τιμή</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>€{product.sales.toFixed(2)}</TableCell>
                      <TableCell>€{(product.sales / product.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
