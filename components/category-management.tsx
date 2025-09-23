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
import { Plus, Edit, Trash2, Tag, Search } from "lucide-react"
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

interface Category {
  id: string
  code: string
  name: string
  description: string
  isActive: boolean
  productCount: number
  createdAt: string
}

interface CategoryManagementProps {
  userRole?: "admin" | "employee" | null
}

const initialCategories: Category[] = [
  {
    id: "1",
    code: "CAT_001",
    name: "Αρνί",
    description: "Προϊόντα από αρνί",
    isActive: true,
    productCount: 5,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    code: "CAT_002",
    name: "Χοιρινό",
    description: "Προϊόντα από χοιρινό κρέας",
    isActive: true,
    productCount: 3,
    createdAt: "2024-01-01",
  },
  {
    id: "3",
    code: "CAT_003",
    name: "Μοσχάρι",
    description: "Προϊόντα από μοσχαρίσιο κρέας",
    isActive: true,
    productCount: 2,
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    code: "CAT_004",
    name: "Κοτόπουλο",
    description: "Προϊόντα από κοτόπουλο",
    isActive: true,
    productCount: 1,
    createdAt: "2024-01-01",
  },
  {
    id: "5",
    code: "CAT_005",
    name: "Παρασκευάσματα",
    description: "Έτοιμα παρασκευάσματα και ειδικότητες",
    isActive: true,
    productCount: 4,
    createdAt: "2024-01-01",
  },
  {
    id: "6",
    code: "CAT_006",
    name: "Αλλαντικά",
    description: "Λουκάνικα και αλλαντικά",
    isActive: true,
    productCount: 2,
    createdAt: "2024-01-01",
  },
]

// Δημιουργία μοναδικού κωδικού κατηγορίας
const generateCategoryCode = (categories: Category[]) => {
  const existingCodes = categories.map((c) => c.code).filter((code) => code.startsWith("CAT_"))
  const numbers = existingCodes.map((code) => {
    const num = Number.parseInt(code.replace("CAT_", ""))
    return isNaN(num) ? 0 : num
  })
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
  return `CAT_${String(maxNumber + 1).padStart(3, "0")}`
}

