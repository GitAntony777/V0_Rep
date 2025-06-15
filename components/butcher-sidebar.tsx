"use client"

import {
  ShoppingCart,
  Users,
  Package,
  UserCheck,
  Beef,
  Home,
  LogOut,
  FileText,
  Tag,
  Ruler,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePeriod } from "@/contexts/period-context"

interface ButcherSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  userRole: "admin" | "employee" | null
  userName: string
  onLogout: () => void
  onBackToPeriods: () => void
}

export function ButcherSidebar({
  activeSection,
  onSectionChange,
  userRole,
  userName,
  onLogout,
  onBackToPeriods,
}: ButcherSidebarProps) {
  const { activePeriod } = usePeriod()

  const menuItems = [
    { id: "dashboard", label: "Επισκόπηση", icon: Home, adminOnly: false },
    { id: "orders", label: "Παραγγελίες", icon: ShoppingCart, adminOnly: false },
    { id: "customers", label: "Πελατολόγιο", icon: Users, adminOnly: false },
    { id: "products", label: "Προϊόντα", icon: Package, adminOnly: false },
    { id: "categories", label: "Κατηγορίες", icon: Tag, adminOnly: false },
    { id: "units", label: "Μονάδες Μέτρησης", icon: Ruler, adminOnly: false },
    { id: "employees", label: "Υπάλληλοι", icon: UserCheck, adminOnly: true },
    { id: "reports", label: "Αναφορές", icon: FileText, adminOnly: false },
  ]

  const filteredMenuItems = menuItems.filter((item) => !item.adminOnly || userRole === "admin")

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Beef className="h-8 w-8 text-red-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">ΤΟ ΜΠΕΛΛΕΣ</h2>
            <p className="text-sm text-gray-500">Κρεοπωλείο</p>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Συνδεδεμένος ως: {userName} ({userRole === "admin" ? "Διαχειριστής" : "Υπάλληλος"})
        </div>
        {activePeriod && (
          <div className="mt-2 p-2 bg-red-50 rounded-md border border-red-100">
            <p className="text-xs font-medium text-red-700">Ενεργή Περίοδος:</p>
            <p className="text-sm text-red-800">{activePeriod.name}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                activeSection === item.id && "bg-red-600 text-white hover:bg-red-700",
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-amber-600 border-amber-200 hover:bg-amber-50"
          onClick={onBackToPeriods}
        >
          <ArrowLeft className="h-5 w-5" />
          Αλλαγή Περιόδου
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          Αποσύνδεση
        </Button>
      </div>
    </div>
  )
}
