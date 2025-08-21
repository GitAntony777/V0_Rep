"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Calendar,
  Euro,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { usePeriod } from "@/contexts/period-context"

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  totalCustomers: number
  totalProducts: number
  todayOrders: number
  todayRevenue: number
}

interface Order {
  id: string
  customer: string
  amount: number
  status: string
  deliveryDate: string
  orderDate: string
  period: string
}

export function MainDashboard() {
  const { getActivePeriodName } = usePeriod()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    todayOrders: 0,
    todayRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    try {
      // Φόρτωση παραγγελιών
      const orders = JSON.parse(localStorage.getItem("orders") || "[]")
      const customers = JSON.parse(localStorage.getItem("customers") || "[]")
      const products = JSON.parse(localStorage.getItem("products") || "[]")

      // Υπολογισμός στατιστικών
      const today = new Date().toISOString().split("T")[0]
      const todayOrders = orders.filter((order: Order) => order.orderDate?.split("T")[0] === today)

      const pendingOrders = orders.filter(
        (order: Order) => order.status === "Εκκρεμής" || order.status === "Νέα" || order.status === "Επιβεβαιωμένη",
      )

      const completedOrders = orders.filter(
        (order: Order) => order.status === "Παραδόθηκε" || order.status === "Έτοιμη",
      )

      setStats({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum: number, order: Order) => sum + (order.amount || 0), 0),
        pendingOrders: pendingOrders.length,
        completedOrders: completedOrders.length,
        totalCustomers: customers.length,
        totalProducts: products.length,
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum: number, order: Order) => sum + (order.amount || 0), 0),
      })

      // Πρόσφατες παραγγελίες (τελευταίες 5)
      const sortedOrders = orders
        .sort((a: Order, b: Order) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime())
        .slice(0, 5)

      setRecentOrders(sortedOrders)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Παραδόθηκε":
        return "bg-green-100 text-green-800"
      case "Έτοιμη":
      case "Μέσα":
        return "bg-blue-100 text-blue-800"
      case "Εκκρεμότητες":
      case "Εκκρεμής":
        return "bg-yellow-100 text-yellow-800"
      case "Ακυρώθηκε":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Παραδόθηκε":
        return <CheckCircle className="h-4 w-4" />
      case "Έτοιμη":
      case "Μέσα":
        return <Clock className="h-4 w-4" />
      case "Εκκρεμότητες":
      case "Εκκρεμής":
        return <AlertCircle className="h-4 w-4" />
      case "Ακυρώθηκε":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Επισκόπηση δραστηριότητας για την περίοδο: {getActivePeriodName()}</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          Ανανέωση Δεδομένων
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Συνολικές Παραγγελίες</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Σήμερα: {stats.todayOrders} παραγγελίες</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Συνολικά Έσοδα</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Σήμερα: €{stats.todayRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Εκκρεμείς Παραγγελίες</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Ολοκληρωμένες: {stats.completedOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Πελάτες & Προϊόντα</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Προϊόντα: {stats.totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Πρόσφατες Παραγγελίες
          </CardTitle>
          <CardDescription>Οι τελευταίες 5 παραγγελίες που καταχωρήθηκαν</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2" />
              <p>Δεν υπάρχουν πρόσφατες παραγγελίες</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-sm text-gray-500">
                        Παραγγελία: {order.id} • Παράδοση: {new Date(order.deliveryDate).toLocaleDateString("el-GR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">€{order.amount?.toFixed(2) || "0.00"}</span>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Γρήγορες Ενέργειες
          </CardTitle>
          <CardDescription>Συχνά χρησιμοποιούμενες λειτουργίες</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-sm">Νέα Παραγγελία</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
              <Users className="h-6 w-6" />
              <span className="text-sm">Νέος Πελάτης</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
              <Package className="h-6 w-6" />
              <span className="text-sm">Νέο Προϊόν</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Αναφορές</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
