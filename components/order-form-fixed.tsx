"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Plus, Trash2, ShoppingCart } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
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

export function OrderForm({ onSave, onCancel, editingOrder, isEditing = false }: OrderFormProps) {
  const { getActivePeriodName } = usePeriod()

  // States
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])

  // Form states
  const [orderCode, setOrderCode] = useState(editingOrder?.id || "")
  const [selectedCustomerId, setSelectedCustomerId] = useState(editingOrder?.customerId || "")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(editingOrder?.employeeId || "")
  const [orderDate] = useState<Date>(new Date())
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderComments, setOrderComments] = useState("")
  const [orderDiscount, setOrderDiscount] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Product form states
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [itemDiscount, setItemDiscount] = useState("0")
  const [itemInstructions, setItemInstructions] = useState("")

  // Status states
  const [statusReady, setStatusReady] = useState(false)
  const [statusPending, setStatusPending] = useState(false)
  const [statusDelivered, setStatusDelivered] = useState(false)
  const [pendingIssues, setPendingIssues] = useState("")

  // Load data on mount
  useEffect(() => {
    // Load customers
    const savedCustomers = localStorage.getItem("customers")
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers))
    } else {
      const defaultCustomers = [
        {
          id: "1",
          code: "CUST_001",
          firstName: "Μαρία",
          lastName: "Παπαδοπούλου",
          address: "Λεωφ. Κηφισίας 123",
          mobile: "6971234567",
        },
        {
          id: "2",
          code: "CUST_002",
          firstName: "Γιάννης",
          lastName: "Κωνσταντίνου",
          address: "Οδός Ερμού 45",
          mobile: "6987654321",
        },
        {
          id: "3",
          code: "CUST_003",
          firstName: "Ελένη",
          lastName: "Δημητρίου",
          address: "Πατησίων 234",
          mobile: "6912345678",
        },
      ]
      setCustomers(defaultCustomers)
      localStorage.setItem("customers", JSON.stringify(defaultCustomers))
    }

    // Load employees
    const savedEmployees = localStorage.getItem("employees")
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees))
    } else {
      const defaultEmployees = [
        { id: "1", firstName: "Γιάννης", lastName: "Κωνσταντίνου" },
        { id: "2", firstName: "Μαρία", lastName: "Δημητρίου" },
        { id: "3", firstName: "Νίκος", lastName: "Παπαδόπουλος" },
      ]
      setEmployees(defaultEmployees)
      localStorage.setItem("employees", JSON.stringify(defaultEmployees))
    }

    // Load products
    const savedProducts = localStorage.getItem("products")
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      const defaultProducts = [
        { id: "1", name: "Αρνί Ψητό", price: 18.5, unitName: "Κιλά" },
        { id: "2", name: "Κοκορέτσι", price: 12.0, unitName: "Κιλά" },
        { id: "3", name: "Κοντοσούβλι Χοιρινό", price: 14.8, unitName: "Κιλά" },
        { id: "4", name: "Μπριζόλες Αρνίσιες", price: 16.2, unitName: "Κιλά" },
      ]
      setProducts(defaultProducts)
      localStorage.setItem("products", JSON.stringify(defaultProducts))
    }
  }, [])

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId)
    const product = products.find((p) => p.id === productId)
    if (product) {
      setUnitPrice(product.price.toString())
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setDeliveryDate(date)
    setCalendarOpen(false) // Κλείνει το popover μετά την επιλογή
  }

  const calculateItemTotal = () => {
    if (!quantity || !unitPrice) return 0
    const qty = Number.parseFloat(quantity)
    const price = Number.parseFloat(unitPrice)
    const discount = Number.parseFloat(itemDiscount) || 0
    const subtotal = qty * price
    return subtotal - (subtotal * discount) / 100
  }

  const handleAddItem = () => {
    if (!selectedProductId || !quantity || !unitPrice) return

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const newItem: OrderItem = {
      id: Date.now().toString(),
      productName: product.name,
      quantity: Number.parseFloat(quantity),
      unit: product.unitName || "Κιλά",
      unitPrice: Number.parseFloat(unitPrice),
      discount: Number.parseFloat(itemDiscount) || 0,
      total: calculateItemTotal(),
      instructions: itemInstructions,
    }

    setOrderItems([...orderItems, newItem])

    // Clear form
    setSelectedProductId("")
    setQuantity("")
    setUnitPrice("")
    setItemDiscount("0")
    setItemInstructions("")
  }

  const handleRemoveItem = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateFinalTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = Number.parseFloat(orderDiscount.toString()) || 0
    return subtotal - (subtotal * discount) / 100
  }

  const getOrderStatus = () => {
    if (statusDelivered) return "Παραδόθηκε"
    if (statusPending && statusReady) return "Μέσα/Εκκρεμότητες"
    if (statusPending) return "Εκκρεμότητες"
    if (statusReady) return "Μέσα"
    return "Νέα"
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!orderCode.trim()) {
      newErrors.orderCode = "Ο κωδικός παραγγελίας είναι υποχρεωτικός"
    }
    if (!selectedCustomerId) {
      newErrors.customer = "Η επιλογή πελάτη είναι υποχρεωτική"
    }
    if (!selectedEmployeeId) {
      newErrors.employee = "Η επιλογή υπαλλήλου είναι υποχρεωτική"
    }
    if (!deliveryDate) {
      newErrors.deliveryDate = "Η ημερομηνία παράδοσης είναι υποχρεωτική"
    }
    if (orderItems.length === 0) {
      newErrors.items = "Προσθέστε τουλάχιστον ένα προϊόν"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const orderData = {
      id: orderCode,
      customer: `${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`,
      customerAddress: selectedCustomer?.address || "",
      customerPhone: selectedCustomer?.mobile || "",
      customerId: selectedCustomerId,
      employeeId: selectedEmployeeId,
      amount: calculateFinalTotal(),
      status: getOrderStatus(),
      deliveryDate: deliveryDate ? format(deliveryDate, "yyyy-MM-dd") : "",
      orderDate: orderDate.toISOString().split("T")[0],
      employee: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : "",
      period: getActivePeriodName(),
      items: orderItems,
      comments: orderComments,
      orderDiscount: orderDiscount,
      pendingIssues: statusPending ? pendingIssues : "",
      subtotal: calculateSubtotal(),
      total: calculateFinalTotal(),
    }

    // Save to localStorage
    try {
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      const newOrders = [orderData, ...existingOrders]
      localStorage.setItem("orders", JSON.stringify(newOrders))
      onSave(orderData)
    } catch (error) {
      console.error("Error saving order:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Νέα Παραγγελία
        </CardTitle>
        <CardDescription>Δημιουργήστε μια νέα παραγγελία</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Κωδικός Παραγγελίας */}
        <div>
          <Label htmlFor="order-code">Κωδικός Παραγγελίας *</Label>
          <Input
            id="order-code"
            placeholder="π.χ. ORD-001"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            className={errors.orderCode ? "border-red-500" : ""}
          />
          {errors.orderCode && <p className="text-red-500 text-sm mt-1">{errors.orderCode}</p>}
        </div>

        {/* Επιλογή Πελάτη και Υπαλλήλου */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Επιλογή Πελάτη *</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className={errors.customer ? "border-red-500" : ""}>
                <SelectValue placeholder="Επιλέξτε πελάτη" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customer && <p className="text-red-500 text-sm">{errors.customer}</p>}
          </div>

          <div>
            <Label>Υπάλληλος *</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className={errors.employee ? "border-red-500" : ""}>
                <SelectValue placeholder="Επιλέξτε υπάλληλο" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee && <p className="text-red-500 text-sm">{errors.employee}</p>}
          </div>
        </div>

        {/* Ημερομηνίες */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Ημερομηνία Παραλαβής</Label>
            <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
              <span className="text-sm">{format(orderDate, "dd/MM/yyyy")}</span>
            </div>
          </div>

          <div>
            <Label>Ημερομηνία Παράδοσης *</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !deliveryDate && "text-muted-foreground"
                  } ${errors.deliveryDate ? "border-red-500" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deliveryDate ? format(deliveryDate, "dd/MM/yyyy") : "Επιλέξτε ημερομηνία"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deliveryDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.deliveryDate && <p className="text-red-500 text-sm">{errors.deliveryDate}</p>}
          </div>
        </div>

        {/* Προσθήκη Προϊόντων */}
        <div className="space-y-4">
          <Label>Προσθήκη Προϊόντων</Label>
          <div className="p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <Label>Προϊόν</Label>
                <Select value={selectedProductId} onValueChange={handleProductChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε προϊόν" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - €{product.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ποσότητα</Label>
                <Input type="number" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>

              <div>
                <Label>Τιμή (€)</Label>
                <Input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
              </div>

              <div>
                <Label>Έκπτωση (%)</Label>
                <Input type="number" value={itemDiscount} onChange={(e) => setItemDiscount(e.target.value)} />
              </div>

              <div className="flex items-end">
                <Button onClick={handleAddItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Προσθήκη
                </Button>
              </div>
            </div>

            <div>
              <Label>Οδηγίες</Label>
              <Input
                placeholder="Ειδικές οδηγίες..."
                value={itemInstructions}
                onChange={(e) => setItemInstructions(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Λίστα Προϊόντων */}
        {orderItems.length > 0 && (
          <div>
            <Label>Προϊόντα Παραγγελίας</Label>
            <div className="border rounded-lg mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Προϊόν</TableHead>
                    <TableHead>Ποσότητα</TableHead>
                    <TableHead>Τιμή</TableHead>
                    <TableHead>Σύνολο</TableHead>
                    <TableHead>Ενέργειες</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>€{item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>€{item.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}
          </div>
        )}

        {/* Σύνολο */}
        {orderItems.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Συνολικό Κόστος:</span>
              <span>€{calculateFinalTotal().toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Κατάσταση */}
        <div className="space-y-4">
          <Label>Κατάσταση Παραγγελίας</Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="ready" checked={statusReady} onCheckedChange={setStatusReady} />
              <Label htmlFor="ready">ΜΕΣΑ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="pending" checked={statusPending} onCheckedChange={setStatusPending} />
              <Label htmlFor="pending">ΕΚΚΡΕΜΟΤΗΤΕΣ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="delivered" checked={statusDelivered} onCheckedChange={setStatusDelivered} />
              <Label htmlFor="delivered">ΠΑΡΑΔΟΘΗΚΕ</Label>
            </div>
          </div>
        </div>

        {/* Σχόλια */}
        <div>
          <Label>Σχόλια</Label>
          <Textarea
            placeholder="Σχόλια παραγγελίας..."
            value={orderComments}
            onChange={(e) => setOrderComments(e.target.value)}
          />
        </div>

        {/* Κουμπιά */}
        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700">
            Αποθήκευση Παραγγελίας
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Ακύρωση
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
