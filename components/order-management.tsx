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
  Search,
  Printer,
  Calendar,
  Filter,
} from "lucide-react"
import { OrderForm } from "./order-form"
import { GoogleMapsIntegration } from "./google-maps-integration"
import { usePeriod } from "../contexts/period-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { el } from "date-fns/locale"
import { PrintUtils } from "./print-utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface OrderManagementProps {
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

export const OrderManagement = ({ userRole }: OrderManagementProps) => {
  const { getActivePeriodName } = usePeriod()
  const [activeTab, setActiveTab] = useState("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateSearchTerm, setDateSearchTerm] = useState("")
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  // States για φιλτράρισμα κατά κατηγορία
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showCategoryResults, setShowCategoryResults] = useState(false)

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
        // Αποθηκεύουμε τις προεπιλεγμένες κατηγορίες στο localStorage
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

  // Προσθέστε αυτό μετά τα υπάρχοντα useEffect
  useEffect(() => {
    // Όταν αλλάζει η ενεργή περίοδος, καθαρίζουμε τα φίλτρα αναζήτησης
    // για να δούμε όλες τις παραγγελίες της νέας περιόδου
    setSearchTerm("")
    setDateSearchTerm("")
    setSelectedCategory("")
    setShowCategoryResults(false)
  }, [getActivePeriodName()])

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
            <h2>${reportTitle}</h2>
            <p>Ημερομηνία εκτύπωσης: ${new Date().toLocaleDateString("el-GR")}</p>
            <p>Περίοδος: ${getActivePeriodName()}</p>
            ${searchTerm || dateSearchTerm ? `<p>Φίλτρα: ${searchTerm ? `Αναζήτηση: "${searchTerm}"` : ""} ${dateSearchTerm ? `Ημερομηνία: ${new Date(dateSearchTerm).toLocaleDateString("el-GR")}` : ""}</p>` : ""}
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
                ${ordersToprint
                  .map(
                    (order) => `
                  <tr>
                    <td>${order.id}</td>
                    <td>${order.customer}</td>
                    <td>${order.customerPhone}</td>
                    <td>${new Date(order.orderDate).toLocaleDateString("el-GR")}</td>
                    <td>${new Date(order.deliveryDate).toLocaleDateString("el-GR")}</td>
                    <td>${order.status}</td>
                    <td>€${(Number.parseFloat(order.amount?.toString() || "0") || 0).toFixed(2)}</td>
                    <td>${order.employee}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="total">
              <p>Σύνολο Παραγγελιών: ${printData.totalOrders}</p>
              <p>Συνολικό Ποσό: €${printData.totalAmount.toFixed(2)}</p>
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
    let matchesSearch = true
    let matchesDate = true
    let matchesPeriod = true

    // Φιλτράρισμα με βάση το γενικό search term (χωρίς ημερομηνία)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      matchesSearch =
        order.id.toLowerCase().includes(searchLower) ||
        order.customer.toLowerCase().includes(searchLower) ||
        order.customerPhone.includes(searchTerm)
    }

    // Φιλτράρισμα με βάση την ημερομηνία παράδοσης
    if (dateSearchTerm) {
      matchesDate =
        order.deliveryDate.includes(dateSearchTerm) ||
        new Date(order.deliveryDate).toLocaleDateString("el-GR").includes(dateSearchTerm)
    }

    // Φιλτράρισμα με βάση την ενεργή περίοδο
    const activePeriodName = getActivePeriodName()
    if (activePeriodName && activePeriodName !== "Καμία ενεργή περίοδος") {
      matchesPeriod = order.period === activePeriodName
    }

    return matchesSearch && matchesDate && matchesPeriod
  })

  // Φιλτράρισμα ανά tab
  const getFilteredOrdersByTab = (tab: string) => {
    switch (tab) {
      case "pending":
        return filteredOrders.filter((order) => order.status === "Εκκρεμότητες")
      case "ready":
        return filteredOrders.filter((order) => order.status === "Μέσα")
      case "ready-pending":
        return filteredOrders.filter((order) => order.status === "Μέσα/Εκκρεμότητες")
      default:
        return filteredOrders
    }
  }

  // Φιλτράρισμα παραγγελιών κατά κατηγορία προϊόντος
  const getOrdersByCategory = (categoryName: string) => {
    return filteredOrders.filter((order) => {
      if (!order.items || !Array.isArray(order.items)) return false

      return (
        order.items &&
        Array.isArray(order.items) &&
        order.items.some((item: any) => {
          // Πρώτα προσπαθούμε να βρούμε το προϊόν στο localStorage
          const savedProducts = localStorage.getItem("products")
          if (savedProducts) {
            try {
              const products = JSON.parse(savedProducts)
              const product = products.find((p: any) => p.name === item.productName)
              if (product && product.categoryName === categoryName) {
                return true
              }
            } catch (error) {
              console.error("Error parsing products from localStorage:", error)
            }
          }

          // Αν δεν βρεθεί στο localStorage, χρησιμοποιούμε τη συνάρτηση guessProductCategory
          const guessedCategory = guessProductCategory(item.productName)
          return guessedCategory === categoryName
        })
      )
    })
  }

  const handleCategoryFilter = (categoryName: string) => {
    setSelectedCategory(categoryName)
    setShowCategoryResults(true)
    setIsFilterOpen(false) // Κλείνουμε το μενού

    // Debug
    console.log(`Filtering by category: ${categoryName}`)
    const filteredOrders = getOrdersByCategory(categoryName)
    console.log(`Found ${filteredOrders.length} orders with products in category ${categoryName}`)
  }

  const renderOrderCard = (order: any) => (
    <Card key={order.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{order.id}</Badge>
              <Badge variant={getStatusColor(order.status) as any} className="flex items-center gap-1">
                {getStatusIcon(order.status)}
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
            <p className="text-lg font-semibold">€{(Number(order.amount) || 0).toFixed(2)}</p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-green-600" onClick={() => handleOpenMaps(order)}>
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
                        Είστε σίγουροι ότι θέλετε να διαγράψετε την παραγγελία "{order.id}"; Αυτή η ενέργεια δεν μπορεί
                        να αναιρεθεί.
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
  )

  const renderCategoryOrderCard = (order: any) => {
    // Βρίσκουμε τα προϊόντα της επιλεγμένης κατηγορίας
    const categoryItems =
      order.items?.filter((item: any) => {
        // Πρώτα προσπαθούμε να βρούμε το προϊόν στο localStorage
        const savedProducts = localStorage.getItem("products")
        if (savedProducts) {
          try {
            const products = JSON.parse(savedProducts)
            const product = products.find((p: any) => p.name === item.productName)
            if (product && product.categoryName === selectedCategory) {
              return true
            }
          } catch (error) {
            console.error("Error parsing products from localStorage:", error)
          }
        }

        // Αν δεν βρεθεί στο localStorage, χρησιμοποιούμε τη συνάρτηση guessProductCategory
        const guessedCategory = guessProductCategory(item.productName)
        return guessedCategory === selectedCategory
      }) || []

    // Υπολογίζουμε το συνολικό ποσό για τα προϊόντα της κατηγορίας
    const categoryTotal = categoryItems.reduce((sum: number, item: any) => sum + (item.total || 0), 0)

    return (
      <Card key={order.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{order.id}</Badge>
                <Badge variant={getStatusColor(order.status) as any} className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
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
              <p className="text-lg font-semibold">€{categoryTotal.toFixed(2)}</p>
              <p className="text-sm text-gray-600">
                {categoryItems.length} προϊόντα κατηγορίας {selectedCategory}
              </p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t pt-3">
            <p className="font-medium text-sm mb-2">Προϊόντα κατηγορίας {selectedCategory}:</p>
            <ul className="text-sm space-y-1">
              {categoryItems.map((item: any, index: number) => (
                <li key={index} className="flex justify-between">
                  <span>
                    {item.productName} ({item.quantity} {item.unit})
                  </span>
                  <span>€{item.total.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Διαχείριση Παραγγελιών
          </CardTitle>
          <CardDescription>
            <div className="space-y-2">
              <div>Διαχειριστείτε τις παραγγελίες σας για την τρέχουσα εορταστική περίοδο</div>
              <Badge variant="outline">Περίοδος: {getActivePeriodName()}</Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="list">Όλες</TabsTrigger>
                <TabsTrigger value="pending">Εκκρεμείς</TabsTrigger>
                <TabsTrigger value="ready">Έτοιμες</TabsTrigger>
                <TabsTrigger value="ready-pending">Μικτές</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrintAllOrders}>
                  <Printer className="h-4 w-4 mr-1" />
                  Εκτύπωση
                </Button>
                <Button onClick={() => setActiveTab("new")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Νέα Παραγγελία
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Αναζήτηση με κωδικό, πελάτη ή τηλέφωνο..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateSearchTerm ? format(new Date(dateSearchTerm), "dd/MM/yyyy") : "Επιλογή ημερομηνίας παράδοσης"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateSearchTerm ? new Date(dateSearchTerm) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setDateSearchTerm(format(date, "yyyy-MM-dd"))
                      } else {
                        setDateSearchTerm("")
                      }
                      // Κλείνουμε το popover αυτόματα
                      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
                    }}
                    locale={el}
                    initialFocus
                  />
                  <div className="p-3 border-t flex justify-between">
                    <Button variant="ghost" size="sm" onClick={() => setDateSearchTerm("")}>
                      Καθαρισμός
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}
                    >
                      Εφαρμογή
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Filter className="h-4 w-4 mr-2" />
                    {selectedCategory ? `Κατηγορία: ${selectedCategory}` : "Φιλτράρισμα κατά Κατηγορία"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <div className="p-2">
                    <p className="font-medium mb-2">Επιλογή Κατηγορίας</p>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleCategoryFilter(category.name)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="p-2 border-t flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory("")
                        setShowCategoryResults(false)
                        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
                      }}
                    >
                      Καθαρισμός
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {dateSearchTerm && (
              <div className="mb-4 flex items-center">
                <Badge variant="secondary" className="mr-2">
                  Ημερομηνία: {format(new Date(dateSearchTerm), "dd/MM/yyyy")}
                </Badge>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setDateSearchTerm("")}>
                  Καθαρισμός
                </Button>
              </div>
            )}

            {selectedCategory && showCategoryResults && (
              <div className="mb-4 flex items-center">
                <Badge variant="secondary" className="mr-2">
                  Κατηγορία: {selectedCategory}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    setSelectedCategory("")
                    setShowCategoryResults(false)
                  }}
                >
                  Καθαρισμός
                </Button>
              </div>
            )}

            <TabsContent value="list" className="space-y-4">
              {selectedCategory && showCategoryResults ? (
                <>
                  <div className="text-sm text-gray-600 mb-2">
                    Βρέθηκαν {getOrdersByCategory(selectedCategory).length} παραγγελίες με προϊόντα κατηγορίας "
                    {selectedCategory}"
                  </div>
                  {getOrdersByCategory(selectedCategory).length > 0 ? (
                    getOrdersByCategory(selectedCategory).map((order) => renderCategoryOrderCard(order))
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      Δεν βρέθηκαν παραγγελίες με προϊόντα της κατηγορίας "{selectedCategory}"
                    </p>
                  )}
                </>
              ) : (
                <>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => renderOrderCard(order))
                  ) : (
                    <p className="text-center py-8 text-gray-500">
                      Δεν βρέθηκαν παραγγελίες που να ταιριάζουν με τα κριτήρια αναζήτησης
                    </p>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {getFilteredOrdersByTab("pending").length > 0 ? (
                getFilteredOrdersByTab("pending").map((order) => renderOrderCard(order))
              ) : (
                <p className="text-center py-8 text-gray-500">Δεν υπάρχουν εκκρεμείς παραγγελίες</p>
              )}
            </TabsContent>

            <TabsContent value="ready" className="space-y-4">
              {getFilteredOrdersByTab("ready").length > 0 ? (
                getFilteredOrdersByTab("ready").map((order) => renderOrderCard(order))
              ) : (
                <p className="text-center py-8 text-gray-500">Δεν υπάρχουν έτοιμες παραγγελίες</p>
              )}
            </TabsContent>

            <TabsContent value="ready-pending" className="space-y-4">
              {getFilteredOrdersByTab("ready-pending").length > 0 ? (
                getFilteredOrdersByTab("ready-pending").map((order) => renderOrderCard(order))
              ) : (
                <p className="text-center py-8 text-gray-500">Δεν υπάρχουν παραγγελίες με μικτή κατάσταση</p>
              )}
            </TabsContent>

            <TabsContent value="new">
              <OrderForm onSave={handleSaveOrder} onCancel={() => setActiveTab("list")} isEditing={false} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Διάλογος Προβολής Παραγγελίας */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Προβολή Παραγγελίας #{viewingOrder?.id}</DialogTitle>
            <DialogDescription>Λεπτομέρειες παραγγελίας</DialogDescription>
          </DialogHeader>

          {viewingOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Στοιχεία Πελάτη</h3>
                  <p className="font-medium">{viewingOrder.customer}</p>
                  <p className="text-sm">{viewingOrder.customerAddress}</p>
                  <p className="text-sm">{viewingOrder.customerPhone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Στοιχεία Παραγγελίας</h3>
                  <p>
                    <span className="font-medium">Κωδικός:</span> {viewingOrder.id}
                  </p>
                  <p>
                    <span className="font-medium">Ημ. Παραγγελίας:</span>{" "}
                    {new Date(viewingOrder.orderDate).toLocaleDateString("el-GR")}
                  </p>
                  <p>
                    <span className="font-medium">Ημ. Παράδοσης:</span>{" "}
                    {new Date(viewingOrder.deliveryDate).toLocaleDateString("el-GR")}
                  </p>
                  <p>
                    <span className="font-medium">Υπάλληλος:</span> {viewingOrder.employee}
                  </p>
                  <p>
                    <span className="font-medium">Κατάσταση:</span>{" "}
                    <Badge variant={getStatusColor(viewingOrder.status) as any}>{viewingOrder.status}</Badge>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Προϊόντα Παραγγελίας</h3>\
                <div className="rounded-lg">
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
                      {viewingOrder.items?.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell>€{item.unitPrice?.toFixed(2)}</TableCell>
                          <TableCell>{item.discount}%</TableCell>
                          <TableCell>€{item.total?.toFixed(2)}</TableCell>
                          <TableCell>{item.instructions || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Υποσύνολο:</span>
                  <span>€{viewingOrder.subtotal?.toFixed(2)}</span>
                </div>

                {viewingOrder.orderDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Έκπτωση ({viewingOrder.orderDiscount}%):</span>
                    <span>-€{((viewingOrder.subtotal * viewingOrder.orderDiscount) / 100).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                  <span>Συνολικό Κόστος:</span>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    €{viewingOrder.total?.toFixed(2)}
                  </Badge>
                </div>
              </div>

              {viewingOrder.pendingIssues && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-red-800 mb-1">Εκκρεμότητες</h3>
                  <p className="text-red-700">{viewingOrder.pendingIssues}</p>
                </div>
              )}

              {viewingOrder.comments && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-1">Σχόλια Παραγγελίας</h3>
                  <p className="text-blue-700">{viewingOrder.comments}</p>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Κλείσιμο
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEditOrder(viewingOrder)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Επεξεργασία
                  </Button>
                  <PrintUtils
                    title="Εκτύπωση Παραγγελίας"
                    data={{
                      id: viewingOrder.id,
                      customerName: viewingOrder.customer,
                      customerAddress: viewingOrder.customerAddress,
                      customerPhone: viewingOrder.customerPhone,
                      orderDate: viewingOrder.orderDate,
                      deliveryDate: viewingOrder.deliveryDate,
                      items: viewingOrder.items,
                      subtotal: viewingOrder.subtotal,
                      orderDiscount: viewingOrder.orderDiscount,
                      total: viewingOrder.total,
                      status: viewingOrder.status,
                      comments: viewingOrder.comments,
                      pendingIssues: viewingOrder.pendingIssues,
                      employee: viewingOrder.employee,
                      period: viewingOrder.period,
                    }}
                    type="order"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Διάλογος Επεξεργασίας Παραγγελίας */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Επεξεργασία Παραγγελίας #{editingOrder?.id}</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <OrderForm
              onSave={handleSaveOrder}
              onCancel={() => setIsEditDialogOpen(false)}
              editingOrder={editingOrder}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Διάλογος Χάρτη */}
      <Dialog open={isMapsDialogOpen} onOpenChange={setIsMapsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Χάρτης Διεύθυνσης Πελάτη</DialogTitle>
            <DialogDescription>
              {selectedOrderForMaps?.customer} - {selectedOrderForMaps?.customerAddress}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[500px]">
            <GoogleMapsIntegration address={selectedOrderForMaps?.customerAddress || ""} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
