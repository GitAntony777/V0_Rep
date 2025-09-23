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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Package, Search, Euro } from "lucide-react"
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

interface Product {
  id: string
  code: string
  name: string
  category: string
  unitName: string
  price: number
  description: string
  isActive: boolean
  image?: string
  createdAt: string
}

interface ProductManagementProps {
  userRole?: "admin" | "employee" | null
}

const initialProducts: Product[] = [
  {
    id: "1",
    code: "PROD_001",
    name: "Αρνί Ψητό (ολόκληρο)",
    category: "Αρνί",
    unitName: "Κιλά",
    price: 18.5,
    description: "Φρέσκο αρνί για ψήσιμο",
    isActive: true,
    image: "/images/placeholder.jpg",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    code: "PROD_002",
    name: "Κοκορέτσι",
    category: "Παρασκευάσματα",
    unitName: "Κιλά",
    price: 12.0,
    description: "Παραδοσιακό κοκορέτσι",
    isActive: true,
    image: "/images/kokoreti.jpg",
    createdAt: "2024-01-01",
  },
  {
    id: "3",
    code: "PROD_003",
    name: "Κοντοσούβλι Χοιρινό",
    category: "Χοιρινό",
    unitName: "Κιλά",
    price: 14.8,
    description: "Χοιρινό κοντοσούβλι",
    isActive: true,
    image: "/images/kontosouvli.jpg",
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    code: "PROD_004",
    name: "Μπριζόλες Αρνίσιες",
    category: "Αρνί",
    unitName: "Κιλά",
    price: 16.2,
    description: "Φρέσκες αρνίσιες μπριζόλες",
    isActive: true,
    image: "/images/brizoles.jpg",
    createdAt: "2024-01-01",
  },
  {
    id: "5",
    code: "PROD_005",
    name: "Αρνί Γεμιστό",
    category: "Παρασκευάσματα",
    unitName: "Κιλά",
    price: 19.5,
    description: "Αρνί γεμιστό με ρύζι και μυρωδικά",
    isActive: true,
    image: "/images/placeholder.jpg",
    createdAt: "2024-01-01",
  },
]

// Δημιουργία μοναδικού κωδικού προϊόντος
const generateProductCode = (products: Product[]) => {
  const existingCodes = products.map((p) => p.code).filter((code) => code.startsWith("PROD_"))
  const numbers = existingCodes.map((code) => {
    const num = Number.parseInt(code.replace("PROD_", ""))
    return isNaN(num) ? 0 : num
  })
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
  return `PROD_${String(maxNumber + 1).padStart(3, "0")}`
}

