"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Users, Package, BarChart3, LogOut } from "lucide-react"

export function ButcherSidebar() {
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
          <Button variant="secondary" className="w-full justify-start">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Παραγγελίες
          </Button>

          <Button variant="ghost" className="w-full justify-start">
            <Package className="h-4 w-4 mr-2" />
            Προϊόντα
          </Button>

          <Button variant="ghost" className="w-full justify-start">
            <Users className="h-4 w-4 mr-2" />
            Πελάτες
          </Button>

          <Button variant="ghost" className="w-full justify-start">
            <BarChart3 className="h-4 w-4 mr-2" />
            Αναφορές
          </Button>
        </nav>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <img src="/placeholder-user.jpg" alt="User" className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <p className="font-medium text-sm">Υπάλληλος</p>
            <p className="text-xs text-gray-500">employee@example.com</p>
          </div>
          <Button variant="ghost" size="icon">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
