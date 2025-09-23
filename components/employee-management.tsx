"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, User, Search, Phone, Mail, Calendar } from "lucide-react"
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

interface Employee {
  id: string
  code: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  salary: number
  isActive: boolean
  notes: string
}

interface EmployeeManagementProps {
  userRole?: "admin" | "employee" | null
}

const initialEmployees: Employee[] = [
  {
    id: "1",
    code: "EMP_001",
    firstName: "Γιάννης",
    lastName: "Κωνσταντίνου",
    email: "giannis@example.com",
    phone: "6971234567",
    position: "Διευθυντής",
    department: "Διοίκηση",
    hireDate: "2020-01-15",
    salary: 2500,
    isActive: true,
    notes: "Έμπειρος διευθυντής",
  },
  {
    id: "2",
    code: "EMP_002",
    firstName: "Μαρία",
    lastName: "Δημητρίου",
    email: "maria@example.com",
    phone: "6987654321",
    position: "Υπεύθυνη Πωλήσεων",
    department: "Πωλήσεις",
    hireDate: "2021-03-10",
    salary: 1800,
    isActive: true,
    notes: "Εξαιρετική στις πωλήσεις",
  },
  {
    id: "3",
    code: "EMP_003",
    firstName: "Νίκος",
    lastName: "Παπαδόπουλος",
    email: "nikos@example.com",
    phone: "6912345678",
    position: "Κρεοπώλης",
    department: "Παραγωγή",
    hireDate: "2019-06-20",
    salary: 1600,
    isActive: true,
    notes: "Ειδικός στο κρέας",
  },
  {
    id: "4",
    code: "EMP_004",
    firstName: "Ελένη",
    lastName: "Αντωνίου",
    email: "eleni@example.com",
    phone: "6923456789",
    position: "Ταμίας",
    department: "Πωλήσεις",
    hireDate: "2022-01-05",
    salary: 1400,
    isActive: true,
    notes: "Νέα στην ομάδα",
  },
]

// Δημιουργία μοναδικού κωδικού υπαλλήλου
const generateEmployeeCode = (employees: Employee[]) => {
  const existingCodes = employees.map((e) => e.code).filter((code) => code.startsWith("EMP_"))
  const numbers = existingCodes.map((code) => {
    const num = Number.parseInt(code.replace("EMP_", ""))
    return isNaN(num) ? 0 : num
  })
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
  return `EMP_${String(maxNumber + 1).padStart(3, "0")}`
}

