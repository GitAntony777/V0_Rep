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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { OrderForm } from "./order-form"
import { GoogleMapsIntegration } from "./google-maps-integration"
import { usePeriod } from "../contexts/period-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { el } from "date-fns/locale"
import { cn } from "@/lib/utils"
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
      totalAmount: ordersToprint.reduce(
        (sum, order) => sum + (Number.parseFloat(order.amount?.toString() || "0") || 0),
        0,
      ),
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

      return order.items.some((item: any) => {
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
            <p className="text-lg font-semibold">
              €{(Number.parseFloat(order.amount?.toString() || "0") || 0).toFixed(2)}
            </p>
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

    return (
      <Card key={order.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{order.id}</Badge>
                <span className="font-medium">{order.customer}</span>
              </div>
              <p className="text-sm text-gray-600">
                Παράδοση: {new Date(order.deliveryDate).toLocaleDateString("el-GR")}
              </p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-700">Προϊόντα {selectedCategory}:</p>
                {categoryItems.map((item: any, index: number) => (
                  <div key={index} className="text-sm text-gray-700 ml-2">
                    • {item.productName} ({item.quantity} {item.unit})
                    {item.instructions && <span className="text-orange-600 font-medium"> - {item.instructions}</span>}
                  </div>
                ))}
              </div>
              {order.comments && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Σημειώσεις:</span> {order.comments}
                </p>
              )}
            </div>
            <div className="text-right ml-4">
              <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                <Eye className="h-4 w-4 mr-1" />
                Προβολή Παραγγελίας
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Αν εμφανίζουμε αποτελέσματα κατηγορίας
  if (showCategoryResults) {
    const categoryOrders = getOrdersByCategory(selectedCategory)

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Παραγγελίες - Κατηγορία: {selectedCategory}
                </CardTitle>
                <div className="space-y-2">
                  <CardDescription>
                    Προβολή παραγγελιών που περιέχουν προϊόντα της κατηγορίας "{selectedCategory}"
                  </CardDescription>
                  <Badge variant="default">Ενεργή Περίοδος: {getActivePeriodName()}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCategoryResults(false)}>
                  Επιστροφή στη Λίστα
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const categoryOrders = getOrdersByCategory(selectedCategory)
                    const printWindow = window.open("", "_blank")
                    if (!printWindow) return

                    printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>Παραγγελίες - ${selectedCategory}</title>
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
                          <h2>Παραγγελίες - Κατηγορία: ${selectedCategory}</h2>
                          <p>Ημερομηνία εκτύπωσης: ${new Date().toLocaleDateString("el-GR")}</p>
                          <p>Περίοδος: ${getActivePeriodName()}</p>
                        </div>
                        <div class="content">
                          <table>
                            <thead>
                              <tr>
                                <th>Κωδικός</th>
                                <th>Πελάτης</th>
                                <th>Ημ. Παράδοσης</th>
                                <th>Προϊόντα ${selectedCategory}</th>
                                <th>Σημειώσεις</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${categoryOrders
                                .map((order) => {
                                  const categoryItems =
                                    order.items?.filter((item) => {
                                      const savedProducts = localStorage.getItem("products")
                                      if (savedProducts) {
                                        try {
                                          const products = JSON.parse(savedProducts)
                                          const product = products.find((p) => p.name === item.productName)
                                          if (product && product.categoryName === selectedCategory) {
                                            return true
                                          }
                                        } catch (error) {
                                          console.error("Error parsing products from localStorage:", error)
                                        }
                                      }
                                      const guessedCategory = guessProductCategory(item.productName)
                                      return guessedCategory === selectedCategory
                                    }) || []

                                  return `
                                  <tr>
                                    <td>${order.id}</td>
                                    <td>${order.customer}</td>
                                    <td>${new Date(order.deliveryDate).toLocaleDateString("el-GR")}</td>
                                    <td>
                                      ${categoryItems
                                        .map(
                                          (item) =>
                                            `${item.productName} (${item.quantity} ${item.unit})${item.instructions ? ` - ${item.instructions}` : ""}`,
                                        )
                                        .join("<br>")}
                                    </td>
                                    <td>${order.comments || "-"}</td>
                                  </tr>
                                  `
                                })
                                .join("")}
                            </tbody>
                          </table>
                          <div class="total">
                            <p>Σύνολο Παραγγελιών: ${categoryOrders.length}</p>
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
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Εκτύπωση
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryOrders.length > 0 ? (
                categoryOrders.map(renderCategoryOrderCard)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Δεν βρέθηκαν παραγγελίες με προϊόντα της κατηγορίας "{selectedCategory}"
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog Προβολής Παραγγελίας */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
                    <Badge
                      variant={getStatusColor(viewingOrder.status) as any}
                      className="flex items-center gap-1 w-fit"
                    >
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
      </div>
    )
  }

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
              <div className="space-y-2">
                <CardDescription>Προβολή και διαχείρηση παραγγελιών εορταστικής περιόδου</CardDescription>
                <Badge variant="default">Ενεργή Περίοδος: {getActivePeriodName()}</Badge>
              </div>
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="list">Όλες</TabsTrigger>
              <TabsTrigger value="pending">Εκκρεμείς</TabsTrigger>
              <TabsTrigger value="ready">Μέσα</TabsTrigger>
              <TabsTrigger value="ready-pending">Μέσα/Εκκρεμότητες</TabsTrigger>
              <TabsTrigger value="add">Νέα Παραγγελία</TabsTrigger>
            </TabsList>

            {/* Φίλτρα και Αναζήτηση */}
            {activeTab !== "add" && (
              <div className="mt-4 space-y-4">
                {/* Μία γραμμή με όλα τα φίλτρα */}
                <div className="grid grid-cols-7 gap-4">
                  {/* Γενική αναζήτηση - διπλάσιο μέγεθος */}
                  <div className="col-span-2 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Αναζήτηση με κωδικό παραγγελίας, ονοματεπώνυμο ή τηλέφωνο..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Date picker για ημερομηνία */}
                  <div className="col-span-2 relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateSearchTerm && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateSearchTerm ? (
                            format(new Date(dateSearchTerm), "dd/MM/yyyy", { locale: el })
                          ) : (
                            <span>Επιλογή ημερομηνίας παράδοσης...</span>
                          )}
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
                          initialFocus
                        />
                        {dateSearchTerm && (
                          <div className="p-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDateSearchTerm("")}
                              className="w-full"
                            >
                              Καθαρισμός
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Πτυσσόμενο μενού κατηγοριών */}
                  <div className="col-span-2">
                    <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Φιλτράρισμα κατά Κατηγορία
                          </div>
                          {isFilterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                        <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                          {categories.map((category) => (
                            <Button
                              key={category.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCategoryFilter(category.name)}
                              className="w-full justify-start"
                            >
                              {category.name}
                            </Button>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Κουμπί καθαρισμού όλων των φίλτρων */}
                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setDateSearchTerm("")
                        setIsFilterOpen(false)
                      }}
                      className="w-full"
                      title="Καθαρισμός όλων των φίλτρων"
                    >
                      Καθαρισμός Φίλτρων
                    </Button>
                  </div>
                </div>

                {/* Στατιστικά Αναζήτησης */}
                {(searchTerm || dateSearchTerm) && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Βρέθηκαν {getFilteredOrdersByTab(activeTab).length} παραγγελίες από σύνολο {orders.length}
                    </p>
                  </div>
                )}
              </div>
            )}

            <TabsContent value="list" className="space-y-4">
              <div className="grid gap-4">
                {getFilteredOrdersByTab("list").map(renderOrderCard)}
                {getFilteredOrdersByTab("list").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm || dateSearchTerm
                      ? "Δεν βρέθηκαν παραγγελίες με τα κριτήρια αναζήτησης"
                      : "Δεν υπάρχουν παραγγελίες"}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <div className="grid gap-4">
                {getFilteredOrdersByTab("pending").map(renderOrderCard)}
                {getFilteredOrdersByTab("pending").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm || dateSearchTerm
                      ? "Δεν βρέθηκαν εκκρεμείς παραγγελίες με τα κριτήρια αναζήτησης"
                      : "Δεν υπάρχουν εκκρεμείς παραγγελίες"}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ready" className="space-y-4">
              <div className="grid gap-4">
                {getFilteredOrdersByTab("ready").map(renderOrderCard)}
                {getFilteredOrdersByTab("ready").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm || dateSearchTerm
                      ? "Δεν βρέθηκαν έτοιμες παραγγελίες με τα κριτήρια αναζήτησης"
                      : "Δεν υπάρχουν έτοιμες παραγγελίες"}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ready-pending" className="space-y-4">
              <div className="grid gap-4">
                {getFilteredOrdersByTab("ready-pending").map(renderOrderCard)}
                {getFilteredOrdersByTab("ready-pending").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm || dateSearchTerm
                      ? "Δεν βρέθηκαν παραγγελίες με μικτή κατάσταση με τα κριτήρια αναζήτησης"
                      : "Δεν υπάρχουν παραγγελίες με μικτή κατάσταση"}
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
export default OrderManagement
