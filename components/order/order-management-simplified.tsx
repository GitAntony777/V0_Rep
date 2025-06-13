"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { ShoppingCart, Clock, CheckCircle, AlertTriangle, Plus, MapPin, Eye, Edit, Trash2, Printer } from "lucide-react"
import { OrderFormSimplified } from "./order-form-simplified"
import { GoogleMapsIntegration } from "../google-maps-integration"
import { usePeriod } from "@/contexts/period-context"
import { OrderFilters } from "./order-filters"
import { OrderViewDialog } from "./order-view-dialog"

interface OrderManagementSimplifiedProps {
  userRole: "admin" | "employee" | null
}

// Βοηθητική συνάρτηση για να μαντέψουμε την κατηγορία από το όνομα του προϊόντος
const guessProductCategory = (productName: string): string => {
  const productNameLower = productName.toLowerCase()

  // Κατηγορίες και λέξεις-κλειδιά
  const categories = {
    Παρασκευάσματα: [
      "παρασκευάσμα",
      "κεφτέδ",
      "μπιφτέκ",
      "σουτζούκ",
      "λουκάνικ",
      "σουβλάκι",
      "κοκορέτσι",
      "γύρος",
      "σεφταλιά",
      "κεμπάπ",
    ],
    "Νωπό Κρέας": [
      "μοσχάρι",
      "μοσχαρίσι",
      "βοδινό",
      "κιμάς",
      "φιλέτο",
      "σπάλα",
      "ελιά",
      "καρέ",
      "κότσι",
      "σπαλομπριζόλα",
    ],
    Κοτόπουλο: ["κοτόπουλο", "στήθος", "μπούτι", "φτερούγα", "κοτομπέικον", "φιλέτο κοτόπουλο"],
    Αρνί: ["αρνί", "αρνίσιο", "αρνάκι", "προβατίνα", "κατσίκι", "κατσικάκι"],
    Χοιρινό: ["χοιρινό", "χοιρινή", "πανσέτα", "μπριζόλα", "σνίτσελ", "λαιμός", "ψαρονέφρι"],
  }

  // Έλεγχος για κάθε κατηγορία
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => productNameLower.includes(keyword))) {
      return category
    }
  }

  // Αν δεν βρεθεί κατηγορία, επιστρέφουμε "Άλλο"
  return "Άλλο"
}

