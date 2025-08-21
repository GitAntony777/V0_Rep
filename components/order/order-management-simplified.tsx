"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Printer,
  Calendar,
} from "lucide-react"
import { OrderForm } from "../order-form"
import { GoogleMapsIntegration } from "../google-maps-integration"
import { usePeriod } from "@/contexts/period-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { el } from "date-fns/locale"
import { PrintUtils } from "../print-utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface OrderManagementProps {
  userRole: "admin" | "employee" | null
}

export const OrderManagementSimplified = ({ userRole }: OrderManagementProps) => {
  const { getActivePeriodName } = usePeriod()
  const [activeTab, setActiveTab] = useState("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateSearchTerm, setDateSearchTerm] = useState("")

  const [orders, setOrders] = useState([])

  // Load orders from localStorage on component mount
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("orders")
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders))
      }
    } catch (error) {
      console.error("Error loading orders from localStorage:", error)
    }
  }, [])

  // Save orders to localStorage whenever orders state changes
  useEffect(() => {
    if (orders.length > 0) {
      try {
        localStorage.setItem("orders", JSON.stringify(orders))
      } catch (error) {
        console.error("Error saving orders to localStorage:", error)
      }
    }
  }, [orders])

  const [isMapsDialogOpen, setIsMapsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOrderForMaps, setSelectedOrderForMaps] = useState<any>(null)
  const [viewingOrder, setViewingOrder] = useState<any>(null)
  const [editingOrder, setEditingOrder] = useState<any>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Παραδόθηκε":
        return <CheckCircle className="h-4 w-4" />
      case "Μέσα":
        return <Clock className="h-4 w-4" />
      case "Εκκρεμότητες":
        return <AlertTriangle className="h-4 w-4" />
      case "Μέσα/Εκκρεμότητες":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <ShoppingCart className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Παραδόθηκε":
        return "default"
      case "Μέσα":
        return "secondary"
      case "Εκκρεμότητες":
        return "destructive"
      case "Μέσα/Εκκρεμότητες":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleSaveOrder = (orderData: any) => {
    const orderDataWithPeriod = {
      ...orderData,
      period: getActivePeriodName(),
    }
    if (editingOrder) {
      // Update existing order
      setOrders(orders.map((order) => (order.id === editingOrder.id ? orderDataWithPeriod : order)))
      setIsEditDialogOpen(false)
      setEditingOrder(null)
    } else {
      // Add new order
      setOrders([orderDataWithPeriod, ...orders])
    }
    setActiveTab("list")
  }

  const handleViewOrder = (order: any) => {
    setViewingOrder(order)
    setIsViewDialogOpen(true)
  }

  const handleEditOrder = (order: any) => {
    setEditingOrder(order)
    setIsEditDialogOpen(true)
  }

  const handleDeleteOrder = (orderId: string) => {
    setOrders(orders.filter((order) => order.id !== orderId))
  }

  const handleOpenMaps = (order: any) => {
    setSelectedOrderForMaps(order)
    setIsMapsDialogOpen(true)
  }

  const handlePrintAllOrders = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Λίστα Παραγγελιών</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .company-info { text-align: center; margin-bottom: 20px; }
            .content { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 0.9em; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="company-info">
            <h1>ΤΟ ΜΠΕΛΛΕΣ - Κρεοπωλείο</h1>
            <p>Καπετάν Γκόνη 34, 55131 Καλαμαρια, Θεσσαλονίκη</p>
            <p>Τηλ: 2310-123456 | Email: info@tobelles.gr</p>
          </div>
          <div class="header">
            <h2>Λίστα Παραγγελιών</h2>
            <p>Ημερομηνία εκτύπωσης: ${new Date().toLocaleDateString("el-GR")}</p>
            <p>Περίοδος: ${getActivePeriodName()}</p>
          </div>
          <div class="content">
            <table>
              <thead>
                <tr>
                  <th>Κωδικός</th>
                  <th>Πελάτης</th>
                  <th>Τηλέφωνο</th>
                  <th>Ημ. Παραγγελίας</th>
                  <th>Ημ. Παράδοσης</th>
                  <th>Κατάσταση</th>
                  <th>Ποσό</th>
                  <th>Υπάλληλος</th>
                </tr>
              </thead>
              <tbody>
                ${filteredOrders
                  .map(
                    (order) => `
                  <tr>
                    <td>${order.id}</td>
                    <td>${order.customer}</td>
                    <td>${order.customerPhone}</td>
                    <td>${new Date(order.orderDate).toLocaleDateString("el-GR")}</td>
                    <td>${new Date(order.deliveryDate).toLocaleDateString("el-GR")}</td>
                    <td>${order.status}</td>
                    <td>€${order.amount.toFixed(2)}</td>
                    <td>${order.employee}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="total">
              <p>Σύνολο Παραγγελιών: ${filteredOrders.length}</p>
              <p>Συνολικό Ποσό: €${filteredOrders.reduce((sum, order) => sum + order.amount, 0).toFixed(2)}</p>
            </div>
          </div>
          <div class="footer">
            <p>Εκτυπώθηκε από το σύστημα διαχείρισης παραγγελιών - ΤΟ ΜΠΕΛΛΕΣ</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  // Φιλτράρισμα παραγγελιών με βάση την αναζήτηση ΚΑΙ την ενεργή περίοδο
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm)

    const matchesDate =
      order.deliveryDate.includes(dateSearchTerm) ||
      new Date(order.deliveryDate).toLocaleDateString("el-GR").includes(dateSearchTerm)

    const activePeriodName = getActivePeriodName()
    const matchesPeriod = order.period === activePeriodName

    return matchesSearch && matchesDate && matchesPeriod
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Διαχείριση Παραγγελιών
              </CardTitle>
              <CardDescription>Προβολή και διαχείρηση παραγγελιών εορταστικής περιόδου</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrintAllOrders}>
                <Printer className="h-4 w-4 mr-2" />
                Εκτύπωση Λίστας
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setActiveTab("add")}>
                <Plus className="h-4 w-4 mr-2" />
                Νέα Παραγγελία
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">Λίστα</TabsTrigger>
              <TabsTrigger value="add">Νέα Παραγγελία</TabsTrigger>
            </TabsList>

            {/* Φίλτρα και Αναζήτηση */}
            {activeTab !== "add" && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="search">Αναζήτηση Παραγγελίας</Label>
                    <Input
                      id="search"
                      placeholder="Αναζήτηση με κωδικό, όνομα πελάτη..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Ημερομηνία Παράδοσης</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateSearchTerm
                            ? format(new Date(dateSearchTerm), "PPP", { locale: el })
                            : "Επιλέξτε ημερομηνία"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={dateSearchTerm ? new Date(dateSearchTerm) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setDateSearchTerm(format(date, "yyyy-MM-dd"))
                            } else {
                              setDateSearchTerm("")
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {(searchTerm || dateSearchTerm) && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Βρέθηκαν {filteredOrders.length} παραγγελίες από σύνολο {orders.length}
                    </p>
                  </div>
                )}
              </div>
            )}

            <TabsContent value="list" className="space-y-4">
              <div className="grid gap-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{order.id}</Badge>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <ShoppingCart className="h-4 w-4" />
                              {order.status}
                            </Badge>
                          </div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-gray-600">
                            Παραγγελία: {new Date(order.orderDate).toLocaleDateString("el-GR")} | Παράδοση:{" "}
                            {new Date(order.deliveryDate).toLocaleDateString("el-GR")}
                          </p>
                          <p className="text-sm text-gray-600">Υπάλληλος: {order.employee}</p>
                          <p className="text-sm text-gray-600">Περίοδος: {order.period}</p>
                          {order.pendingIssues && (
                            <p className="text-sm text-red-600 font-medium">Εκκρεμότητες: {order.pendingIssues}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">€{order.amount.toFixed(2)}</p>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleOpenMaps(order)}
                            >
                              <MapPin className="h-4 w-4" />
                            </Button>
                            {userRole === "admin" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Επιβεβαίωση Διαγραφής</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Είστε σίγουροι ότι θέλετε να διαγράψετε την παραγγελία "{order.id}"; Αυτή η
                                      ενέργεια δεν μπορεί να αναιρεθεί.
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
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm || dateSearchTerm
                      ? "Δεν βρέθηκαν παραγγελίες με τα κριτήρια αναζήτησης"
                      : "Δεν υπάρχουν παραγγελίες"}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="add">
              <OrderForm onSave={handleSaveOrder} onCancel={() => setActiveTab("list")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog Προβολής Παραγγελίας */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Προβολή Παραγγελίας - {viewingOrder?.id}
            </DialogTitle>
            <DialogDescription>
              Προβολή λεπτομερειών παραγγελίας και δυνατότητα επεξεργασίας ή εκτύπωσης
            </DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-6">
              {/* Στοιχεία Πελάτη */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Πελάτης</Label>
                  <p className="font-medium">{viewingOrder.customer}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Κατάσταση</Label>
                  <Badge variant={getStatusColor(viewingOrder.status) as any} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(viewingOrder.status)}
                    {viewingOrder.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Διεύθυνση</Label>
                  <p className="font-medium">{viewingOrder.customerAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Τηλέφωνο</Label>
                  <p className="font-medium">{viewingOrder.customerPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ημερομηνία Παραγγελίας</Label>
                  <p className="font-medium">{new Date(viewingOrder.orderDate).toLocaleDateString("el-GR")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ημερομηνία Παράδοσης</Label>
                  <p className="font-medium">{new Date(viewingOrder.deliveryDate).toLocaleDateString("el-GR")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Υπάλληλος</Label>
                  <p className="font-medium">{viewingOrder.employee}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Περίοδος</Label>
                  <p className="font-medium">{viewingOrder.period}</p>
                </div>
              </div>

              {/* Προϊόντα Παραγγελίας */}
              {viewingOrder.items && viewingOrder.items.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Προϊόντα Παραγγελίας</Label>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Προϊόν</TableHead>
                          <TableHead>Ποσότητα</TableHead>
                          <TableHead>Τιμή Μονάδος</TableHead>
                          <TableHead>Έκπτωση</TableHead>
                          <TableHead>Σύνολο</TableHead>
                          <TableHead>Οδηγίες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingOrder.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell>
                              {item.quantity} {item.unit}
                            </TableCell>
                            <TableCell>€{(item.unitPrice || item.price || 0).toFixed(2)}</TableCell>
                            <TableCell>{item.discount || 0}%</TableCell>
                            <TableCell>€{(item.total || 0).toFixed(2)}</TableCell>
                            <TableCell>{item.instructions || item.comments || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Οικονομικά Στοιχεία */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Υποσύνολο:</span>
                  <span>€{(viewingOrder.subtotal || 0).toFixed(2)}</span>
                </div>

                {viewingOrder.orderDiscount && viewingOrder.orderDiscount > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span>Έκπτωση Παραγγελίας ({viewingOrder.orderDiscount}%):</span>
                    <span>
                      -€{(((viewingOrder.subtotal || 0) * (viewingOrder.orderDiscount || 0)) / 100).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                  <span>Συνολικό Κόστος:</span>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    €{(viewingOrder.total || viewingOrder.amount || 0).toFixed(2)}
                  </Badge>
                </div>
              </div>

              {/* Σχόλια και Εκκρεμότητες */}
              {(viewingOrder.comments || viewingOrder.pendingIssues) && (
                <div className="space-y-3">
                  {viewingOrder.comments && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Σχόλια Παραγγελίας</Label>
                      <p className="mt-1 p-3 bg-blue-50 rounded-lg">{viewingOrder.comments}</p>
                    </div>
                  )}

                  {viewingOrder.pendingIssues && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Εκκρεμότητες</Label>
                      <p className="mt-1 p-3 bg-red-50 rounded-lg text-red-800">{viewingOrder.pendingIssues}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsViewDialogOpen(false)} className="flex-1">
                  Κλείσιμο
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEditOrder(viewingOrder)
                  }}
                  className="flex-1"
                >
                  Επεξεργασία
                </Button>
                {viewingOrder && (
                  <PrintUtils
                    title={`Παραγγελία ${viewingOrder.id}`}
                    data={{
                      id: viewingOrder.id,
                      customerName: viewingOrder.customer,
                      customerAddress: viewingOrder.customerAddress,
                      customerPhone: viewingOrder.customerPhone,
                      orderDate: viewingOrder.orderDate,
                      deliveryDate: viewingOrder.deliveryDate,
                      items: viewingOrder.items || [],
                      subtotal: viewingOrder.subtotal || 0,
                      orderDiscount: viewingOrder.orderDiscount || 0,
                      total: viewingOrder.total || 0,
                      status: viewingOrder.status,
                      comments: viewingOrder.comments || "",
                      pendingIssues: viewingOrder.pendingIssues || "",
                      employee: viewingOrder.employee,
                      period: viewingOrder.period,
                    }}
                    type="order"
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Επεξεργασίας Παραγγελίας */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Επεξεργασία Παραγγελίας</DialogTitle>
            <DialogDescription>
              Επεξεργαστείτε τα στοιχεία της παραγγελίας και αποθηκεύστε τις αλλαγές
            </DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <OrderForm
              onSave={handleSaveOrder}
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

      {/* Dialog Χάρτη */}
      <Dialog open={isMapsDialogOpen} onOpenChange={setIsMapsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Χάρτης Διεύθυνσης - {selectedOrderForMaps?.customer}</DialogTitle>
            <DialogDescription>Προβολή της διεύθυνσης παράδοσης στον χάρτη</DialogDescription>
          </DialogHeader>
          {selectedOrderForMaps && (
            <div className="h-[500px]">
              <GoogleMapsIntegration address={selectedOrderForMaps.customerAddress} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Add both named and default exports
export default OrderManagementSimplified
