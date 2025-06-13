"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginScreenProps {
  onLogin: (role: "admin" | "employee", name: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Απλός έλεγχος για demo
    if (username === "admin" && password === "admin") {
      onLogin("admin", "Διαχειριστής")
    } else if (username === "employee" && password === "employee") {
      onLogin("employee", "Υπάλληλος")
    } else {
      setError("Λάθος όνομα χρήστη ή κωδικός πρόσβασης")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img src="/placeholder-logo.png" alt="Logo" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl text-center">ΤΟ ΜΠΕΛΛΕΣ</CardTitle>
          <CardDescription className="text-center">Σύστημα Διαχείρισης Κρεοπωλείου</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="username">Όνομα Χρήστη</Label>
              <Input
                id="username"
                placeholder="Εισάγετε το όνομα χρήστη"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Κωδικός</Label>
              <Input
                id="password"
                type="password"
                placeholder="Εισάγετε τον κωδικό σας"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <Button type="submit" className="w-full mt-4">
              Σύνδεση
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-gray-500">© 2023 ΤΟ ΜΠΕΛΛΕΣ. Με επιφύλαξη παντός δικαιώματος.</p>
        </CardFooter>
      </Card>
    </div>
  )
}
