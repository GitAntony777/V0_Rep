"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Edit, Trash2, Plus, MapPin, Printer } from "lucide-react"
import { OrderForm } from "./order-form"
import { OrderViewDialog } from "./order/order-view-dialog"
import { OrderFilters } from "./order/order-filters"
import { GoogleMapsIntegration } from "./google-maps-integration"
import { format, isSameDay } from "date-fns"
import { el } from "date-fns/locale"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { usePeriod } from "@/contexts/period-context"

interface Product {
  id: string
  name: string
  category: string
  unit: string
  price: number
  image?: string
}

interface Customer {
  id: string
  name: string
  phone: string
  address: string
  email?: string
}

interface Employee {
  id: string
  name: string
  role: string
}

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unit: string
  price: number
  total: number
}

interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  employeeId: string
  employeeName: string
  orderDate: Date
  deliveryDate: Date
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  notes?: string
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
}

const statusLabels = {
  pending: "Εκκρεμής",
  confirmed: "Επιβεβαιωμένη",
  preparing: "Προετοιμασία",
  ready: "Έτοιμη",
  delivered: "Παραδόθηκε",
  cancelled: "Ακυρώθηκε",
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Γιάννης Παπαδόπουλος",
    phone: "6912345678",
    address: "Καπετάν Γκόνη 25, Καλαμαριά",
    email: "giannis@email.com",
  },
  {
    id: "2",
    name: "Μαρία Γεωργίου",
    phone: "6923456789",
    address: "Τσιμισκή 45, Θεσσαλονίκη",
    email: "maria@email.com",
  },
  {
    id: "3",
    name: "Νίκος Αντωνίου",
    phone: "6934567890",
    address: "Μεγάλου Αλεξάνδρου 12, Πυλαία",
    email: "nikos@email.com",
  },
]

const mockEmployees: Employee[] = [
  { id: "1", name: "Κώστας Μπέλλας", role: "Ιδιοκτήτης" },
  { id: "2", name: "Άννα Παπαδάκη", role: "Πωλήτρια" },
  { id: "3", name: "Δημήτρης Καρακώστας", role: "Βοηθός" },
]

const mockProducts: Product[] = [
  { id: "1", name: "Μοσχαρίσιος Κιμάς", category: "Κιμάς", unit: "kg", price: 8.5, image: "/images/kimas.jpg" },
  { id: "2", name: "Χοιρινές Μπριζόλες", category: "Χοιρινό", unit: "kg", price: 7.2, image: "/images/brizoles.jpg" },
  { id: "3", name: "Σουβλάκι Χοιρινό", category: "Έτοιμα", unit: "τεμ", price: 0.8, image: "/images/souvlaki.jpg" },
  {
    id: "4",
    name: "Κεφτεδάκια Γιαγιάς",
    category: "Έτοιμα",
    unit: "kg",
    price: 9.5,
    image: "/images/keftedakia-giagias.jpg",
  },
  {
    id: "5",
    name: "Λουκάνικα Χωριάτικα",
    category: "Αλλαντικά",
    unit: "kg",
    price: 12.0,
    image: "/images/loukanika.jpg",
  },
]

