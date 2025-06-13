"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { usePeriod } from "@/contexts/period-context"

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
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333;
