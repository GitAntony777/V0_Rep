"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, Eye, ShoppingCart, Calendar, Euro, Phone, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { OrderForm } from "./order/order-form-simplified"
import { usePeriod } from "@/contexts/period-context"

interface Order {
  id: string
  customer: string
  customerAddress: string
  customerPhone: string
  customerId: string
  employeeId: string
  amount: number
  status: string
  deliveryDate: string
  orderDate: string
  employee: string
  period: string
  items: any[]
  comments: string
  orderDiscount: number
  pendingIssues: string
  subtotal: number
  total: number
}

interface OrderManagementProps {
  userRole?: "admin" | "employee" | null
}

const initialOrders: Order[] = [
  {
    id: "ORD24010100001",
    customer: "Μαρία Παπαδοπούλου",
    customerAddress: "Λεωφ. Κηφισίας 123, Αθήνα",
    customerPhone: "6971234567",
    customerId: "1",
    employeeId: "1",
    amount: 245.5,
    status: "Μέσα",
    deliveryDate: "2024-01-15",
    orderDate: "2024-01-10",
    employee: "Γιάννης Κωνσταντίνου",
    period: "Χριστούγεννα 2024",
    items: [
      {
        id: "1",
        productName: "Αρνί Ψητό (ολόκληρο)",
        quantity: 5,
        unit: "Κιλά",
        unitPrice: 18.5,
        discount: 0,
        total: 92.5,
        instructions: "Καλοψημένο",
      },
      {
        id: "2",
        productName: "Κοκορέτσι",
        quantity: 3,
        unit: "Κιλά",
        unitPrice: 12.0,
        discount: 0,
        total: 36.0,
        instructions: "",
      },
    ],
    comments: "Παράδοση το πρωί",
    orderDiscount: 5,
    pendingIssues: "",
    subtotal: 128.5,
    total: 245.5,
  },
  {
    id: "ORD24010200002",
    customer: "Γιάννης Κωνσταντίνου",
    customerAddress: "Οδός Ερμού 45, Αθήνα",
    customerPhone: "6987654321",
    customerId: "2",
    employeeId: "2",
    amount: 180.0,
    status: "Εκκρεμότητες",
    deliveryDate: "2024-01-20",
    orderDate: "2024-01-12",
    employee: "Μαρία Δημητρίου",
    period: "Χριστούγεννα 2024",
    items: [
      {
        id: "1",
        productName: "Κοντοσούβλι Χοιρινό",
        quantity: 4,
        unit: "Κιλά",
        unitPrice: 14.8,
        discount: 0,
        total: 59.2,
        instructions: "Μέτριο ψήσιμο",
      },
    ],
    comments: "Επείγουσα παραγγελία",
    orderDiscount: 0,
    pendingIssues: "Αναμονή προμηθευτή",
    subtotal: 59.2,
    total: 180.0,
  },
]