export function OrderManagementSimplified({ userRole }: OrderManagementSimplifiedProps) {
  const { getActivePeriodName } = usePeriod()
  const [activeTab, setActiveTab] = useState("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  // States για dialogs
  const [isMapsDialogOpen, setIsMapsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOrderForMaps, setSelectedOrderForMaps] = useState<any>(null)
  const [viewingOrder, setViewingOrder] = useState<any>(null)
  const [editingOrder, setEditingOrder] = useState<any>(null)

  // Load orders, categories and products from localStorage on component mount
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("orders")
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders))
      }

      const savedCategories = localStorage.getItem("categories")
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories))
      } else {
        // Default categories αν δεν υπάρχουν
        const defaultCategories = [
          { id: "1", name: "Παρασκευάσματα" },
          { id: "2", name: "Νωπό Κρέας" },
          { id: "3", name: "Κοτόπουλο" },
          { id: "4", name: "Αρνί" },
          { id: "5", name: "Χοιρινό" },
          { id: "6", name: "Άλλο" },
        ]
        setCategories(defaultCategories)
        localStorage.setItem("categories", JSON.stringify(defaultCategories))
      }

      const savedProducts = localStorage.getItem("products")
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts))
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
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

  // Reset filters when active period changes
  useEffect(() => {
    setSearchTerm("")
    setDateFilter("")
    setCategoryFilter("")
  }, [getActivePeriodName()])

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
    // Παίρνουμε τα φιλτραρισμένα αποτελέσματα ανάλογα με το ενεργό tab
    const ordersToprint = getFilteredOrdersByTab(activeTab)

    // Καθορίζουμε τον τίτλο ανάλογα με το tab
    let reportTitle = "Λίστα Παραγγελιών"
    switch (activeTab) {
      case "pending":
        reportTitle = "Εκκρεμείς Παραγγελίες"
        break
      case "ready":
        reportTitle = "Έτοιμες Παραγγελίες (ΜΕΣΑ)"
        break
      case "ready-pending":
        reportTitle = "Παραγγελίες με Μικτή Κατάσταση (ΜΕΣΑ/ΕΚΚΡΕΜΟΤΗΤΕΣ)"
        break
      default:
        reportTitle = "Όλες οι Παραγγελίες"
    }

    const printData = {
      title: reportTitle,
      orders: ordersToprint,
      totalOrders: ordersToprint.length,
      totalAmount: ordersToprint.reduce((sum, order) => sum + (Number(order.amount) || 0), 0),
    }

    // Χρησιμοποιούμε το PrintUtils component για εκτύπωση
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333;  padding-bottom: 10px; }
            .order-list { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .order-list th, .order-list td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .order-list th { background-color: #f2f2f2; }
            .summary { margin-top: 30px; text-align: right; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <p>Περίοδος: ${getActivePeriodName()}</p>
            <p>Ημερομηνία Εκτύπωσης: ${new Date().toLocaleDateString("el-GR")}</p>
          </div>
          
          <table class="order-list">
            <thead>
              <tr>
                <th>Κωδικός</th>
                <th>Πελάτης</th>
                <th>Ημ. Παράδοσης</th>
                <th>Κατάσταση</th>
                <th>Ποσό</th>
              </tr>
            </thead>
            <tbody>
              ${printData.orders
                .map(
                  (order) => `
                <tr>
                  <td>${order.id}</td>
                  <td>${order.customer}</td>
                  <td>${new Date(order.deliveryDate).toLocaleDateString("el-GR")}</td>
                  <td>${order.status}</td>
                  <td>€${Number(order.amount).toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="summary">
            <p>Σύνολο Παραγγελιών: ${printData.totalOrders}</p>
            <p>Συνολικό Ποσό: €${printData.totalAmount.toFixed(2)}</p>
          </div>
          
          <div class="footer">
            <p>Το Μπέλλες - Σύστημα Διαχείρισης Παραγγελιών</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  // Φιλτράρισμα παραγγελιών με βάση τα κριτήρια αναζήτησης
  const filterOrders = (orders: any[]) => {
    return orders.filter((order) => {
      // Φίλτρο αναζήτησης
      const searchMatch =
        !searchTerm ||
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase())

      // Φίλτρο ημερομηνίας
      const dateMatch = !dateFilter || order.deliveryDate === dateFilter

      // Φίλτρο κατηγορίας
      let categoryMatch = true
      if (categoryFilter) {
        // Ελέγχουμε αν υπάρχει τουλάχιστον ένα προϊόν στην παραγγελία που ανήκει στην επιλεγμένη κατηγορία
        categoryMatch = order.items?.some((item: any) => {
          // Βρίσκουμε το προϊόν από τη λίστα προϊόντων
          const product = products.find((p) => p.name === item.productName)
          if (product && product.category) {
            return product.category === categoryFilter
          }
          // Αν δεν βρεθεί το προϊόν ή δεν έχει κατηγορία, μαντεύουμε την κατηγορία από το όνομα
          return guessProductCategory(item.productName) === categoryFilter
        })
      }

      // Φίλτρο περιόδου
      const periodMatch = order.period === getActivePeriodName()

      return searchMatch && dateMatch && categoryMatch && periodMatch
    })
  }

  // Φιλτράρισμα παραγγελιών με βάση το ενεργό tab
  const getFilteredOrdersByTab = (tab: string) => {
    const filteredOrders = filterOrders(orders)

    switch (tab) {
      case "pending":
        return filteredOrders.filter((order) => order.status === "Εκκρεμότητες")
      case "ready":
        return filteredOrders.filter((order) => order.status === "Μέσα")
      case "ready-pending":
        return filteredOrders.filter((order) => order.status === "Μέσα/Εκκρεμότητες")
      case "delivered":
        return filteredOrders.filter((order) => order.status === "Παραδόθηκε")
      default:
        return filteredOrders
    }
  }

  // Υπολογισμός συνολικών ποσών για κάθε tab
  const calculateTabTotals = (tab: string) => {
    const filteredOrders = getFilteredOrdersByTab(tab)
    return {
      count: filteredOrders.length,
      amount: filteredOrders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0),
    }
  }

  const listTabTotals = calculateTabTotals("list")
  const pendingTabTotals = calculateTabTotals("pending")
  const readyTabTotals = calculateTabTotals("ready")
  const readyPendingTabTotals = calculateTabTotals("ready-pending")
  const deliveredTabTotals = calculateTabTotals("delivered")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Διαχείριση Παραγγελιών
          </CardTitle>
          <CardDescription>
            <div className="space-y-2">
              <div>Διαχειριστείτε τις παραγγελίες για την τρέχουσα εορταστική περίοδο</div>
              <Badge variant="outline">Περίοδος: {getActivePeriodName()}</Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <Button onClick={() => setActiveTab("new")} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Νέα Παραγγελία
            </Button>
            <Button variant="outline" onClick={handlePrintAllOrders}>
              <Printer className="h-4 w-4 mr-2" />
              Εκτύπωση Λίστας
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
              <TabsTrigger value="list" className="relative">
                Όλες
                <Badge variant="secondary" className="ml-2">
                  {listTabTotals.count}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Εκκρεμείς
                <Badge variant="secondary" className="ml-2">
                  {pendingTabTotals.count}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ready" className="relative">
                Έτοιμες
                <Badge variant="secondary" className="ml-2">
                  {readyTabTotals.count}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ready-pending" className="relative">
                Μικτές
                <Badge variant="secondary" className="ml-2">
                  {readyPendingTabTotals.count}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="delivered" className="relative">
                Παραδόθηκαν
                <Badge variant="secondary" className="ml-2">
                  {deliveredTabTotals.count}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new">
              <OrderFormSimplified onSave={handleSaveOrder} onCancel={() => setActiveTab("list")} isEditing={false} />
            </TabsContent>

            {["list", "pending", "ready", "ready-pending", "delivered"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <div className="space-y-4">
                  <OrderFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    dateFilter={dateFilter}
                    onDateFilterChange={setDateFilter}
                    categoryFilter={categoryFilter}
                    onCategoryFilterChange={setCategoryFilter}
                    categories={categories}
                  />

                  <div className="grid grid-cols-1 gap-4">
                    {getFilteredOrdersByTab(tab).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="mx-auto h-12 w-12 opacity-20 mb-2" />
                        <p>Δεν βρέθηκαν παραγγελίες με τα επιλεγμένα κριτήρια</p>
                      </div>
                    ) : (
                      getFilteredOrdersByTab(tab).map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="flex-1 p-4">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">#{order.id}</h3>
                                    <Badge
                                      variant={getStatusColor(order.status) as any}
                                      className="flex items-center gap-1"
                                    >
                                      {getStatusIcon(order.status)}
                                      <span>{order.status}</span>
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    Παράδοση: {new Date(order.deliveryDate).toLocaleDateString("el-GR")}
                                  </p>
                                </div>
                                <div className="mt-2 md:mt-0 text-right">
                                  <p className="font-semibold">€{Number(order.amount).toFixed(2)}</p>
                                  <p className="text-sm text-gray-500">{order.employee}</p>
                                </div>
                              </div>

                              <div className="mt-4">
                                <p className="font-medium">{order.customer}</p>
                                <p className="text-sm text-gray-500">{order.customerAddress}</p>
                                <p className="text-sm text-gray-500">{order.customerPhone}</p>
                              </div>

                              {order.pendingIssues && (
                                <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                                  <strong>Εκκρεμότητες:</strong> {order.pendingIssues}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-row md:flex-col justify-between border-t md:border-t-0 md:border-l p-2 gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 md:w-full"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-2">Προβολή</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 md:w-full"
                                onClick={() => handleEditOrder(order)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-2">Επεξεργασία</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 md:w-full"
                                onClick={() => handleOpenMaps(order)}
                              >
                                <MapPin className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-2">Χάρτης</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 md:w-full text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only md:not-sr-only md:ml-2">Διαγραφή</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Διαγραφή Παραγγελίας</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Είστε βέβαιοι ότι θέλετε να διαγράψετε την παραγγελία #{order.id}; Αυτή η ενέργεια
                                      δεν μπορεί να αναιρεθεί.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Άκυρο</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteOrder(order.id)}>
                                      Διαγραφή
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>

                  {getFilteredOrdersByTab(tab).length > 0 && (
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">Σύνολο Παραγγελιών:</span> {getFilteredOrdersByTab(tab).length}
                      </div>
                      <div>
                        <span className="font-medium">Συνολικό Ποσό:</span> €
                        {getFilteredOrdersByTab(tab)
                          .reduce((sum, order) => sum + (Number(order.amount) || 0), 0)
                          .toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog για Google Maps */}
      <Dialog open={isMapsDialogOpen} onOpenChange={setIsMapsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Χάρτης Διεύθυνσης Πελάτη</DialogTitle>
          </DialogHeader>
          {selectedOrderForMaps && (
            <GoogleMapsIntegration
              address={selectedOrderForMaps.customerAddress}
              customerName={selectedOrderForMaps.customer}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog για προβολή παραγγελίας */}
      <OrderViewDialog
        order={viewingOrder}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onEdit={(order) => {
          setIsViewDialogOpen(false)
          handleEditOrder(order)
        }}
      />

      {/* Dialog για επεξεργασία παραγγελίας */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Επεξεργασία Παραγγελίας</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <OrderFormSimplified
              onSave={handleSaveOrder}
              onCancel={() => setIsEditDialogOpen(false)}
              editingOrder={editingOrder}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
