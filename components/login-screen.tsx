"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Lock, Store } from "lucide-react"

interface LoginScreenProps {
  onLogin: (role: "admin" | "employee", name: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<"admin" | "employee" | null>(null)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    if (!selectedRole) {
      setError("Παρακαλώ επιλέξτε ρόλο")
      return
    }

    if (!name.trim()) {
      setError("Παρακαλώ εισάγετε το όνομά σας")
      return
    }

    if (!password) {
      setError("Παρακαλώ εισάγετε κωδικό πρόσβασης")
      return
    }

    // Απλή επαλήθευση κωδικών
    const validCredentials = {
      admin: "admin123",
      employee: "emp123",
    }

    if (password !== validCredentials[selectedRole]) {
      setError("Λάθος κωδικός πρόσβασης")
      return
    }

    setError("")
    onLogin(selectedRole, name)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">ΤΟ ΜΠΕΛΛΕΣ</CardTitle>
          <CardDescription>Σύστημα Διαχείρισης Κρεοπωλείου</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Επιλέξτε Ρόλο</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={selectedRole === "admin" ? "default" : "outline"}
                className={`h-20 flex flex-col gap-2 ${selectedRole === "admin" ? "bg-red-600 hover:bg-red-700" : ""}`}
                onClick={() => setSelectedRole("admin")}
              >
                <User className="w-6 h-6" />
                <span>Διαχειριστής</span>
              </Button>
              <Button
                variant={selectedRole === "employee" ? "default" : "outline"}
                className={`h-20 flex flex-col gap-2 ${
                  selectedRole === "employee" ? "bg-red-600 hover:bg-red-700" : ""
                }`}
                onClick={() => setSelectedRole("employee")}
              >
                <User className="w-6 h-6" />
                <span>Υπάλληλος</span>
              </Button>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Όνομα</Label>
            <Input
              id="name"
              placeholder="Εισάγετε το όνομά σας"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password">Κωδικός Πρόσβασης</Label>
            <Input
              id="password"
              type="password"
              placeholder="Εισάγετε τον κωδικό σας"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <Button onClick={handleLogin} className="w-full bg-red-600 hover:bg-red-700" size="lg">
            <Lock className="w-4 h-4 mr-2" />
            Σύνδεση
          </Button>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>Κωδικοί πρόσβασης:</p>
            <p>Διαχειριστής: admin123</p>
            <p>Υπάλληλος: emp123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
