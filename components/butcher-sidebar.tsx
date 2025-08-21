"use client"

import { Users, Package, ShoppingCart, BarChart3, Settings, LogOut, User, ArrowLeft } from "lucide-react"
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
import { Button } from "@/components/ui/button"
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

  const mainMenuItems = [
    {
      title: "Πελάτες",
      icon: Users,
      id: "customers",
    },
    {
      title: "Προϊόντα",
      icon: Package,
      id: "products",
    },
    {
      title: "Παραγγελίες",
      icon: ShoppingCart,
      id: "orders",
    },
    {
      title: "Αναφορές",
      icon: BarChart3,
      id: "reports",
    },
  ]

  const adminMenuItems = [
    {
      title: "Υπάλληλοι",
      icon: User,
      id: "employees",
    },
    {
      title: "Κατηγορίες",
      icon: Settings,
      id: "categories",
    },
    {
      title: "Μονάδες",
      icon: Settings,
      id: "units",
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">ΤΜ</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">ΤΟ ΜΠΕΛΛΕΣ</h2>
            <p className="text-xs text-muted-foreground">Κρεοπωλείο</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-muted/50 rounded-lg mx-4">
          <p className="text-xs text-muted-foreground">Ενεργή Περίοδος</p>
          <p className="font-medium text-sm">{getActivePeriodName()}</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Κύριο Μενού</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => onSectionChange(item.id)} isActive={activeSection === item.id}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Διαχείριση</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton onClick={() => onSectionChange(item.id)} isActive={activeSection === item.id}>
                      <item.icon />
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
            <div className="px-2 py-1">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole === "admin" ? "Διαχειριστής" : "Υπάλληλος"}</p>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button variant="ghost" onClick={onBackToPeriods} className="w-full justify-start">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Αλλαγή Περιόδου
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button variant="ghost" onClick={onLogout} className="w-full justify-start text-red-600 hover:text-red-700">
              <LogOut className="mr-2 h-4 w-4" />
              Αποσύνδεση
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
