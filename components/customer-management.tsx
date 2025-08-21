"use client"

import { DialogDescription } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Plus, Edit, Trash2, Users, Phone, Mail, MapPin, Eye, ShoppingCart, Search, Printer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrintUtils } from "./print-utils"
import { usePeriod } from "../contexts/period-context"
import { GoogleMapsIntegration } from "./google-maps-integration"
import { OrderForm } from "./order-form"

interface CustomerManagementProps {
  userRole: "admin" | "employee" | null
}

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
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  createdAt: string
}

interface Order {
  id: string
  customerId: string
  customer: string
  customerAddress: string
  customerPhone: string
  amount: number
  status: string
  deliveryDate: string
  orderDate: string
  employee: string
  period: string
  items: OrderItem[]
  comments: string
  orderDiscount: number
  subtotal: number
  total: number
  pendingIssues: string
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

export function CustomerManagement({ userRole }: CustomerManagementProps) {
  const { getActivePeriodName } = usePeriod()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [activeTab, setActiveTab] = useState("list")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isMapsDialogOpen, setIsMapsDialogOpen] = useState(false)
  const [selectedCustomerForMaps, setSelectedCustomerForMaps] = useState<Customer | null>(null)

  // States για παραγγελίες πελάτη
  const [isCustomerOrdersDialogOpen, setIsCustomerOrdersDialogOpen] = useState(false)
  const [isOrderViewDialogOpen, setIsOrderViewDialogOpen] = useState(false)
  const [selectedCustomerForOrders, setSelectedCustomerForOrders] = useState<Customer | null>(null)
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null)
  const [orderSearchTerm, setOrderSearchTerm] = useState("")

  // States για επεξεργασία παραγγελίας
  const [isOrderEditDialogOpen, setIsOrderEditDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    firstName: "",
    lastName: "",
    address: "",
    postalCode: "",
    phone: "",
    mobile: "",
    email: "",
    comments: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load orders from localStorage
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("orders")
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders))
      }
    } catch (error) {
      console.error("Error loading orders from localStorage:", error)
    }
  }, [])

  // Load customers from localStorage on component mount
  useEffect(() => {
    try {
      const savedCustomers = localStorage.getItem("customers")
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers))
      } else {
        const initialCustomers = [
          {
            id: "1",
            code: "CUST_001",
            firstName: "Μαρία",
            lastName: "Παπαδοπούλου",
            address: "Λεωφ. Κηφισίας 123",
            postalCode: "15124",
            phone: "2106789012",
            mobile: "6971234567",
            email: "maria.papa@email.com",
            comments: "Προτιμά αρνί από Μάνη",
            totalOrders: 23,
            totalSpent: 2340.5,
            lastOrderDate: "2025-04-15",
            createdAt: "2024-01-15",
          },
          {
            id: "2",
            code: "CUST_002",
            firstName: "Γιάννης",
            lastName: "Κωνσταντίνου",
            address: "Οδός Ερμού 45",
            postalCode: "10563",
            phone: "",
            mobile: "6987654321",
            email: "",
            comments: "",
            totalOrders: 18,
            totalSpent: 1890.3,
            lastOrderDate: "2025-04-12",
            createdAt: "2024-02-20",
          },
        ]
        setCustomers(initialCustomers)
        localStorage.setItem("customers", JSON.stringify(initialCustomers))
      }
    } catch (error) {
      console.error("Error loading customers from localStorage:", error)
    }
  }, [])

  // Save customers to localStorage whenever customers state changes
  useEffect(() => {
    if (customers.length > 0) {
      try {
        localStorage.setItem("customers", JSON.stringify(customers))
      } catch (error) {
        console.error("Error saving customers to localStorage:", error)
      }
    }
  }, [customers])

  // Δημιουργία μοναδικού κωδικού πελάτη
  const generateCustomerCode = () => {
    const existingCodes = customers.map((c) => c.code).filter((code) => code.startsWith("CUST_"))
    const numbers = existingCodes.map((code) => {
      const num = Number.parseInt(code.replace("CUST_", ""))
      return isNaN(num) ? 0 : num
    })
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
    return `CUST_${String(maxNumber + 1).padStart(3, "0")}`
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Ο κωδικός πελάτη είναι υποχρεωτικός"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Το επώνυμο είναι υποχρεωτικό"
    }
    if (!formData.address.trim()) {
      newErrors.address = "Η διεύθυνση είναι υποχρεωτική"
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Το κινητό τηλέφωνο είναι υποχρεωτικό"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      code: generateCustomerCode(),
      firstName: "",
      lastName: "",
      address: "",
      postalCode: "",
      phone: "",
      mobile: "",
      email: "",
      comments: "",
    })
    setErrors({})
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const newCustomer: Customer = {
      id: Date.now().toString(),
      code: formData.code,
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      postalCode: formData.postalCode,
      phone: formData.phone,
      mobile: formData.mobile,
      email: formData.email,
      comments: formData.comments,
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: "",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setCustomers([...customers, newCustomer])
    resetForm()
    setActiveTab("list")
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      code: customer.code,
      firstName: customer.firstName,
      lastName: customer.lastName,
      address: customer.address,
      postalCode: customer.postalCode,
      phone: customer.phone,
      mobile: customer.mobile,
      email: customer.email,
      comments: customer.comments,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!validateForm() || !editingCustomer) return

    setCustomers(
      customers.map((customer) =>
        customer.id === editingCustomer.id
          ? {
              ...customer,
              code: formData.code,
              firstName: formData.firstName,
              lastName: formData.lastName,
              address: formData.address,
              postalCode: formData.postalCode,
              phone: formData.phone,
              mobile: formData.mobile,
              email: formData.email,
              comments: formData.comments,
            }
          : customer,
      ),
    )

    resetForm()
    setIsEditDialogOpen(false)
    setEditingCustomer(null)
  }

  const handleDelete = (customerId: string) => {
    setCustomers(customers.filter((customer) => customer.id !== customerId))
  }

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer)
    setIsViewDialogOpen(true)
  }

  const handleOpenMaps = (customer: Customer) => {
    setSelectedCustomerForMaps(customer)
    setIsMapsDialogOpen(true)
  }

  const handleViewCustomerOrders = (customer: Customer) => {
    setSelectedCustomerForOrders(customer)
    setOrderSearchTerm("")
    setIsCustomerOrdersDialogOpen(true)
  }

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrderForView(order)
    setIsOrderViewDialogOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setIsOrderEditDialogOpen(true)
    setIsOrderViewDialogOpen(false)
    setIsCustomerOrdersDialogOpen(false)
  }

  const handleSaveOrder = (orderData: any) => {
    const orderDataWithPeriod = {
      ...orderData,
      period: getActivePeriodName(),
    }

    // Ενημέρωση της παραγγελίας στο localStorage
    try {
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      const updatedOrders = existingOrders.map((order: any) =>
        order.id === orderDataWithPeriod.id ? orderDataWithPeriod : order,
      )
      localStorage.setItem("orders", JSON.stringify(updatedOrders))

      // Ενημέρωση του local state
      setOrders(updatedOrders)
    } catch (error) {
      console.error("Error saving order to localStorage:", error)
    }

    setIsOrderEditDialogOpen(false)
    setEditingOrder(null)
  }

  const getCustomerOrders = (customerId: string) => {
    // Φιλτράρουμε τις παραγγελίες του πελάτη μόνο για την ενεργή περίοδο
    const customerOrders = orders.filter(
      (order) => order.customerId === customerId && order.period === getActivePeriodName(),
    )

    if (!orderSearchTerm) return customerOrders

    return customerOrders.filter(
      (order) =>
        order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.deliveryDate.includes(orderSearchTerm) ||
        new Date(order.deliveryDate).toLocaleDateString("el-GR").includes(orderSearchTerm),
    )
  }

  const getTotalOrdersCount = () => {
    return orders.filter((order) => order.period === getActivePeriodName()).length
  }

  const getTotalOrdersAmount = () => {
    return orders
      .filter((order) => order.period === getActivePeriodName())
      .reduce((sum, order) => sum + order.amount, 0)
  }

  const getCustomerOrdersCount = (customerId: string) => {
    return orders.filter((order) => order.customerId === customerId && order.period === getActivePeriodName()).length
  }

  const getCustomerOrdersAmount = (customerId: string) => {
    return orders
      .filter((order) => order.customerId === customerId && order.period === getActivePeriodName())
      .reduce((sum, order) => sum + order.amount, 0)
  }

  const handlePrintCustomerOrders = () => {
    if (!selectedCustomerForOrders) return

    const customerOrders = getCustomerOrders(selectedCustomerForOrders.id)
    const printData = {
      customer: selectedCustomerForOrders,
      orders: customerOrders,
      totalOrders: customerOrders.length,
      totalAmount: customerOrders.reduce((sum, order) => sum + order.amount, 0),
      period: getActivePeriodName(),
    }

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Παραγγελίες Πελάτη - ${selectedCustomerForOrders.firstName} ${selectedCustomerForOrders.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .company-info { text-align: center; margin-bottom: 20px; }
            .customer-info { background-color: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
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
            <h2>Παραγγελίες Πελάτη</h2>
            <p>Ημερομηνία εκτύπωσης: ${new Date().toLocaleDateString("el-GR")}</p>
            <p>Περίοδος: ${getActivePeriodName()}</p>
          </div>
          <div class="customer-info">
            <h3>${selectedCustomerForOrders.firstName} ${selectedCustomerForOrders.lastName} (${
              selectedCustomerForOrders.code
            })</h3>
            <p><strong>Διεύθυνση:</strong> ${selectedCustomerForOrders.address}, ${
              selectedCustomerForOrders.postalCode
            }</p>
            <p><strong>Τηλέφωνο:</strong> ${selectedCustomerForOrders.mobile}</p>
            ${selectedCustomerForOrders.email ? `<p><strong>Email:</strong> ${selectedCustomerForOrders.email}</p>` : ""}
          </div>
          <div class="content">
            <table>
              <thead>
                <tr>
                  <th>Κωδικός</th>
                  <th>Ημ. Παραγγελίας</th>
                  <th>Ημ. Παράδοσης</th>
                  <th>Κατάσταση</th>
                  <th>Ποσό</th>
                  <th>Υπάλληλος</th>
                </tr>
              </thead>
              <tbody>
                ${customerOrders
                  .map(
                    (order) => `
                  <tr>
                    <td>${order.id}</td>
                    <td>${new Date(order.orderDate).toLocaleDateString("el-GR")}</td>
                    <td>${new Date(order.deliveryDate).toLocaleDateString("el-GR")}</td>
                    <td>${order.status}</td>
                    <td>€${order.amount.toFixed(2)}</td>
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

  const filteredCustomers = customers.filter(
    (customer) =>
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile.includes(searchTerm) ||
      customer.phone.includes(searchTerm) ||
      customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Πελατολόγιο
              </CardTitle>
              <CardDescription>Διαχείριση στοιχείων πελατών κρεοπωλείου</CardDescription>
            </div>
            <div className="flex gap-2">
              <PrintUtils title="Λίστα Πελατών" data={customers} type="customer" />
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  resetForm()
                  setActiveTab("add")
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Νέος Πελάτης
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Λίστα Πελατών</TabsTrigger>
              <TabsTrigger value="add">Νέος Πελάτης</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {/* Αναζήτηση */}
              <div>
                <Label htmlFor="search">Αναζήτηση Πελάτη</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Αναζήτηση με ονοματεπώνυμο, διεύθυνση, τηλέφωνο, email ή κωδικό..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Λίστα Πελατών */}
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Κωδικός</TableHead>
                      <TableHead>Ονοματεπώνυμο</TableHead>
                      <TableHead>Διεύθυνση</TableHead>
                      <TableHead>Κινητό</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Παραγγελίες</TableHead>
                      <TableHead>Σύνολο</TableHead>
                      <TableHead>Ενέργειες</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Δεν βρέθηκαν πελάτες
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <Badge variant="outline">{customer.code}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={customer.address}>
                            {customer.address}
                          </TableCell>
                          <TableCell>{customer.mobile}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={customer.email}>
                            {customer.email || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="cursor-pointer hover:bg-blue-100">
                              {getCustomerOrdersCount(customer.id)}
                            </Badge>
                          </TableCell>
                          <TableCell>€{getCustomerOrdersAmount(customer.id).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(customer)}
                                title="Προβολή στοιχείων"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewCustomerOrders(customer)}
                                title="Προβολή παραγγελιών"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(customer)}
                                title="Επεξεργασία"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {userRole === "admin" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                      title="Διαγραφή"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Επιβεβαίωση Διαγραφής</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Είστε σίγουροι ότι θέλετε να διαγράψετε τον πελάτη "{customer.firstName}{" "}
                                        {customer.lastName}"; Αυτή η ενέργεια θα διαγράψει και όλες τις παραγγελίες του
                                        και δεν μπορεί να αναιρεθεί.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(customer.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Διαγραφή
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Στατιστικά */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-gray-600">
                    <span className="font-semibold">Σύνολο πελατών:</span> {customers.length}
                    {searchTerm && (
                      <>
                        <br />
                        <span className="font-semibold">Αποτελέσματα:</span> {filteredCustomers.length}
                      </>
                    )}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold">Συνολικές παραγγελίες:</span>
                    <br />
                    <span className="text-lg font-bold text-blue-600">{getTotalOrdersCount()}</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold">Συνολικό ποσό:</span>
                    <br />
                    <span className="text-lg font-bold text-green-600">€{getTotalOrdersAmount().toLocaleString()}</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold">Περίοδος:</span>
                    <br />
                    <Badge variant="default">{getActivePeriodName()}</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Εισαγωγή Νέου Πελάτη</CardTitle>
                  <CardDescription>Συμπληρώστε τα στοιχεία του νέου πελάτη</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer-code">Κωδικός Πελάτη *</Label>
                      <Input
                        id="customer-code"
                        placeholder="CUST_001, CUST_002..."
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className={errors.code ? "border-red-500" : ""}
                      />
                      {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                    </div>
                    <div></div>

                    <div>
                      <Label htmlFor="first-name">Όνομα</Label>
                      <Input
                        id="first-name"
                        placeholder="Όνομα πελάτη"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last-name">Επώνυμο *</Label>
                      <Input
                        id="last-name"
                        placeholder="Επώνυμο πελάτη"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>

                    <div className="md:col-span-2 grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <Label htmlFor="address">Διεύθυνση *</Label>
                        <Input
                          id="address"
                          placeholder="Διεύθυνση πελάτη"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className={errors.address ? "border-red-500" : ""}
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="postal-code">Τ.Κ.</Label>
                        <Input
                          id="postal-code"
                          placeholder="Τ.Κ."
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor="phone">Τηλέφωνο</Label>
                        <Input
                          id="phone"
                          placeholder="Σταθερό τηλέφωνο"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="maps" className="opacity-0">
                          Maps
                        </Label>
                        <Button
                          id="maps"
                          variant="outline"
                          className="w-full mt-0.5"
                          onClick={() => {
                            if (formData.address) {
                              const address = `${formData.address}, ${formData.postalCode}`
                              window.open(
                                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
                                "_blank",
                              )
                            }
                          }}
                          disabled={!formData.address}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Maps
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="mobile">Κινητό Τηλέφωνο *</Label>
                      <Input
                        id="mobile"
                        placeholder="Κινητό τηλέφωνο"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className={errors.mobile ? "border-red-500" : ""}
                      />
                      {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Διεύθυνση email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="comments">Σχόλια</Label>
                      <Textarea
                        id="comments"
                        placeholder="Σχόλια για τον πελάτη (προτιμήσεις, ιδιαιτερότητες κλπ)"
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSubmit} className="flex-1">
                      Αποθήκευση Πελάτη
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("list")} className="flex-1">
                      Ακύρωση
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Όλα τα υπόλοιπα dialogs παραμένουν ίδια... */}
      {/* Dialog Προβολής Στοιχείων Πελάτη */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Στοιχεία Πελάτη
            </DialogTitle>
            <DialogDescription>Προβολή λεπτομερειών πελάτη</DialogDescription>
          </DialogHeader>
          {viewingCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Κωδικός</Label>
                  <p className="font-medium">{viewingCustomer.code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ονοματεπώνυμο</Label>
                  <p className="font-medium">
                    {viewingCustomer.firstName} {viewingCustomer.lastName}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Διεύθυνση</Label>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {viewingCustomer.address} {viewingCustomer.postalCode}
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => handleOpenMaps(viewingCustomer)}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Maps
                    </Button>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Τηλέφωνα</Label>
                  <div className="space-y-1">
                    {viewingCustomer.phone && (
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {viewingCustomer.phone}
                      </p>
                    )}
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {viewingCustomer.mobile}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {viewingCustomer.email || "Δεν έχει καταχωρηθεί"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Παραγγελίες (Τρέχουσα Περίοδος)</Label>
                  <p className="font-medium">{getCustomerOrdersCount(viewingCustomer.id)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Συνολικά Έσοδα (Τρέχουσα Περίοδος)</Label>
                  <p className="font-medium">€{getCustomerOrdersAmount(viewingCustomer.id).toLocaleString()}</p>
                </div>
                {viewingCustomer.comments && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-500">Σχόλια</Label>
                    <p className="font-medium">{viewingCustomer.comments}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsViewDialogOpen(false)} className="flex-1">
                  Κλείσιμο
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleViewCustomerOrders(viewingCustomer)
                  }}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Προβολή Παραγγελιών
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEdit(viewingCustomer)
                  }}
                  className="flex-1"
                >
                  Επεξεργασία
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Επεξεργασία Στοιχείων Πελάτη</DialogTitle>
            <DialogDescription>Επεξεργαστείτε τα στοιχεία του πελάτη</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-customer-code">Κωδικός Πελάτη *</Label>
                <Input
                  id="edit-customer-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>
              <div></div>

              <div>
                <Label htmlFor="edit-first-name">Όνομα</Label>
                <Input
                  id="edit-first-name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-last-name">Επώνυμο *</Label>
                <Input
                  id="edit-last-name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>

              <div className="md:col-span-2 grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Label htmlFor="edit-address">Διεύθυνση *</Label>
                  <Input
                    id="edit-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-postal-code">Τ.Κ.</Label>
                  <Input
                    id="edit-postal-code"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="edit-phone">Τηλέφωνο</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-maps" className="opacity-0">
                    Maps
                  </Label>
                  <Button
                    id="edit-maps"
                    variant="outline"
                    className="w-full mt-0.5"
                    onClick={() => {
                      if (formData.address) {
                        const address = `${formData.address}, ${formData.postalCode}`
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
                          "_blank",
                        )
                      }
                    }}
                    disabled={!formData.address}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Maps
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-mobile">Κινητό Τηλέφωνο *</Label>
                <Input
                  id="edit-mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className={errors.mobile ? "border-red-500" : ""}
                />
                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
              </div>
              <div>
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-comments">Σχόλια</Label>
                <Textarea
                  id="edit-comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdate} className="flex-1">
                Ενημέρωση
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Ακύρωση
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Υπόλοιπα dialogs... */}
      {/* Dialog Παραγγελιών Πελάτη */}
      <Dialog open={isCustomerOrdersDialogOpen} onOpenChange={setIsCustomerOrdersDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Παραγγελίες Πελάτη - {selectedCustomerForOrders?.firstName} {selectedCustomerForOrders?.lastName}
            </DialogTitle>
            <DialogDescription>
              Προβολή όλων των παραγγελιών του πελάτη για την περίοδο: {getActivePeriodName()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Αναζήτηση */}
            <div>
              <Label htmlFor="order-search">Αναζήτηση Παραγγελίας</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="order-search"
                  placeholder="Αναζήτηση με κωδικό παραγγελίας ή ημερομηνία παράδοσης..."
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Compact λίστα παραγγελιών */}
            <div className="space-y-2">
              {getCustomerOrders(selectedCustomerForOrders?.id || "").length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  {orderSearchTerm
                    ? "Δεν βρέθηκαν παραγγελίες με τα κριτήρια αναζήτησης"
                    : "Δεν βρέθηκαν παραγγελίες για τον πελάτη"}
                </div>
              ) : (
                getCustomerOrders(selectedCustomerForOrders?.id || "").map((order) => (
                  <Card
                    key={order.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                    onClick={() => handleViewOrderDetails(order)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="font-mono">
                            {order.id}
                          </Badge>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Παραγγελία:</span>{" "}
                            {new Date(order.orderDate).toLocaleDateString("el-GR")}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Παράδοση:</span>{" "}
                            {new Date(order.deliveryDate).toLocaleDateString("el-GR")}
                          </div>
                          <Badge
                            variant={
                              order.status === "Παραδόθηκε"
                                ? "default"
                                : order.status === "Μέσα"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">€{order.amount.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">{order.employee}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Στατιστικά */}
            {getCustomerOrders(selectedCustomerForOrders?.id || "").length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-gray-600">
                    <span className="font-semibold">Σύνολο παραγγελιών:</span>{" "}
                    {getCustomerOrders(selectedCustomerForOrders?.id || "").length}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold">Συνολικό ποσό:</span> €
                    {getCustomerOrders(selectedCustomerForOrders?.id || "")
                      .reduce((sum, order) => sum + order.amount, 0)
                      .toFixed(2)}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-semibold">Μέσος όρος παραγγελίας:</span> €
                    {(
                      getCustomerOrders(selectedCustomerForOrders?.id || "").reduce(
                        (sum, order) => sum + order.amount,
                        0,
                      ) / getCustomerOrders(selectedCustomerForOrders?.id || "").length
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setIsCustomerOrdersDialogOpen(false)} className="flex-1">
                Κλείσιμο
              </Button>
              <Button variant="outline" onClick={handlePrintCustomerOrders} className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Εκτύπωση Παραγγελιών
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Προβολής Παραγγελίας */}
      <Dialog open={isOrderViewDialogOpen} onOpenChange={setIsOrderViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Προβολή Παραγγελίας - {selectedOrderForView?.id}
            </DialogTitle>
            <DialogDescription>Προβολή λεπτομερειών παραγγελίας</DialogDescription>
          </DialogHeader>
          {selectedOrderForView && (
            <div className="space-y-6">
              {/* Στοιχεία Παραγγελίας */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Κωδικός Παραγγελίας</Label>
                  <p className="font-medium">{selectedOrderForView.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Πελάτης</Label>
                  <p className="font-medium">{selectedOrderForView.customer}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ημερομηνία Παραγγελίας</Label>
                  <p className="font-medium">{new Date(selectedOrderForView.orderDate).toLocaleDateString("el-GR")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ημερομηνία Παράδοσης</Label>
                  <p className="font-medium">
                    {new Date(selectedOrderForView.deliveryDate).toLocaleDateString("el-GR")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Περίοδος</Label>
                  <p className="font-medium">{selectedOrderForView.period}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Κατάσταση</Label>
                  <Badge
                    variant={
                      selectedOrderForView.status === "Παραδόθηκε"
                        ? "default"
                        : selectedOrderForView.status === "Μέσα"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {selectedOrderForView.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Υπάλληλος</Label>
                  <p className="font-medium">{selectedOrderForView.employee}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Διεύθυνση Παράδοσης</Label>
                  <p className="font-medium">{selectedOrderForView.customerAddress}</p>
                </div>
              </div>

              {/* Προϊόντα Παραγγελίας */}
              <div>
                <Label className="text-sm font-medium text-gray-500 mb-2 block">Προϊόντα Παραγγελίας</Label>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Προϊόν</TableHead>
                        <TableHead>Ποσότητα</TableHead>
                        <TableHead>Μονάδα</TableHead>
                        <TableHead>Τιμή Μονάδας</TableHead>
                        <TableHead>Έκπτωση</TableHead>
                        <TableHead>Σύνολο</TableHead>
                        <TableHead>Οδηγίες</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrderForView.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>€{item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>{item.discount}%</TableCell>
                          <TableCell>€{item.total.toFixed(2)}</TableCell>
                          <TableCell>{item.instructions || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Σύνολα */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Υποσύνολο:</span>
                  <span>€{selectedOrderForView.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrderForView.orderDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Έκπτωση Παραγγελίας ({selectedOrderForView.orderDiscount}%):</span>
                    <span>
                      -€{((selectedOrderForView.subtotal * selectedOrderForView.orderDiscount) / 100).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Συνολικό Κόστος:</span>
                  <span>€{selectedOrderForView.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Σχόλια και Εκκρεμότητες */}
              {(selectedOrderForView.comments || selectedOrderForView.pendingIssues) && (
                <div className="space-y-4">
                  {selectedOrderForView.comments && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Σχόλια</Label>
                      <p className="font-medium">{selectedOrderForView.comments}</p>
                    </div>
                  )}
                  {selectedOrderForView.pendingIssues && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Εκκρεμότητες</Label>
                      <p className="font-medium text-red-600">{selectedOrderForView.pendingIssues}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsOrderViewDialogOpen(false)} className="flex-1">
                  Κλείσιμο
                </Button>
                <Button variant="outline" onClick={() => handleEditOrder(selectedOrderForView)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Επεξεργασία Παραγγελίας
                </Button>
                <PrintUtils title={`Παραγγελία ${selectedOrderForView.id}`} data={selectedOrderForView} type="order" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Επεξεργασίας Παραγγελίας */}
      <Dialog open={isOrderEditDialogOpen} onOpenChange={setIsOrderEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Επεξεργασία Παραγγελίας</DialogTitle>
            <DialogDescription>Επεξεργασία των στοιχείων της παραγγελίας</DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <OrderForm
              onSave={handleSaveOrder}
              onCancel={() => {
                setIsOrderEditDialogOpen(false)
                setEditingOrder(null)
              }}
              editingOrder={editingOrder}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Maps Dialog */}
      <Dialog open={isMapsDialogOpen} onOpenChange={setIsMapsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Πληροφορίες Τοποθεσίας</DialogTitle>
            <DialogDescription>Προβολή της τοποθεσίας του πελάτη στους χάρτες</DialogDescription>
          </DialogHeader>
          {selectedCustomerForMaps && (
            <GoogleMapsIntegration
              customerAddress={`${selectedCustomerForMaps.address}, ${selectedCustomerForMaps.postalCode}`}
              customerName={`${selectedCustomerForMaps.firstName} ${selectedCustomerForMaps.lastName}`}
              onClose={() => setIsMapsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CustomerManagement
