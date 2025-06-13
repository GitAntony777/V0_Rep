"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Power } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePeriod } from "@/contexts/period-context"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface PeriodSelectionProps {
  onPeriodSelected: () => void
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
    orders: 0,
    revenue: 0,
    startDate: "2025-04-01",
    endDate: "2025-04-20",
    description: "Πασχαλινή περίοδος 2025",
  },
]

export function PeriodSelection({ onPeriodSelected, onLogout }: PeriodSelectionProps) {
  const [periods, setPeriods] = useLocalStorage<Period[]>("periods", initialPeriods)
  const { setActivePeriod } = usePeriod()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
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
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleToggleStatus = (periodId: string) => {
    const updatedPeriods = periods.map((period) => {
      if (period.id === periodId) {
        return { ...period, status: period.status === "Ενεργή" ? "Ανενεργή" : "Ενεργή" }
      } else if (period.status === "Ενεργή") {
        return { ...period, status: "Ανενεργή" }
      }
      return period
    }) as Period[]

    setPeriods(updatedPeriods)

    const activePeriod = updatedPeriods.find((p) => p.status === "Ενεργή")
    if (activePeriod) {
      setActivePeriod({
        id: activePeriod.id,
        name: activePeriod.name,
        status: "Ενεργή",
        orders: activePeriod.orders,
        revenue: activePeriod.revenue,
        startDate: activePeriod.startDate,
        endDate: activePeriod.endDate,
      })
    }
  }

  const handleDelete = (periodId: string) => {
    setPeriods(periods.filter((period) => period.id !== periodId))
  }

  const handleSelectPeriod = () => {
    const activePeriod = periods.find((p) => p.status === "Ενεργή")
    if (activePeriod) {
      onPeriodSelected()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Εορταστικές Περίοδοι</h1>
            <p className="text-gray-600 mt-2">Διαχειριστείτε τις εορταστικές περιόδους</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onLogout}>
              Αποσύνδεση
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Νέα Περίοδος
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Νέα Εορταστική Περίοδος</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Όνομα Περιόδου *</Label>
                    <Input
                      placeholder="π.χ. Πρωτομαγιά 2025"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </div>

                  <div>
                    <Label>Περιγραφή</Label>
                    <Textarea
                      placeholder="Περιγραφή της περιόδου"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ημερομηνία Έναρξης *</Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={errors.startDate ? "border-red-500" : ""}
                      />
                      {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}
                    </div>
                    <div>
                      <Label>Ημερομηνία Λήξης *</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={errors.endDate ? "border-red-500" : ""}
                      />
                      {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSubmit} className="flex-1">
                      Δημιουργία
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

        <Card>
          <CardHeader>
            <CardTitle>Διαθέσιμες Περίοδοι</CardTitle>
            <CardDescription>Επιλέξτε μια ενεργή περίοδο για να συνεχίσετε</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Όνομα</TableHead>
                  <TableHead>Κατάσταση</TableHead>
                  <TableHead>Έναρξη</TableHead>
                  <TableHead>Λήξη</TableHead>
                  <TableHead>Περιγραφή</TableHead>
                  <TableHead>Ενέργειες</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Δεν υπάρχουν περίοδοι
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell className="font-medium">{period.name}</TableCell>
                      <TableCell>
                        <Badge variant={period.status === "Ενεργή" ? "default" : "secondary"}>{period.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(period.startDate).toLocaleDateString("el-GR")}</TableCell>
                      <TableCell>{new Date(period.endDate).toLocaleDateString("el-GR")}</TableCell>
                      <TableCell>{period.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleToggleStatus(period.id)}>
                            <Power className="h-4 w-4" />
                          </Button>
                          {period.status === "Ενεργή" && (
                            <Button size="sm" onClick={handleSelectPeriod} className="bg-green-600 hover:bg-green-700">
                              Επιλογή
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(period.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
