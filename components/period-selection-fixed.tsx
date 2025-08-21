"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Settings, Trash2 } from "lucide-react"
import { usePeriod } from "@/contexts/period-context"
import { format } from "date-fns"
import { el } from "date-fns/locale"

export function PeriodSelectionFixed() {
  const { periods, activePeriod, setActivePeriod, getActivePeriodName } = usePeriod()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPeriodName, setNewPeriodName] = useState("")
  const [newPeriodStartDate, setNewPeriodStartDate] = useState("")
  const [newPeriodEndDate, setNewPeriodEndDate] = useState("")

  // Safely get the active period name as string
  const activePeriodName = getActivePeriodName()
  const displayPeriodName = typeof activePeriodName === "string" ? activePeriodName : "Καμία Περίοδος"

  const handleCreatePeriod = () => {
    if (!newPeriodName.trim() || !newPeriodStartDate || !newPeriodEndDate) {
      alert("Παρακαλώ συμπληρώστε όλα τα πεδία")
      return
    }

    const newPeriod = {
      id: Date.now().toString(),
      name: newPeriodName.trim(),
      startDate: newPeriodStartDate,
      endDate: newPeriodEndDate,
    }

    const updatedPeriods = [...periods, newPeriod]
    localStorage.setItem("periods", JSON.stringify(updatedPeriods))

    // Reset form
    setNewPeriodName("")
    setNewPeriodStartDate("")
    setNewPeriodEndDate("")
    setIsDialogOpen(false)

    // Refresh the page to load new periods
    window.location.reload()
  }

  const handleDeletePeriod = (periodId: string) => {
    if (activePeriod && activePeriod.id === periodId) {
      alert("Δεν μπορείτε να διαγράψετε την ενεργή περίοδο")
      return
    }

    if (confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την περίοδο;")) {
      const updatedPeriods = periods.filter((p) => p.id !== periodId)
      localStorage.setItem("periods", JSON.stringify(updatedPeriods))
      window.location.reload()
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">{displayPeriodName}</span>
          <Settings className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Διαχείριση Περιόδων
          </DialogTitle>
          <DialogDescription>Επιλέξτε ενεργή περίοδος ή δημιουργήστε νέα εορταστική περίοδο</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ενεργή Περίοδος */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Ενεργή Περίοδος</h3>
            {activePeriod ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{activePeriod.name}</h4>
                      <p className="text-sm text-gray-600">
                        {format(new Date(activePeriod.startDate), "dd/MM/yyyy", { locale: el })} -{" "}
                        {format(new Date(activePeriod.endDate), "dd/MM/yyyy", { locale: el })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Ενεργή
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-gray-500">Δεν έχει επιλεγεί ενεργή περίοδος</p>
            )}
          </div>

          {/* Διαθέσιμες Περίοδοι */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Διαθέσιμες Περίοδοι</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {periods.map((period) => (
                <Card key={period.id} className={activePeriod?.id === period.id ? "border-green-200" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{period.name}</h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(period.startDate), "dd/MM/yyyy", { locale: el })} -{" "}
                          {format(new Date(period.endDate), "dd/MM/yyyy", { locale: el })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {activePeriod?.id !== period.id && (
                          <Button size="sm" onClick={() => setActivePeriod(period)}>
                            Ενεργοποίηση
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePeriod(period.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Δημιουργία Νέας Περιόδου */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Δημιουργία Νέας Περιόδου</h3>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="periodName">Όνομα Περιόδου</Label>
                  <Input
                    id="periodName"
                    value={newPeriodName}
                    onChange={(e) => setNewPeriodName(e.target.value)}
                    placeholder="π.χ. Πάσχα 2024"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Ημερομηνία Έναρξης</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newPeriodStartDate}
                      onChange={(e) => setNewPeriodStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Ημερομηνία Λήξης</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newPeriodEndDate}
                      onChange={(e) => setNewPeriodEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleCreatePeriod} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Δημιουργία Περιόδου
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
