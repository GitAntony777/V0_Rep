"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Period {
  id: string
  name: string
  startDate: string
  endDate: string
}

interface PeriodContextType {
  periods: Period[]
  activePeriod: Period | null
  setActivePeriod: (period: Period) => void
  getActivePeriodName: () => string
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined)

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [periods, setPeriods] = useState<Period[]>([])
  const [activePeriod, setActivePeriod] = useState<Period | null>(null)

  useEffect(() => {
    // Φόρτωση περιόδων από το localStorage
    const savedPeriods = localStorage.getItem("periods")
    if (savedPeriods) {
      setPeriods(JSON.parse(savedPeriods))
    } else {
      // Αν δεν υπάρχουν περίοδοι, δημιουργούμε προκαθορισμένες
      const defaultPeriods: Period[] = [
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

    // Φόρτωση ενεργής περιόδου από το localStorage
    const savedActivePeriod = localStorage.getItem("activePeriod")
    if (savedActivePeriod) {
      setActivePeriod(JSON.parse(savedActivePeriod))
    }
  }, [])

  // Αποθήκευση ενεργής περιόδου στο localStorage όταν αλλάζει
  useEffect(() => {
    if (activePeriod) {
      localStorage.setItem("activePeriod", JSON.stringify(activePeriod))
    }
  }, [activePeriod])

  const getActivePeriodName = () => {
    return activePeriod ? activePeriod.name : "Καμία Περίοδος"
  }

  return (
    <PeriodContext.Provider value={{ periods, activePeriod, setActivePeriod, getActivePeriodName }}>
      {children}
    </PeriodContext.Provider>
  )
}

export function usePeriod() {
  const context = useContext(PeriodContext)
  if (context === undefined) {
    throw new Error("usePeriod must be used within a PeriodProvider")
  }
  return context
}
