"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Edit, Trash2, Package, Eye, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrintUtils } from "./print-utils"

interface ProductManagementProps {
  userRole: "admin" | "employee" | null
}

interface Product {
  id: string
  code: string
  name: string
  description: string
  price: number
  categoryId: string
  categoryName: string
  unitId: string
  unitName: string
  comments: string
  imageUrl: string
  createdAt: string
}

export function ProductManagement({ userRole }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState([])
  const [units, setUnits] = useState([])

  // Load categories and units from localStorage
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem("categories")
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories))
      } else {
        const defaultCategories = [
          { id: "1", code: "CAT_001", name: "Αρνί" },
          { id: "2", code: "CAT_002", name: "Χοιρινό" },
          { id: "3", code: "CAT_003", name: "Μοσχάρι" },
          { id: "4", code: "CAT_004", name: "Κοτόπουλο" },
          { id: "5", code: "CAT_005", name: "Παρασκευάσματα" },
        ]
        setCategories(defaultCategories)
      }

      const savedUnits = localStorage.getItem("units")
      if (savedUnits) {
        setUnits(JSON.parse(savedUnits))
      } else {
        const defaultUnits = [
          { id: "1", code: "UNIT_001", name: "Κιλά", symbol: "kg" },
          { id: "2", code: "UNIT_002", name: "Τεμάχια", symbol: "τεμ." },
          { id: "3", code: "UNIT_003", name: "Γραμμάρια", symbol: "gr" },
        ]
        setUnits(defaultUnits)
      }
    } catch (error) {
      console.error("Error loading categories/units from localStorage:", error)
    }
  }, [])

  const [activeTab, setActiveTab] = useState("list")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    price: "",
    categoryId: "",
    unitId: "",
    comments: "",
    imageUrl: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load products from localStorage on component mount
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem("products")
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts))
      } else {
        const initialProducts = [
          {
            id: "1",
            code: "PRD_001",
            name: "Αρνί Ψητό (ολόκληρο)",
            description: "Φρέσκο αρνί από Μάνη, ιδανικό για ψητό",
            price: 18.5,
            categoryId: "1",
            categoryName: "Αρνί",
            unitId: "1",
            unitName: "Κιλά",
            comments: "Διαθέσιμο κατά παραγγελία",
            imageUrl: "/placeholder.svg?height=100&width=100",
            createdAt: "2024-01-15",
          },
          {
            id: "2",
            code: "PRD_002",
            name: "Κοκορέτσι",
            description: "Παραδοσιακό κοκορέτσι με αρνίσια εντόσθια",
            price: 12.0,
            categoryId: "5",
            categoryName: "Παρασκευάσματα",
            unitId: "1",
            unitName: "Κιλά",
            comments: "Παρασκευάζεται την ίδια μέρα",
            imageUrl: "/placeholder.svg?height=100&width=100",
            createdAt: "2024-01-15",
          },
          {
            id: "3",
            code: "PRD_003",
            name: "Κοντοσούβλι Χοιρινό",
            description: "Χοιρινό κοντοσούβλι σε μερίδες",
            price: 14.8,
            categoryId: "2",
            categoryName: "Χοιρινό",
            unitId: "1",
            unitName: "Κιλά",
            comments: "",
            imageUrl: "/placeholder.svg?height=100&width=100",
            createdAt: "2024-01-15",
          },
          {
            id: "6",
            code: "PRD_006",
            name: "Κεφτεδάκια της γιαγιάς",
            description: "Παραδοσιακά κεφτεδάκια με μυρωδικά και κρεμμύδι, έτοιμα για τηγάνισμα",
            price: 11.5,
            categoryId: "3",
            categoryName: "Μοσχάρι",
            unitId: "1",
            unitName: "Κιλά",
            comments: "Φρέσκα καθημερινά",
            imageUrl: "/images/keftedakia-giagias.jpg",
            createdAt: "2024-01-15",
          },
          {
            id: "7",
            code: "PRD_007",
            name: "Κιμάς Μοσχαρίσιος",
            description: "Φρέσκος κιμάς μοσχαρίσιος, ιδανικός για μπιφτέκια και σάλτσες",
            price: 9.8,
            categoryId: "3",
            categoryName: "Μοσχάρι",
            unitId: "1",
            unitName: "Κιλά",
            comments: "Άλεσμα της ημέρας",
            imageUrl: "/images/kimas-mosxarisios.jpg",
            createdAt: "2024-01-15",
          },
          {
            id: "8",
            code: "PRD_008",
            name: "Γύρος Χοιρινός",
            description: "Παραδοσιακός γύρος χοιρινός, μαριναρισμένος με μυρωδικά",
            price: 8.5,
            categoryId: "5",
            categoryName: "Παρασκευάσματα",
            unitId: "1",
            unitName: "Κιλά",
            comments: "Μαρινάρισμα 24 ωρών",
            imageUrl: "/images/gyros-xoirinos.jpg",
            createdAt: "2024-01-15",
          },
          {
            id: "9",
            code: "PRD_009",
            name: "Κεμπάπ Σπεσιάλ",
            description: "Κεμπάπ με ειδικά μυρωδικά και κρεμμύδι, έτοιμο για ψήσιμο",
            price: 10.2,
            categoryId: "5",
            categoryName: "Παρασκευάσματα",
            unitId: "1",
            unitName: "Κιλά",
            comments: "Συνταγή του σπιτιού",
            imageUrl: "/images/kebab.jpg",
            createdAt: "2024-01-15",
          },
          {
            id: "10",
            code: "PRD_010",
            name: "Καρέ Χοιρινό Γεμιστό με Δημητριακά",
            description: "Χοιρινό καρέ γεμιστό με μείγμα δημητριακών και μυρωδικών",
            price: 13.8,
            categoryId: "2",
            categoryName: "Χοιρινό",
            unitId: "1",
            unitName: "Κιλά",
            comments: "Παραγγελία 1 ημέρα νωρίτερα",
            imageUrl: "/images/kare-gemisto-xoirino.jpg",
            createdAt: "2024-01-15",
          },
        ]
        setProducts(initialProducts)
        localStorage.setItem("products", JSON.stringify(initialProducts))
      }
    } catch (error) {
      console.error("Error loading products from localStorage:", error)
    }
  }, [])

  // Save products to localStorage whenever products state changes
  useEffect(() => {
    if (products.length > 0) {
      try {
        localStorage.setItem("products", JSON.stringify(products))
      } catch (error) {
        console.error("Error saving products to localStorage:", error)
      }
    }
  }, [products])

  // Auto-generate product code when products change
  useEffect(() => {
    if (activeTab === "add" && !editingProduct) {
      setFormData((prev) => ({
        ...prev,
        code: generateProductCode(),
      }))
    }
  }, [products, activeTab, editingProduct])

  // Δημιουργία μοναδικού κωδικού προϊόντος
  const generateProductCode = () => {
    const existingCodes = products.map((p) => p.code).filter((code) => code.startsWith("PRD_"))
    const numbers = existingCodes.map((code) => {
      const num = Number.parseInt(code.replace("PRD_", ""))
      return isNaN(num) ? 0 : num
    })
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
    return `PRD_${String(maxNumber + 1).padStart(3, "0")}`
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Ο κωδικός προϊόντος είναι υποχρεωτικός"
    } else {
      // Έλεγχος μοναδικότητας κωδικού
      const existingProduct = products.find(
        (prod) => prod.code === formData.code && (!editingProduct || prod.id !== editingProduct.id),
      )
      if (existingProduct) {
        newErrors.code = "Ο κωδικός προϊόντος υπάρχει ήδη"
      }
    }
    if (!formData.name.trim()) {
      newErrors.name = "Η ονομασία προϊόντος είναι υποχρεωτική"
    }
    if (!formData.price || Number.parseFloat(formData.price) <= 0) {
      newErrors.price = "Η τιμή προϊόντος είναι υποχρεωτική και πρέπει να είναι μεγαλύτερη από 0"
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Η κατηγορία προϊόντος είναι υποχρεωτική"
    }
    if (!formData.unitId) {
      newErrors.unitId = "Η μονάδα μέτρησης είναι υποχρεωτική"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      code: generateProductCode(),
      name: "",
      description: "",
      price: "",
      categoryId: "",
      unitId: "",
      comments: "",
      imageUrl: "",
    })
    setErrors({})
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const selectedCategory = categories.find((cat) => cat.id === formData.categoryId)
    const selectedUnit = units.find((unit) => unit.id === formData.unitId)

    const newProduct: Product = {
      id: Date.now().toString(),
      code: formData.code,
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      categoryId: formData.categoryId,
      categoryName: selectedCategory?.name || "",
      unitId: formData.unitId,
      unitName: selectedUnit?.name || "",
      comments: formData.comments,
      imageUrl: formData.imageUrl || "/placeholder.svg?height=100&width=100",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setProducts([...products, newProduct])
    resetForm()
    setActiveTab("list")
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      categoryId: product.categoryId,
      unitId: product.unitId,
      comments: product.comments,
      imageUrl: product.imageUrl,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!validateForm() || !editingProduct) return

    const selectedCategory = categories.find((cat) => cat.id === formData.categoryId)
    const selectedUnit = units.find((unit) => unit.id === formData.unitId)

    setProducts(
      products.map((product) =>
        product.id === editingProduct.id
          ? {
              ...product,
              code: formData.code,
              name: formData.name,
              description: formData.description,
              price: Number.parseFloat(formData.price),
              categoryId: formData.categoryId,
              categoryName: selectedCategory?.name || "",
              unitId: formData.unitId,
              unitName: selectedUnit?.name || "",
              comments: formData.comments,
              imageUrl: formData.imageUrl,
            }
          : product,
      ),
    )

    resetForm()
    setIsEditDialogOpen(false)
    setEditingProduct(null)
  }

  const handleDelete = (productId: string) => {
    setProducts(products.filter((product) => product.id !== productId))
  }

  const handleView = (product: Product) => {
    setViewingProduct(product)
    setIsViewDialogOpen(true)
  }

  const handlePriceChange = (value: string) => {
    // Handle empty string and invalid numbers
    if (value === "") {
      setFormData({ ...formData, price: "" })
    } else {
      const numValue = Number.parseFloat(value)
      if (!isNaN(numValue)) {
        setFormData({ ...formData, price: value })
      }
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Κατάλογος Προϊόντων
              </CardTitle>
              <CardDescription>Διαχείριση προϊόντων κρεοπωλείου</CardDescription>
            </div>
            <div className="flex gap-2">
              <PrintUtils title="Κατάλογος Προϊόντων" data={products} type="product" />
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  resetForm()
                  setActiveTab("add")
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Νέο Προϊόν
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Λίστα Προϊόντων</TabsTrigger>
              <TabsTrigger value="add">Νέο Προϊόν</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {/* Φίλτρα Αναζήτησης */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">Αναζήτηση Προϊόντος</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Όνομα, περιγραφή, κατηγορία..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category-filter">Φίλτρο Κατηγορίας</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Όλες οι κατηγορίες" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Όλες οι κατηγορίες</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Λίστα Προϊόντων */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Εικόνα</TableHead>
                      <TableHead>Κωδικός</TableHead>
                      <TableHead>Ονομασία</TableHead>
                      <TableHead>Κατηγορία</TableHead>
                      <TableHead>Τιμή</TableHead>
                      <TableHead>Μονάδα</TableHead>
                      <TableHead>Ενέργειες</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Δεν βρέθηκαν προϊόντα
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <img
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.code}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{product.categoryName}</Badge>
                          </TableCell>
                          <TableCell>€{product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.unitName}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleView(product)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
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
                                        Είστε σίγουροι ότι θέλετε να διαγράψετε το προϊόν "{product.name}"; Αυτή η
                                        ενέργεια δεν μπορεί να αναιρεθεί.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(product.id)}
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
                  Σύνολο προϊόντων: <span className="font-semibold">{products.length}</span>
                  {(searchTerm || categoryFilter !== "all") && (
                    <>
                      {" | "}Αποτελέσματα φίλτρων: <span className="font-semibold">{filteredProducts.length}</span>
                    </>
                  )}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Εισαγωγή Νέου Προϊόντος</CardTitle>
                  <CardDescription>Συμπληρώστε τα στοιχεία του νέου προϊόντος</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product-code">Κωδικός Προϊόντος *</Label>
                      <Input
                        id="product-code"
                        placeholder="PRD_001, PRD_002..."
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className={errors.code ? "border-red-500" : ""}
                      />
                      {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                    </div>

                    <div>
                      <Label htmlFor="product-category">Κατηγορία Προϊόντος *</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                      >
                        <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                          <SelectValue placeholder="Επιλέξτε κατηγορία" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="product-name">Ονομασία Προϊόντος *</Label>
                      <Input
                        id="product-name"
                        placeholder="π.χ. Αρνί Ψητό, Κοκορέτσι"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="product-description">Περιγραφή Προϊόντος</Label>
                      <Textarea
                        id="product-description"
                        placeholder="Περιγραφή του προϊόντος"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="product-price">Τιμή Προϊόντος (€) *</Label>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        className={errors.price ? "border-red-500" : ""}
                      />
                      {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                    </div>

                    <div>
                      <Label htmlFor="product-unit">Μονάδα Μέτρησης *</Label>
                      <Select
                        value={formData.unitId}
                        onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                      >
                        <SelectTrigger className={errors.unitId ? "border-red-500" : ""}>
                          <SelectValue placeholder="Επιλέξτε μονάδα" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name} ({unit.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.unitId && <p className="text-red-500 text-sm mt-1">{errors.unitId}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="product-comments">Σχόλια Προϊόντος</Label>
                      <Textarea
                        id="product-comments"
                        placeholder="Ιδιαιτερότητες, οδηγίες παρασκευής κλπ"
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="product-image">URL Φωτογραφίας</Label>
                      <Input
                        id="product-image"
                        placeholder="https://example.com/image.jpg ή /images/products/product.jpg"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSubmit} className="flex-1">
                      Αποθήκευση Προϊόντος
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Στοιχεία Προϊόντος
            </DialogTitle>
            <DialogDescription>Προβολή λεπτομερειών προϊόντος</DialogDescription>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-4">
              <div className="flex gap-6">
                <img
                  src={viewingProduct.imageUrl || "/placeholder.svg"}
                  alt={viewingProduct.name}
                  className="w-32 h-32 object-cover rounded border"
                />
                <div className="flex-1 space-y-2">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Κωδικός</Label>
                    <p className="font-medium">{viewingProduct.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Ονομασία</Label>
                    <p className="font-medium text-lg">{viewingProduct.name}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Κατηγορία</Label>
                  <p className="font-medium">{viewingProduct.categoryName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Μονάδα Μέτρησης</Label>
                  <p className="font-medium">{viewingProduct.unitName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Τιμή</Label>
                  <p className="font-medium text-lg">€{viewingProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ημερομηνία Δημιουργίας</Label>
                  <p className="font-medium">{new Date(viewingProduct.createdAt).toLocaleDateString("el-GR")}</p>
                </div>
              </div>

              {viewingProduct.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Περιγραφή</Label>
                  <p className="font-medium">{viewingProduct.description}</p>
                </div>
              )}

              {viewingProduct.comments && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Σχόλια</Label>
                  <p className="font-medium">{viewingProduct.comments}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setIsViewDialogOpen(false)} className="flex-1">
                  Κλείσιμο
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEdit(viewingProduct)
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Επεξεργασία Προϊόντος</DialogTitle>
            <DialogDescription>Επεξεργαστείτε τα στοιχεία του προϊόντος</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-product-code">Κωδικός Προϊόντος *</Label>
                <Input
                  id="edit-product-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>
              <div></div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-product-name">Ονομασία Προϊόντος *</Label>
                <Input
                  id="edit-product-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-product-description">Περιγραφή Προϊόντος</Label>
                <Textarea
                  id="edit-product-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-product-price">Τιμή Προϊόντος (€) *</Label>
                <Input
                  id="edit-product-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              <div></div>

              <div>
                <Label htmlFor="edit-product-category">Κατηγορία Προϊόντος *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Επιλέξτε κατηγορία" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
              </div>

              <div>
                <Label htmlFor="edit-product-unit">Μονάδα Μέτρησης *</Label>
                <Select value={formData.unitId} onValueChange={(value) => setFormData({ ...formData, unitId: value })}>
                  <SelectTrigger className={errors.unitId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Επιλέξτε μονάδα" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unitId && <p className="text-red-500 text-sm mt-1">{errors.unitId}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-product-comments">Σχόλια Προϊόντος</Label>
                <Textarea
                  id="edit-product-comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-product-image">URL Φωτογραφίας</Label>
                <Input
                  id="edit-product-image"
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
