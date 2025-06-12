"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Plus, Edit, Trash2, Ruler } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UnitsManagementProps {
  userRole: "admin" | "employee" | null
}

interface Unit {
  id: string
  code: string
  name: string
  symbol: string
  createdAt: string
}

export function UnitsManagement({ userRole }: UnitsManagementProps) {
  const [units, setUnits] = useState<Unit[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load units from localStorage on component mount
  useEffect(() => {
    try {
      const savedUnits = localStorage.getItem("units")
      if (savedUnits) {
        setUnits(JSON.parse(savedUnits))
      } else {
        const initialUnits = [
          { id: "1", code: "UNIT_001", name: "Κιλά", symbol: "kg", createdAt: "2024-01-15" },
          { id: "2", code: "UNIT_002", name: "Τεμάχια", symbol: "τεμ.", createdAt: "2024-01-15" },
          { id: "3", code: "UNIT_003", name: "Λίτρα", symbol: "lt", createdAt: "2024-01-15" },
          { id: "4", code: "UNIT_004", name: "Γραμμάρια", symbol: "gr", createdAt: "2024-01-15" },
        ]
        setUnits(initialUnits)
        localStorage.setItem("units", JSON.stringify(initialUnits))
      }
    } catch (error) {
      console.error("Error loading units from localStorage:", error)
    }
  }, [])

  // Save units to localStorage whenever units state changes
  useEffect(() => {
    if (units.length > 0) {
      try {
        localStorage.setItem("units", JSON.stringify(units))
      } catch (error) {
        console.error("Error saving units to localStorage:", error)
      }
    }
  }, [units])

  // Δημιουργία μοναδικού κωδικού μονάδας
  const generateUnitCode = () => {
    const existingCodes = units.map((u) => u.code).filter((code) => code.startsWith("UNIT_"))
    const numbers = existingCodes.map((code) => {
      const num = Number.parseInt(code.replace("UNIT_", ""))
      return isNaN(num) ? 0 : num
    })
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
    return `UNIT_${String(maxNumber + 1).padStart(3, "0")}`
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Ο κωδικός μονάδας είναι υποχρεωτικός"
    }
    if (!formData.name.trim()) {
      newErrors.name = "Το είδος μονάδας μέτρησης είναι υποχρεωτικό"
    }
    if (!formData.symbol.trim()) {
      newErrors.symbol = "Το σύμβολο μονάδας είναι υποχρεωτικό"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      code: generateUnitCode(),
      name: "",
      symbol: "",
    })
    setErrors({})
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const newUnit: Unit = {
      id: Date.now().toString(),
      code: formData.code,
      name: formData.name,
      symbol: formData.symbol,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setUnits([...units, newUnit])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormData({
      code: unit.code,
      name: unit.name,
      symbol: unit.symbol,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!validateForm() || !editingUnit) return

    setUnits(
      units.map((unit) =>
        unit.id === editingUnit.id
          ? { ...unit, code: formData.code, name: formData.name, symbol: formData.symbol }
          : unit,
      ),
    )

    resetForm()
    setIsEditDialogOpen(false)
    setEditingUnit(null)
  }

  const handleDelete = (unitId: string) => {
    setUnits(units.filter((unit) => unit.id !== unitId))
  }

  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Μονάδες Μέτρησης Προϊόντων
              </CardTitle>
              <CardDescription>Διαχείριση μονάδων μέτρησης (Κιλά, Τεμάχια, Λίτρα κ.λπ.)</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Νέα Μονάδα
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Εισαγωγή Νέας Μονάδας Μέτρησης</DialogTitle>
                  <DialogDescription>Προσθέστε μια νέα μονάδα μέτρησης για τα προϊόντα</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="unit-code">Κωδικός Μονάδας *</Label>
                    <Input
                      id="unit-code"
                      placeholder="UNIT_001, UNIT_002..."
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className={errors.code ? "border-red-500" : ""}
                    />
                    {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                  </div>
                  <div>
                    <Label htmlFor="unit-name">Είδος Μονάδας Μέτρησης *</Label>
                    <Input
                      id="unit-name"
                      placeholder="π.χ. Κιλά, Τεμάχια, Λίτρα"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="unit-symbol">Σύμβολο Μονάδας *</Label>
                    <Input
                      id="unit-symbol"
                      placeholder="π.χ. kg, τεμ., lt, gr"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      className={errors.symbol ? "border-red-500" : ""}
                    />
                    {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSubmit} className="flex-1">
                      Αποθήκευση
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                      Ακύρωση
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Αναζήτηση */}
          <div>
            <Label htmlFor="search">Αναζήτηση Μονάδας</Label>
            <Input
              id="search"
              placeholder="Αναζήτηση με βάση το όνομα, κωδικό ή σύμβολο..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Λίστα Μονάδων */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Κωδικός</TableHead>
                  <TableHead>Είδος Μονάδας</TableHead>
                  <TableHead>Σύμβολο</TableHead>
                  <TableHead>Ημερομηνία Δημιουργίας</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Δεν βρέθηκαν μονάδες μέτρησης
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>
                        <Badge variant="outline">{unit.code}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{unit.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{unit.symbol}</Badge>
                      </TableCell>
                      <TableCell>{new Date(unit.createdAt).toLocaleDateString("el-GR")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(unit)}>
                            <Edit className="h-4 w-4" />
                          </Button>

                          {userRole === "admin" && (
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
                                    Είστε σίγουροι ότι θέλετε να διαγράψετε τη μονάδα μέτρησης "{unit.name}"; Αυτή η
                                    ενέργεια δεν μπορεί να αναιρεθεί.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(unit.id)}
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
            <p className="text-sm text-gray-600">
              Σύνολο μονάδων μέτρησης: <span className="font-semibold">{units.length}</span>
              {searchTerm && (
                <>
                  {" | "}Αποτελέσματα αναζήτησης: <span className="font-semibold">{filteredUnits.length}</span>
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog για επεξεργασία */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Επεξεργασία Μονάδας Μέτρησης</DialogTitle>
            <DialogDescription>Επεξεργαστείτε τα στοιχεία της μονάδας μέτρησης</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-unit-code">Κωδικός Μονάδας *</Label>
              <Input
                id="edit-unit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>
            <div>
              <Label htmlFor="edit-unit-name">Είδος Μονάδας Μέτρησης *</Label>
              <Input
                id="edit-unit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="edit-unit-symbol">Σύμβολο Μονάδας *</Label>
              <Input
                id="edit-unit-symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className={errors.symbol ? "border-red-500" : ""}
              />
              {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
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
    </div>
  )
}
