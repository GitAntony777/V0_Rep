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
import { Plus, Edit, Trash2, Ruler, Search } from "lucide-react"
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

interface Unit {
  id: string
  code: string
  name: string
  symbol: string
  description: string
  isActive: boolean
  productCount: number
  createdAt: string
}

interface UnitsManagementProps {
  userRole?: "admin" | "employee" | null
}

const initialUnits: Unit[] = [
  {
    id: "1",
    code: "UNIT_001",
    name: "Κιλά",
    symbol: "kg",
    description: "Μονάδα μέτρησης βάρους σε κιλά",
    isActive: true,
    productCount: 15,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    code: "UNIT_002",
    name: "Γραμμάρια",
    symbol: "gr",
    description: "Μονάδα μέτρησης βάρους σε γραμμάρια",
    isActive: true,
    productCount: 5,
    createdAt: "2024-01-01",
  },
  {
    id: "3",
    code: "UNIT_003",
    name: "Τεμάχια",
    symbol: "τεμ",
    description: "Μονάδα μέτρησης σε τεμάχια",
    isActive: true,
    productCount: 8,
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    code: "UNIT_004",
    name: "Μερίδες",
    symbol: "μερ",
    description: "Μονάδα μέτρησης σε μερίδες",
    isActive: true,
    productCount: 3,
    createdAt: "2024-01-01",
  },
  {
    id: "5",
    code: "UNIT_005",
    name: "Λίτρα",
    symbol: "lt",
    description: "Μονάδα μέτρησης όγκου σε λίτρα",
    isActive: false,
    productCount: 0,
    createdAt: "2024-01-01",
  },
]

// Δημιουργία μοναδικού κωδικού μονάδας
const generateUnitCode = (units: Unit[]) => {
  const existingCodes = units.map((u) => u.code).filter((code) => code.startsWith("UNIT_"))
  const numbers = existingCodes.map((code) => {
    const num = Number.parseInt(code.replace("UNIT_", ""))
    return isNaN(num) ? 0 : num
  })
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
  return `UNIT_${String(maxNumber + 1).padStart(3, "0")}`
}

