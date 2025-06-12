"use client"

import { BarChart3, ShoppingCart, Users, Package, UserCheck, Gift, Home, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "Επισκόπηση", icon: Home },
    { id: "orders", label: "Παραγγελίες", icon: ShoppingCart },
    { id: "customers", label: "Πελάτες", icon: Users },
    { id: "products", label: "Προϊόντα", icon: Package },
    { id: "employees", label: "Υπάλληλοι", icon: UserCheck },
    { id: "holidays", label: "Εορταστικά", icon: Gift },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">OrderFlow</h2>
            <p className="text-sm text-gray-500">Διαχείρηση Παραγγελιών</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                activeTab === item.id && "bg-blue-600 text-white hover:bg-blue-700",
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3">
          <Settings className="h-5 w-5" />
          Ρυθμίσεις
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="h-5 w-5" />
          Αποσύνδεση
        </Button>
      </div>
    </div>
  )
}
