"use client"

import { useState, useEffect } from "react"
import { LoginScreen } from "@/components/login-screen"
import { MainDashboard } from "@/components/main-dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<"admin" | "employee" | null>(null)

  // Check if user is already logged in
  useEffect(() => {
    const savedLoginStatus = localStorage.getItem("isLoggedIn")
    const savedUserRole = localStorage.getItem("userRole") as "admin" | "employee" | null

    if (savedLoginStatus === "true" && savedUserRole) {
      setIsLoggedIn(true)
      setUserRole(savedUserRole)
    }
  }, [])

  const handleLogin = (role: "admin" | "employee") => {
    setIsLoggedIn(true)
    setUserRole(role)
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userRole", role)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole(null)
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
  }

  return (
    <main className="min-h-screen">
      {isLoggedIn && userRole ? (
        <MainDashboard userRole={userRole} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </main>
  )
}
