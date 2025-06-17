"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Plus, Trash2, ShoppingCart, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { el } from "date-fns/locale"
import { PrintUtils } from "./print-utils"
import { usePeriod } from "@/contexts/period-context"
import { useEmailService } from "@/services/email-service"

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
  const { sendOrderEmail, isConfigured } = useEmailService()

  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])

  useEffect(() => {
    // Simplified localStorage loading for brevity
    try {
      const savedCustomers = localStorage.getItem("customers")
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers))
      const savedEmployees = localStorage.getItem("employees")
      if (savedEmployees) setEmployees(JSON.parse(savedEmployees))
      const savedProducts = localStorage.getItem("products")
      if (savedProducts) setProducts(JSON.parse(savedProducts))
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const savedProducts = localStorage.getItem("products")
      if (savedProducts) {
        try {
          setProducts(JSON.parse(savedProducts))
        } catch (error) {
          console.error("Error updating products from storage change:", error)
        }
      }
    }
    window.addEventListener("storage", handleStorageChange)
    const interval = setInterval(handleStorageChange, 2000)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const [orderCode, setOrderCode] = useState(editingOrder?.id || "")
  const [selectedCustomerId, setSelectedCustomerId] = useState(editingOrder?.customerId || "")
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(editingOrder?.employeeId || "")
  const [orderDate] = useState<Date>(editingOrder?.orderDate ? new Date(editingOrder.orderDate) : new Date())
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    editingOrder?.deliveryDate ? new Date(editingOrder.deliveryDate) : undefined,
  )
  const [orderItems, setOrderItems] = useState<OrderItem[]>(editingOrder?.items || [])
  const [orderComments, setOrderComments] = useState(editingOrder?.comments || "")
  const [orderDiscount, setOrderDiscount] = useState<number>(editingOrder?.orderDiscount || 0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [statusReady, setStatusReady] = useState(
    editingOrder?.status === "Μέσα" || editingOrder?.status === "Μέσα/Εκκρεμότητες" || false,
  )
  const [statusPending, setStatusPending] = useState(
    editingOrder?.status === "Εκκρεμότητες" || editingOrder?.status === "Μέσα/Εκκρεμότητες" || false,
  )
  const [statusDelivered, setStatusDelivered] = useState(editingOrder?.status === "Παραδόθηκε" || false)
  const [pendingIssues, setPendingIssues] = useState(editingOrder?.pendingIssues || "")
  const currentPeriod = getActivePeriodName()

  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [itemDiscount, setItemDiscount] = useState("0")
  const [itemInstructions, setItemInstructions] = useState("")

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)

  const [isDeliveryDatePopoverOpen, setIsDeliveryDatePopoverOpen] = useState(false)

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId)
    const product = products.find((p) => p.id === productId)
    if (product) {
      setUnitPrice(product.price ? product.price.toString() : "")
    } else {
      setUnitPrice("")
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!orderCode.trim()) newErrors.orderCode = "Ο κωδικός παραγγελίας είναι υποχρεωτικός"
    if (!selectedCustomerId) newErrors.customer = "Η επιλογή πελάτη είναι υποχρεωτική"
    if (!selectedEmployeeId) newErrors.employee = "Η επιλογή υπαλλήλου είναι υποχρεωτική"
    if (!deliveryDate) newErrors.deliveryDate = "Η ημερομηνία παράδοσης είναι υποχρεωτική"
    if (orderItems.length === 0) newErrors.items = "Προσθέστε τουλάχιστον ένα προϊόν"
    if (statusPending && !pendingIssues.trim()) newErrors.pendingIssues = "Περιγράψτε τις εκκρεμότητες"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStatusChange = (status: string, checked: boolean) => {
    switch (status) {
      case "ready":
        setStatusReady(checked)
        break
      case "pending":
        setStatusPending(checked)
        if (checked) setStatusDelivered(false)
        if (!checked) setPendingIssues("")
        break
      case "delivered":
        setStatusDelivered(checked)
        if (checked) {
          setStatusReady(false)
          setStatusPending(false)
          setPendingIssues("")
        }
        break
    }
  }

  const calculateItemTotal = (): number => {
    const qtyNum = Number.parseFloat(quantity)
    const priceNum = Number.parseFloat(unitPrice)
    let discountNum = Number.parseFloat(itemDiscount)
    if (!Number.isFinite(discountNum) || discountNum < 0) discountNum = 0
    if (!Number.isFinite(qtyNum) || !Number.isFinite(priceNum) || qtyNum <= 0 || priceNum < 0) return 0
    const subtotal = qtyNum * priceNum
    const total = subtotal - (subtotal * discountNum) / 100
    return Number.isFinite(total) ? total : 0
  }

  const handleAddItem = () => {
    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const qtyNum = Number.parseFloat(quantity)
    const priceNum = Number.parseFloat(unitPrice)
    const discountNum = Number.parseFloat(itemDiscount)

    // --- FIX: Sanitize all numeric inputs before use ---
    const sanitizedQty = Number.isFinite(qtyNum) && qtyNum > 0 ? qtyNum : 0
    const sanitizedPrice = Number.isFinite(priceNum) && priceNum >= 0 ? priceNum : 0
    const sanitizedDiscount = Number.isFinite(discountNum) && discountNum >= 0 ? discountNum : 0

    if (sanitizedQty === 0) return // Don't add item with zero quantity

    const subtotal = sanitizedQty * sanitizedPrice
    const total = subtotal - (subtotal * sanitizedDiscount) / 100

    const itemData = {
      productName: product.name,
      quantity: sanitizedQty,
      unit: product.unitName || "Κιλά",
      unitPrice: sanitizedPrice,
      discount: sanitizedDiscount,
      total: total,
      instructions: itemInstructions,
    }

    if (editingItemId) {
      setOrderItems(orderItems.map((item) => (item.id === editingItemId ? { ...item, ...itemData } : item)))
      setEditingItemId(null)
    } else {
      setOrderItems([...orderItems, { id: Date.now().toString(), ...itemData }])
    }

    setSelectedProductId("")
    setQuantity("")
    setUnitPrice("")
    setItemDiscount("0")
    setItemInstructions("")
  }

  const handleEditItem = (item: OrderItem) => {
    const product = products.find((p) => p.name === item.productName)
    setEditingItemId(item.id)
    setSelectedProductId(product?.id || "")
    setQuantity(item.quantity.toString())
    setUnitPrice(item.unitPrice.toString())
    setItemDiscount(item.discount.toString())
    setItemInstructions(item.instructions)
  }

  const handleCancelEdit = () => {
    setEditingItemId(null)
    setSelectedProductId("")
    setQuantity("")
    setUnitPrice("")
    setItemDiscount("0")
    setItemInstructions("")
  }

  const handleRemoveItem = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
  }

  const calculateSubtotal = (): number => {
    return orderItems.reduce((sum, item) => sum + (Number.isFinite(item.total) ? item.total : 0), 0)
  }

  const calculateFinalTotal = (): number => {
    const subtotal = calculateSubtotal()
    const discountToApply = Number.isFinite(orderDiscount) && orderDiscount >= 0 ? orderDiscount : 0
    const total = subtotal - (subtotal * discountToApply) / 100
    return Number.isFinite(total) ? total : 0
  }

  const getOrderStatus = () => {
    if (statusDelivered) return "Παραδόθηκε"
    if (statusPending && statusReady) return "Μέσα/Εκκρεμότητες"
    if (statusPending) return "Εκκρεμότητες"
    if (statusReady) return "Μέσα"
    return "Νέα"
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    const finalTotal = calculateFinalTotal()
    const orderData = {
      id: orderCode,
      customer: `${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`,
      customerAddress: selectedCustomer?.address || "",
      customerPhone: selectedCustomer?.mobile || "",
      customerId: selectedCustomerId,
      employeeId: selectedEmployeeId,
      amount: finalTotal,
      status: getOrderStatus(),
      deliveryDate: deliveryDate ? format(deliveryDate, "yyyy-MM-dd") : "",
      orderDate: orderDate.toISOString().split("T")[0],
      employee: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : "Άγνωστος",
      period: currentPeriod,
      items: orderItems,
      comments: orderComments,
      orderDiscount: Number.isFinite(orderDiscount) && orderDiscount >= 0 ? orderDiscount : 0,
      pendingIssues: statusPending ? pendingIssues : "",
      subtotal: calculateSubtotal(),
      total: finalTotal,
    }
    try {
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      if (isEditing) {
        const updatedOrders = existingOrders.map((order: any) =>
          order.id === orderData.id && order.period === orderData.period ? orderData : order,
        )
        localStorage.setItem("orders", JSON.stringify(updatedOrders))
      } else {
        localStorage.setItem("orders", JSON.stringify([orderData, ...existingOrders]))
      }
    } catch (error) {
      console.error("Error saving order to localStorage:", error)
    }
    if (selectedCustomer?.email && isConfigured) {
      try {
        await sendOrderEmail({ ...orderData, customerEmail: selectedCustomer.email }, isEditing)
      } catch (e) {
        console.error(e)
      }
    }
    onSave(orderData)
  }

  const itemTotalForDisplay = calculateItemTotal()
  const subTotalForDisplay = calculateSubtotal()
  const finalTotalForDisplay = calculateFinalTotal()
  const orderDiscountAmountForDisplay =
    (subTotalForDisplay * (Number.isFinite(orderDiscount) && orderDiscount >= 0 ? orderDiscount : 0)) / 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          {isEditing ? "Επεξεργασία Παραγγελίας" : "Νέα Παραγγελία"}
        </CardTitle>
        <CardDescription>
          <div className="space-y-2">
            <div>
              {isEditing
                ? "Επεξεργαστείτε τα στοιχεία της παραγγελίας"
                : "Δημιουργήστε μια νέα παραγγελία για την εορταστική περίοδο"}
            </div>
            <Badge variant="outline">Περίοδος: {currentPeriod}</Badge>
            {!isConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm text-yellow-800">
                  <strong>Σημείωση:</strong> Η αποστολή emails δεν είναι ενεργοποιημένη.
                </div>
              </div>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Επιλογή Πελάτη *</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className={errors.customer ? "border-red-500" : ""}>
                <SelectValue placeholder="Επιλέξτε πελάτη" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName} - {customer.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.customer && <p className="text-red-500 text-sm">{errors.customer}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee">Υπάλληλος Παραγγελίας *</Label>
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

        {selectedCustomer && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-medium">
              {selectedCustomer.firstName} {selectedCustomer.lastName}
            </p>
            <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
            <p className="text-sm text-gray-600">{selectedCustomer.mobile}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ημερομηνία Παραλαβής</Label>
            <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
              <span className="text-sm">{format(orderDate, "PPP", { locale: el })}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ημερομηνία Παράδοσης *</Label>
            <Popover open={isDeliveryDatePopoverOpen} onOpenChange={setIsDeliveryDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !deliveryDate && "text-muted-foreground"
                  } ${errors.deliveryDate ? "border-red-500" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deliveryDate ? format(deliveryDate, "PPP", { locale: el }) : "Επιλέξτε ημερομηνία"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={deliveryDate}
                  onSelect={(date) => {
                    setDeliveryDate(date)
                    setIsDeliveryDatePopoverOpen(false)
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  locale={el}
                />
              </PopoverContent>
            </Popover>
            {errors.deliveryDate && <p className="text-red-500 text-sm">{errors.deliveryDate}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Προσθήκη Προϊόντων</Label>
          <div className="p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-end">
              <div className="lg:col-span-5">
                <Label htmlFor="product">Προϊόν</Label>
                <Select value={selectedProductId} onValueChange={handleProductChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε προϊόν" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - €{product.price}/{product.unitName || "Κιλά"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-1">
                <Label htmlFor="quantity">Ποσότητα</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="lg:col-span-1">
                <Label htmlFor="unit-price">Τιμή (€)</Label>
                <Input
                  id="unit-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                />
              </div>
              <div className="lg:col-span-1">
                <Label htmlFor="item-discount">Έκπτ. (%)</Label>
                <Input
                  id="item-discount"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={itemDiscount}
                  onChange={(e) => setItemDiscount(e.target.value)}
                />
              </div>
              <div className="lg:col-span-2">
                <Label>Σύνολο</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                  <span className="font-medium">€{itemTotalForDisplay.toFixed(2)}</span>
                </div>
              </div>
              <div className="lg:col-span-2 flex gap-1">
                <Button onClick={handleAddItem} className="flex-1 text-sm px-2">
                  <Plus className="h-4 w-4 mr-1" /> {editingItemId ? "Ενημέρωση" : "Προσθήκη"}
                </Button>
                {editingItemId && (
                  <Button variant="outline" onClick={handleCancelEdit} className="flex-1 text-sm px-2">
                    Ακύρωση
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="item-instructions">Οδηγίες</Label>
              <Input
                id="item-instructions"
                placeholder="Ειδικές οδηγίες..."
                value={itemInstructions}
                onChange={(e) => setItemInstructions(e.target.value)}
              />
            </div>
          </div>
        </div>

        {orderItems.length > 0 && (
          <div className="space-y-2">
            <Label>Προϊόντα Παραγγελίας</Label>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Προϊόν</TableHead>
                    <TableHead>Ποσότητα</TableHead>
                    <TableHead>Τιμή</TableHead>
                    <TableHead>Έκπτ.</TableHead>
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
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}
          </div>
        )}

        {orderItems.length > 0 && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Υποσύνολο:</span>
                <span>€{subTotalForDisplay.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="order-discount" className="whitespace-nowrap">
                  Έκπτωση Παραγγελίας (%):
                </Label>
                <Input
                  id="order-discount"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={orderDiscount.toString()}
                  onChange={(e) => {
                    const parsed = Number.parseFloat(e.target.value)
                    setOrderDiscount(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0)
                  }}
                  className="w-24"
                />
                {orderDiscount > 0 && (
                  <span className="text-sm text-muted-foreground">(-€{orderDiscountAmountForDisplay.toFixed(2)})</span>
                )}
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                <span>Συνολικό Κόστος:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  €{finalTotalForDisplay.toFixed(2)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {orderItems.length > 0 && (
          <div className="space-y-4">
            <Label>Κατάσταση Παραγγελίας</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-ready"
                  checked={statusReady}
                  onCheckedChange={(c) => handleStatusChange("ready", c as boolean)}
                />
                <Label htmlFor="status-ready">ΜΕΣΑ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-pending"
                  checked={statusPending}
                  onCheckedChange={(c) => handleStatusChange("pending", c as boolean)}
                />
                <Label htmlFor="status-pending">ΕΚΚΡΕΜΟΤΗΤΕΣ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-delivered"
                  checked={statusDelivered}
                  onCheckedChange={(c) => handleStatusChange("delivered", c as boolean)}
                />
                <Label htmlFor="status-delivered">ΠΑΡΑΔΟΘΗΚΕ</Label>
              </div>
            </div>
            {statusPending && (
              <div className="space-y-2">
                <Label htmlFor="pending-issues">Περιγραφή Εκκρεμοτήτων *</Label>
                <Textarea
                  id="pending-issues"
                  placeholder="Περιγράψτε τις εκκρεμότητες..."
                  value={pendingIssues}
                  onChange={(e) => setPendingIssues(e.target.value)}
                  rows={3}
                  className={errors.pendingIssues ? "border-red-500" : ""}
                />
                {errors.pendingIssues && <p className="text-red-500 text-sm">{errors.pendingIssues}</p>}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="order-comments">Σχόλια Παραγγελίας</Label>
          <Textarea
            id="order-comments"
            placeholder="Γενικά σχόλια..."
            value={orderComments}
            onChange={(e) => setOrderComments(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700">
            {isEditing ? "Ενημέρωση Παραγγελίας" : "Αποθήκευση Παραγγελίας"}
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Ακύρωση
          </Button>
          {orderItems.length > 0 && selectedCustomer && (
            <PrintUtils
              title="Προεπισκόπηση Παραγγελίας"
              data={{
                id: orderCode || "ΠΡΟΕΠΙΣΚΟΠΗΣΗ",
                customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
                customerAddress: selectedCustomer.address,
                customerPhone: selectedCustomer.mobile,
                orderDate: orderDate.toISOString().split("T")[0],
                deliveryDate: deliveryDate ? format(deliveryDate, "yyyy-MM-dd") : "",
                items: orderItems,
                subtotal: subTotalForDisplay,
                orderDiscount: Number.isFinite(orderDiscount) && orderDiscount >= 0 ? orderDiscount : 0,
                total: finalTotalForDisplay,
                status: getOrderStatus(),
                comments: orderComments,
                pendingIssues: statusPending ? pendingIssues : "",
                employee: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : "",
                period: currentPeriod,
              }}
              type="order"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
