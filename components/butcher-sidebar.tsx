"use client"

import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  UserCheck,
  Layers,
  Calendar,
  User,
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
  const [isManagementOpen, setIsManagementOpen] = useState(false)
  const { activePeriod } = usePeriod()

  const menuItems = [
    {
      id: "dashboard",
      label: "Αρχική",
      icon: Home,
      adminOnly: false,
    },
    {
      id: "orders",
      label: "Παραγγελίες",
      icon: ShoppingCart,
      adminOnly: false,
    },
    {
      id: "customers",
      label: "Πελάτες",
      icon: Users,
      adminOnly: false,
    },
    {
      id: "reports",
      label: "Αναφορές",
      icon: BarChart3,
      adminOnly: false,
    },
  ]

  const managementItems = [
    {
      id: "products",
      label: "Προϊόντα",
      icon: Package,
      adminOnly: true,
    },
    {
      id: "categories",
      label: "Κατηγορίες",
      icon: Layers,
      adminOnly: true,
    },
    {
      id: "units",
      label: "Μονάδες",
      icon: Settings,
      adminOnly: true,
    },
    {
      id: "employees",
      label: "Υπάλληλοι",
      icon: UserCheck,
      adminOnly: true,
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => !item.adminOnly || userRole === "admin")
  const filteredManagementItems = managementItems.filter((item) => !item.adminOnly || userRole === "admin")

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-gray-900">ΤΟ ΜΠΕΛΛΕΣ</h2>
            <p className="text-sm text-gray-600">Κρεοπωλείο</p>
          </div>
        </div>
        <SidebarTrigger className="ml-auto" />
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* User Info */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">{userName}</span>
          </div>
          <Badge variant={userRole === "admin" ? "default" : "secondary"} className="text-xs">
            {userRole === "admin" ? "Διαχειριστής" : "Υπάλληλος"}
          </Badge>
        </div>

        {/* Active Period */}
        {activePeriod && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Ενεργή Περίοδος</span>
            </div>
            <p className="text-sm text-red-700">{activePeriod?.name ? String(activePeriod.name) : "Καμία Περίοδος"}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToPeriods}
              className="mt-2 w-full text-xs border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
            >
              Αλλαγή Περιόδου
            </Button>
          </div>
        )}

        <SidebarMenu>
          {/* Main Menu Items */}
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

          {/* Management Section (Admin Only) */}
          {userRole === "admin" && filteredManagementItems.length > 0 && (
            <SidebarMenuItem>
              <Collapsible open={isManagementOpen} onOpenChange={setIsManagementOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Διαχείριση</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isManagementOpen ? "rotate-180" : ""}`} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {filteredManagementItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <SidebarMenuSubItem key={item.id}>
                          <SidebarMenuSubButton
                            onClick={() => onSectionChange(item.id)}
                            isActive={activeSection === item.id}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button variant="outline" onClick={onLogout} className="w-full justify-start bg-transparent">
          <LogOut className="w-4 h-4 mr-2" />
          Αποσύνδεση
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
