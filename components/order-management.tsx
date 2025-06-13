"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { ShoppingCart, Clock, CheckCircle, AlertTriangle, MapPin, Eye, Edit, Trash2 } from "lucide-react"
import { usePeriod } from "../contexts/period-context"

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
