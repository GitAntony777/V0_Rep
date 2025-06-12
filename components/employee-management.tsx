"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Plus, Edit, Trash2, UserCheck, Eye, Phone, Mail, MapPin, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrintUtils } from "./print-utils"
import { GoogleMapsIntegration } from "./google-maps-integration"

interface EmployeeManagementProps {
  userRole: "admin" | "employee" | null
}

interface Employee {
  id: string
  code: string
  firstName: string
  lastName: string
  address: string
  postalCode: string
  area: string
  mobile: string
  phone: string
  homePhone: string
  email: string
  username: string
  password: string
  role: "admin" | "employee"
  comments: string
  imageUrl: string
  createdAt: string
}

const initialEmployees: Employee[] = [
  {
    id: "1",
    code: "EMP_001",
    firstName: "Γιάννης",
    lastName: "Κωνσταντίνου",
    address: "Οδός Αθηνάς 45",
    postalCode: "54635",
    area: "Θεσσαλονίκη",
    mobile: "6971234567",
    phone: "",
    homePhone: "2310123456",
    email: "giannis.k@email.com",
    username: "giannis.k",
    password: "password123",
    role: "admin",
    comments: "Εργάζεται Δευτέρα-Παρασκευή, 08:00-16:00",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    code: "EMP_002",
    firstName: "Μαρία",
    lastName: "Δημητρίου",
    address: "Λεωφ. Συγγρού 123",
    postalCode: "11745",
    area: "Αθήνα",
    mobile: "6987654321",
    phone: "",
    homePhone: "",
    email: "maria.d@email.com",
    username: "maria.d",
    password: "password456",
    role: "employee",
    comments: "Part-time, Σαββατοκύριακα",
    imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    createdAt: "2024-02-01",
  },
  {
    id: "3",
    code: "EMP_003",
    firstName: "Νίκος",
    lastName: "Παπαδόπουλος",
    address: "Εγνατία 89",
    postalCode: "54630",
    area: "Θεσσαλονίκη",
    mobile: "6945678901",
    phone: "",
    homePhone: "2310987654",
    email: "nikos.p@email.com",
    username: "nikos.p",
    password: "password789",
    role: "employee",
    comments: "Ειδικός σε κρέατα βοδινά",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    createdAt: "2024-03-10",
  },
]

const initialFormData = {
  code: "",
  firstName: "",
  lastName: "",
  address: "",
  postalCode: "",
  area: "",
  mobile: "",
  phone: "",
  homePhone: "",
  email: "",
  username: "",
  password: "",
  role: "employee" as "admin" | "employee",
  comments: "",
  imageUrl: "",
}

const generateEmployeeCode = (employees: Employee[]) => {
  const existingCodes = employees.map((emp) => emp.code).filter((code) => code.startsWith("EMP_"))
  const numbers = existingCodes.map((code) => {
    const num = Number.parseInt(code.replace("EMP_", ""))
    return isNaN(num) ? 0 : num
  })
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
  return `EMP_${String(maxNumber + 1).padStart(3, "0")}`
}

