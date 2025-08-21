"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Plus, Trash2, ShoppingCart } from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"
import { el } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { usePeriod } from "@/contexts/period-context"

interface Customer {
  id: string
  code: string
  firstName: string
  lastName: string
  address: string
  postalCode: string
  phone: string
  mobile: string
  email: string
  comments: string
}

interface Employee {
  id: string
  name: string
  role: string
}

interface Product {
  id: string
  name: string
  categoryName: string
  unit: string
  price: number
  image?: string
}

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

  // Load data from localStorage
  const [customers, setCustomers] = useState<Customer[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [orderDate, setOrderDate] = useState<Date>(new Date())
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined)
  const [status, setStatus] = useState("Μέσα")
  const [comments, setComments] = useState("")
  const [pendingIssues, setPendingIssues] = useState("")
  const [orderDiscount, setOrderDiscount] = useState(0)

  // Order items
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [itemDiscount, setItemDiscount] = useState(0)
  const [instructions, setInstructions] = useState("")

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedCustomers = localStorage.getItem("customers")
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers))
      }

      const savedEmployees = localStorage.getItem("employees")
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees))
      } else {
        // Default employees
        const defaultEmployees = [
          { id: "1", name: "Κώστας Μπέλλας", role: "Ιδιοκτήτης" },
          { id: "2", name: "Άννα Παπαδάκη", role: "Πωλήτρια" },
          { id: "3", name: "Δημήτρης Καρακώστας", role: "Βοηθός" },
        ]
        setEmployees(defaultEmployees)
        localStorage.setItem("employees", JSON.stringify(defaultEmployees))
      }

      const savedProducts = localStorage.getItem("products")
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts))
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  // Load editing order data
  useEffect(() => {
    if (editingOrder && isEditing) {
      console.log("Loading editing order:", editingOrder)
      setSelectedCustomerId(editingOrder.customerId || "")
      setSelectedEmployeeId(editingOrder.employeeId || "")
      setOrderDate(editingOrder.orderDate ? new Date(editingOrder.orderDate) : new Date())
      setDeliveryDate(editingOrder.deliveryDate ? new Date(editingOrder.deliveryDate) : undefined)
      setStatus(editingOrder.status || "Μέσα")
      setComments(editingOrder.comments || "")
      setPendingIssues(editingOrder.pendingIssues || "")
      setOrderDiscount(editingOrder.orderDiscount || 0)
      setOrderItems(editingOrder.items || [])
    }
  }, [editingOrder, isEditing])

  const generateOrderId = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const day = now.getDate().toString().padStart(2, "0")
    const time = now.getTime().toString().slice(-6)
    return `ORD${year}${month}${day}${time}`
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedCustomerId) {
      newErrors.customer = "Επιλέξτε πελάτη"
    }
    if (!selectedEmployeeId) {
      newErrors.employee = "Επιλέξτε υπάλληλο"
    }
    if (!deliveryDate) {
      newErrors.deliveryDate = "Επιλέξτε ημερομηνία παράδοσης"
    } else if (isBefore(startOfDay(deliveryDate), startOfDay(orderDate))) {
      newErrors.deliveryDate = "Η ημερομηνία παράδοσης δεν μπορεί να είναι πριν από την ημερομηνία καταχώρησης"
    }
    if (orderItems.length === 0) {
      newErrors.items = "Προσθέστε τουλάχιστον ένα προϊόν"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addOrderItem = () => {
    if (!selectedProductId || quantity <= 0) return

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const unitPrice = product.price
    const discountAmount = (unitPrice * itemDiscount) / 100
    const finalPrice = unitPrice - discountAmount
    const total = finalPrice * quantity

    const newItem: OrderItem = {
      id: Date.now().toString(),
      productName: product.name,
      quantity,
      unit: product.unit,
      unitPrice,
      discount: itemDiscount,
      total,
      instructions,
    }

    setOrderItems([...orderItems, newItem])

    // Reset form
    setSelectedProductId("")
    setQuantity(1)
    setItemDiscount(0)
    setInstructions("")
  }

  const removeOrderItem = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = (subtotal * orderDiscount) / 100
    return subtotal - discountAmount
  }

  const handleSubmit = () => {
    console.log("Form submission started")

    if (!validateForm()) {
      console.log("Validation failed:", errors)
      return
    }

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)
    const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)

    if (!selectedCustomer || !selectedEmployee || !deliveryDate) {
      console.log("Missing required data")
      return
    }

    const subtotal = calculateSubtotal()
    const total = calculateTotal()

    const orderData = {
      id: editingOrder?.id || generateOrderId(),
      customerId: selectedCustomerId,
      customer: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      customerAddress: `${selectedCustomer.address}, ${selectedCustomer.postalCode}`,
      customerPhone: selectedCustomer.mobile || selectedCustomer.phone,
      employeeId: selectedEmployeeId,
      employee: selectedEmployee.name,
      orderDate: orderDate.toISOString().split("T")[0],
      deliveryDate: deliveryDate.toISOString().split("T")[0],
      status,
      items: orderItems,
      subtotal,
      orderDiscount,
      total,
      amount: total, // For compatibility
      comments,
      pendingIssues,
      period: getActivePeriodName(),
    }

    console.log("Saving order data:", orderData)
    onSave(orderData)
  }

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)
  const selectedProduct = products.find((p) => p.id === selectedProductId)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {isEditing ? "Επεξεργασία Παραγγελίας" : "Νέα Παραγγελία"}
          </CardTitle>
          <CardDescription>
            Συμπληρώστε τα στοιχεία της παραγγελίας για την περίοδο: {getActivePeriodName()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Στοιχεία Παραγγελίας */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Πελάτης *</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className={errors.customer ? "border-red-500" : ""}>
                  <SelectValue placeholder="Επιλέξτε πελάτη" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} ({customer.mobile})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customer && <p className="text-red-500 text-sm mt-1">{errors.customer}</p>}
            </div>

            <div>
              <Label htmlFor="employee">Υπάλληλος *</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className={errors.employee ? "border-red-500" : ""}>
                  <SelectValue placeholder="Επιλέξτε υπάλληλο" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employee && <p className="text-red-500 text-sm mt-1">{errors.employee}</p>}
            </div>

            <div>
              <Label>Ημερομηνία Καταχώρησης</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !orderDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {orderDate ? format(orderDate, "PPP", { locale: el }) : "Επιλέξτε ημερομηνία"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={orderDate}
                    onSelect={(date) => {
                      if (date) {
                        setOrderDate(date)
                      }
                    }}
                    showOutsideDays={true}
                    className="rounded-md border"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Ημερομηνία Παράδοσης *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDate && "text-muted-foreground",
                      errors.deliveryDate && "border-red-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(deliveryDate, "PPP", { locale: el }) : "Επιλέξτε ημερομηνία παράδοσης"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={(date) => {
                      setDeliveryDate(date)
                    }}
                    disabled={(date) => isBefore(startOfDay(date), startOfDay(orderDate))}
                    showOutsideDays={true}
                    className="rounded-md border"
                    initialFocus
                  />
                  {deliveryDate && (
                    <div className="p-3 border-t">
                      <Button variant="outline" size="sm" onClick={() => setDeliveryDate(undefined)} className="w-full">
                        Καθαρισμός
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              {errors.deliveryDate && <p className="text-red-500 text-sm mt-1">{errors.deliveryDate}</p>}
            </div>

            <div>
              <Label htmlFor="status">Κατάσταση</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Μέσα">Μέσα</SelectItem>
                  <SelectItem value="Εκκρεμότητες">Εκκρεμότητες</SelectItem>
                  <SelectItem value="Μέσα/Εκκρεμότητες">Μέσα/Εκκρεμότητες</SelectItem>
                  <SelectItem value="Παραδόθηκε">Παραδόθηκε</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Στοιχεία Πελάτη */}
          {selectedCustomer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Στοιχεία Πελάτη</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Όνομα:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </div>
                  <div>
                    <strong>Τηλέφωνο:</strong> {selectedCustomer.mobile || selectedCustomer.phone}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Διεύθυνση:</strong> {selectedCustomer.address}, {selectedCustomer.postalCode}
                  </div>
                  {selectedCustomer.email && (
                    <div>
                      <strong>Email:</strong> {selectedCustomer.email}
                    </div>
                  )}
                  {selectedCustomer.comments && (
                    <div className="md:col-span-2">
                      <strong>Σχόλια:</strong> {selectedCustomer.comments}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Προσθήκη Προϊόντων */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Προσθήκη Προϊόντων</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Προϊόν</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Επιλέξτε προϊόν" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (€{product.price.toFixed(2)}/{product.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Ποσότητα</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label>Έκπτωση (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={itemDiscount}
                    onChange={(e) => setItemDiscount(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label>Οδηγίες</Label>
                  <Input
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="π.χ. κομμένο σε φέτες"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={addOrderItem} disabled={!selectedProductId || quantity <= 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Προσθήκη
                  </Button>
                </div>
              </div>

              {selectedProduct && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm">
                    <strong>Επιλεγμένο:</strong> {selectedProduct.name} - €{selectedProduct.price.toFixed(2)}/
                    {selectedProduct.unit}
                    {quantity > 0 && (
                      <>
                        <br />
                        <strong>Σύνολο:</strong> €
                        {(selectedProduct.price * (1 - itemDiscount / 100) * quantity).toFixed(2)}
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Λίστα Προϊόντων */}
          {orderItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Προϊόντα Παραγγελίας</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Προϊόν</TableHead>
                        <TableHead>Ποσότητα</TableHead>
                        <TableHead>Τιμή Μονάδας</TableHead>
                        <TableHead>Έκπτωση</TableHead>
                        <TableHead>Σύνολο</TableHead>
                        <TableHead>Οδηγίες</TableHead>
                        <TableHead>Ενέργειες</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell>€{item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>{item.discount}%</TableCell>
                          <TableCell>€{item.total.toFixed(2)}</TableCell>
                          <TableCell>{item.instructions || "-"}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeOrderItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}
              </CardContent>
            </Card>
          )}

          {/* Σύνολα */}
          {orderItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Σύνολα Παραγγελίας</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Έκπτωση Παραγγελίας (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={orderDiscount}
                      onChange={(e) => setOrderDiscount(Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Υποσύνολο:</span>
                    <span>€{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  {orderDiscount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Έκπτωση ({orderDiscount}%):</span>
                      <span>-€{((calculateSubtotal() * orderDiscount) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Συνολικό Κόστος:</span>
                    <span>€{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Σχόλια */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="comments">Σχόλια Παραγγελίας</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Σχόλια για την παραγγελία..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="pendingIssues">Εκκρεμότητες</Label>
              <Textarea
                id="pendingIssues"
                value={pendingIssues}
                onChange={(e) => setPendingIssues(e.target.value)}
                placeholder="Εκκρεμότητες ή ειδικές οδηγίες..."
                rows={3}
              />
            </div>
          </div>

          {/* Κουμπιά */}
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {isEditing ? "Ενημέρωση Παραγγελίας" : "Αποθήκευση Παραγγελίας"}
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Ακύρωση
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