export function UnitsManagement({ userRole }: UnitsManagementProps) {
  const [units, setUnits] = useState<Unit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    description: "",
    isActive: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Φόρτωση μονάδων από localStorage
  useEffect(() => {
    try {
      const savedUnits = localStorage.getItem("units")
      if (savedUnits) {
        const parsedUnits = JSON.parse(savedUnits)
        setUnits(parsedUnits)
      } else {
        setUnits(initialUnits)
        localStorage.setItem("units", JSON.stringify(initialUnits))
      }
    } catch (error) {
      console.error("Error loading units:", error)
      setUnits(initialUnits)
    }
  }, [])

  // Αποθήκευση μονάδων στο localStorage
  const saveUnits = (updatedUnits: Unit[]) => {
    setUnits(updatedUnits)
    try {
      localStorage.setItem("units", JSON.stringify(updatedUnits))
    } catch (error) {
      console.error("Error saving units:", error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Ο κωδικός μονάδας είναι υποχρεωτικός"
    } else {
      // Έλεγχος μοναδικότητας κωδικού
      const existingUnit = units.find((u) => u.code === formData.code && (!editingUnit || u.id !== editingUnit.id))
      if (existingUnit) {
        newErrors.code = "Ο κωδικός μονάδας υπάρχει ήδη"
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = "Το όνομα μονάδας είναι υποχρεωτικό"
    } else {
      // Έλεγχος μοναδικότητας ονόματος
      const existingUnit = units.find(
        (u) => u.name.toLowerCase() === formData.name.toLowerCase() && (!editingUnit || u.id !== editingUnit.id),
      )
      if (existingUnit) {
        newErrors.name = "Το όνομα μονάδας υπάρχει ήδη"
      }
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = "Το σύμβολο μονάδας είναι υποχρεωτικό"
    } else {
      // Έλεγχος μοναδικότητας συμβόλου
      const existingUnit = units.find(
        (u) => u.symbol.toLowerCase() === formData.symbol.toLowerCase() && (!editingUnit || u.id !== editingUnit.id),
      )
      if (existingUnit) {
        newErrors.symbol = "Το σύμβολο μονάδας υπάρχει ήδη"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      code: generateUnitCode(units),
      name: "",
      symbol: "",
      description: "",
      isActive: true,
    })
    setErrors({})
  }

  const handleAddUnit = () => {
    if (!validateForm()) return

    const newUnit: Unit = {
      id: Date.now().toString(),
      code: formData.code.trim(),
      name: formData.name.trim(),
      symbol: formData.symbol.trim(),
      description: formData.description.trim(),
      isActive: formData.isActive,
      productCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    saveUnits([...units, newUnit])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormData({
      code: unit.code,
      name: unit.name,
      symbol: unit.symbol,
      description: unit.description,
      isActive: unit.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateUnit = () => {
    if (!editingUnit || !validateForm()) return

    const updatedUnit = {
      ...editingUnit,
      code: formData.code.trim(),
      name: formData.name.trim(),
      symbol: formData.symbol.trim(),
      description: formData.description.trim(),
      isActive: formData.isActive,
    }

    const updatedUnits = units.map((unit) => (unit.id === editingUnit.id ? updatedUnit : unit))

    saveUnits(updatedUnits)
    resetForm()
    setIsEditDialogOpen(false)
    setEditingUnit(null)
  }

  const handleDeleteUnit = (unitId: string) => {
    const updatedUnits = units.filter((unit) => unit.id !== unitId)
    saveUnits(updatedUnits)
  }

  const toggleUnitStatus = (unitId: string) => {
    const updatedUnits = units.map((unit) => (unit.id === unitId ? { ...unit, isActive: !unit.isActive } : unit))
    saveUnits(updatedUnits)
  }

  // Φιλτράρισμα μονάδων
  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Διαχείριση Μονάδων Μέτρησης</h1>
          <p className="text-gray-600 mt-2">Διαχειριστείτε τις μονάδες μέτρησης προϊόντων</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Νέα Μονάδα
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Προσθήκη Νέας Μονάδας</DialogTitle>
              <DialogDescription>Εισάγετε τα στοιχεία της νέας μονάδας μέτρησης</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Κωδικός Μονάδας *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="UNIT_001, UNIT_002..."
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Όνομα Μονάδας *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="π.χ. Κιλά, Τεμάχια..."
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="symbol">Σύμβολο *</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder="π.χ. kg, τεμ..."
                    className={errors.symbol ? "border-red-500" : ""}
                  />
                  {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Περιγραφή</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Περιγραφή της μονάδας μέτρησης"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddUnit} className="flex-1">
                  Προσθήκη Μονάδας
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
            Αναζήτηση Μονάδων
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Αναζήτηση με όνομα, κωδικό, σύμβολο ή περιγραφή..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Λίστα Μονάδων */}
      <Card>
        <CardHeader>
          <CardTitle>Λίστα Μονάδων Μέτρησης ({filteredUnits.length})</CardTitle>
          <CardDescription>Όλες οι καταχωρημένες μονάδες μέτρησης</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Κωδικός</TableHead>
                  <TableHead>Μονάδα</TableHead>
                  <TableHead>Σύμβολο</TableHead>
                  <TableHead>Περιγραφή</TableHead>
                  <TableHead>Προϊόντα</TableHead>
                  <TableHead>Κατάσταση</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "Δεν βρέθηκαν μονάδες" : "Δεν υπάρχουν καταχωρημένες μονάδες"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>
                        <Badge variant="outline">{unit.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{unit.name}</div>
                            <div className="text-sm text-gray-500">
                              Δημιουργήθηκε: {new Date(unit.createdAt).toLocaleDateString("el-GR")}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{unit.symbol}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="truncate max-w-xs">{unit.description || "-"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{unit.productCount} προϊόντα</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={unit.isActive ? "default" : "secondary"}>
                          {unit.isActive ? "Ενεργή" : "Ανενεργή"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUnitStatus(unit.id)}
                            className={
                              unit.isActive
                                ? "text-orange-600 hover:text-orange-700"
                                : "text-green-600 hover:text-green-700"
                            }
                          >
                            {unit.isActive ? "Απενεργοποίηση" : "Ενεργοποίηση"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditUnit(unit)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                                disabled={unit.productCount > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Επιβεβαίωση Διαγραφής</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Είστε σίγουροι ότι θέλετε να διαγράψετε τη μονάδα "{unit.name}"; Αυτή η ενέργεια δεν
                                  μπορεί να αναιρεθεί.
                                  {unit.productCount > 0 && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                      <strong>Προσοχή:</strong> Αυτή η μονάδα χρησιμοποιείται από {unit.productCount}{" "}
                                      προϊόντα. Δεν μπορεί να διαγραφεί.
                                    </div>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUnit(unit.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={unit.productCount > 0}
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
            <DialogTitle>Επεξεργασία Μονάδας</DialogTitle>
            <DialogDescription>Επεξεργαστείτε τα στοιχεία της μονάδας μέτρησης</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-code">Κωδικός Μονάδας *</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="UNIT_001, UNIT_002..."
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Όνομα Μονάδας *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="π.χ. Κιλά, Τεμάχια..."
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="edit-symbol">Σύμβολο *</Label>
                <Input
                  id="edit-symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  placeholder="π.χ. kg, τεμ..."
                  className={errors.symbol ? "border-red-500" : ""}
                />
                {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Περιγραφή</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Περιγραφή της μονάδας μέτρησης"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateUnit} className="flex-1">
                Ενημέρωση
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingUnit(null)
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
