"use client"

import { useState } from "react"
import { PeriodProvider } from "@/contexts/period-context"
import { LoginScreen } from "@/components/login-screen"
import { PeriodSelection } from "@/components/period-selection-fixed"
import { MainDashboard } from "@/components/main-dashboard"

export default function Home() {
  const [userRole, setUserRole] = useState<"admin" | "employee" | null>(null)
  const [userName, setUserName] = useState("")
  const [showPeriodSelection, setShowPeriodSelection] = useState(false)

  const handleLogin = (role: "admin" | "employee", name: string) => {
    setUserRole(role)
    setUserName(name)
    setShowPeriodSelection(true)
  }

  const handleLogout = () => {
    setUserRole(null)
    setUserName("")
    setShowPeriodSelection(false)
  }

  const handlePeriodSelected = () => {
    setShowPeriodSelection(false)
  }

  const handleBackToPeriods = () => {
    setShowPeriodSelection(true)
  }

  return (
    <PeriodProvider>
      <main className="min-h-screen bg-gray-50">
        {!userRole ? (
          <LoginScreen onLogin={handleLogin} />
        ) : showPeriodSelection ? (
          <PeriodSelection onPeriodSelected={handlePeriodSelected} onLogout={handleLogout} />
        ) : (
          <MainDashboard
            userRole={userRole}
            userName={userName}
            onLogout={handleLogout}
            onPeriodChange={handleBackToPeriods}
          />
        )}
      </main>
    </PeriodProvider>
  )
}
