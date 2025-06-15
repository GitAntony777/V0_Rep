"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Unit {
  id: string
  name: string
  symbol: string
  type: "weight" | "volume" | "piece"
  baseUnit?: string
  conversionFactor?: number
  createdAt: string
  updatedAt: string
}

interface UnitsManagementProps {
  userRole: "admin" | "employee" | null
}

export function UnitsManagement({ userRole }: UnitsManagementProps) {
  const [units, setUnits] = useLocalStorage<Unit[]>("units", [
    {
      id: "1",
      name: "Κιλό",
      symbol: "kg",
      type: "weight",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Γραμμάριο",
      symbol: "gr",
      type: "weight",
      baseUnit: "kg",
      conversionFactor: 0.001,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Τεμάχιο",
      symbol: "τεμ",
      type: "piece",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Λίτρο",
      symbol: "L",
      type: "volume",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    type: "weight" as "weight" | "volume" | "piece",
    baseUnit: "",
    conversionFactor: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      symbol: "",
      type: "weight",
      baseUnit: "",
      conversionFactor: "",
    })
    setEditingUnit(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.symbol.trim()) {
      alert("Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία")
      return
    }

    const unitData: Unit = {
      id: editingUnit?.id || Date.now().toString(),
      name: formData.name.trim(),
      symbol: formData.symbol.trim(),
      type: formData.type,
      baseUnit: formData.baseUnit || undefined,
      conversionFactor: formData.conversionFactor ? Number.parseFloat(formData.conversionFactor) : undefined,
      createdAt: editingUnit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingUnit) {
      setUnits(units.map((unit) => (unit.id === editingUnit.id ? unitData : unit)))
    } else {
      setUnits([...units, unitData])
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormData({
      name: unit.name,
      symbol: unit.symbol,
      type: unit.type,
      baseUnit: unit.baseUnit || "",
      conversionFactor: unit.conversionFactor?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (unitId: string) => {
    setUnits(units.filter((unit) => unit.id !== unitId))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "weight":
        return "bg-blue-100 text-blue-800"
      case "volume":
        return "bg-green-100 text-green-800"
      case "piece":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "weight":
        return "Βάρος"
      case "volume":
        return "Όγκος"
      case "piece":
        return "Τεμάχια"
      default:
        return type
    }
  }

  const baseUnits = units.filter((unit) => !unit.baseUnit)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Μονάδες Μέτρησης</h1>
          <p className="text-gray-600 mt-2">Διαχείριση μονάδων μέτρησης προϊόντων</p>
        </div>

        {userRole === "admin" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Νέα Μονάδα
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingUnit ? "Επεξεργασία Μονάδας" : "Νέα Μονάδα Μέτρησης"}</DialogTitle>
                <DialogDescription>
                  {editingUnit
                    ? "Επεξεργαστείτε τα στοιχεία της μονάδας μέτρησης"
                    : "Προσθέστε μια νέα μονάδα μέτρησης στο σύστημα"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Όνομα *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                      placeholder="π.χ. Κιλό"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="symbol" className="text-right">
                      Σύμβολο *
                    </Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      className="col-span-3"
                      placeholder="π.χ. kg"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Τύπος *
                    </Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as "weight" | "volume" | "piece" })
                      }
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="weight">Βάρος</option>
                      <option value="volume">Όγκος</option>
                      <option value="piece">Τεμάχια</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="baseUnit" className="text-right">
                      Βασική Μονάδα
                    </Label>
                    <select
                      id="baseUnit"
                      value={formData.baseUnit}
                      onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Καμία (Βασική μονάδα)</option>
                      {baseUnits
                        .filter((unit) => unit.type === formData.type && unit.id !== editingUnit?.id)
                        .map((unit) => (
                          <option key={unit.id} value={unit.symbol}>
                            {unit.name} ({unit.symbol})
                          </option>
                        ))}
                    </select>
                  </div>
                  {formData.baseUnit && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="conversionFactor" className="text-right">
                        Συντελεστής
                      </Label>
                      <Input
                        id="conversionFactor"
                        type="number"
                        step="0.001"
                        value={formData.conversionFactor}
                        onChange={(e) => setFormData({ ...formData, conversionFactor: e.target.value })}
                        className="col-span-3"
                        placeholder="π.χ. 0.001"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">{editingUnit ? "Ενημέρωση" : "Προσθήκη"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Λίστα Μονάδων ({units.length})
          </CardTitle>
          <CardDescription>Διαχείριση όλων των μονάδων μέτρησης που χρησιμοποιούνται στο σύστημα</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Όνομα</TableHead>
                <TableHead>Σύμβολο</TableHead>
                <TableHead>Τύπος</TableHead>
                <TableHead>Βασική Μονάδα</TableHead>
                <TableHead>Συντελεστής</TableHead>
                <TableHead>Ημερομηνία</TableHead>
                {userRole === "admin" && <TableHead>Ενέργειες</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{unit.symbol}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(unit.type)}>{getTypeLabel(unit.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    {unit.baseUnit ? (
                      <Badge variant="secondary">{unit.baseUnit}</Badge>
                    ) : (
                      <span className="text-gray-500">Βασική</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {unit.conversionFactor ? (
                      <span className="font-mono">{unit.conversionFactor}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(unit.createdAt).toLocaleDateString("el-GR")}
                  </TableCell>
                  {userRole === "admin" && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(unit)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Διαγραφή Μονάδας</AlertDialogTitle>
                              <AlertDialogDescription>
                                Είστε σίγουροι ότι θέλετε να διαγράψετε τη μονάδα "{unit.name}"? Αυτή η ενέργεια δεν
                                μπορεί να αναιρεθεί.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(unit.id)}>Διαγραφή</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
