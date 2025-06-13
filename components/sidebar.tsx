"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Users, Package, BarChart3, Settings, User, LogOut, ChevronDown, Tags, Scale } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isProductsOpen, setIsProductsOpen] = useState(false)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <img src="/placeholder-logo.png" alt="Logo" className="h-8 w-8" />
          <div>
            <h2 className="font-bold">ΤΟ ΜΠΕΛΛΕΣ</h2>
            <p className="text-xs text-gray-500">Σύστημα Διαχείρισης</p>
          </div>
        </div>
      </div>

      <div className="flex-1 py-4 overflow-auto">
        <div className="px-3 mb-2 text-xs font-medium text-gray-400">ΚΥΡΙΟ ΜΕΝΟΥ</div>
        <nav className="space-y-1 px-2">
          <Button
            variant={activeTab === "orders" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Παραγγελίες
          </Button>

          <Collapsible open={isProductsOpen} onOpenChange={setIsProductsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Προϊόντα
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isProductsOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pl-6 space-y-1 mt-1">
                <Button
                  variant={activeTab === "products" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("products")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Κατάλογος Προϊόντων
                </Button>
                <Button
                  variant={activeTab === "categories" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("categories")}
                >
                  <Tags className="h-4 w-4 mr-2" />
                  Κατηγορίες
                </Button>
                <Button
                  variant={activeTab === "units" ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("units")}
                >
                  <Scale className="h-4 w-4 mr-2" />
                  Μονάδες Μέτρησης
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Button
            variant={activeTab === "customers" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("customers")}
          >
            <Users className="h-4 w-4 mr-2" />
            Πελάτες
          </Button>

          <Button
            variant={activeTab === "employees" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("employees")}
          >
            <User className="h-4 w-4 mr-2" />
            Υπάλληλοι
          </Button>

          <Button
            variant={activeTab === "reports" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("reports")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Αναφορές
          </Button>
        </nav>

        <div className="px-3 mt-6 mb-2 text-xs font-medium text-gray-400">ΡΥΘΜΙΣΕΙΣ</div>
        <nav className="space-y-1 px-2">
          <Button
            variant={activeTab === "settings" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Ρυθμίσεις
          </Button>
        </nav>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <img src="/placeholder-user.jpg" alt="User" className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <p className="font-medium text-sm">Διαχειριστής</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
          <Button variant="ghost" size="icon">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