export function OrderManagement() {
  const { activePeriod } = usePeriod()
  const [orders, setOrders] = useLocalStorage<Order[]>(`orders-${activePeriod}`, [])
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | undefined>()
  const [viewingOrder, setViewingOrder] = useState<Order | undefined>()
  const [showMapsDialog, setShowMapsDialog] = useState(false)
  const [selectedOrderForMaps, setSelectedOrderForMaps] = useState<Order | undefined>()

  // Φίλτρα
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateSearchTerm, setDateSearchTerm] = useState<Date | undefined>(undefined)

  // Καθαρισμός φίλτρων όταν αλλάζει η ενεργή περίοδος
  useEffect(() => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateSearchTerm(undefined)
  }, [activePeriod])

  const generateOrderNumber = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const day = now.getDate().toString().padStart(2, "0")
    const time = now.getTime().toString().slice(-6)
    return `ORD${year}${month}${day}${time}`
  }

  const handleSaveOrder = (orderData: Omit<Order, "id" | "orderNumber">) => {
    console.log("💾 Αποθήκευση παραγγελίας:", orderData)

    try {
      if (editingOrder) {
        // Ενημέρωση υπάρχουσας παραγγελίας
        console.log("✏️ Ενημέρωση παραγγελίας:", editingOrder.id)
        const updatedOrders = orders.map((order) =>
          order.id === editingOrder.id
            ? { ...orderData, id: editingOrder.id, orderNumber: editingOrder.orderNumber }
            : order,
        )
        setOrders(updatedOrders)
        console.log("✅ Παραγγελία ενημερώθηκε επιτυχώς")
      } else {
        // Νέα παραγγελία
        const newOrder: Order = {
          ...orderData,
          id: Date.now().toString(),
          orderNumber: generateOrderNumber(),
        }
        console.log("➕ Νέα παραγγελία:", newOrder)
        setOrders([...orders, newOrder])
        console.log("✅ Νέα παραγγελία αποθηκεύτηκε επιτυχώς")
      }

      // Κλείσιμο dialogs
      setShowOrderForm(false)
      setEditingOrder(undefined)
      setViewingOrder(undefined)
    } catch (error) {
      console.error("❌ Σφάλμα κατά την αποθήκευση:", error)
    }
  }

  const handleViewOrder = (order: Order) => {
    console.log("👁️ Προβολή παραγγελίας:", order.id)
    setViewingOrder(order)
  }

  const handleEditOrder = (order: Order) => {
    console.log("✏️ Επεξεργασία παραγγελίας:", order.id)
    setEditingOrder(order)
    setViewingOrder(undefined) // Κλείσιμο view dialog
    setShowOrderForm(true)
  }

  const handleDeleteOrder = (orderId: string) => {
    if (confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την παραγγελία;")) {
      const updatedOrders = orders.filter((order) => order.id !== orderId)
      setOrders(updatedOrders)
    }
  }

  const handleShowMaps = (order: Order) => {
    setSelectedOrderForMaps(order)
    setShowMapsDialog(true)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateSearchTerm(undefined)
  }

  const handlePrintFiltered = () => {
    const filteredOrders = getFilteredOrders()

    const printContent = `
      <html>
        <head>
          <title>Παραγγελίες - ${activePeriod}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .filters { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-confirmed { background: #dbeafe; color: #1e40af; }
            .status-preparing { background: #fed7aa; color: #c2410c; }
            .status-ready { background: #dcfce7; color: #166534; }
            .status-delivered { background: #f3f4f6; color: #374151; }
            .status-cancelled { background: #fecaca; color: #dc2626; }
          </style>
        </head>
        <body>
          <h1>Παραγγελίες - ${activePeriod}</h1>
          <div class="filters">
            <strong>Φίλτρα:</strong><br>
            Αναζήτηση: ${searchTerm || "Όλες"}<br>
            Κατάσταση: ${statusFilter === "all" ? "Όλες" : statusLabels[statusFilter as keyof typeof statusLabels]}<br>
            Ημερομηνία Παράδοσης: ${dateSearchTerm ? format(dateSearchTerm, "PPP", { locale: el }) : "Όλες"}
          </div>
          <table>
            <thead>
              <tr>
                <th>Αρ. Παραγγελίας</th>
                <th>Πελάτης</th>
                <th>Ημ/νία Καταχώρησης</th>
                <th>Ημ/νία Παράδοσης</th>
                <th>Σύνολο</th>
                <th>Κατάσταση</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders
                .map(
                  (order) => `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.customerName}</td>
                  <td>${format(new Date(order.orderDate), "PPP", { locale: el })}</td>
                  <td>${format(new Date(order.deliveryDate), "PPP", { locale: el })}</td>
                  <td>€${order.total.toFixed(2)}</td>
                  <td><span class="status status-${order.status}">${statusLabels[order.status]}</span></td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            Εκτυπώθηκε στις ${format(new Date(), "PPP 'στις' p", { locale: el })}
          </div>
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getFilteredOrders = () => {
    console.log("🔍 Φιλτράρισμα παραγγελιών...")
    console.log("📊 Συνολικές παραγγελίες:", orders.length)
    console.log("🔤 Search term:", searchTerm)
    console.log("📋 Status filter:", statusFilter)
    console.log("📅 Date search term:", dateSearchTerm)

    return orders.filter((order) => {
      // Φίλτρο αναζήτησης
      const matchesSearch =
        !searchTerm ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm)

      // Φίλτρο κατάστασης
      const matchesStatus = statusFilter === "all" || order.status === statusFilter

      // Φίλτρο ημερομηνίας παράδοσης
      const matchesDate = !dateSearchTerm || isSameDay(new Date(order.deliveryDate), dateSearchTerm)

      const matches = matchesSearch && matchesStatus && matchesDate

      if (!matches) {
        console.log(`❌ Παραγγελία ${order.orderNumber} δεν ταιριάζει:`, {
          matchesSearch,
          matchesStatus,
          matchesDate,
          orderDeliveryDate: order.deliveryDate,
          searchDate: dateSearchTerm,
        })
      }

      return matches
    })
  }

  const filteredOrders = getFilteredOrders()
  console.log("📊 Φιλτραρισμένες παραγγελίες:", filteredOrders.length)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Διαχείριση Παραγγελιών</CardTitle>
              <CardDescription>Διαχειριστείτε τις παραγγελίες για την περίοδο: {activePeriod}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrintFiltered}>
                <Printer className="w-4 h-4 mr-2" />
                Εκτύπωση
              </Button>
              <Button onClick={() => setShowOrderForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Νέα Παραγγελία
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <OrderFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            dateSearchTerm={dateSearchTerm}
            onDateSearchChange={setDateSearchTerm}
            onClearFilters={handleClearFilters}
          />

          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Αρ. Παραγγελίας</TableHead>
                  <TableHead>Πελάτης</TableHead>
                  <TableHead>Τηλέφωνο</TableHead>
                  <TableHead>Ημ/νία Καταχώρησης</TableHead>
                  <TableHead>Ημ/νία Παράδοσης</TableHead>
                  <TableHead>Σύνολο</TableHead>
                  <TableHead>Κατάσταση</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Δεν βρέθηκαν παραγγελίες
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.customerPhone}</TableCell>
                      <TableCell>{format(new Date(order.orderDate), "PPP", { locale: el })}</TableCell>
                      <TableCell>{format(new Date(order.deliveryDate), "PPP", { locale: el })}</TableCell>
                      <TableCell>€{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleShowMaps(order)}>
                            <MapPin className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Νέας/Επεξεργασίας Παραγγελίας */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOrder ? "Επεξεργασία Παραγγελίας" : "Νέα Παραγγελία"}</DialogTitle>
          </DialogHeader>
          <OrderForm
            onSave={handleSaveOrder}
            onCancel={() => {
              setShowOrderForm(false)
              setEditingOrder(undefined)
            }}
            editOrder={editingOrder}
            customers={mockCustomers}
            employees={mockEmployees}
            products={mockProducts}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Προβολής Παραγγελίας */}
      {viewingOrder && (
        <OrderViewDialog
          order={viewingOrder}
          onClose={() => setViewingOrder(undefined)}
          onEdit={() => handleEditOrder(viewingOrder)}
          products={mockProducts}
        />
      )}

      {/* Dialog Google Maps */}
      <Dialog open={showMapsDialog} onOpenChange={setShowMapsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Πληροφορίες Διαδρομής</DialogTitle>
          </DialogHeader>
          {selectedOrderForMaps && (
            <GoogleMapsIntegration
              customerAddress={selectedOrderForMaps.customerAddress}
              customerName={selectedOrderForMaps.customerName}
              onClose={() => setShowMapsDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