function EmployeeManagement({ userRole }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState(initialFormData)
  const [activeTab, setActiveTab] = useState("list")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [isMapsDialogOpen, setIsMapsDialogOpen] = useState(false)
  const [selectedEmployeeForMaps, setSelectedEmployeeForMaps] = useState<Employee | null>(null)

  // Load employees from localStorage on component mount
  useEffect(() => {
    try {
      const savedEmployees = localStorage.getItem("employees")
      if (savedEmployees) {
        setEmployees(JSON.parse(savedEmployees))
      } else {
        setEmployees(initialEmployees)
        localStorage.setItem("employees", JSON.stringify(initialEmployees))
      }
    } catch (error) {
      console.error("Error loading employees from localStorage:", error)
      setEmployees(initialEmployees)
    }
  }, [])

  // Save employees to localStorage whenever employees state changes
  useEffect(() => {
    if (employees.length > 0) {
      try {
        localStorage.setItem("employees", JSON.stringify(employees))
      } catch (error) {
        console.error("Error saving employees to localStorage:", error)
      }
    }
  }, [employees])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Ο κωδικός υπαλλήλου είναι υποχρεωτικός"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Το επώνυμο είναι υποχρεωτικό"
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Το κινητό τηλέφωνο είναι υποχρεωτικό"
    }
    if (!formData.username.trim()) {
      newErrors.username = "Το username είναι υποχρεωτικό"
    }
    if (!formData.password.trim()) {
      newErrors.password = "Ο κωδικός πρόσβασης είναι υποχρεωτικός"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      code: generateEmployeeCode(employees),
      firstName: "",
      lastName: "",
      address: "",
      postalCode: "",
      area: "",
      mobile: "",
      phone: "",
      homePhone: "",
      email: "",
      username: "",
      password: "",
      role: "employee",
      comments: "",
      imageUrl: "",
    })
    setErrors({})
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const newEmployee: Employee = {
      id: Date.now().toString(),
      code: formData.code,
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      postalCode: formData.postalCode,
      area: formData.area,
      mobile: formData.mobile,
      phone: formData.phone,
      homePhone: formData.homePhone,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      role: formData.role,
      comments: formData.comments,
      imageUrl: formData.imageUrl || "/placeholder.svg?height=100&width=100",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setEmployees([...employees, newEmployee])
    resetForm()
    setActiveTab("list")
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      code: employee.code,
      firstName: employee.firstName,
      lastName: employee.lastName,
      address: employee.address,
      postalCode: employee.postalCode,
      area: employee.area,
      mobile: employee.mobile,
      phone: employee.phone,
      homePhone: employee.homePhone,
      email: employee.email,
      username: employee.username,
      password: employee.password,
      role: employee.role,
      comments: employee.comments,
      imageUrl: employee.imageUrl,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!validateForm() || !editingEmployee) return

    setEmployees(
      employees.map((employee) =>
        employee.id === editingEmployee.id
          ? {
              ...employee,
              code: formData.code,
              firstName: formData.firstName,
              lastName: formData.lastName,
              address: formData.address,
              postalCode: formData.postalCode,
              area: formData.area,
              mobile: formData.mobile,
              phone: formData.phone,
              homePhone: formData.homePhone,
              email: formData.email,
              username: formData.username,
              password: formData.password,
              role: formData.role,
              comments: formData.comments,
              imageUrl: formData.imageUrl,
            }
          : employee,
      ),
    )

    resetForm()
    setIsEditDialogOpen(false)
    setEditingEmployee(null)
  }

  const handleDelete = (employeeId: string) => {
    setEmployees(employees.filter((employee) => employee.id !== employeeId))
  }

  const handleView = (employee: Employee) => {
    setViewingEmployee(employee)
    setIsViewDialogOpen(true)
  }

  const filteredEmployees = employees.filter(
    (employee) =>
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.mobile.includes(searchTerm) ||
      employee.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenMaps = (employee: Employee) => {
    setSelectedEmployeeForMaps(employee)
    setIsMapsDialogOpen(true)
  }

  if (userRole !== "admin") {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Περιορισμένη Πρόσβαση</h3>
          <p className="text-gray-600">Η διαχείριση υπαλλήλων είναι διαθέσιμη μόνο για διαχειριστές.</p>
        </CardContent>
      </Card>
    )
  }

  const handleChangePassword = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Ο τρέχων κωδικός είναι υποχρεωτικός"
    } else if (editingEmployee && passwordData.currentPassword !== editingEmployee.password) {
      newErrors.currentPassword = "Λάθος τρέχων κωδικός"
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "Ο νέος κωδικός είναι υποχρεωτικός"
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες"
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Οι κωδικοί δεν ταιριάζουν"
    }

    setPasswordErrors(newErrors)

    if (Object.keys(newErrors).length === 0 && editingEmployee) {
      setEmployees(
        employees.map((employee) =>
          employee.id === editingEmployee.id ? { ...employee, password: passwordData.newPassword } : employee,
        ),
      )
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setIsChangePasswordOpen(false)
      setPasswordErrors({})
    }
  }

  const resetPasswordForm = () => {
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setPasswordErrors({})
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Διαχείριση Υπαλλήλων
              </CardTitle>
              <CardDescription>Διαχείριση στοιχείων προσωπικού κρεοπωλείου</CardDescription>
            </div>
            <div className="flex gap-2">
              <PrintUtils title="Λίστα Υπαλλήλων" data={employees} type="employee" />
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  resetForm()
                  setActiveTab("add")
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Νέος Υπάλληλος
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Λίστα Υπαλλήλων</TabsTrigger>
              <TabsTrigger value="add">Νέος Υπάλληλος</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div>
                <Label htmlFor="search">Αναζήτηση Υπαλλήλου</Label>
                <Input
                  id="search"
                  placeholder="Αναζήτηση με ονοματεπώνυμο, κινητό ή κωδικό..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Κωδικός</TableHead>
                      <TableHead>Φωτογραφία</TableHead>
                      <TableHead>Ονοματεπώνυμο</TableHead>
                      <TableHead>Διεύθυνση</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Ρόλος</TableHead>
                      <TableHead>Κινητό</TableHead>
                      <TableHead>Ενέργειες</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Δεν βρέθηκαν υπάλληλοι
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <Badge variant="outline">{employee.code}</Badge>
                          </TableCell>
                          <TableCell>
                            <img
                              src={employee.imageUrl || "/placeholder.svg"}
                              alt={`${employee.firstName} ${employee.lastName}`}
                              className="w-12 h-12 object-cover rounded-full border"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </TableCell>
                          <TableCell className="text-sm">
                            {employee.address}, {employee.area}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{employee.username}</TableCell>
                          <TableCell>
                            <Badge variant={employee.role === "admin" ? "default" : "secondary"}>
                              {employee.role === "admin" ? "Διαχειριστής" : "Υπάλληλος"}
                            </Badge>
                          </TableCell>
                          <TableCell>{employee.mobile}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleView(employee)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(employee)}>
                                <Edit className="h-4 w-4" />
                              </Button>
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
                                      Είστε σίγουροι ότι θέλετε να διαγράψετε τον υπάλληλο "{employee.firstName}{" "}
                                      {employee.lastName}"; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(employee.id)}
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

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Σύνολο υπαλλήλων: <span className="font-semibold">{employees.length}</span>
                  {searchTerm && (
                    <>
                      {" | "}Αποτελέσματα αναζήτησης: <span className="font-semibold">{filteredEmployees.length}</span>
                    </>
                  )}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Εισαγωγή Νέου Υπαλλήλου</CardTitle>
                  <CardDescription>Συμπληρώστε τα στοιχεία του νέου υπαλλήλου</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employee-code">Κωδικός Υπαλλήλου *</Label>
                      <Input
                        id="employee-code"
                        placeholder="EMP_001, EMP_002..."
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className={errors.code ? "border-red-500" : ""}
                      />
                      {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                    </div>
                    <div>
                      <Label htmlFor="role">Ρόλος Υπαλλήλου *</Label>
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "employee" })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="employee">Υπάλληλος</option>
                        <option value="admin">Διαχειριστής</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="first-name">Όνομα Υπαλλήλου</Label>
                      <Input
                        id="first-name"
                        placeholder="Όνομα"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last-name">Επώνυμο Υπαλλήλου *</Label>
                      <Input
                        id="last-name"
                        placeholder="Επώνυμο"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>

                    <div className="md:col-span-2 grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <Label htmlFor="address">Διεύθυνση Υπαλλήλου</Label>
                        <Input
                          id="address"
                          placeholder="Διεύθυνση κατοικίας"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
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
                        <Label htmlFor="area">Περιοχή</Label>
                        <Input
                          id="area"
                          placeholder="Περιοχή"
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
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
                              const address = `${formData.address}, ${formData.area}, ${formData.postalCode}`
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

                    <div className="grid grid-cols-12 gap-2 col-span-2">
                      <div className="col-span-4">
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
                      <div className="col-span-4">
                        <Label htmlFor="home-phone">Τηλέφωνο Σπιτιού</Label>
                        <Input
                          id="home-phone"
                          placeholder="Τηλέφωνο σπιτιού"
                          value={formData.homePhone}
                          onChange={(e) => setFormData({ ...formData, homePhone: e.target.value })}
                        />
                      </div>
                      <div className="col-span-4">
                        <Label htmlFor="email">E-mail Υπαλλήλου</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Διεύθυνση email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        placeholder="Όνομα χρήστη για σύνδεση"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className={errors.username ? "border-red-500" : ""}
                      />
                      {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                    </div>
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Κωδικός πρόσβασης"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={errors.password ? "border-red-500" : ""}
                      />
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="comments">Σχόλια Υπαλλήλου</Label>
                      <Textarea
                        id="comments"
                        placeholder="Ωράριο, ημέρες εργασίας, ιδιαιτερότητες κλπ"
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="image">URL Φωτογραφίας</Label>
                      <Input
                        id="image"
                        placeholder="https://example.com/photo.jpg"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSubmit} className="flex-1">
                      Αποθήκευση Υπαλλήλου
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Στοιχεία Υπαλλήλου
            </DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={viewingEmployee.imageUrl || "/placeholder.svg"}
                  alt={`${viewingEmployee.firstName} ${viewingEmployee.lastName}`}
                  className="w-24 h-24 object-cover rounded-full border"
                />
                <div className="flex-1 space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Κωδικός</Label>
                    <p className="font-medium">{viewingEmployee.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Ονοματεπώνυμο</Label>
                    <p className="font-medium text-lg">
                      {viewingEmployee.firstName} {viewingEmployee.lastName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Διεύθυνση</Label>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {viewingEmployee.address}, {viewingEmployee.area} {viewingEmployee.postalCode}
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => handleOpenMaps(viewingEmployee)}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Maps
                    </Button>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Κινητό Τηλέφωνο</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {viewingEmployee.mobile}
                    </p>
                  </div>

                  {viewingEmployee.homePhone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Τηλέφωνο Σπιτιού</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {viewingEmployee.homePhone}
                      </p>
                    </div>
                  )}

                  {viewingEmployee.email && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {viewingEmployee.email}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Ρόλος</Label>
                    <p className="font-medium">
                      <Badge variant={viewingEmployee.role === "admin" ? "default" : "secondary"}>
                        {viewingEmployee.role === "admin" ? "Διαχειριστής" : "Υπάλληλος"}
                      </Badge>
                    </p>
                  </div>
                </div>

                {viewingEmployee.comments && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Σχόλια</Label>
                    <p className="font-medium">{viewingEmployee.comments}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-500">Ημερομηνία Πρόσληψης</Label>
                  <p className="font-medium">{new Date(viewingEmployee.createdAt).toLocaleDateString("el-GR")}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsViewDialogOpen(false)} className="flex-1">
                  Κλείσιμο
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEdit(viewingEmployee)
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

      {/* Maps Dialog */}
      <Dialog open={isMapsDialogOpen} onOpenChange={setIsMapsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Πληροφορίες Τοποθεσίας</DialogTitle>
          </DialogHeader>
          {selectedEmployeeForMaps && (
            <GoogleMapsIntegration
              customerAddress={`${selectedEmployeeForMaps.address}, ${selectedEmployeeForMaps.area}, ${selectedEmployeeForMaps.postalCode}`}
              customerName={`${selectedEmployeeForMaps.firstName} ${selectedEmployeeForMaps.lastName}`}
              onClose={() => setIsMapsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Επεξεργασία Στοιχείων Υπαλλήλου</DialogTitle>
            <DialogDescription>Επεξεργαστείτε τα στοιχεία του υπαλλήλου</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-employee-code">Κωδικός Υπαλλήλου *</Label>
                <Input
                  id="edit-employee-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>
              <div>
                <Label htmlFor="edit-role">Ρόλος Υπαλλήλου *</Label>
                <select
                  id="edit-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "employee" })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="employee">Υπάλληλος</option>
                  <option value="admin">Διαχειριστής</option>
                </select>
              </div>

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
                  <Label htmlFor="edit-address">Διεύθυνση</Label>
                  <Input
                    id="edit-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
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
                  <Label htmlFor="edit-area">Περιοχή</Label>
                  <Input
                    id="edit-area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
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
                        const address = `${formData.address}, ${formData.area}, ${formData.postalCode}`
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

              <div className="grid grid-cols-12 gap-2 col-span-2">
                <div className="col-span-4">
                  <Label htmlFor="edit-mobile">Κινητό Τηλέφωνο *</Label>
                  <Input
                    id="edit-mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className={errors.mobile ? "border-red-500" : ""}
                  />
                  {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                </div>
                <div className="col-span-4">
                  <Label htmlFor="edit-home-phone">Τηλέφωνο Σπιτιού</Label>
                  <Input
                    id="edit-home-phone"
                    value={formData.homePhone}
                    onChange={(e) => setFormData({ ...formData, homePhone: e.target.value })}
                  />
                </div>
                <div className="col-span-4">
                  <Label htmlFor="edit-email">E-mail</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-username">Username *</Label>
                <Input
                  id="edit-username"
                  placeholder="Όνομα χρήστη για σύνδεση"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>
              <div>
                <Label htmlFor="edit-password">Password *</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Κωδικός πρόσβασης"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="md:col-span-2">
                <Label>Αλλαγή Κωδικού Πρόσβασης</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    resetPasswordForm()
                    setIsChangePasswordOpen(true)
                  }}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Αλλαγή Κωδικού
                </Button>
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

              <div className="md:col-span-2">
                <Label htmlFor="edit-image">URL Φωτογραφίας</Label>
                <Input
                  id="edit-image"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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
              <Button variant="secondary" onClick={() => setIsChangePasswordOpen(true)} className="flex-1">
                Αλλαγή Κωδικού
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Αλλαγή Κωδικού Πρόσβασης
            </DialogTitle>
            <DialogDescription>Αλλάξτε τον κωδικό πρόσβασης του υπαλλήλου</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Τρέχων Κωδικός *</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Εισάγετε τον τρέχοντα κωδικό"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className={passwordErrors.currentPassword ? "border-red-500" : ""}
              />
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="new-password">Νέος Κωδικός *</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Εισάγετε τον νέο κωδικό"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className={passwordErrors.newPassword ? "border-red-500" : ""}
              />
              {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>}
            </div>

            <div>
              <Label htmlFor="confirm-password">Επιβεβαίωση Νέου Κωδικού *</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Επιβεβαιώστε τον νέο κωδικό"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className={passwordErrors.confirmPassword ? "border-red-500" : ""}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleChangePassword} className="flex-1">
                Αλλαγή Κωδικού
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsChangePasswordOpen(false)
                  resetPasswordForm()
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

export { EmployeeManagement }
