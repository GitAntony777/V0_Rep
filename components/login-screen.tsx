"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Lock, Building } from "lucide-react"

interface LoginScreenProps {
  onLogin: (user: { role: "admin" | "employee"; name: string }) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "employee">("employee")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username.trim() || !password.trim()) {
      setError("Παρακαλώ συμπληρώστε όλα τα πεδία")
      return
    }

    // Simple authentication - in a real app, this would be more secure
    const validCredentials = [
      { username: "admin", password: "admin123", role: "admin" as const, name: "Διαχειριστής" },
      { username: "employee", password: "emp123", role: "employee" as const, name: "Υπάλληλος" },
      { username: "maria", password: "maria123", role: "employee" as const, name: "Μαρία Παπαδοπούλου" },
      { username: "giannis", password: "giannis123", role: "admin" as const, name: "Γιάννης Κωνσταντίνου" },
    ]

    const user = validCredentials.find(
      (cred) => cred.username === username && cred.password === password && cred.role === role,
    )

    if (user) {
      onLogin({ role: user.role, name: user.name })
    } else {
      setError("Λάθος στοιχεία σύνδεσης")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Building className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">ΤΟ ΜΠΕΛΛΕΣ</CardTitle>
          <CardDescription>Σύστημα Διαχείρισης Κρεοπωλείου</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Ρόλος</Label>
              <Select value={role} onValueChange={(value: "admin" | "employee") => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Διαχειριστής</SelectItem>
                  <SelectItem value="employee">Υπάλληλος</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Όνομα Χρήστη</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  placeholder="Εισάγετε το όνομα χρήστη"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Κωδικός Πρόσβασης</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Εισάγετε τον κωδικό"
                />
              </div>
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

            <Button type="submit" className="w-full">
              Σύνδεση
            </Button>
          </form>

          <div className="mt-6 text-xs text-gray-500 space-y-2">
            <p className="font-semibold">Δοκιμαστικοί Λογαριασμοί:</p>
            <div className="space-y-1">
              <p>
                <strong>Διαχειριστής:</strong> admin / admin123
              </p>
              <p>
                <strong>Υπάλληλος:</strong> employee / emp123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
