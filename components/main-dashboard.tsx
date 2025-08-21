"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ButcherSidebar } from "./butcher-sidebar"
import { CustomerManagement } from "./customer-management"
import { ProductManagement } from "./product-management"
import { OrderManagement } from "./order-management"
import { EmployeeManagement } from "./employee-management"
import { ReportsDashboard } from "./reports-dashboard"
import { CategoryManagement } from "./category-management"
import { UnitsManagement } from "./units-management"
import { usePeriod } from "@/contexts/period-context"

interface MainDashboardProps {
  userRole: "admin" | "employee" | null
  userName: string
  onLogout: () => void
  onPeriodChange: () => void
}

export function MainDashboard({ userRole, userName, onLogout, onPeriodChange }: MainDashboardProps) {
  const [activeSection, setActiveSection] = useState("dashboard")
  const { activePeriod } = usePeriod()

  const renderContent = () => {
    switch (activeSection) {
      case "customers":
        return <CustomerManagement userRole={userRole} />
      case "products":
        return <ProductManagement userRole={userRole} />
      case "orders":
        return <OrderManagement userRole={userRole} />
      case "employees":
        return userRole === "admin" ? (
          <EmployeeManagement userRole={userRole} />
        ) : (
          <div>Δεν έχετε δικαίωμα πρόσβασης</div>
        )
      case "reports":
        return <ReportsDashboard userRole={userRole} />
      case "categories":
        return <CategoryManagement userRole={userRole} />
      case "units":
        return <UnitsManagement userRole={userRole} />
      default:
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Καλώς ήρθατε στο Σύστημα Διαχείρισης</h1>
              <p className="text-gray-600 mt-2">Κρεοπωλείο "ΤΟ ΜΠΕΛΛΕΣ"</p>
              {activePeriod && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">Ενεργή Περίοδος: {activePeriod.name}</p>
                  <p className="text-red-600 text-sm">
                    {new Date(activePeriod.startDate).toLocaleDateString("el-GR")} -{" "}
                    {new Date(activePeriod.endDate).toLocaleDateString("el-GR")}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                className="bg-white p-6 rounded-lg shadow-md border cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-blue-50 hover:border-blue-200"
                onClick={() => setActiveSection("customers")}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Πελάτες</h3>
                <p className="text-gray-600 text-sm">Διαχείριση πελατολογίου</p>
              </div>

              <div
                className="bg-white p-6 rounded-lg shadow-md border cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-green-50 hover:border-green-200"
                onClick={() => setActiveSection("products")}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Προϊόντα</h3>
                <p className="text-gray-600 text-sm">Κατάλογος προϊόντων</p>
              </div>

              <div
                className="bg-white p-6 rounded-lg shadow-md border cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-orange-50 hover:border-orange-200"
                onClick={() => setActiveSection("orders")}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Παραγγελίες</h3>
                <p className="text-gray-600 text-sm">Διαχείριση παραγγελιών</p>
              </div>

              {userRole === "admin" && (
                <div
                  className="bg-white p-6 rounded-lg shadow-md border cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-purple-50 hover:border-purple-200"
                  onClick={() => setActiveSection("employees")}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Υπάλληλοι</h3>
                  <p className="text-gray-600 text-sm">Διαχείριση προσωπικού</p>
                </div>
              )}

              <div
                className="bg-white p-6 rounded-lg shadow-md border cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-indigo-50 hover:border-indigo-200"
                onClick={() => setActiveSection("reports")}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Αναφορές</h3>
                <p className="text-gray-600 text-sm">Στατιστικά και αναφορές</p>
              </div>

              <div
                className="bg-white p-6 rounded-lg shadow-md border cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-teal-50 hover:border-teal-200"
                onClick={() => setActiveSection("categories")}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Κατηγορίες</h3>
                <p className="text-gray-600 text-sm">Διαχείριση κατηγοριών</p>
              </div>

              <div
                className="bg-white p-6 rounded-lg shadow-md border cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-yellow-50 hover:border-yellow-200"
                onClick={() => setActiveSection("units")}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Μονάδες</h3>
                <p className="text-gray-600 text-sm">Μονάδες μέτρησης</p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ButcherSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userRole={userRole}
          userName={userName}
          onLogout={onLogout}
          onBackToPeriods={onPeriodChange}
        />
        <main className="flex-1 overflow-auto bg-gray-50">{renderContent()}</main>
      </div>
    </SidebarProvider>
  )
}
