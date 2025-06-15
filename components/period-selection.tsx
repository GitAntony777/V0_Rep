"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Plus, Edit, Trash2, Power, PowerOff } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePeriod } from "../contexts/period-context"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface PeriodSelectionProps {
  onPeriodSelected: (period: string) => void
  onLogout: () => void
}

interface Period {
  id: string
  name: string
  status: "Ενεργή" | "Ανενεργή"
  orders: number
  revenue: number
  startDate: string
  endDate: string
  description: string
}

const initialPeriods: Period[] = [
  {
    id: "easter-2025",
    name: "Πάσχα 2025",
    status: "Ενεργή",
    orders: 89,
    revenue: 8920,
    startDate: "2025-04-01",
    endDate: "2025-04-20",
    description: "Πασχαλινή περίοδος 2025",
  },
  {
    id: "christmas-2024",
    name: "Χριστούγεννα 2024",
    status: "Ανενεργή",
    orders: 156,
    revenue: 12450,
    startDate: "2024-12-01",
    endDate: "2024-12-25",
    description: "Χριστουγεννιάτικη περίοδος 2024",
  },
]

export function PeriodSelection({ onPeriodSelected, onLogout }: PeriodSelectionProps) {
  const [periods, setPeriods] = useLocalStorage<Period[]>("periods", initialPeriods)
  const { setActivePeriod } = usePeriod()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Το όνομα περιόδου είναι υποχρεωτικό"
    }
    if (!formData.startDate) {
      newErrors.startDate = "Η ημερομηνία έναρξης είναι υποχρεωτική"
    }
    if (!formData.endDate) {
      newErrors.endDate = "Η ημερομηνία λήξης είναι υποχρεωτική"
    }
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = "Η ημερομηνία λήξης πρέπει να είναι μετά την έναρξη"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
    })
    setErrors({})
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const newPeriod: Period = {
      id: `period-${Date.now()}`,
      name: formData.name,
      status: "Ανενεργή",
      orders: 0,
      revenue: 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
    }

    setPeriods([newPeriod, ...periods])

    // Αν θέλουμε να κάνουμε την νέα περίοδο αυτόματα ενεργή (προαιρετικό)
    // Μπορούμε να προσθέσουμε ένα checkbox στη φόρμα για αυτό

    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEdit = (period: Period) => {
    setEditingPeriod(period)
    setFormData({
      name: period.name,
      description: period.description,
      startDate: period.startDate,
      endDate: period.endDate,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (!validateForm() || !editingPeriod) return

    const updatedPeriod = {
      ...editingPeriod,
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
    }

    setPeriods(periods.map((period) => (period.id === editingPeriod.id ? updatedPeriod : period)))

    resetForm()
    setIsEditDialogOpen(false)
    setEditingPeriod(null)
  }

  const handleDelete = (periodId: string) => {
    setPeriods(periods.filter((period) => period.id !== periodId))
  }

  const handleToggleStatus = (periodId: string) => {
    const updatedPeriods = periods.map((period) => {
      if (period.id === periodId) {
        const newStatus = period.status === "Ενεργή" ? "Ανενεργή" : "Ενεργή"
        return { ...period, status: newStatus }
      } else if (period.status === "Ενεργή") {
        // Απενεργοποίηση άλλων ενεργών περιόδων
        return { ...period, status: "Ανενεργή" }
      }
      return period
    }) as Period[]

    setPeriods(updatedPeriods)

    // Ενημέρωση της ενεργής περιόδου στο context
    const activePeriod = updatedPeriods.find((p) => p.status === "Ενεργή")
    if (activePeriod) {
      // Μετατροπή σε format που περιμένει το context
      const contextPeriod = {
        id: activePeriod.id,
        name: activePeriod.name,
        status: "Ενεργή" as const,
        orders: activePeriod.orders,
        revenue: activePeriod.revenue,
        startDate: activePeriod.startDate,
        endDate: activePeriod.endDate,
      }
      setActivePeriod(contextPeriod)
    } else {
      setActivePeriod(null)
    }
  }

  // Ταξινόμηση περιόδων - πιο πρόσφατες πρώτα
  const sortedPeriods = [...periods].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Εορταστικές Περίοδοι</h1>
            <p className="text-gray-600 mt-2">
              Διαχειριστείτε τις εορταστικές περιόδους (Πάσχα, Χριστούγεννα) για την οργάνωση των παραγγελιών.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onLogout}>
              Αποσύνδεση
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700" onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Προσθήκη Περιόδου
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Δημιουργία Νέας Εορταστικής Περιόδου</DialogTitle>
                  <DialogDescription>Δημιουργήστε μια νέα περίοδο για διαχείριση παραγγελιών</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="period-name">Όνομα Περιόδου *</Label>
                    <Input
                      id="period-name"
                      placeholder="π.χ. Πρωτομαγιά 2025"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="period-description">Περιγραφή</Label>
                    <Textarea
                      id="period-description"
                      placeholder="Περιγραφή της εορταστικής περιόδου"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Ημερομηνία Έναρξης *</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={errors.startDate ? "border-red-500" : ""}
                      />
                      {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                    </div>
                    <div>
                      <Label htmlFor="end-date">Ημερομηνία Λήξης *</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={errors.endDate ? "border-red-500" : ""}
                      />
                      {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSubmit} className="flex-1">
                      Δημιουργία Περιόδου
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                      Ακύρωση
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Λίστα Εορταστικών Περιόδων */}
        <Card>
          <CardHeader>
            <CardTitle>Λίστα Εορταστικών Περιόδων</CardTitle>
            <CardDescription>
              Διαχειριστείτε τις εορταστικές περιόδους (Πάσχα, Χριστούγεννα) για την οργάνωση των παραγγελιών.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Όνομα</TableHead>
                    <TableHead>Κατάσταση</TableHead>
                    <TableHead>Έναρξη</TableHead>
                    <TableHead>Λήξη</TableHead>
                    <TableHead>Περιγραφή</TableHead>
                    <TableHead>Παραγγελίες</TableHead>
                    <TableHead>Έσοδα</TableHead>
                    <TableHead>Ενέργειες</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPeriods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Δεν υπάρχουν εορταστικές περίοδοι
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedPeriods.map((period) => (
                      <TableRow key={period.id}>
                        <TableCell className="font-medium">{period.name}</TableCell>
                        <TableCell>
                          <Badge variant={period.status === "Ενεργή" ? "default" : "secondary"}>{period.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(period.startDate).toLocaleDateString("el-GR")}</TableCell>
                        <TableCell>{new Date(period.endDate).toLocaleDateString("el-GR")}</TableCell>
                        <TableCell className="max-w-xs truncate">{period.description}</TableCell>
                        <TableCell>{period.orders}</TableCell>
                        <TableCell>€{period.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(period.id)}
                              className={
                                period.status === "Ενεργή"
                                  ? "text-red-600 hover:text-red-700"
                                  : "text-green-600 hover:text-green-700"
                              }
                            >
                              {period.status === "Ενεργή" ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (period.status === "Ενεργή") {
                                  onPeriodSelected(period.id)
                                }
                              }}
                              disabled={period.status !== "Ενεργή"}
                              className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300"
                            >
                              Επιλογή
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(period)}>
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
                                    Είστε σίγουροι ότι θέλετε να διαγράψετε την περίοδο "{period.name}"; Αυτή η ενέργεια
                                    θα διαγράψει και όλες τις παραγγελίες της περιόδου και δεν μπορεί να αναιρεθεί.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(period.id)}
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
              <DialogTitle>Επεξεργασία Εορταστικής Περιόδου</DialogTitle>
              <DialogDescription>Επεξεργαστείτε τα στοιχεία της περιόδου</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-period-name">Όνομα Περιόδου *</Label>
                <Input
                  id="edit-period-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="edit-period-description">Περιγραφή</Label>
                <Textarea
                  id="edit-period-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start-date">Ημερομηνία Έναρξης *</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <Label htmlFor="edit-end-date">Ημερομηνία Λήξης *</Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdate} className="flex-1">
                  Ενημέρωση
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setEditingPeriod(null)
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

        {/* Πληροφορίες */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-2 rounded-full">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Σχετικά με τις Εορταστικές Περιόδους</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Κάθε εορταστική περίοδος είναι ανεξάρτητη με τα δικά της στατιστικά και παραγγελίες. Μπορεί να υπάρχει
                  μόνο μία ενεργή περίοδος τη φορά. Οι πελάτες μεταφέρονται αυτόματα μεταξύ των περιόδων, ενώ μπορείτε
                  να δείτε το ιστορικό παραγγελιών από προηγούμενες περιόδους.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Make sure we export the component properly
export default PeriodSelection
