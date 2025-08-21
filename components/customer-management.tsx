"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Phone, MapPin, User, Search } from "lucide-react"
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

interface Customer {
  id: string
  code: string
  firstName: string
  lastName: string
  phone: string
  address: string
  notes: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
  createdAt: string
}

interface CustomerManagementProps {
  userRole?: "admin" | "employee" | null
}

const initialCustomers: Customer[] = [
  {
    id: "1",
    code: "CUST_001",
    firstName: "Μαρία",
    lastName: "Παπαδοπούλου",
    address: "Λεωφ. Κηφισίας 123, Αθήνα",
    phone: "6971234567",
    notes: "Προτιμά παραδόσεις το πρωί",
    totalOrders: 5,
    totalSpent: 245.5,
    lastOrderDate: "2024-01-15",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    code: "CUST_002",
    firstName: "Γιάννης",
    lastName: "Κωνσταντίνου",
    address: "Οδός Ερμού 45, Αθήνα",
    phone: "6987654321",
    notes: "Αλλεργικός στα καρυκεύματα",
    totalOrders: 3,
    totalSpent: 180.0,
    lastOrderDate: "2024-01-10",
    createdAt: "2024-01-05",
  },
  {
    id: "3",
    code: "CUST_003",
    firstName: "Ελένη",
    lastName: "Δημητρίου",
    address: "Πατησίων 234, Αθήνα",
    phone: "6912345678",
    notes: "VIP πελάτης - έκπτωση 10%",
    totalOrders: 12,
    totalSpent: 890.75,
    lastOrderDate: "2024-01-20",
    createdAt: "2023-12-15",
  },
]

// Δημιουργία μοναδικού κωδικού πελάτη
const generateCustomerCode = (customers: Customer[]) => {
  const existingCodes = customers.map((c) => c.code).filter((code) => code.startsWith("CUST_"))
  const numbers = existingCodes.map((code) => {
    const num = Number.parseInt(code.replace("CUST_", ""))
    return isNaN(num) ? 0 : num
  })
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
  return `CUST_${String(maxNumber + 1).padStart(3, "0")}`
}

export function CustomerManagement({ userRole }: CustomerManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Φόρτωση πελατών από localStorage
  useEffect(() => {
    try {
      const savedCustomers = localStorage.getItem("customers")
      if (savedCustomers) {
        const parsedCustomers = JSON.parse(savedCustomers)
        setCustomers(parsedCustomers)
      } else {
        setCustomers(initialCustomers)
        localStorage.setItem("customers", JSON.stringify(initialCustomers))
      }
    } catch (error) {
      console.error("Error loading customers:", error)
      setCustomers(initialCustomers)
    }
  }, [])

  // Αποθήκευση πελατών στο localStorage
  const saveCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers)
    try {
      localStorage.setItem("customers", JSON.stringify(updatedCustomers))
    } catch (error) {
      console.error("Error saving customers:", error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Ο κωδικός πελάτη είναι υποχρεωτικός"
    } else {
      // Έλεγχος μοναδικότητας κωδικού
      const existingCustomer = customers.find(
        (c) => c.code === formData.code && (!editingCustomer || c.id !== editingCustomer.id),
      )
      if (existingCustomer) {
        newErrors.code = "Ο κωδικός πελάτη υπάρχει ήδη"
      }
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Το όνομα είναι υποχρεωτικό"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Το επώνυμο είναι υποχρεωτικό"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Το τηλέφωνο είναι υποχρεωτικό"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      code: generateCustomerCode(customers),
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      notes: "",
    })
    setErrors({})
  }

  const handleAddCustomer = () => {
    if (!validateForm()) return

    const newCustomer: Customer = {
      id: Date.now().toString(),
      code: formData.code.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      notes: formData.notes.trim(),
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    saveCustomers([...customers, newCustomer])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      code: customer.code,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateCustomer = () => {
    if (!editingCustomer || !validateForm()) return

    const updatedCustomer = {
      ...editingCustomer,
      code: formData.code.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      notes: formData.notes.trim(),
    }

    const updatedCustomers = customers.map((customer) =>
      customer.id === editingCustomer.id ? updatedCustomer : customer,
    )

    saveCustomers(updatedCustomers)
    resetForm()
    setIsEditDialogOpen(false)
    setEditingCustomer(null)
  }

  const handleDeleteCustomer = (customerId: string) => {
    const updatedCustomers = customers.filter((customer) => customer.id !== customerId)
    saveCustomers(updatedCustomers)
  }

  // Φιλτράρισμα πελατών βάσει αναζήτησης
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Διαχείριση Πελατών</h1>
          <p className="text-gray-600 mt-2">Διαχειριστείτε το πελατολόγιό σας</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Νέος Πελάτης
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Προσθήκη Νέου Πελάτη</DialogTitle>
              <DialogDescription>Εισάγετε τα στοιχεία του νέου πελάτη</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Κωδικός Πελάτη *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CUST_001, CUST_002..."
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Όνομα *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Όνομα"
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Επώνυμο *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Επώνυμο"
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Τηλέφωνο *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Τηλέφωνο"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="address">Διεύθυνση</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Διεύθυνση"
                />
              </div>
              <div>
                <Label htmlFor="notes">Σημειώσεις</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Σημειώσεις για τον πελάτη"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCustomer} className="flex-1">
                  Προσθήκη Πελάτη
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Ακύρωση
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Αναζήτηση */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Αναζήτηση Πελατών
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Αναζήτηση με όνομα, επώνυμο, κωδικό, τηλέφωνο ή διεύθυνση..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Λίστα Πελατών */}
      <Card>
        <CardHeader>
          <CardTitle>Λίστα Πελατών ({filteredCustomers.length})</CardTitle>
          <CardDescription>Όλοι οι καταχωρημένοι πελάτες</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Κωδικός</TableHead>
                  <TableHead>Πελάτης</TableHead>
                  <TableHead>Τηλέφωνο</TableHead>
                  <TableHead>Διεύθυνση</TableHead>
                  <TableHead>Παραγγελίες</TableHead>
                  <TableHead>Σύνολο</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "Δεν βρέθηκαν πελάτες" : "Δεν υπάρχουν καταχωρημένοι πελάτες"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Badge variant="outline">{customer.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {customer.firstName} {customer.lastName}
                            </div>
                            {customer.notes && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{customer.notes}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate max-w-xs">{customer.address || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{customer.totalOrders}</Badge>
                      </TableCell>
                      <TableCell>€{customer.totalSpent.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditCustomer(customer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Επιβεβαίωση Διαγραφής</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Είστε σίγουροι ότι θέλετε να διαγράψετε τον πελάτη "{customer.firstName}{" "}
                                  {customer.lastName}"; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCustomer(customer.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Διαγραφή
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Επεξεργασίας */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Επεξεργασία Πελάτη</DialogTitle>
            <DialogDescription>Επεξεργαστείτε τα στοιχεία του πελάτη</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-code">Κωδικός Πελάτη *</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="CUST_001, CUST_002..."
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-firstName">Όνομα *</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Όνομα"
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="edit-lastName">Επώνυμο *</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Επώνυμο"
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-phone">Τηλέφωνο *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Τηλέφωνο"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="edit-address">Διεύθυνση</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Διεύθυνση"
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Σημειώσεις</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Σημειώσεις για τον πελάτη"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateCustomer} className="flex-1">
                Ενημέρωση
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingCustomer(null)
                  resetForm()
                }}
                className="flex-1"
              >
                Ακύρωση
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
