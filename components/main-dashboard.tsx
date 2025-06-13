"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { ButcherSidebar } from "@/components/butcher-sidebar"
import { OrderManagementSimplified } from "@/components/order/order-management-simplified"
import { ProductManagement } from "@/components/product-management"
import { CustomerManagement } from "@/components/customer-management"
import { EmployeeManagement } from "@/components/employee-management"
import { CategoryManagement } from "@/components/category-management"
import { UnitsManagement } from "@/components/units-management"
import { ReportsDashboard } from "@/components/reports-dashboard"
import { PeriodSelection } from "@/components/period-selection-fixed"
import { PeriodProvider } from "@/contexts/period-context"
import { LogOut, Settings } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface MainDashboardProps {
  userRole: "admin" | "employee"
  onLogout: () => void
}

export function MainDashboard({ userRole, onLogout }: MainDashboardProps) {
  const [activeTab, setActiveTab] = useState("orders")
  const isMobile = useMobile()

  return (
    <PeriodProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:block w-64 border-r bg-gray-50">
          {userRole === "admin" ? <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} /> : <ButcherSidebar />}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/placeholder-logo.png" alt="Logo" className="h-8 w-8" />
              <h1 className="text-xl font-bold">ΤΟ ΜΠΕΛΛΕΣ</h1>
            </div>
            <div className="flex items-center gap-2">
              <PeriodSelection />
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Αποσύνδεση
              </Button>
            </div>
          </header>

          {/* Mobile Tabs */}
          {isMobile && (
            <div className="p-2 bg-gray-50 border-b">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="orders">Παραγγελίες</TabsTrigger>
                  <TabsTrigger value="products">Προϊόντα</TabsTrigger>
                  <TabsTrigger value="customers">Πελάτες</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Content */}
          <main className="flex-1 overflow-auto p-4">
            {activeTab === "orders" && <OrderManagementSimplified userRole={userRole} />}
            {activeTab === "products" && <ProductManagement />}
            {activeTab === "customers" && <CustomerManagement />}
            {activeTab === "employees" && userRole === "admin" && <EmployeeManagement />}
            {activeTab === "categories" && userRole === "admin" && <CategoryManagement />}
            {activeTab === "units" && userRole === "admin" && <UnitsManagement />}
            {activeTab === "reports" && <ReportsDashboard />}
            {activeTab === "settings" && userRole === "admin" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Ρυθμίσεις Συστήματος
                  </CardTitle>
                  <CardDescription>Διαχειριστείτε τις ρυθμίσεις του συστήματος</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Περιεχόμενο ρυθμίσεων συστήματος...</p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </PeriodProvider>
  )
}