export function ProductManagement({ userRole }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories] = useState<string[]>(["Αρνί", "Χοιρινό", "Μοσχάρι", "Κοτόπουλο", "Παρασκευάσματα", "Αλλαντικά"])
  const [units] = useState<string[]>(["Κιλά", "Γραμμάρια", "Τεμάχια", "Μερίδες"])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    unitName: "",
    price: "",
    description: "",
    isActive: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Φόρτωση προϊόντων από localStorage
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem("products")
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts)
        setProducts(parsedProducts)
      } else {
        setProducts(initialProducts)
        localStorage.setItem("products", JSON.stringify(initialProducts))
      }
    } catch (error) {
      console.error("Error loading products:", error)
      setProducts(initialProducts)
    }
  }, [])

  // Αποθήκευση προϊόντων στο localStorage
  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts)
    try {
      localStorage.setItem("products", JSON.stringify(updatedProducts))
    } catch (error) {
      console.error("Error saving products:", error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Ο κωδικός προϊόντος είναι υποχρεωτικός"
    } else {
      // Έλεγχος μοναδικότητας κωδικού
      const existingProduct = products.find(
        (p) => p.code === formData.code && (!editingProduct || p.id !== editingProduct.id),
      )
      if (existingProduct) {
        newErrors.code = "Ο κωδικός προϊόντος υπάρχει ήδη"
      }
    }

    if (!formData.name.trim()) {
      newErrors.name = "Το όνομα προϊόντος είναι υποχρεωτικό"
    }
    if (!formData.category) {
      newErrors.category = "Η κατηγορία είναι υποχρεωτική"
    }
    if (!formData.unitName) {
      newErrors.unitName = "Η μονάδα μέτρησης είναι υποχρεωτική"
    }
    if (!formData.price) {
      newErrors.price = "Η τιμή είναι υποχρεωτική"
    } else {
      const price = Number.parseFloat(formData.price)
      if (isNaN(price) || price < 0) {
        newErrors.price = "Παρακαλώ εισάγετε έγκυρη τιμή"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      code: generateProductCode(products),
      name: "",
      category: "",
      unitName: "",
      price: "",
      description: "",
      isActive: true,
    })
    setErrors({})
  }

  const handleAddProduct = () => {
    if (!validateForm()) return

    const newProduct: Product = {
      id: Date.now().toString(),
      code: formData.code.trim(),
      name: formData.name.trim(),
      category: formData.category,
      unitName: formData.unitName,
      price: Number.parseFloat(formData.price),
      description: formData.description.trim(),
      isActive: formData.isActive,
      image: "/images/placeholder.jpg",
      createdAt: new Date().toISOString().split("T")[0],
    }

    saveProducts([...products, newProduct])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category,
      unitName: product.unitName,
      price: product.price.toString(),
      description: product.description,
      isActive: product.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProduct = () => {
    if (!editingProduct || !validateForm()) return

    const updatedProduct = {
      ...editingProduct,
      code: formData.code.trim(),
      name: formData.name.trim(),
      category: formData.category,
      unitName: formData.unitName,
      price: Number.parseFloat(formData.price),
      description: formData.description.trim(),
      isActive: formData.isActive,
    }

    const updatedProducts = products.map((product) => (product.id === editingProduct.id ? updatedProduct : product))

    saveProducts(updatedProducts)
    resetForm()
    setIsEditDialogOpen(false)
    setEditingProduct(null)
  }

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter((product) => product.id !== productId)
    saveProducts(updatedProducts)
  }

  const toggleProductStatus = (productId: string) => {
    const updatedProducts = products.map((product) =>
      product.id === productId ? { ...product, isActive: !product.isActive } : product,
    )
    saveProducts(updatedProducts)
  }

  // Φιλτράρισμα προϊόντων
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (userRole !== "admin") {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Δεν έχετε δικαίωμα πρόσβασης</h3>
          <p className="mt-1 text-sm text-gray-500">Μόνο οι διαχειριστές μπορούν να διαχειριστούν τα προϊόντα.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Διαχείριση Προϊόντων</h1>
          <p className="text-gray-600 mt-2">Διαχειριστείτε τον κατάλογο προϊόντων σας</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Νέο Προϊόν
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Προσθήκη Νέου Προϊόντος</DialogTitle>
              <DialogDescription>Εισάγετε τα στοιχεία του νέου προϊόντος</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Κωδικός Προϊόντος *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="PROD_001, PROD_002..."
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>
              <div>
                <Label htmlFor="name">Όνομα Προϊόντος *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="π.χ. Μοσχαρίσιο Κιμάς"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Κατηγορία *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Επιλέξτε κατηγορία" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
                <div>
                  <Label htmlFor="unitName">Μονάδα Μέτρησης *</Label>
                  <Select
                    value={formData.unitName}
                    onValueChange={(value) => setFormData({ ...formData, unitName: value })}
                  >
                    <SelectTrigger className={errors.unitName ? "border-red-500" : ""}>
                      <SelectValue placeholder="Επιλέξτε μονάδα" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unitName && <p className="text-red-500 text-sm mt-1">{errors.unitName}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="price">Τιμή (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              <div>
                <Label htmlFor="description">Περιγραφή</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Περιγραφή του προϊόντος"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddProduct} className="flex-1">
                  Προσθήκη Προϊόντος
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
              placeholder="Αναζήτηση προϊόντων..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Όλες οι κατηγορίες</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Λίστα Προϊόντων */}
      <Card>
        <CardHeader>
          <CardTitle>Κατάλογος Προϊόντων ({filteredProducts.length})</CardTitle>
          <CardDescription>Όλα τα καταχωρημένα προϊόντα</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Κωδικός</TableHead>
                  <TableHead>Προϊόν</TableHead>
                  <TableHead>Κατηγορία</TableHead>
                  <TableHead>Μονάδα</TableHead>
                  <TableHead>Τιμή</TableHead>
                  <TableHead>Κατάσταση</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || selectedCategory !== "all"
                        ? "Δεν βρέθηκαν προϊόντα"
                        : "Δεν υπάρχουν καταχωρημένα προϊόντα"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Badge variant="outline">{product.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{product.unitName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4 text-gray-400" />
                          {product.price.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Ενεργό" : "Ανενεργό"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleProductStatus(product.id)}
                            className={
                              product.isActive
                                ? "text-orange-600 hover:text-orange-700"
                                : "text-green-600 hover:text-green-700"
                            }
                          >
                            {product.isActive ? "Απενεργοποίηση" : "Ενεργοποίηση"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
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
                                  Είστε σίγουροι ότι θέλετε να διαγράψετε το προϊόν "{product.name}"; Αυτή η ενέργεια
                                  δεν μπορεί να αναιρεθεί.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product.id)}
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
            <DialogTitle>Επεξεργασία Προϊόντος</DialogTitle>
            <DialogDescription>Επεξεργαστείτε τα στοιχεία του προϊόντος</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-code">Κωδικός Προϊόντος *</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="PROD_001, PROD_002..."
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>
            <div>
              <Label htmlFor="edit-name">Όνομα Προϊόντος *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="π.χ. Μοσχαρίσιο Κιμάς"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Κατηγορία *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Επιλέξτε κατηγορία" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
              <div>
                <Label htmlFor="edit-unitName">Μονάδα Μέτρησης *</Label>
                <Select
                  value={formData.unitName}
                  onValueChange={(value) => setFormData({ ...formData, unitName: value })}
                >
                  <SelectTrigger className={errors.unitName ? "border-red-500" : ""}>
                    <SelectValue placeholder="Επιλέξτε μονάδα" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unitName && <p className="text-red-500 text-sm mt-1">{errors.unitName}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-price">Τιμή (€) *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
            <div>
              <Label htmlFor="edit-description">Περιγραφή</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Περιγραφή του προϊόντος"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateProduct} className="flex-1">
                Ενημέρωση
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingProduct(null)
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
