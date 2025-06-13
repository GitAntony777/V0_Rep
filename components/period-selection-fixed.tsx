"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePeriod } from "@/contexts/period-context"

export function PeriodSelection() {
  const { activePeriod, setActivePeriod, getActivePeriodName } = usePeriod()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [periods, setPeriods] = useState<any[]>([])
  const [newPeriodName, setNewPeriodName] = useState("")
  const [newPeriodStartDate, setNewPeriodStartDate] = useState("")
  const [newPeriodEndDate, setNewPeriodEndDate] = useState("")

  // Load periods from localStorage on component mount
  useEffect(() => {
    const savedPeriods = localStorage.getItem("periods")
    if (savedPeriods) {
      setPeriods(JSON.parse(savedPeriods))
    } else {
      // Default periods if none exist
      const defaultPeriods = [
        {
          id: "1",
          name: "Πάσχα 2023",
          startDate: "2023-04-01",
          endDate: "2023-04-16",
        },
        {
          id: "2",
          name: "Χριστούγεννα 2023",
          startDate: "2023-12-01",
          endDate: "2023-12-31",
        },
        {
          id: "3",
          name: "Πάσχα 2024",
          startDate: "2024-04-15",
          endDate: "2024-05-05",
        },
      ]
      setPeriods(defaultPeriods)
      localStorage.setItem("periods", JSON.stringify(defaultPeriods))
    }
  }, [])

  const handleAddPeriod = () => {
    if (!newPeriodName || !newPeriodStartDate || !newPeriodEndDate) return

    const newPeriod = {
      id: Date.now().toString(),
      name: newPeriodName,
      startDate: newPeriodStartDate,
      endDate: newPeriodEndDate,
    }

    const updatedPeriods = [...periods, newPeriod]
    setPeriods(updatedPeriods)
    localStorage.setItem("periods", JSON.stringify(updatedPeriods))

    // Reset form
    setNewPeriodName("")
    setNewPeriodStartDate("")
    setNewPeriodEndDate("")
  }

  const handleSelectPeriod = (periodId: string) => {
    setActivePeriod(periodId)
    setIsDialogOpen(false)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span className="hidden md:inline">{getActivePeriodName()}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Επιλογή Εορταστικής Περιόδου</DialogTitle>
          <DialogDescription>
            Επιλέξτε την εορταστική περίοδο για την οποία θέλετε να διαχειριστείτε παραγγελίες
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {periods.map((period) => (
              <Card
                key={period.id}
                className={`cursor-pointer transition-colors ${
                  activePeriod === period.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => handleSelectPeriod(period.id)}
              >
                <CardHeader className="p-3">
                  <CardTitle className="text-base">{period.name}</CardTitle>
                  <CardDescription>
                    {new Date(period.startDate).toLocaleDateString("el-GR")} -{" "}
                    {new Date(period.endDate).toLocaleDateString("el-GR")}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Προσθήκη Νέας Περιόδου</h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="period-name">Όνομα Περιόδου</Label>
                <Input
                  id="period-name"
                  placeholder="π.χ. Πάσχα 2024"
                  value={newPeriodName}
                  onChange={(e) => setNewPeriodName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="start-date">Ημ. Έναρξης</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newPeriodStartDate}
                    onChange={(e) => setNewPeriodStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Ημ. Λήξης</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newPeriodEndDate}
                    onChange={(e) => setNewPeriodEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleAddPeriod} className="w-full">
                Προσθήκη Περιόδου
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