export function OrderManagement({ userRole }: OrderManagementProps) {
  const { getActivePeriodName } = usePeriod()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)

  // Φόρτωση παραγγελιών από localStorage
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("orders")
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders)
        setOrders(parsedOrders)
      } else {
        setOrders(initialOrders)
        localStorage.setItem("orders", JSON.stringify(initialOrders))
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      setOrders(initialOrders)
    }
  }, [])

  // Αποθήκευση παραγγελιών στο localStorage
  const saveOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders)
    try {
      localStorage.setItem("orders", JSON.stringify(updatedOrders))
    } catch (error) {
      console.error("Error saving orders:", error)
    }
  }

  const handleAddOrder = (orderData: Order) => {
    const newOrders = [orderData, ...orders]
    saveOrders(newOrders)
    setIsAddDialogOpen(false)
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setIsEditDialogOpen(true)
  }

  const handleUpdateOrder = (orderData: Order) => {
    const updatedOrders = orders.map((order) => (order.id === orderData.id ? orderData : order))
    saveOrders(updatedOrders)
    setIsEditDialogOpen(false)
    setEditingOrder(null)
  }

  const handleDeleteOrder = (orderId: string) => {
    const updatedOrders = orders.filter((order) => order.id !== orderId)
    saveOrders(updatedOrders)
  }

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order)
    setIsViewDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Παραδόθηκε":
        return "bg-green-100 text-green-800"
      case "Μέσα":
        return "bg-blue-100 text-blue-800"
      case "Εκκρεμότητες":
        return "bg-yellow-100 text-yellow-800"
      case "Ακυρώθηκε":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Φιλτράρισμα παραγγελιών
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Διαχείριση Παραγγελιών</h1>
          <p className="text-gray-600 mt-2">Διαχειριστείτε τις παραγγελίες για την περίοδο: {getActivePeriodName()}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Νέα Παραγγελία
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Νέα Παραγγελία</DialogTitle>
              <DialogDescription>Δημιουργήστε μια νέα παραγγελία</DialogDescription>
            </DialogHeader>
            <OrderForm onSave={handleAddOrder} onCancel={() => setIsAddDialogOpen(false)} isEditing={false} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Φίλτρα */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Αναζήτηση & Φίλτρα
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Αναζήτηση με κωδικό, πελάτη ή τηλέφωνο..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Όλες οι καταστάσεις</SelectItem>
                <SelectItem value="Νέα">Νέα</SelectItem>
                <SelectItem value="Μέσα">Μέσα</SelectItem>
                <SelectItem value="Εκκρεμότητες">Εκκρεμότητες</SelectItem>
                <SelectItem value="Παραδόθηκε">Παραδόθηκε</SelectItem>
                <SelectItem value="Ακυρώθηκε">Ακυρώθηκε</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Λίστα Παραγγελιών */}
      <Card>
        <CardHeader>
          <CardTitle>Λίστα Παραγγελιών ({filteredOrders.length})</CardTitle>
          <CardDescription>Όλες οι καταχωρημένες παραγγελίες</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Κωδικός</TableHead>
                  <TableHead>Πελάτης</TableHead>
                  <TableHead>Ημ/νία Παράδοσης</TableHead>
                  <TableHead>Κατάσταση</TableHead>
                  <TableHead>Ποσό</TableHead>
                  <TableHead>Υπάλληλος</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== "all"
                        ? "Δεν βρέθηκαν παραγγελίες"
                        : "Δεν υπάρχουν καταχωρημένες παραγγελίες"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-gray-400" />
                          <Badge variant="outline">{order.id}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {order.customerPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(order.deliveryDate).toLocaleDateString("el-GR")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">€{order.amount.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.employee}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Επιβεβαίωση Διαγραφής</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Είστε σίγουροι ότι θέλετε να διαγράψετε την παραγγελία "{order.id}"; Αυτή η ενέργεια
                                  δεν μπορεί να αναιρεθεί.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Διαγραφή
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Dialog Επεξεργασίας */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Επεξεργασία Παραγγελίας</DialogTitle>
            <DialogDescription>Επεξεργαστείτε τα στοιχεία της παραγγελίας</DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <OrderForm
              onSave={handleUpdateOrder}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingOrder(null)
              }}
              editingOrder={editingOrder}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Προβολής */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Προβολή Παραγγελίας</DialogTitle>
            <DialogDescription>Λεπτομέρειες παραγγελίας {viewingOrder?.id}</DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-6">
              {/* Στοιχεία Παραγγελίας */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Στοιχεία Παραγγελίας</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Κωδικός:</span> {viewingOrder.id}
                    </div>
                    <div>
                      <span className="font-medium">Ημ/νία Παραγγελίας:</span>{" "}
                      {new Date(viewingOrder.orderDate).toLocaleDateString("el-GR")}
                    </div>
                    <div>
                      <span className="font-medium">Ημ/νία Παράδοσης:</span>{" "}
                      {new Date(viewingOrder.deliveryDate).toLocaleDateString("el-GR")}
                    </div>
                    <div>
                      <span className="font-medium">Κατάσταση:</span>{" "}
                      <Badge className={getStatusColor(viewingOrder.status)}>{viewingOrder.status}</Badge>
                    </div>
                    <div>
                      <span className="font-medium">Υπάλληλος:</span> {viewingOrder.employee}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Στοιχεία Πελάτη</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Όνομα:</span> {viewingOrder.customer}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span className="font-medium">Τηλέφωνο:</span> {viewingOrder.customerPhone}
                    </div>
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      <div>
                        <span className="font-medium">Διεύθυνση:</span>
                        <div>{viewingOrder.customerAddress}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Προϊόντα */}
              <div>
                <h3 className="font-semibold mb-2">Προϊόντα Παραγγελίας</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Προϊόν</TableHead>
                        <TableHead>Ποσότητα</TableHead>
                        <TableHead>Τιμή</TableHead>
                        <TableHead>Έκπτωση</TableHead>
                        <TableHead>Σύνολο</TableHead>
                        <TableHead>Οδηγίες</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell>€{item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>{item.discount}%</TableCell>
                          <TableCell>€{item.total.toFixed(2)}</TableCell>
                          <TableCell>{item.instructions || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Σύνολα */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Υποσύνολο:</span>
                    <span>€{viewingOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {viewingOrder.orderDiscount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Έκπτωση ({viewingOrder.orderDiscount}%):</span>
                      <span>-€{((viewingOrder.subtotal * viewingOrder.orderDiscount) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Συνολικό Κόστος:</span>
                    <span>€{viewingOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Σχόλια */}
              {viewingOrder.comments && (
                <div>
                  <h3 className="font-semibold mb-2">Σχόλια</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded">{viewingOrder.comments}</p>
                </div>
              )}

              {/* Εκκρεμότητες */}
              {viewingOrder.pendingIssues && (
                <div>
                  <h3 className="font-semibold mb-2">Εκκρεμότητες</h3>
                  <p className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                    {viewingOrder.pendingIssues}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
