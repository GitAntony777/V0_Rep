"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  User,
  UserCheck,
  Users,
  Layers,
} from "lucide-react"
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
  const { getActivePeriodName } = usePeriod()

  const menuItems = [
    { id: "dashboard", label: "Αρχική", icon: Home, adminOnly: false },
    { id: "orders", label: "Παραγγελίες", icon: ShoppingCart, adminOnly: false },
    { id: "customers", label: "Πελάτες", icon: Users, adminOnly: false },
    { id: "products", label: "Προϊόντα", icon: Package, adminOnly: true },
    { id: "categories", label: "Κατηγορίες", icon: Layers, adminOnly: true },
    { id: "units", label: "Μονάδες", icon: Settings, adminOnly: true },
    { id: "employees", label: "Υπάλληλοι", icon: UserCheck, adminOnly: true },
    { id: "reports", label: "Αναφορές", icon: FileText, adminOnly: true },
  ]

  const filteredMenuItems = menuItems.filter((item) => !item.adminOnly || userRole === "admin")

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">ΤΟ ΜΠΕΛΛΕΣ</h2>
            <p className="text-sm text-muted-foreground">Κρεοπωλείο</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => onSectionChange(item.id)}
                  isActive={activeSection === item.id}
                  className="w-full justify-start"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-3">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Ενεργή Περίοδος</span>
            </div>
            <p className="text-sm text-red-700">{getActivePeriodName()}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToPeriods}
              className="w-full mt-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            >
              Αλλαγή Περιόδου
            </Button>
          </div>

          <Separator />

          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole === "admin" ? "Διαχειριστής" : "Υπάλληλος"}</p>
            </div>
          </div>

          <Button variant="outline" onClick={onLogout} className="w-full bg-transparent">
            <LogOut className="w-4 h-4 mr-2" />
            Αποσύνδεση
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
