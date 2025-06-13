"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface PeriodContextType {
  activePeriod: string
  setActivePeriod: (periodId: string) => void
  getActivePeriodName: () => string
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined)

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [activePeriod, setActivePeriod] = useState<string>("")
  const [periods, setPeriods] = useState<any[]>([])

  // Load periods and active period from localStorage on component mount
  useEffect(() => {
    const savedPeriods = localStorage.getItem("periods")
    if (savedPeriods) {
      setPeriods(JSON.parse(savedPeriods))
    }

    const savedActivePeriod = localStorage.getItem("activePeriod")
    if (savedActivePeriod) {
      setActivePeriod(savedActivePeriod)
    } else if (savedPeriods) {
      // Set the most recent period as active if none is selected
      const parsedPeriods = JSON.parse(savedPeriods)
      if (parsedPeriods.length > 0) {
        setActivePeriod(parsedPeriods[parsedPeriods.length - 1].id)
        localStorage.setItem("activePeriod", parsedPeriods[parsedPeriods.length - 1].id)
      }
    }
  }, [])

  // Save active period to localStorage whenever it changes
  useEffect(() => {
    if (activePeriod) {
      localStorage.setItem("activePeriod", activePeriod)
    }
  }, [activePeriod])

  const getActivePeriodName = () => {
    if (!activePeriod || periods.length === 0) return "Επιλέξτε Περίοδο"

    const period = periods.find((p) => p.id === activePeriod)
    return period ? period.name : "Επιλέξτε Περίοδο"
  }

  return (
    <PeriodContext.Provider value={{ activePeriod, setActivePeriod, getActivePeriodName }}>
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
