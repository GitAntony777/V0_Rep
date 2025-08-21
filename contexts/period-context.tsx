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
      const parsedPeriods = JSON.parse(savedPeriods)
      setPeriods(parsedPeriods)
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
      try {
        const parsedActivePeriod = JSON.parse(savedActivePeriod)
        setActivePeriod(parsedActivePeriod)
      } catch (error) {
        console.error("Error parsing active period:", error)
        // Αν υπάρχει πρόβλημα, ορίζουμε την πρώτη περίοδο ως ενεργή
        if (periods.length > 0) {
          setActivePeriod(periods[0])
        }
      }
    }
  }, [])

  // Αποθήκευση ενεργής περιόδου στο localStorage όταν αλλάζει
  useEffect(() => {
    if (activePeriod) {
      localStorage.setItem("activePeriod", JSON.stringify(activePeriod))
    }
  }, [activePeriod])

  const getActivePeriodName = (): string => {
    if (!activePeriod) {
      return "Καμία Περίοδος"
    }
    // Βεβαιωνόμαστε ότι επιστρέφουμε string
    return typeof activePeriod.name === "string" ? activePeriod.name : "Καμία Περίοδος"
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
