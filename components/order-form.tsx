"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Minus, X } from "lucide-react"
import { format, isBefore, startOfDay } from "date-fns"
import { el } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  category: string
  unit: string
  price: number
  image?: string
}

interface Customer {
  id: string
  name: string
  phone: string
  address: string
  email?: string
}

interface Employee {
  id: string
  name: string
  role: string
}

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unit: string
  price: number
  total: number
}

interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  employeeId: string
  employeeName: string
  orderDate: Date
  deliveryDate: Date
  items: OrderItem[]
  subtotal: number
  discount: number
  total: number
  notes?: string
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
}

interface OrderFormProps {
  onSave: (order: Omit<Order, "id" | "orderNumber">) => void
  onCancel: () => void
  editOrder?: Order
  customers: Customer[]
  employees: Employee[]
  products: Product[]
}

export function OrderForm({ onSave, onCancel, editOrder, customers, employees, products }: OrderFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [orderDate, setOrderDate] = useState<Date>(new Date())
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date())
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [discount, setDiscount] = useState<number>(0)
  const [notes, setNotes] = useState<string>("")
  const [status, setStatus] = useState<Order["status"]>("pending")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [orderDateOpen, setOrderDateOpen] = useState(false)
  const [deliveryDateOpen, setDeliveryDateOpen] = useState(false)

  // Φόρτωση δεδομένων για επεξεργασία
  useEffect(() => {
    if (editOrder) {
      setSelectedCustomer(editOrder.customerId)
      setSelectedEmployee(editOrder.employeeId)
      setOrderDate(editOrder.orderDate)
      setDeliveryDate(editOrder.deliveryDate)
      setOrderItems(editOrder.items)
      setDiscount(editOrder.discount)
      setNotes(editOrder.notes || "")
      setStatus(editOrder.status)
    }
  }, [editOrder])

  const addOrderItem = () => {
    if (!selectedProduct) {
      setErrors({ ...errors, product: "Επιλέξτε προϊόν" })
      return
    }

    if (quantity <= 0) {
      setErrors({ ...errors, quantity: "Η ποσότητα πρέπει να είναι μεγαλύτερη από 0" })
      return
    }

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    // Έλεγχος αν το προϊόν υπάρχει ήδη
    const existingItemIndex = orderItems.findIndex((item) => item.productId === selectedProduct)

    if (existingItemIndex >= 0) {
      // Ενημέρωση υπάρχοντος προϊόντος
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += quantity
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * product.price
      setOrderItems(updatedItems)
    } else {
      // Προσθήκη νέου προϊόντος
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        unit: product.unit,
        price: product.price,
        total: quantity * product.price,
      }
      setOrderItems([...orderItems, newItem])
    }

    // Reset form
    setSelectedProduct("")
    setQuantity(1)
    setErrors({ ...errors, product: "", quantity: "" })
  }

  const removeOrderItem = (index: number) => {
    const updatedItems = orderItems.filter((_, i) => i !== index)
    setOrderItems(updatedItems)
  }

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeOrderItem(index)
      return
    }

    const updatedItems = [...orderItems]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].total = newQuantity * updatedItems[index].price
    setOrderItems(updatedItems)
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
  const total = subtotal - discount

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedCustomer) newErrors.customer = "Επιλέξτε πελάτη"
    if (!selectedEmployee) newErrors.employee = "Επιλέξτε υπάλληλο"
    if (!orderDate) newErrors.orderDate = "Επιλέξτε ημερομηνία καταχώρησης"
    if (!deliveryDate) newErrors.deliveryDate = "Επιλέξτε ημερομηνία παράδοσης"
    if (deliveryDate && orderDate && isBefore(startOfDay(deliveryDate), startOfDay(orderDate))) {
      newErrors.deliveryDate = "Η ημερομηνία παράδοσης δεν μπορεί να είναι πριν από την ημερομηνία καταχώρησης"
    }
    if (orderItems.length === 0) newErrors.items = "Προσθέστε τουλάχιστον ένα προϊόν"
    if (discount < 0) newErrors.discount = "Η έκπτωση δεν μπορεί να είναι αρνητική"
    if (discount > subtotal) newErrors.discount = "Η έκπτωση δεν μπορεί να είναι μεγαλύτερη από το υποσύνολο"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    console.log("🔄 Έναρξη υποβολής φόρμας...")

    if (!validateForm()) {
      console.log("❌ Validation failed:", errors)
      return
    }

    const customer = customers.find((c) => c.id === selectedCustomer)
    const employee = employees.find((e) => e.id === selectedEmployee)

    if (!customer || !employee) {
      console.log("❌ Customer ή Employee δεν βρέθηκε")
      return
    }

    const orderData: Omit<Order, "id" | "orderNumber"> = {
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      employeeId: employee.id,
      employeeName: employee.name,
      orderDate,
      deliveryDate,
      items: orderItems,
      subtotal,
      discount,
      total,
      notes,
      status,
    }

    console.log("✅ Δεδομένα παραγγελίας:", orderData)
    onSave(orderData)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{editOrder ? "Επεξεργασία Παραγγελίας" : "Νέα Παραγγελία"}</CardTitle>
        <CardDescription>
          {editOrder ? "Επεξεργαστείτε τα στοιχεία της παραγγελίας" : "Συμπληρώστε τα στοιχεία της νέας παραγγελίας"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Στοιχεία Πελάτη και Υπαλλήλου */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Πελάτης *</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className={errors.customer ? "border-red-500" : ""}>
                <SelectValue placeholder="Επιλέξτε πελάτη" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customer && <p className="text-sm text-red-500">{errors.customer}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee">Υπάλληλος *</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className={errors.employee ? "border-red-500" : ""}>
                <SelectValue placeholder="Επιλέξτε υπάλληλο" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} - {employee.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee && <p className="text-sm text-red-500">{errors.employee}</p>}
          </div>
        </div>

        {/* Ημερομηνίες */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ημερομηνία Καταχώρησης *</Label>
            <Popover open={orderDateOpen} onOpenChange={setOrderDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !orderDate && "text-muted-foreground",
                    errors.orderDate && "border-red-500",
                  )}
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
                      setOrderDateOpen(false)
                    }
                  }}
                  initialFocus
                  showOutsideDays={true}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
            {errors.orderDate && <p className="text-sm text-red-500">{errors.orderDate}</p>}
          </div>

          <div className="space-y-2">
            <Label>Ημερομηνία Παράδοσης *</Label>
            <Popover open={deliveryDateOpen} onOpenChange={setDeliveryDateOpen}>
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
                  {deliveryDate ? format(deliveryDate, "PPP", { locale: el }) : "Επιλέξτε ημερομηνία"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deliveryDate}
                  onSelect={(date) => {
                    if (date) {
                      setDeliveryDate(date)
                      setDeliveryDateOpen(false)
                    }
                  }}
                  disabled={(date) => (orderDate ? isBefore(startOfDay(date), startOfDay(orderDate)) : false)}
                  initialFocus
                  showOutsideDays={true}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
            {errors.deliveryDate && <p className="text-sm text-red-500">{errors.deliveryDate}</p>}
          </div>
        </div>

        {/* Κατάσταση Παραγγελίας */}
        {editOrder && (
          <div className="space-y-2">
            <Label htmlFor="status">Κατάσταση</Label>
            <Select value={status} onValueChange={(value: Order["status"]) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Εκκρεμής</SelectItem>
                <SelectItem value="confirmed">Επιβεβαιωμένη</SelectItem>
                <SelectItem value="preparing">Προετοιμασία</SelectItem>
                <SelectItem value="ready">Έτοιμη</SelectItem>
                <SelectItem value="delivered">Παραδόθηκε</SelectItem>
                <SelectItem value="cancelled">Ακυρώθηκε</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Προσθήκη Προϊόντων */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Προϊόντα</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="product">Προϊόν</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className={errors.product ? "border-red-500" : ""}>
                  <SelectValue placeholder="Επιλέξτε προϊόν" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - €{product.price.toFixed(2)}/{product.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.product && <p className="text-sm text-red-500">{errors.product}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Ποσότητα</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="0.1"
                step="0.1"
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
            </div>

            <div className="flex items-end">
              <Button onClick={addOrderItem} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Προσθήκη
              </Button>
            </div>
          </div>

          {errors.items && <p className="text-sm text-red-500">{errors.items}</p>}

          {/* Λίστα Προϊόντων */}
          {orderItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Προϊόντα Παραγγελίας</h4>
              <div className="space-y-2">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        €{item.price.toFixed(2)}/{item.unit}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateItemQuantity(index, item.quantity - 0.1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>

                      <span className="w-16 text-center">
                        {item.quantity} {item.unit}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateItemQuantity(index, item.quantity + 0.1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>

                      <span className="w-20 text-right font-medium">€{item.total.toFixed(2)}</span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeOrderItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Οικονομικά Στοιχεία */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Οικονομικά Στοιχεία</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Έκπτωση (€)</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                min="0"
                step="0.01"
                className={errors.discount ? "border-red-500" : ""}
              />
              {errors.discount && <p className="text-sm text-red-500">{errors.discount}</p>}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Υποσύνολο:</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Έκπτωση:</span>
              <span>-€{discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Σύνολο:</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Σημειώσεις */}
        <div className="space-y-2">
          <Label htmlFor="notes">Σημειώσεις</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Προσθέστε σημειώσεις για την παραγγελία..."
            rows={3}
          />
        </div>

        {/* Κουμπιά Ενεργειών */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Ακύρωση
          </Button>
          <Button onClick={handleSubmit}>{editOrder ? "Ενημέρωση" : "Αποθήκευση"} Παραγγελίας</Button>
        </div>
      </CardContent>
    </Card>
  )
}
