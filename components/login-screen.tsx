"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Lock } from "lucide-react"

interface LoginScreenProps {
  onLogin: (role: "admin" | "employee", name: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<"admin" | "employee" | "">("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    if (!selectedRole || !name || !password) {
      alert("Παρακαλώ συμπληρώστε όλα τα πεδία")
      return
    }

    // Απλή επαλήθευση κωδικών (για demo)
    const validCredentials = {
      admin: { password: "admin123", names: ["Κώστας Μπέλλας", "Διαχειριστής"] },
      employee: { password: "emp123", names: ["Άννα Παπαδάκη", "Δημήτρης Καρακώστας", "Μαρία Γεωργίου"] },
    }

    if (password === validCredentials[selectedRole].password) {
      onLogin(selectedRole, name)
    } else {
      alert("Λάθος κωδικός πρόσβασης")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">ΤΟ ΜΠΕΛΛΕΣ</CardTitle>
            <CardDescription className="text-lg">Κρεοπωλείο - Σύστημα Διαχείρισης</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role">Ρόλος Χρήστη</Label>
            <Select value={selectedRole} onValueChange={(value: "admin" | "employee") => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε ρόλο" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Διαχειριστής</SelectItem>
                <SelectItem value="employee">Υπάλληλος</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Όνομα</Label>
            <Input
              id="name"
              type="text"
              placeholder="Εισάγετε το όνομά σας"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Κωδικός Πρόσβασης</Label>
            <Input
              id="password"
              type="password"
              placeholder="Εισάγετε τον κωδικό"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          <Button onClick={handleLogin} className="w-full bg-red-600 hover:bg-red-700" size="lg">
            <Lock className="w-4 h-4 mr-2" />
            Σύνδεση
          </Button>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-2">Δοκιμαστικοί Κωδικοί:</p>
            <p>
              <strong>Διαχειριστής:</strong> admin123
            </p>
            <p>
              <strong>Υπάλληλος:</strong> emp123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