export function EmployeeManagement({ userRole }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    hireDate: "",
    salary: "",
    notes: "",
    isActive: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const departments = ["Διοίκηση", "Πωλήσεις", "Παραγωγή", "Λογιστήριο", "Αποθήκη"]
  const positions = ["Διευθυντής", "Υπεύθυνη Πωλήσεων", "Κρεοπώλης", "Ταμίας", "Βοηθός", "Λογιστής"]

  // Φόρτωση υπαλλήλων από localStorage
  useEffect(() => {
    try {
      const savedEmployees = localStorage.getItem("employees")
      if (savedEmployees) {
        const parsedEmployees = JSON.parse(savedEmployees)
        setEmployees(parsedEmployees)
      } else {
        setEmployees(initialEmployees)
        localStorage.setItem("employees", JSON.stringify(initialEmployees))
      }
    } catch (error) {
      console.error("Error loading employees:", error)
      setEmployees(initialEmployees)
    }
  }, [])

  // Αποθήκευση υπαλλήλων στο localStorage
  const saveEmployees = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees)
    try {
      localStorage.setItem("employees", JSON.stringify(updatedEmployees))
    } catch (error) {
      console.error("Error saving employees:", error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Ο κωδικός υπαλλήλου είναι υποχρεωτικός"
    } else {
      // Έλεγχος μοναδικότητας κωδικού
      const existingEmployee = employees.find(
        (e) => e.code === formData.code && (!editingEmployee || e.id !== editingEmployee.id),
      )
      if (existingEmployee) {
        newErrors.code = "Ο κωδικός υπαλλήλου υπάρχει ήδη"
      }
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Το όνομα είναι υποχρεωτικό"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Το επώνυμο είναι υποχρεωτικό"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Το email είναι υποχρεωτικό"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Το email δεν είναι έγκυρο"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Το τηλέφωνο είναι υποχρεωτικό"
    }
    if (!formData.position) {
      newErrors.position = "Η θέση είναι υποχρεωτική"
    }
    if (!formData.department) {
      newErrors.department = "Το τμήμα είναι υποχρεωτικό"
    }
    if (!formData.hireDate) {
      newErrors.hireDate = "Η ημερομηνία πρόσληψης είναι υποχρεωτική"
    }
    if (!formData.salary) {
      newErrors.salary = "Ο μισθός είναι υποχρεωτικός"
    } else {
      const salary = Number.parseFloat(formData.salary)
      if (isNaN(salary) || salary < 0) {
        newErrors.salary = "Παρακαλώ εισάγετε έγκυρο μισθό"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      code: generateEmployeeCode(employees),
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      hireDate: "",
      salary: "",
      notes: "",
      isActive: true,
    })
    setErrors({})
  }

  const handleAddEmployee = () => {
    if (!validateForm()) return

    const newEmployee: Employee = {
      id: Date.now().toString(),
      code: formData.code.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      position: formData.position,
      department: formData.department,
      hireDate: formData.hireDate,
      salary: Number.parseFloat(formData.salary),
      notes: formData.notes.trim(),
      isActive: formData.isActive,
    }

    saveEmployees([...employees, newEmployee])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      code: employee.code,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      hireDate: employee.hireDate,
      salary: employee.salary.toString(),
      notes: employee.notes,
      isActive: employee.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateEmployee = () => {
    if (!editingEmployee || !validateForm()) return

    const updatedEmployee = {
      ...editingEmployee,
      code: formData.code.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      position: formData.position,
      department: formData.department,
      hireDate: formData.hireDate,
      salary: Number.parseFloat(formData.salary),
      notes: formData.notes.trim(),
      isActive: formData.isActive,
    }

    const updatedEmployees = employees.map((employee) =>
      employee.id === editingEmployee.id ? updatedEmployee : employee,
    )

    saveEmployees(updatedEmployees)
    resetForm()
    setIsEditDialogOpen(false)
    setEditingEmployee(null)
  }

  const handleDeleteEmployee = (employeeId: string) => {
    const updatedEmployees = employees.filter((employee) => employee.id !== employeeId)
    saveEmployees(updatedEmployees)
  }

  const toggleEmployeeStatus = (employeeId: string) => {
    const updatedEmployees = employees.map((employee) =>
      employee.id === employeeId ? { ...employee, isActive: !employee.isActive } : employee,
    )
    saveEmployees(updatedEmployees)
  }

  // Φιλτράρισμα υπαλλήλων
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.includes(searchTerm)

    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter

    return matchesSearch && matchesDepartment
  })

  if (userRole !== "admin") {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Δεν έχετε δικαίωμα πρόσβασης</h3>
          <p className="mt-1 text-sm text-gray-500">Μόνο οι διαχειριστές μπορούν να διαχειριστούν τους υπαλλήλους.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Διαχείριση Υπαλλήλων</h1>
          <p className="text-gray-600 mt-2">Διαχειριστείτε το προσωπικό σας</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Νέος Υπάλληλος
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Προσθήκη Νέου Υπαλλήλου</DialogTitle>
              <DialogDescription>Εισάγετε τα στοιχεία του νέου υπαλλήλου</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <Label htmlFor="code">Κωδικός Υπαλλήλου *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="EMP_001, EMP_002..."
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Θέση *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger className={errors.position ? "border-red-500" : ""}>
                      <SelectValue placeholder="Επιλέξτε θέση" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                </div>
                <div>
                  <Label htmlFor="department">Τμήμα *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                      <SelectValue placeholder="Επιλέξτε τμήμα" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hireDate">Ημερομηνία Πρόσληψης *</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    className={errors.hireDate ? "border-red-500" : ""}
                  />
                  {errors.hireDate && <p className="text-red-500 text-sm mt-1">{errors.hireDate}</p>}
                </div>
                <div>
                  <Label htmlFor="salary">Μισθός (€) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    min="0"
                    step="50"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="1500"
                    className={errors.salary ? "border-red-500" : ""}
                  />
                  {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Σημειώσεις</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Σημειώσεις για τον υπάλληλο"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddEmployee} className="flex-1">
                  Προσθήκη Υπαλλήλου
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Ακύρωση
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Φίλτρα */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Αναζήτηση & Φίλτρα
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Αναζήτηση υπαλλήλων..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Όλα τα τμήματα</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Λίστα Υπαλλήλων */}
      <Card>
        <CardHeader>
          <CardTitle>Λίστα Υπαλλήλων ({filteredEmployees.length})</CardTitle>
          <CardDescription>Όλοι οι καταχωρημένοι υπάλληλοι</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Κωδικός</TableHead>
                  <TableHead>Υπάλληλος</TableHead>
                  <TableHead>Θέση</TableHead>
                  <TableHead>Τμήμα</TableHead>
                  <TableHead>Επικοινωνία</TableHead>
                  <TableHead>Μισθός</TableHead>
                  <TableHead>Κατάσταση</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm || departmentFilter !== "all"
                        ? "Δεν βρέθηκαν υπάλληλοι"
                        : "Δεν υπάρχουν καταχωρημένοι υπάλληλοι"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Badge variant="outline">{employee.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Από {new Date(employee.hireDate).toLocaleDateString("el-GR")}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{employee.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {employee.phone}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>€{employee.salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={employee.isActive ? "default" : "secondary"}>
                          {employee.isActive ? "Ενεργός" : "Ανενεργός"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEmployeeStatus(employee.id)}
                            className={
                              employee.isActive
                                ? "text-orange-600 hover:text-orange-700"
                                : "text-green-600 hover:text-green-700"
                            }
                          >
                            {employee.isActive ? "Απενεργοποίηση" : "Ενεργοποίηση"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditEmployee(employee)}>
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
                                  Είστε σίγουροι ότι θέλετε να διαγράψετε τον υπάλληλο "{employee.firstName}{" "}
                                  {employee.lastName}"; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEmployee(employee.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Επεξεργασία Υπαλλήλου</DialogTitle>
            <DialogDescription>Επεξεργαστείτε τα στοιχεία του υπαλλήλου</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label htmlFor="edit-code">Κωδικός Υπαλλήλου *</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="EMP_001, EMP_002..."
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-position">Θέση *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger className={errors.position ? "border-red-500" : ""}>
                    <SelectValue placeholder="Επιλέξτε θέση" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
              </div>
              <div>
                <Label htmlFor="edit-department">Τμήμα *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                    <SelectValue placeholder="Επιλέξτε τμήμα" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-hireDate">Ημερομηνία Πρόσληψης *</Label>
                <Input
                  id="edit-hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  className={errors.hireDate ? "border-red-500" : ""}
                />
                {errors.hireDate && <p className="text-red-500 text-sm mt-1">{errors.hireDate}</p>}
              </div>
              <div>
                <Label htmlFor="edit-salary">Μισθός (€) *</Label>
                <Input
                  id="edit-salary"
                  type="number"
                  min="0"
                  step="50"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="1500"
                  className={errors.salary ? "border-red-500" : ""}
                />
                {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Σημειώσεις</Label>
              <Input
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Σημειώσεις για τον υπάλληλο"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateEmployee} className="flex-1">
                Ενημέρωση
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingEmployee(null)
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
