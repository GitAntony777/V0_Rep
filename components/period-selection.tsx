"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, LogOut, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePeriod } from "@/contexts/period-context"

interface PeriodSelectionProps {
  onPeriodSelected: () => void
  onLogout: () => void
}

export default function PeriodSelection({ onPeriodSelected, onLogout }: PeriodSelectionProps) {
  const { periods, activePeriod, setActivePeriod } = usePeriod()
  const [showNewPeriodDialog, setShowNewPeriodDialog] = useState(false)
  const [newPeriod, setNewPeriod] = useState({
    name: "",
    startDate: "",
    endDate: "",
  })

  const handlePeriodSelect = (period: any) => {
    setActivePeriod(period)
    onPeriodSelected()
  }

  const handleCreatePeriod = () => {
    if (!newPeriod.name || !newPeriod.startDate || !newPeriod.endDate) {
      alert("Παρακαλώ συμπληρώστε όλα τα πεδία")
      return
    }

    const period = {
      id: Date.now().toString(),
      name: newPeriod.name,
      startDate: newPeriod.startDate,
      endDate: newPeriod.endDate,
    }

    // Προσθήκη στις περιόδους
    const updatedPeriods = [...periods, period]
    localStorage.setItem("periods", JSON.stringify(updatedPeriods))

    // Reset form
    setNewPeriod({ name: "", startDate: "", endDate: "" })
    setShowNewPeriodDialog(false)

    // Ανανέωση σελίδας για να φορτωθούν οι νέες περίοδοι
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Επιλογή Εορταστικής Περιόδου</h1>
            <p className="text-gray-600 mt-2">Επιλέξτε την περίοδο για την οποία θέλετε να εργαστείτε</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Αποσύνδεση
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {periods.map((period) => (
            <Card
              key={period.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                activePeriod?.id === period.id
                  ? "ring-2 ring-red-500 bg-red-50"
                  : "hover:bg-gray-50 hover:border-red-200"
              }`}
              onClick={() => handlePeriodSelect(period)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Calendar className="w-6 h-6 text-red-600" />
                  {activePeriod?.id === period.id && <Badge className="bg-red-600">Ενεργή</Badge>}
                </div>
                <CardTitle className="text-xl">{period.name}</CardTitle>
                <CardDescription>
                  {new Date(period.startDate).toLocaleDateString("el-GR")} -{" "}
                  {new Date(period.endDate).toLocaleDateString("el-GR")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Παραγγελίες:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Έσοδα:</span>
                    <span className="font-medium">€0.00</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-4 bg-red-600 hover:bg-red-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePeriodSelect(period)
                  }}
                >
                  Επιλογή Περιόδου
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Κάρτα για νέα περίοδο */}
          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50 border-dashed border-2 border-gray-300">
            <Dialog open={showNewPeriodDialog} onOpenChange={setShowNewPeriodDialog}>
              <DialogTrigger asChild>
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <Plus className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Νέα Περίοδος</h3>
                  <p className="text-gray-500 text-sm">Δημιουργήστε μια νέα εορταστική περίοδο</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Δημιουργία Νέας Περιόδου</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="periodName">Όνομα Περιόδου</Label>
                    <Input
                      id="periodName"
                      placeholder="π.χ. Πάσχα 2024"
                      value={newPeriod.name}
                      onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Ημερομηνία Έναρξης</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newPeriod.startDate}
                      onChange={(e) => setNewPeriod({ ...newPeriod, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Ημερομηνία Λήξης</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newPeriod.endDate}
                      onChange={(e) => setNewPeriod({ ...newPeriod, endDate: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowNewPeriodDialog(false)} className="flex-1">
                      Ακύρωση
                    </Button>
                    <Button onClick={handleCreatePeriod} className="flex-1 bg-red-600 hover:bg-red-700">
                      Δημιουργία
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </div>

        {activePeriod && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Επιλεγμένη Περίοδος: {activePeriod.name}</h3>
                  <p className="text-green-600">
                    {new Date(activePeriod.startDate).toLocaleDateString("el-GR")} -{" "}
                    {new Date(activePeriod.endDate).toLocaleDateString("el-GR")}
                  </p>
                </div>
                <Button onClick={onPeriodSelected} className="bg-green-600 hover:bg-green-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Συνέχεια στο Σύστημα
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
