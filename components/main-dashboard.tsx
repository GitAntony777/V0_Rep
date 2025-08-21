"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Settings,
  LogOut,
  User,
  BarChart3,
  FileText,
  UserCheck,
  Layers,
} from "lucide-react"
import { OrderManagementSimplified } from "./order/order-management-simplified"
import { CustomerManagement } from "./customer-management"
import { ProductManagement } from "./product-management"
import { EmployeeManagement } from "./employee-management"
import { CategoryManagement } from "./category-management"
import { UnitsManagement } from "./units-management"
import { ReportsDashboard } from "./reports-dashboard"
import { PeriodSelectionFixed } from "./period-selection-fixed"
import { usePeriod } from "@/contexts/period-context"

interface MainDashboardProps {
  user: { role: "admin" | "employee"; name: string }
  onLogout: () => void
}

export function MainDashboard({ user, onLogout }: MainDashboardProps) {
  const [activeSection, setActiveSection] = useState("dashboard")
  const { getActivePeriodName } = usePeriod()

  // Safely get the active period name as string
  const activePeriodName = getActivePeriodName()
  const displayPeriodName = typeof activePeriodName === "string" ? activePeriodName : "Καμία Περίοδος"

  const menuItems = [
    { id: "dashboard", label: "Αρχική", icon: BarChart3, adminOnly: false },
    { id: "orders", label: "Παραγγελίες", icon: ShoppingCart, adminOnly: false },
    { id: "customers", label: "Πελάτες", icon: Users, adminOnly: false },
    { id: "products", label: "Προϊόντα", icon: Package, adminOnly: true },
    { id: "categories", label: "Κατηγορίες", icon: Layers, adminOnly: true },
    { id: "units", label: "Μονάδες", icon: Settings, adminOnly: true },
    { id: "employees", label: "Υπάλληλοι", icon: UserCheck, adminOnly: true },
    { id: "reports", label: "Αναφορές", icon: FileText, adminOnly: true },
  ]

  const filteredMenuItems = menuItems.filter((item) => !item.adminOnly || user.role === "admin")

  const renderContent = () => {
    switch (activeSection) {
      case "orders":
        return <OrderManagementSimplified userRole={user.role} />
      case "customers":
        return <CustomerManagement />
      case "products":
        return <ProductManagement />
      case "categories":
        return <CategoryManagement />
      case "units":
        return <UnitsManagement />
      case "employees":
        return <EmployeeManagement />
      case "reports":
        return <ReportsDashboard />
      case "dashboard":
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Καλώς ήρθατε, {user.name}
                </CardTitle>
                <CardDescription>
                  Ενεργή περίοδος: <Badge variant="secondary">{displayPeriodName}</Badge>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Συνολικές Παραγγελίες</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">για την ενεργή περίοδο</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ενεργοί Πελάτες</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">συνολικά</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Προϊόντα</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">διαθέσιμα</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Συνολικά Έσοδα</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€0.00</div>
                  <p className="text-xs text-muted-foreground">για την ενεργή περίοδο</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Γρήγορες Ενέργειες</CardTitle>
                <CardDescription>Συχνά χρησιμοποιούμενες λειτουργίες</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 bg-transparent"
                    onClick={() => setActiveSection("orders")}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    <span>Νέα Παραγγελία</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 bg-transparent"
                    onClick={() => setActiveSection("customers")}
                  >
                    <Users className="h-6 w-6" />
                    <span>Διαχείριση Πελατών</span>
                  </Button>

                  {user.role === "admin" && (
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col gap-2 bg-transparent"
                      onClick={() => setActiveSection("reports")}
                    >
                      <FileText className="h-6 w-6" />
                      <span>Αναφορές</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">ΤΟ ΜΠΕΛΛΕΣ - Κρεοπωλείο</h1>
              <Badge variant="outline">{user.role === "admin" ? "Διαχειριστής" : "Υπάλληλος"}</Badge>
            </div>

            <div className="flex items-center gap-4">
              <PeriodSelectionFixed />
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Αποσύνδεση
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{renderContent()}</main>
        </div>
      </div>
    </div>
  )
}
