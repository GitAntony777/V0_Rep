"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Users, Package, ShoppingCart, UserCheck, BarChart3, LogOut, Calendar, Layers, Ruler, User } from "lucide-react"
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

  const mainMenuItems = [
    {
      title: "Αρχική",
      icon: BarChart3,
      id: "dashboard",
      adminOnly: false,
    },
    {
      title: "Πελάτες",
      icon: Users,
      id: "customers",
      adminOnly: false,
    },
    {
      title: "Προϊόντα",
      icon: Package,
      id: "products",
      adminOnly: false,
    },
    {
      title: "Παραγγελίες",
      icon: ShoppingCart,
      id: "orders",
      adminOnly: false,
    },
  ]

  const adminMenuItems = [
    {
      title: "Υπάλληλοι",
      icon: UserCheck,
      id: "employees",
      adminOnly: true,
    },
    {
      title: "Αναφορές",
      icon: BarChart3,
      id: "reports",
      adminOnly: true,
    },
  ]

  const settingsMenuItems = [
    {
      title: "Κατηγορίες",
      icon: Layers,
      id: "categories",
      adminOnly: true,
    },
    {
      title: "Μονάδες",
      icon: Ruler,
      id: "units",
      adminOnly: true,
    },
  ]

  const filteredMainItems = mainMenuItems.filter((item) => !item.adminOnly || userRole === "admin")
  const filteredAdminItems = adminMenuItems.filter((item) => !item.adminOnly || userRole === "admin")
  const filteredSettingsItems = settingsMenuItems.filter((item) => !item.adminOnly || userRole === "admin")

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2">
          <h2 className="text-lg font-bold text-red-600">ΤΟ ΜΠΕΛΛΕΣ</h2>
          <p className="text-sm text-gray-600">Κρεοπωλείο</p>
        </div>
        {activePeriod && (
          <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg mx-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Ενεργή Περίοδος</span>
            </div>
            <p className="text-sm text-red-700 font-medium">{activePeriod.name}</p>
            <p className="text-xs text-red-600">
              {new Date(activePeriod.startDate).toLocaleDateString("el-GR")} -{" "}
              {new Date(activePeriod.endDate).toLocaleDateString("el-GR")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToPeriods}
              className="w-full mt-2 text-xs border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
            >
              Αλλαγή Περιόδου
            </Button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Κύριο Μενού</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => onSectionChange(item.id)} isActive={activeSection === item.id}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === "admin" && filteredAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Διαχείριση</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton onClick={() => onSectionChange(item.id)} isActive={activeSection === item.id}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {userRole === "admin" && filteredSettingsItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Ρυθμίσεις</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSettingsItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton onClick={() => onSectionChange(item.id)} isActive={activeSection === item.id}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-4 py-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">{userName}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {userRole === "admin" ? "Διαχειριστής" : "Υπάλληλος"}
              </Badge>
              <Button variant="outline" size="sm" onClick={onLogout} className="w-full mt-2 bg-transparent">
                <LogOut className="w-4 h-4 mr-2" />
                Αποσύνδεση
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
