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
  name: string
  category: string
  unit: string
  price: number
  description: string
  isActive: boolean
  image?: string
}

interface ProductManagementProps {
  userRole?: "admin" | "employee" | null
}

export function ProductManagement({ userRole }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [units, setUnits] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    price: "",
    description: "",
    isActive: true,
  })

  // Φόρτωση δεδομένων από localStorage
  useEffect(() => {
    // Φόρτωση προϊόντων
    const savedProducts = localStorage.getItem("products")
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts)
        setProducts(parsedProducts)
      } catch (error) {
        console.error("Error parsing products:", error)
      }
    }

    // Φόρτωση κατηγοριών
    const savedCategories = localStorage.getItem("categories")
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories)
        setCategories(parsedCategories.map((cat: any) => cat.name))
      } catch (error) {
        console.error("Error parsing categories:", error)
        setCategories(["Κρέατα", "Κιμάδες", "Λουκάνικα", "Έτοιμα Φαγητά"])
      }
    } else {
      setCategories(["Κρέατα", "Κιμάδες", "Λουκάνικα", "Έτοιμα Φαγητά"])
    }

    // Φόρτωση μονάδων
    const savedUnits = localStorage.getItem("units")
    if (savedUnits) {
      try {
        const parsedUnits = JSON.parse(savedUnits)
        setUnits(parsedUnits.map((unit: any) => unit.name))
      } catch (error) {
        console.error("Error parsing units:", error)
        setUnits(["κιλό", "γραμμάριο", "τεμάχιο", "μερίδα"])
      }
    } else {
      setUnits(["κιλό", "γραμμάριο", "τεμάχιο", "μερίδα"])
    }
  }, [])

  // Αποθήκευση προϊόντων στο localStorage
  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts)
    localStorage.setItem("products", JSON.stringify(updatedProducts))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      unit: "",
      price: "",
      description: "",
      isActive: true,
    })
  }

  const handleAddProduct = () => {
    if (!formData.name.trim() || !formData.category || !formData.unit || !formData.price) {
      alert("Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία")
      return
    }

    const price = Number.parseFloat(formData.price)
    if (isNaN(price) || price < 0) {
      alert("Παρακαλώ εισάγετε έγκυρη τιμή")
      return
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      category: formData.category,
      unit: formData.unit,
      price: price,
      description: formData.description.trim(),
      isActive: formData.isActive,
    }

    saveProducts([...products, newProduct])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      price: product.price.toString(),
      description: product.description,
      isActive: product.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProduct = () => {
    if (!editingProduct) return

    if (!formData.name.trim() || !formData.category || !formData.unit || !formData.price) {
      alert("Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία")
      return
    }

    const price = Number.parseFloat(formData.price)
    if (isNaN(price) || price < 0) {
      alert("Παρακαλώ εισάγετε έγκυρη τιμή")
      return
    }

    const updatedProduct = {
      ...editingProduct,
      name: formData.name.trim(),
      category: formData.category,
      unit: formData.unit,
      price: price,
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
                <Label htmlFor="name">Όνομα Προϊόντος *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="π.χ. Μοσχαρίσιο Κιμάς"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Κατηγορία *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
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
                </div>
                <div>
                  <Label htmlFor="unit">Μονάδα Μέτρησης *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
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
                />
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
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm || selectedCategory !== "all"
                        ? "Δεν βρέθηκαν προϊόντα"
                        : "Δεν υπάρχουν καταχωρημένα προϊόντα"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
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
                      <TableCell>{product.unit}</TableCell>
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
              <Label htmlFor="edit-name">Όνομα Προϊόντος *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="π.χ. Μοσχαρίσιο Κιμάς"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Κατηγορία *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
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
              </div>
              <div>
                <Label htmlFor="edit-unit">Μονάδα Μέτρησης *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger>
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
              />
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
