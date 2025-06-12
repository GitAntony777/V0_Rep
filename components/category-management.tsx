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
import { Plus, Edit, Trash2, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CategoryManagementProps {
  userRole: "admin" | "employee" | null
}

interface Category {
  id: string
  code: string
  name: string
  productCount: number
  createdAt: string
}

export function CategoryManagement({ userRole }: CategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load categories from localStorage on component mount
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem("categories")
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories))
      } else {
        const initialCategories = [
          { id: "1", code: "CATEG_001", name: "Αρνί", productCount: 12, createdAt: "2024-01-15" },
          { id: "2", code: "CATEG_002", name: "Χοιρινό", productCount: 8, createdAt: "2024-01-15" },
          { id: "3", code: "CATEG_003", name: "Μοσχάρι", productCount: 6, createdAt: "2024-01-15" },
          { id: "4", code: "CATEG_004", name: "Κοτόπουλο", productCount: 5, createdAt: "2024-01-15" },
          { id: "5", code: "CATEG_005", name: "Παρασκευάσματα", productCount: 14, createdAt: "2024-01-15" },
        ]
        setCategories(initialCategories)
        localStorage.setItem("categories", JSON.stringify(initialCategories))
      }
    } catch (error) {
      console.error("Error loading categories from localStorage:", error)
    }
  }, [])

  // Save categories to localStorage whenever categories state changes
  useEffect(() => {
    if (categories.length > 0) {
      try {
        localStorage.setItem("categories", JSON.stringify(categories))
      } catch (error) {
        console.error("Error saving categories to localStorage:", error)
      }
    }
  }, [categories])

  // Δημιουργία μοναδικού κωδικού κατηγορίας
  const generateCategoryCode = () => {
    const existingCodes = categories.map((c) => c.code).filter((code) => code.startsWith("CATEG_"))
    const numbers = existingCodes.map((code) => {
      const num = Number.parseInt(code.replace("CATEG_", ""))
      return isNaN(num) ? 0 : num
    })
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
    return `CATEG_${String(maxNumber + 1).padStart(3, "0")}`
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Ο κωδικός κατηγορίας είναι υποχρεωτικός"
    }
    if (!formData.name.trim()) {
      newErrors.name = "Η ονομασία κατηγορίας είναι υποχρεωτική"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      code: generateCategoryCode(),
      name: "",
    })
    setErrors({})
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const newCategory: Category = {
      id: Date.now().toString(),
      code: formData.code,
      name: formData.name,
      productCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setCategories([...categories, newCategory])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      code: category.code,
      name: category.name,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!validateForm() || !editingCategory) return

    setCategories(
      categories.map((category) =>
        category.id === editingCategory.id ? { ...category, code: formData.code, name: formData.name } : category,
      ),
    )

    resetForm()
    setIsEditDialogOpen(false)
    setEditingCategory(null)
  }

  const handleDelete = (categoryId: string) => {
    setCategories(categories.filter((category) => category.id !== categoryId))
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Κατηγορίες Προϊόντων
              </CardTitle>
              <CardDescription>Διαχείριση κατηγοριών προϊόντων κρεοπωλείου</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Νέα Κατηγορία
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Εισαγωγή Νέας Κατηγορίας</DialogTitle>
                  <DialogDescription>Προσθέστε μια νέα κατηγορία προϊόντων</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-code">Κωδικός Κατηγορίας *</Label>
                    <Input
                      id="category-code"
                      placeholder="CATEG_001, CATEG_002..."
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className={errors.code ? "border-red-500" : ""}
                    />
                    {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                  </div>
                  <div>
                    <Label htmlFor="category-name">Ονομασία Κατηγορίας *</Label>
                    <Input
                      id="category-name"
                      placeholder="π.χ. Αρνί, Χοιρινό, Μοσχάρι"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
            <Label htmlFor="search">Αναζήτηση Κατηγορίας</Label>
            <Input
              id="search"
              placeholder="Αναζήτηση με βάση το όνομα ή τον κωδικό..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Λίστα Κατηγοριών */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Κωδικός</TableHead>
                  <TableHead>Ονομασία</TableHead>
                  <TableHead>Προϊόντα</TableHead>
                  <TableHead>Ημερομηνία Δημιουργίας</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Δεν βρέθηκαν κατηγορίες
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <Badge variant="outline">{category.code}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.productCount} προϊόντα</Badge>
                      </TableCell>
                      <TableCell>{new Date(category.createdAt).toLocaleDateString("el-GR")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Επεξεργασία Κατηγορίας</DialogTitle>
                                <DialogDescription>Επεξεργαστείτε τα στοιχεία της κατηγορίας</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-category-code">Κωδικός Κατηγορίας *</Label>
                                  <Input
                                    id="edit-category-code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    className={errors.code ? "border-red-500" : ""}
                                  />
                                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                                </div>
                                <div>
                                  <Label htmlFor="edit-category-name">Ονομασία Κατηγορίας *</Label>
                                  <Input
                                    id="edit-category-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={errors.name ? "border-red-500" : ""}
                                  />
                                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleUpdate} className="flex-1">
                                    Ενημέρωση
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(false)}
                                    className="flex-1"
                                  >
                                    Ακύρωση
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

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
                                    Είστε σίγουροι ότι θέλετε να διαγράψετε την κατηγορία "{category.name}"; Αυτή η
                                    ενέργεια θα επηρεάσει {category.productCount} προϊόντα και δεν μπορεί να αναιρεθεί.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(category.id)}
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
              Σύνολο κατηγοριών: <span className="font-semibold">{categories.length}</span>
              {" | "}Σύνολο προϊόντων:{" "}
              <span className="font-semibold">{categories.reduce((sum, cat) => sum + cat.productCount, 0)}</span>
              {searchTerm && (
                <>
                  {" | "}Αποτελέσματα αναζήτησης: <span className="font-semibold">{filteredCategories.length}</span>
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
