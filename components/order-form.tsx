"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  Phone,
  MapPin,
  CalendarIcon,
  Package,
  Euro,
  FileText,
  AlertTriangle,
  Save,
  X,
} from "lucide-react"
import { format } from "date-fns"
import { el } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface OrderFormProps {
  onSave: (orderData: any) => void
  onCancel: () => void
  editingOrder?: any
  isEditing?: boolean
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

export function OrderForm({ onSave, onCancel, editingOrder, isEditing = false }: OrderFormProps) {
  // Βασικά στοιχεία παραγγελίας
  const [customer, setCustomer] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [orderDate, setOrderDate] = useState<Date>(new Date())
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined)
  const [employee, setEmployee] = useState("")
  const [status, setStatus] = useState("Εκκρεμής")
  const [comments, setComments] = useState("")
  const [pendingIssues, setPendingIssues] = useState("")

  // Στοιχεία προϊόντων
  const [items, setItems] = useState<OrderItem[]>([])
  const [orderDiscount, setOrderDiscount] = useState(0)

  // Δεδομένα από localStorage
  const [customers, setCustomers] = useState([])
  const [employees, setEmployees] = useState([])
  const [products, setProducts] = useState([])

  // UI states
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isDeliveryCalendarOpen, setIsDeliveryCalendarOpen] = useState(false)

  // Φόρτωση δεδομένων από localStorage
  useEffect(() => {
    try {
      const savedCustomers = localStorage.getItem("customers")
      const savedEmployees = localStorage.getItem("employees")
      const savedProducts = localStorage.getItem("products")

      if (savedCustomers) setCustomers(JSON.parse(savedCustomers))
      if (savedEmployees) setEmployees(JSON.parse(savedEmployees))
      if (savedProducts) setProducts(JSON.parse(savedProducts))
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  // Φόρτωση δεδομένων για επεξεργασία
  useEffect(() => {
    if (isEditing && editingOrder) {
      setCustomer(editingOrder.customer || "")
      setCustomerPhone(editingOrder.customerPhone || "")
      setCustomerAddress(editingOrder.customerAddress || "")
      setOrderDate(editingOrder.orderDate ? new Date(editingOrder.orderDate) : new Date())
      setDeliveryDate(editingOrder.deliveryDate ? new Date(editingOrder.deliveryDate) : undefined)
      setEmployee(editingOrder.employee || "")
      setStatus(editingOrder.status || "Εκκρεμής")
      setComments(editingOrder.comments || "")
      setPendingIssues(editingOrder.pendingIssues || "")
      setItems(editingOrder.items || [])
      setOrderDiscount(editingOrder.orderDiscount || 0)
    }
  }, [isEditing, editingOrder])

  // Υπολογισμός συνόλων
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = (subtotal * orderDiscount) / 100
  const total = subtotal - discountAmount

  // Προσθήκη νέου προϊόντος
  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      productName: "",
      quantity: 1,
      unit: "kg",
      unitPrice: 0,
      discount: 0,
      total: 0,
      instructions: "",
    }
    setItems([...items, newItem])
  }

  // Ενημέρωση προϊόντος
  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          // Αυτόματος υπολογισμός συνόλου
          if (field === "quantity" || field === "unitPrice" || field === "discount") {
            const qty = field === "quantity" ? value : updatedItem.quantity
            const price = field === "unitPrice" ? value : updatedItem.unitPrice
            const disc = field === "discount" ? value : updatedItem.discount

            const itemTotal = qty * price
            const discountAmount = (itemTotal * disc) / 100
            updatedItem.total = itemTotal - discountAmount
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  // Διαγραφή προϊόντος
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  // Επιλογή προϊόντος από τη λίστα
  const selectProduct = (itemId: string, productName: string) => {
    const product = products.find((p) => p.name === productName)
    if (product) {
      updateItem(itemId, "productName", productName)
      updateItem(itemId, "unitPrice", product.price || 0)
      updateItem(itemId, "unit", product.unit || "kg")
    }
  }

  // Επιλογή πελάτη
  const selectCustomer = (customerName: string) => {
    const selectedCustomer = customers.find((c) => c.name === customerName)
    if (selectedCustomer) {
      setCustomer(customerName)
      setCustomerPhone(selectedCustomer.phone || "")
      setCustomerAddress(selectedCustomer.address || "")
    }
  }

  // Validation
  const validateForm = () => {
    if (!customer.trim()) {
      alert("Παρακαλώ εισάγετε το όνομα του πελάτη")
      return false
    }
    if (!customerPhone.trim()) {
      alert("Παρακαλώ εισάγετε το τηλέφωνο του πελάτη")
      return false
    }
    if (!customerAddress.trim()) {
      alert("Παρακαλώ εισάγετε τη διεύθυνση του πελάτη")
      return false
    }
    if (!deliveryDate) {
      alert("Παρακαλώ επιλέξτε ημερομηνία παράδοσης")
      return false
    }
    if (deliveryDate < orderDate) {
      alert("Η ημερομηνία παράδοσης δεν μπορεί να είναι πριν την ημερομηνία παραγγελίας")
      return false
    }
    if (!employee.trim()) {
      alert("Παρακαλώ επιλέξτε υπάλληλο")
      return false
    }
    if (items.length === 0) {
      alert("Παρακαλώ προσθέστε τουλάχιστον ένα προϊόν")
      return false
    }

    // Έλεγχος ότι όλα τα προϊόντα έχουν όνομα
    const emptyItems = items.filter((item) => !item.productName.trim())
    if (emptyItems.length > 0) {
      alert("Παρακαλώ συμπληρώστε όλα τα προϊόντα")
      return false
    }

    return true
  }

  // Αποθήκευση παραγγελίας
  const handleSubmit = () => {
    console.log("🚀 handleSubmit called")

    if (!validateForm()) {
      console.log("❌ Validation failed")
      return
    }

    const orderData = {
      id: isEditing ? editingOrder.id : `ORD-${Date.now()}`,
      customer: customer.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      orderDate: orderDate.toISOString(),
      deliveryDate: deliveryDate!.toISOString(),
      employee: employee.trim(),
      status,
      items,
      subtotal,
      orderDiscount,
      total,
      amount: total, // για backward compatibility
      comments: comments.trim(),
      pendingIssues: pendingIssues.trim(),
      createdAt: isEditing ? editingOrder.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("📦 Order data prepared:", orderData)
    onSave(orderData)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {isEditing ? "Επεξεργασία Παραγγελίας" : "Νέα Παραγγελία"}
          </CardTitle>
          <CardDescription>
            {isEditing ? "Επεξεργαστείτε τα στοιχεία της παραγγελίας" : "Συμπληρώστε τα στοιχεία της νέας παραγγελίας"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Στοιχεία Πελάτη */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Στοιχεία Πελάτη</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Όνομα Πελάτη *</Label>
                <Select value={customer} onValueChange={selectCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε ή πληκτρολογήστε πελάτη" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="customer"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Ή πληκτρολογήστε νέο όνομα"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Τηλέφωνο *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Τηλέφωνο πελάτη"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customerAddress">Διεύθυνση *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="customerAddress"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Διεύθυνση παράδοσης"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Στοιχεία Παραγγελίας */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Στοιχεία Παραγγελίας</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ημερομηνία Παραγγελίας</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !orderDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {orderDate ? format(orderDate, "PPP", { locale: el }) : "Επιλέξτε ημερομηνία"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={orderDate}
                      onSelect={(date) => {
                        if (date) {
                          setOrderDate(date)
                          setIsCalendarOpen(false)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Ημερομηνία Παράδοσης *</Label>
                <Popover open={isDeliveryCalendarOpen} onOpenChange={setIsDeliveryCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deliveryDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDate ? format(deliveryDate, "PPP", { locale: el }) : "Επιλέξτε ημερομηνία"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={(date) => {
                        setDeliveryDate(date)
                        setIsDeliveryCalendarOpen(false)
                      }}
                      disabled={(date) => date < orderDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee">Υπάλληλος *</Label>
                <Select value={employee} onValueChange={setEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε υπάλληλο" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.name}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Κατάσταση</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Εκκρεμής">Εκκρεμής</SelectItem>
                    <SelectItem value="Επιβεβαιωμένη">Επιβεβαιωμένη</SelectItem>
                    <SelectItem value="Προετοιμασία">Προετοιμασία</SelectItem>
                    <SelectItem value="Έτοιμη">Έτοιμη</SelectItem>
                    <SelectItem value="Παραδόθηκε">Παραδόθηκε</SelectItem>
                    <SelectItem value="Ακυρώθηκε">Ακυρώθηκε</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Προϊόντα Παραγγελίας */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <h3 className="text-lg font-semibold">Προϊόντα Παραγγελίας</h3>
              </div>
              <Button onClick={addItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Προσθήκη Προϊόντος
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Label>Προϊόν</Label>
                      <Select value={item.productName} onValueChange={(value) => selectProduct(item.id, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Επιλέξτε προϊόν" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.name}>
                              {product.name} - €{product.price}/{product.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={item.productName}
                        onChange={(e) => updateItem(item.id, "productName", e.target.value)}
                        placeholder="Ή πληκτρολογήστε προϊόν"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Ποσότητα</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateItem(item.id, "quantity", Math.max(0.1, item.quantity - 0.1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                          className="text-center"
                          step="0.1"
                          min="0"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateItem(item.id, "quantity", item.quantity + 0.1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Select value={item.unit} onValueChange={(value) => updateItem(item.id, "unit", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="τεμ">τεμ</SelectItem>
                          <SelectItem value="γρ">γρ</SelectItem>
                          <SelectItem value="λίτρα">λίτρα</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Τιμή/Μονάδα</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                          className="pl-10"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Έκπτωση (%)</Label>
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, "discount", Number.parseFloat(e.target.value) || 0)}
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <Label>Σύνολο</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          €{item.total.toFixed(2)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="md:col-span-6">
                      <Label>Οδηγίες Προετοιμασίας</Label>
                      <Input
                        value={item.instructions}
                        onChange={(e) => updateItem(item.id, "instructions", e.target.value)}
                        placeholder="π.χ. κομμένο σε φέτες, χωρίς κόκκαλο..."
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2" />
                  <p>Δεν έχουν προστεθεί προϊόντα</p>
                  <Button onClick={addItem} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Προσθήκη Πρώτου Προϊόντος
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Οικονομικά Στοιχεία */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Οικονομικά Στοιχεία</h3>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Υποσύνολο:</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Έκπτωση Παραγγελίας:</span>
                  <Input
                    type="number"
                    value={orderDiscount}
                    onChange={(e) => setOrderDiscount(Number.parseFloat(e.target.value) || 0)}
                    className="w-20"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span>%</span>
                </div>
                <span className="text-red-600">-€{discountAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                <span>Συνολικό Κόστος:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  €{total.toFixed(2)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Σχόλια και Εκκρεμότητες */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comments">Σχόλια Παραγγελίας</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Επιπλέον σχόλια ή οδηγίες..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pendingIssues" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Εκκρεμότητες
                </Label>
                <Textarea
                  id="pendingIssues"
                  value={pendingIssues}
                  onChange={(e) => setPendingIssues(e.target.value)}
                  placeholder="Εκκρεμότητες ή προβλήματα..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Κουμπιά Ενεργειών */}
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Ενημέρωση Παραγγελίας" : "Αποθήκευση Παραγγελίας"}
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Ακύρωση
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
