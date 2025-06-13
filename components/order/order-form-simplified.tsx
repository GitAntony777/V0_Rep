"use client"

import { useState, useEffect } from "react"
import { usePeriod } from "@/contexts/period-context"

interface OrderItem {
  id: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  discount: number
  total: number
  instructions: string
}

interface OrderFormProps {
  onSave: (orderData: any) => void
  onCancel: () => void
  editingOrder?: any
  isEditing?: boolean
}

export function OrderFormSimplified({ onSave, onCancel, editingOrder, isEditing = false }: OrderFormProps) {
  const { getActivePeriodName } = usePeriod()

  // Dynamic data states - φορτώνουμε από localStorage
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      // Load customers
      const savedCustomers = localStorage.getItem("customers")
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers))
      } else {
        setCustomers([])
      }

      // Load employees
      const savedEmployees = localStorage.getItem("employees")
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees))
      } else {
        setEmployees([])
      }

      // Load products
      const savedProducts = localStorage.getItem("products")
      if (savedProducts) {
        try {
          const allProducts = JSON.parse(savedProducts)
          setProducts(allProducts)
        } catch (error) {
          console.error("Σφάλμα κατά την ανάλυση των προϊόντων:", error)
          setProducts([])
        }
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      // Σε περίπτωση σφάλματος, αρχικοποιούμε με κενούς πίνακες
      setCustomers([])
      setProducts([])
      setEmployees([])
    }
  }, [])

  // Initialize form data
  const [orderCode, setOrderCode] = useState(editingOrder?.id || "")
  const [selectedCustomerId, setSelectedCustomerId] = useState(editingOrder?.customerId || "")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(editingOrder?.employeeId || "")
  const [orderDate] = useState<Date>(editingOrder?.orderDate ? new Date(editingOrder.orderDate) : new Date())
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    editingOrder?.deliveryDate ? new Date(editingOrder.deliveryDate) : undefined,
  )
  const [orderItems, setOrderItems] = useState<OrderItem[]>(editingOrder?.items || [])
  const [orderComments, setOrderComments] = useState(editingOrder?.comments || "")
  const [orderDiscount, setOrderDiscount] = useState(editingOrder?.orderDiscount || 0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // State για επεξεργασία προϊόντος παραγγελίας
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  // Status checkboxes
  const [statusReady, setStatusReady] = useState(
    editingOrder?.status === "Μέσα" || editingOrder?.status === "Μέσα/Εκκρεμότητες" || false,
  )
  const [statusPending, setStatusPending] = useState(
    editingOrder?.status === "Εκκρεμότητες" || editingOrder?.status === "Μέσα/Εκκρεμότητες" || false,
  )
  const [statusDelivered, setStatusDelivered] = useState(editingOrder?.status === "Παραδόθηκε" || false)
  const [pendingIssues, setPendingIssues] = useState(editingOrder?.pendingIssues || "")

  // Τρέχουσα εορταστική περίοδος
  const currentPeriod = getActivePeriodName()

  // Form states για νέο προϊόν
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [itemDiscount, setItemDiscount] = useState("0")
  const [itemInstructions, setItemInstructions] = useState("")

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)
  const selectedProduct =\
