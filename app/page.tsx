"use client"

import { useState } from "react"
import { PeriodProvider } from "@/contexts/period-context"
import { LoginScreen } from "@/components/login-screen"
import { MainDashboard } from "@/components/main-dashboard"

export default function Home() {
  const [user, setUser] = useState<{ role: "admin" | "employee"; name: string } | null>(null)

  const handleLogin = (userData: { role: "admin" | "employee"; name: string }) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <PeriodProvider>
      <MainDashboard user={user} onLogout={handleLogout} />
    </PeriodProvider>
  )
}
