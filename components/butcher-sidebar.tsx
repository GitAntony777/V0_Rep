"use client"
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
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  Package,
  ShoppingCart,
  UserCheck,
  BarChart3,
  Tag,
  Ruler,
  LogOut,
  ChevronUp,
  ArrowLeft,
  Home,
  Calendar,
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
    {
      title: "Dashboard",
      icon: Home,
      key: "dashboard",
      available: true,
    },
    {
      title: "Πελάτες",
      icon: Users,
      key: "customers",
      available: true,
    },
    {
      title: "Προϊόντα",
      icon: Package,
      key: "products",
      available: userRole === "admin",
    },
    {
      title: "Παραγγελίες",
      icon: ShoppingCart,
      key: "orders",
      available: true,
    },
    {
      title: "Υπάλληλοι",
      icon: UserCheck,
      key: "employees",
      available: userRole === "admin",
    },
    {
      title: "Αναφορές",
      icon: BarChart3,
      key: "reports",
      available: true,
    },
  ]

  const settingsItems = [
    {
      title: "Κατηγορίες",
      icon: Tag,
      key: "categories",
      available: userRole === "admin",
    },
    {
      title: "Μονάδες",
      icon: Ruler,
      key: "units",
      available: userRole === "admin",
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold">
              ΤΜ
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">ΤΟ ΜΠΕΛΛΕΣ</span>
              <span className="truncate text-xs">Κρεοπωλείο</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onBackToPeriods} className="h-8 w-8 p-0">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>

        {/* Ενεργή Περίοδος */}
        <div className="px-2 pb-2">
          <div className="rounded-lg bg-red-50 p-2 border border-red-200">
            <div className="text-xs font-medium text-red-800">Ενεργή Περίοδος</div>
            <div className="text-sm font-semibold text-red-900">{getActivePeriodName()}</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Κύριο Μενού */}
        <SidebarGroup>
          <SidebarGroupLabel>Κύριο Μενού</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter((item) => item.available)
                .map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton isActive={activeSection === item.key} onClick={() => onSectionChange(item.key)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Ρυθμίσεις */}
        {userRole === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Ρυθμίσεις</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems
                  .filter((item) => item.available)
                  .map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        isActive={activeSection === item.key}
                        onClick={() => onSectionChange(item.key)}
                      >
                        <item.icon className="h-4 w-4" />
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <UserCheck className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{userName}</span>
                    <Badge variant="outline" className="text-xs">
                      {userRole === "admin" ? "Διαχειριστής" : "Υπάλληλος"}
                    </Badge>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem onClick={onBackToPeriods}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span>Επιστροφή στις Περιόδους</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Αποσύνδεση</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
