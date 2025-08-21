"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit, Trash2, Plus, MapPin } from "lucide-react"
import { OrderForm } from "./order-form"
import { OrderViewDialog } from "./order/order-view-dialog"
import { OrderFilters } from "./order/order-filters"
import { GoogleMapsIntegration } from "./google-maps-integration"
import { format, isSameDay } from "date-fns"
import { el } from "date-fns/locale"
import { usePeriod } from "@/contexts/period-context"

interface Order {
  id: string
  customerId: string
  customer: string
  customerAddress: string
  customerPhone: string
  employeeId: string
  employee: string
  orderDate: string
  deliveryDate: string
  status: string
  items: any[]
  subtotal: number
  orderDiscount: number
  total: number
  amount: number
  comments: string
  pendingIssues: string
  period: string
}

export function OrderManagement() {
  const { getActivePeriodName } = usePeriod()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showMapsDialog, setShowMapsDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateSearchTerm, setDateSearchTerm] = useState<Date | undefined>()

  const currentPeriod = getActivePeriodName()

  const loadOrders = () => {
    try {
      const savedOrders = localStorage.getItem("orders")
      if (savedOrders) {
        const allOrders = JSON.parse(savedOrders)
        const periodOrders = allOrders.filter((order: Order) => order.period === currentPeriod)
        setOrders(periodOrders)
        console.log("Loaded orders for period:", currentPeriod, periodOrders)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      setOrders([])
    }
  }

  useEffect(() => {
    loadOrders()
  }, [currentPeriod])

  useEffect(() => {
    let filtered = orders

    // Filter by search term (order code or customer name)
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by delivery date
    if (dateSearchTerm) {
      filtered = filtered.filter((order) => {
        if (!order.deliveryDate) return false
        try {
          const orderDeliveryDate = new Date(order.deliveryDate)
          return isSameDay(orderDeliveryDate, dateSearchTerm)
        } catch (error) {
          console.error("Error parsing delivery date:", order.deliveryDate, error)
          return false
        }
      })
    }

    setFilteredOrders(filtered)
    console.log("Filtered orders:", filtered)
  }, [orders, searchTerm, dateSearchTerm])

  const handleSaveOrder = (orderData: Order) => {
    console.log("handleSaveOrder called with:", orderData)

    try {
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      let updatedOrders

      if (editingOrder) {
        // Update existing order
        updatedOrders = existingOrders.map((order: Order) =>
          order.id === orderData.id && order.period === orderData.period ? orderData : order,
        )
        console.log("Updated existing order")
      } else {
        // Add new order
        updatedOrders = [orderData, ...existingOrders]
        console.log("Added new order")
      }

      localStorage.setItem("orders", JSON.stringify(updatedOrders))
      console.log("Orders saved to localStorage")

      // Reload orders and close dialogs
      loadOrders()
      setShowOrderForm(false)
      setShowEditDialog(false)
      setEditingOrder(null)

      console.log("Order management state updated")
    } catch (error) {
      console.error("Error saving order:", error)
    }
  }

  const handleViewOrder = (order: Order) => {
    console.log("handleViewOrder called with:", order)
    setSelectedOrder(order)
    setShowViewDialog(true)
  }

  const handleEditOrder = (order: Order) => {
    console.log("handleEditOrder called with:", order)
    setEditingOrder(order)
    setShowViewDialog(false) // Close view dialog if open
    setShowEditDialog(true)
  }

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την παραγγελία;")) {
      try {
        const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
        const updatedOrders = existingOrders.filter(
          (order: Order) => !(order.id === orderId && order.period === currentPeriod),
        )
        localStorage.setItem("orders", JSON.stringify(updatedOrders))
        loadOrders()
      } catch (error) {
        console.error("Error deleting order:", error)
      }
    }
  }

  const handleShowMaps = (order: Order) => {
    setSelectedOrder(order)
    setShowMapsDialog(true)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Παραδόθηκε":
        return "default"
      case "Μέσα":
        return "secondary"
      case "Εκκρεμότητες":
        return "destructive"
      case "Μέσα/Εκκρεμότητες":
        return "outline"
      default:
        return "outline"
    }
  }

  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.amount, 0)
  const totalOrders = filteredOrders.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Διαχείριση Παραγγελιών</span>
            <Button onClick={() => setShowOrderForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Νέα Παραγγελία
            </Button>
          </CardTitle>
          <CardDescription>
            <div className="space-y-2">
              <div>Διαχειριστείτε τις παραγγελίες για την εορταστική περίοδο</div>
              <div className="flex gap-4 text-sm">
                <Badge variant="outline">Περίοδος: {currentPeriod}</Badge>
                <Badge variant="secondary">Σύνολο: {totalOrders} παραγγελίες</Badge>
                <Badge variant="default">Αξία: €{totalAmount.toFixed(2)}</Badge>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter="all"
            onStatusFilterChange={() => {}}
            dateSearchTerm={dateSearchTerm}
            onDateSearchChange={setDateSearchTerm}
            onClearFilters={() => {
              setSearchTerm("")
              setDateSearchTerm(undefined)
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Λίστα Παραγγελιών</CardTitle>
          <CardDescription>
            {filteredOrders.length > 0
              ? `Εμφανίζονται ${filteredOrders.length} από ${orders.length} παραγγελίες`
              : "Δεν βρέθηκαν παραγγελίες"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Κωδικός</TableHead>
                    <TableHead>Πελάτης</TableHead>
                    <TableHead>Ημ/νία Καταχώρησης</TableHead>
                    <TableHead>Ημ/νία Παράδοσης</TableHead>
                    <TableHead>Κατάσταση</TableHead>
                    <TableHead>Αξία</TableHead>
                    <TableHead>Υπάλληλος</TableHead>
                    <TableHead>Ενέργειες</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={`${order.id}-${order.period}`}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>
                        {order.orderDate ? format(new Date(order.orderDate), "dd/MM/yyyy", { locale: el }) : "-"}
                      </TableCell>
                      <TableCell>
                        {order.deliveryDate ? format(new Date(order.deliveryDate), "dd/MM/yyyy", { locale: el }) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>€{order.amount.toFixed(2)}</TableCell>
                      <TableCell>{order.employee}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowMaps(order)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {orders.length === 0
                ? "Δεν υπάρχουν παραγγελίες για αυτή την περίοδο. Δημιουργήστε την πρώτη σας παραγγελία!"
                : "Δεν βρέθηκαν παραγγελίες που να ταιριάζουν με τα κριτήρια αναζήτησης."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Order Dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Νέα Παραγγελία</DialogTitle>
          </DialogHeader>
          <OrderForm onSave={handleSaveOrder} onCancel={() => setShowOrderForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Επεξεργασία Παραγγελίας</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <OrderForm
              onSave={handleSaveOrder}
              onCancel={() => {
                setShowEditDialog(false)
                setEditingOrder(null)
              }}
              editingOrder={editingOrder}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      {selectedOrder && (
        <OrderViewDialog
          order={selectedOrder}
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          onEdit={() => handleEditOrder(selectedOrder)}
        />
      )}

      {/* Google Maps Dialog */}
      {selectedOrder && (
        <Dialog open={showMapsDialog} onOpenChange={setShowMapsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Τοποθεσία Πελάτη</DialogTitle>
            </DialogHeader>
            <GoogleMapsIntegration
              customerAddress={selectedOrder.customerAddress}
              customerName={selectedOrder.customer}
              onClose={() => setShowMapsDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
