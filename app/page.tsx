"use client"

import { useState, useEffect } from "react"
import { PeriodProvider } from "@/contexts/period-context"
import { LoginScreen } from "@/components/login-screen"
import PeriodSelection from "@/components/period-selection"
import { MainDashboard } from "@/components/main-dashboard"

export default function Home() {
  const [userRole, setUserRole] = useState<"admin" | "employee" | null>(null)
  const [userName, setUserName] = useState("")
  const [showPeriodSelection, setShowPeriodSelection] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const savedUserRole = localStorage.getItem("userRole") as "admin" | "employee" | null
    const savedUserName = localStorage.getItem("userName")
    const savedPeriodSelected = localStorage.getItem("periodSelected")

    if (savedUserRole) {
      setUserRole(savedUserRole)
      setUserName(savedUserName || "")
      setShowPeriodSelection(savedPeriodSelected !== "true")
    }
  }, [])

  const handleLogin = (role: "admin" | "employee", name: string) => {
    setUserRole(role)
    setUserName(name)
    setShowPeriodSelection(true)
    localStorage.setItem("userRole", role)
    localStorage.setItem("userName", name)
  }

  const handleLogout = () => {
    setUserRole(null)
    setUserName("")
    setShowPeriodSelection(false)
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("periodSelected")
  }

  const handlePeriodSelected = () => {
    setShowPeriodSelection(false)
    localStorage.setItem("periodSelected", "true")
  }

  const handleBackToPeriods = () => {
    setShowPeriodSelection(true)
    localStorage.removeItem("periodSelected")
  }

  return (
    <PeriodProvider>
      <main className="min-h-screen bg-gray-50">
        {!userRole ? (
          <LoginScreen onLogin={handleLogin} />
        ) : showPeriodSelection ? (
          <PeriodSelection onPeriodSelected={handlePeriodSelected} onLogout={handleLogout} />
        ) : (
          <MainDashboard userRole={userRole} onLogout={handleLogout} />
        )}
      </main>
    </PeriodProvider>
  )
}