export function CategoryManagement({ userRole }: CategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Φόρτωση κατηγοριών από localStorage
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem("categories")
      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories)
        setCategories(parsedCategories)
      } else {
        setCategories(initialCategories)
        localStorage.setItem("categories", JSON.stringify(initialCategories))
      }
    } catch (error) {
      console.error("Error loading categories:", error)
      setCategories(initialCategories)
    }
  }, [])

  // Αποθήκευση κατηγοριών στο localStorage
  const saveCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories)
    try {
      localStorage.setItem("categories", JSON.stringify(updatedCategories))
    } catch (error) {
      console.error("Error saving categories:", error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Ο κωδικός κατηγορίας είναι υποχρεωτικός"
    } else {
      // Έλεγχος μοναδικότητας κωδικού
      const existingCategory = categories.find(
        (c) => c.code === formData.code && (!editingCategory || c.id !== editingCategory.id),
      )
      if (existingCategory) {
        newErrors.code = "Ο κωδικός κατηγορίας υπάρχει ήδη"
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = "Το όνομα κατηγορίας είναι υποχρεωτικό"
    } else {
      // Έλεγχος μοναδικότητας ονόματος
      const existingCategory = categories.find(
        (c) =>
          c.name.toLowerCase() === formData.name.toLowerCase() && (!editingCategory || c.id !== editingCategory.id),
      )
      if (existingCategory) {
        newErrors.name = "Το όνομα κατηγορίας υπάρχει ήδη"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      code: generateCategoryCode(categories),
      name: "",
      description: "",
      isActive: true,
    })
    setErrors({})
  }

  const handleAddCategory = () => {
    if (!validateForm()) return

    const newCategory: Category = {
      id: Date.now().toString(),
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      isActive: formData.isActive,
      productCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    saveCategories([...categories, newCategory])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      code: category.code,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateCategory = () => {
    if (!editingCategory || !validateForm()) return

    const updatedCategory = {
      ...editingCategory,
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      isActive: formData.isActive,
    }

    const updatedCategories = categories.map((category) =>
      category.id === editingCategory.id ? updatedCategory : category,
    )

    saveCategories(updatedCategories)
    resetForm()
    setIsEditDialogOpen(false)
    setEditingCategory(null)
  }

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter((category) => category.id !== categoryId)
    saveCategories(updatedCategories)
  }

  const toggleCategoryStatus = (categoryId: string) => {
    const updatedCategories = categories.map((category) =>
      category.id === categoryId ? { ...category, isActive: !category.isActive } : category,
    )
    saveCategories(updatedCategories)
  }

  // Φιλτράρισμα κατηγοριών
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Διαχείριση Κατηγοριών</h1>
          <p className="text-gray-600 mt-2">Διαχειριστείτε τις κατηγορίες προϊόντων</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Νέα Κατηγορία
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Προσθήκη Νέας Κατηγορίας</DialogTitle>
              <DialogDescription>Εισάγετε τα στοιχεία της νέας κατηγορίας</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Κωδικός Κατηγορίας *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CAT_001, CAT_002..."
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>
              <div>
                <Label htmlFor="name">Όνομα Κατηγορίας *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="π.χ. Αρνί, Χοιρινό..."
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="description">Περιγραφή</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Περιγραφή της κατηγορίας"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCategory} className="flex-1">
                  Προσθήκη Κατηγορίας
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
            Αναζήτηση Κατηγοριών
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Αναζήτηση με όνομα, κωδικό ή περιγραφή..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Λίστα Κατηγοριών */}
      <Card>
        <CardHeader>
          <CardTitle>Λίστα Κατηγοριών ({filteredCategories.length})</CardTitle>
          <CardDescription>Όλες οι καταχωρημένες κατηγορίες προϊόντων</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Κωδικός</TableHead>
                  <TableHead>Κατηγορία</TableHead>
                  <TableHead>Περιγραφή</TableHead>
                  <TableHead>Προϊόντα</TableHead>
                  <TableHead>Κατάσταση</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "Δεν βρέθηκαν κατηγορίες" : "Δεν υπάρχουν καταχωρημένες κατηγορίες"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <Badge variant="outline">{category.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-gray-500">
                              Δημιουργήθηκε: {new Date(category.createdAt).toLocaleDateString("el-GR")}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="truncate max-w-xs">{category.description || "-"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.productCount} προϊόντα</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Ενεργή" : "Ανενεργή"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCategoryStatus(category.id)}
                            className={
                              category.isActive
                                ? "text-orange-600 hover:text-orange-700"
                                : "text-green-600 hover:text-green-700"
                            }
                          >
                            {category.isActive ? "Απενεργοποίηση" : "Ενεργοποίηση"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 bg-transparent"
                                disabled={category.productCount > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Επιβεβαίωση Διαγραφής</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Είστε σίγουροι ότι θέλετε να διαγράψετε την κατηγορία "{category.name}"; Αυτή η
                                  ενέργεια δεν μπορεί να αναιρεθεί.
                                  {category.productCount > 0 && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                      <strong>Προσοχή:</strong> Αυτή η κατηγορία περιέχει {category.productCount}{" "}
                                      προϊόντα. Δεν μπορεί να διαγραφεί.
                                    </div>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={category.productCount > 0}
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
            <DialogTitle>Επεξεργασία Κατηγορίας</DialogTitle>
            <DialogDescription>Επεξεργαστείτε τα στοιχεία της κατηγορίας</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-code">Κωδικός Κατηγορίας *</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="CAT_001, CAT_002..."
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>
            <div>
              <Label htmlFor="edit-name">Όνομα Κατηγορίας *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="π.χ. Αρνί, Χοιρινό..."
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="edit-description">Περιγραφή</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Περιγραφή της κατηγορίας"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateCategory} className="flex-1">
                Ενημέρωση
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingCategory(null)
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
