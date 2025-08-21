"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Period {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  description?: string
}

interface PeriodContextType {
  periods: Period[]
  activePeriod: Period | null
  setActivePeriod: (period: Period) => void
  addPeriod: (period: Omit<Period, "id">) => void
  updatePeriod: (id: string, period: Partial<Period>) => void
  deletePeriod: (id: string) => void
  getActivePeriodName: () => string
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined)

const defaultPeriods: Period[] = [
  {
    id: "1",
    name: "Χριστούγεννα 2024",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    isActive: true,
    description: "Εορταστική περίοδος Χριστουγέννων",
  },
  {
    id: "2",
    name: "Πάσχα 2025",
    startDate: "2025-04-01",
    endDate: "2025-04-30",
    isActive: false,
    description: "Εορταστική περίοδος Πάσχα",
  },
  {
    id: "3",
    name: "Καλοκαίρι 2025",
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    isActive: false,
    description: "Καλοκαιρινή περίοδος",
  },
]

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [periods, setPeriods] = useState<Period[]>([])
  const [activePeriod, setActivePeriodState] = useState<Period | null>(null)

  // Φόρτωση περιόδων από localStorage
  useEffect(() => {
    try {
      const savedPeriods = localStorage.getItem("periods")
      if (savedPeriods) {
        const parsedPeriods = JSON.parse(savedPeriods)
        setPeriods(parsedPeriods)

        // Εύρεση ενεργής περιόδου
        const active = parsedPeriods.find((p: Period) => p.isActive)
        if (active) {
          setActivePeriodState(active)
        }
      } else {
        // Αρχικοποίηση με default περιόδους
        setPeriods(defaultPeriods)
        setActivePeriodState(defaultPeriods[0])
        localStorage.setItem("periods", JSON.stringify(defaultPeriods))
      }
    } catch (error) {
      console.error("Error loading periods:", error)
      setPeriods(defaultPeriods)
      setActivePeriodState(defaultPeriods[0])
    }
  }, [])

  // Αποθήκευση περιόδων στο localStorage
  useEffect(() => {
    if (periods.length > 0) {
      try {
        localStorage.setItem("periods", JSON.stringify(periods))
      } catch (error) {
        console.error("Error saving periods:", error)
      }
    }
  }, [periods])

  const setActivePeriod = (period: Period) => {
    // Ενημέρωση όλων των περιόδων - μόνο μία μπορεί να είναι ενεργή
    const updatedPeriods = periods.map((p) => ({
      ...p,
      isActive: p.id === period.id,
    }))

    setPeriods(updatedPeriods)
    setActivePeriodState(period)
  }

  const addPeriod = (periodData: Omit<Period, "id">) => {
    const newPeriod: Period = {
      ...periodData,
      id: Date.now().toString(),
    }

    setPeriods((prev) => [...prev, newPeriod])
  }

  const updatePeriod = (id: string, periodData: Partial<Period>) => {
    setPeriods((prev) => prev.map((period) => (period.id === id ? { ...period, ...periodData } : period)))

    // Ενημέρωση activePeriod αν είναι η ίδια περίοδος
    if (activePeriod?.id === id) {
      setActivePeriodState((prev) => (prev ? { ...prev, ...periodData } : null))
    }
  }

  const deletePeriod = (id: string) => {
    setPeriods((prev) => prev.filter((period) => period.id !== id))

    // Αν διαγράφεται η ενεργή περίοδος, επιλογή της πρώτης διαθέσιμης
    if (activePeriod?.id === id) {
      const remainingPeriods = periods.filter((p) => p.id !== id)
      if (remainingPeriods.length > 0) {
        setActivePeriod(remainingPeriods[0])
      } else {
        setActivePeriodState(null)
      }
    }
  }

  const getActivePeriodName = (): string => {
    if (!activePeriod || !activePeriod.name) {
      return "Καμία Περίοδος"
    }

    // Βεβαιωνόμαστε ότι επιστρέφουμε string
    return typeof activePeriod.name === "string" ? activePeriod.name : String(activePeriod.name)
  }

  const value: PeriodContextType = {
    periods,
    activePeriod,
    setActivePeriod,
    addPeriod,
    updatePeriod,
    deletePeriod,
    getActivePeriodName,
  }

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>
}

export function usePeriod() {
  const context = useContext(PeriodContext)
  if (context === undefined) {
    throw new Error("usePeriod must be used within a PeriodProvider")
  }
  return context
}
