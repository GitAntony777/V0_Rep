"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "lucide-react"
import { usePeriod } from "@/contexts/period-context"

export function PeriodSelection() {
  const [isOpen, setIsOpen] = useState(false)
  const { activePeriod, setActivePeriod, periods } = usePeriod()

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Calendar className="h-4 w-4 mr-2" />
        {activePeriod ? activePeriod.name : "Επιλογή Περιόδου"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Επιλογή Εορταστικής Περιόδου</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              {periods.map((period) => (
                <Button
                  key={period.id}
                  variant={activePeriod?.id === period.id ? "default" : "outline"}
                  className="justify-start h-auto py-3"
                  onClick={() => {
                    setActivePeriod(period)
                    setIsOpen(false)
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{period.name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(period.startDate).toLocaleDateString("el-GR")} -{" "}
                      {new Date(period.endDate).toLocaleDateString("el-GR")}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PeriodSelection
