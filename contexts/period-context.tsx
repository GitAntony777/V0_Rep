"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Period {
  id: string
  name: string
  status: "Ενεργή" | "Κλειστή" | "Προγραμματισμένη" | "Ανενεργή"
  orders: number
  revenue: number
  startDate: string
  endDate: string
}

interface PeriodContextType {
  activePeriod: Period | null
  setActivePeriod: (period: Period | null) => void
  periods: Period[]
  setPeriods: (periods: Period[]) => void
  getActivePeriodName: () => string
  syncWithLocalStorage: () => void
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined)

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const [periods, setPeriods] = useState<Period[]>([
    {
      id: "christmas-2024",
      name: "Χριστούγεννα 2024",
      status: "Κλειστή",
      orders: 156,
      revenue: 12450,
      startDate: "2024-12-01",
      endDate: "2024-12-31",
    },
    {
      id: "easter-2025",
      name: "Πάσχα 2025",
      status: "Ενεργή",
      orders: 89,
      revenue: 8920,
      startDate: "2025-04-15",
      endDate: "2025-04-30",
    },
    {
      id: "christmas-2025",
      name: "Χριστούγεννα 2025",
      status: "Προγραμματισμένη",
      orders: 0,
      revenue: 0,
      startDate: "2025-12-01",
      endDate: "2025-12-31",
    },
  ])

  const [activePeriod, setActivePeriodState] = useState<Period | null>(null)

  // Συγχρονισμός με localStorage
  const syncWithLocalStorage = () => {
    try {
      const storedPeriods = localStorage.getItem("periods")
      if (storedPeriods) {
        const parsedPeriods = JSON.parse(storedPeriods)

        // Μετατροπή των περιόδων από το localStorage στο format του context
        const contextPeriods = parsedPeriods.map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status === "Ενεργή" ? "Ενεργή" : p.status === "Κλειστή" ? "Κλειστή" : "Προγραμματισμένη",
          orders: p.orders || 0,
          revenue: p.revenue || 0,
          startDate: p.startDate,
          endDate: p.endDate,
        }))

        setPeriods(contextPeriods)

        // Βρες την ενεργή περίοδο
        const active = contextPeriods.find((p: any) => p.status === "Ενεργή")
        setActivePeriodState(active || null)
      }
    } catch (error) {
      console.error("Error syncing with localStorage:", error)
    }
  }

  // Αρχικοποίηση και συγχρονισμός
  useEffect(() => {
    syncWithLocalStorage()

    // Συγχρονισμός κάθε 1 δευτερόλεπτο για να πιάνει αλλαγές από άλλα components
    const interval = setInterval(syncWithLocalStorage, 1000)

    return () => clearInterval(interval)
  }, [])

  // Βρες την ενεργή περίοδο όταν αλλάζουν οι περίοδοι
  useEffect(() => {
    const active = periods.find((p) => p.status === "Ενεργή")
    setActivePeriodState(active || null)
  }, [periods])

  const setActivePeriod = (period: Period | null) => {
    if (period) {
      // Ενημέρωσε τις περιόδους - κάνε την επιλεγμένη ενεργή και τις άλλες ανενεργές
      const updatedPeriods = periods.map((p) => ({
        ...p,
        status: p.id === period.id ? "Ενεργή" : p.status === "Ενεργή" ? "Προγραμματισμένη" : p.status,
      })) as Period[]

      setPeriods(updatedPeriods)
      setActivePeriodState(period)

      // Ενημέρωσε το localStorage
      localStorage.setItem("periods", JSON.stringify(updatedPeriods))
    } else {
      setActivePeriodState(null)
    }
  }

  const getActivePeriodName = () => {
    return activePeriod?.name || "Καμία ενεργή περίοδος"
  }

  return (
    <PeriodContext.Provider
      value={{
        activePeriod,
        setActivePeriod,
        periods,
        setPeriods,
        getActivePeriodName,
        syncWithLocalStorage,
      }}
    >
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
