"use client"

import { useState, useEffect } from "react"
import { LoginScreen } from "@/components/login-screen"
import { PeriodSelection } from "@/components/period-selection"
import { MainDashboard } from "@/components/main-dashboard"
import { PeriodProvider } from "@/contexts/period-context"

export default function Home() {
  const [currentUser, setCurrentUser] = useState<{
    username: string
    role: "admin" | "employee"
  } | null>(null)
  const [showPeriodSelection, setShowPeriodSelection] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  // Έλεγχος για αποθηκευμένη σύνδεση
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setShowPeriodSelection(true)
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("currentUser")
      }
    }
  }, [])

  const handleLogin = (username: string, role: "admin" | "employee") => {
    const user = { username, role }
    setCurrentUser(user)
    localStorage.setItem("currentUser", JSON.stringify(user))
    setShowPeriodSelection(true)
  }

  const handlePeriodSelected = () => {
    setShowDashboard(true)
  }

  const handleBackToPeriods = () => {
    setShowDashboard(false)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setShowPeriodSelection(false)
    setShowDashboard(false)
    localStorage.removeItem("currentUser")
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <PeriodProvider>
      {!showDashboard ? (
        <PeriodSelection
          onPeriodSelected={handlePeriodSelected}
          onLogout={handleLogout}
          userName={currentUser.username}
          userRole={currentUser.role}
        />
      ) : (
        <MainDashboard
          userRole={currentUser.role}
          userName={currentUser.username}
          onLogout={handleLogout}
          onPeriodChange={handleBackToPeriods}
        />
      )}
    </PeriodProvider>
  )
}
