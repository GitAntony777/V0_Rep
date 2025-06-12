"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Lock, User, ChevronLeft, ChevronRight } from "lucide-react"

interface LoginScreenProps {
  onLogin: (role: "admin" | "employee", name: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [employees, setEmployees] = useState<any[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageOrder, setImageOrder] = useState<number[]>([])

  // Εικόνες για το slideshow
  const images = [
    { src: "/images/kokoreti.jpg", alt: "Κοκορέτσι" },
    { src: "/images/burger.jpg", alt: "Μπιφτέκια" },
    { src: "/images/kontosouvli.jpg", alt: "Κοντοσούβλι" },
    { src: "/images/loukanika.jpg", alt: "Χωριάτικα Λουκάνικα" },
    { src: "/images/kimas.jpg", alt: "Κιμάς Μοσχαρίσιος" },
    { src: "/images/rolo-gemisto.jpg", alt: "Μοσχαρίσιο Ρολό Γεμιστό" },
    { src: "/images/brizoles.jpg", alt: "Μπριζόλες Χοιρινές" },
    { src: "/images/kebab.jpg", alt: "Κεμπάπ" },
    { src: "/images/osompouko.jpg", alt: "Οσομπούκο" },
    { src: "/images/souvlaki.jpg", alt: "Σουβλάκι Χοιρινό" },
  ]

  // Δημιουργία τυχαίας σειράς εικόνων
  const shuffleArray = (array: number[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // Αρχικοποίηση τυχαίας σειράς
  useEffect(() => {
    const initialOrder = shuffleArray(Array.from({ length: images.length }, (_, i) => i))
    setImageOrder(initialOrder)
    setCurrentImageIndex(0)
  }, [images.length])

  // Auto slideshow με τυχαία σειρά
  useEffect(() => {
    if (imageOrder.length === 0) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const nextIndex = (prev + 1) % imageOrder.length
        // Αν τελειώσαμε έναν κύκλο, ανακατεύουμε ξανά
        if (nextIndex === 0) {
          const newOrder = shuffleArray(Array.from({ length: images.length }, (_, i) => i))
          setImageOrder(newOrder)
        }
        return nextIndex
      })
    }, 7000) // 7 δευτερόλεπτα

    return () => clearInterval(interval)
  }, [imageOrder.length, images.length])

  // Φόρτωση υπαλλήλων από localStorage
  useEffect(() => {
    const defaultEmployees = [
      {
        username: "admin",
        password: "admin123",
        role: "admin",
        name: "Διαχειριστής Συστήματος",
      },
    ]

    try {
      const storedEmployees = localStorage.getItem("employees")
      if (storedEmployees) {
        const parsedEmployees = JSON.parse(storedEmployees)
        const allEmployees = [
          ...defaultEmployees,
          ...parsedEmployees.map((emp: any) => ({
            username: emp.username,
            password: emp.password,
            role: emp.role,
            name: `${emp.firstName} ${emp.lastName}`,
          })),
        ]
        setEmployees(allEmployees)
      } else {
        setEmployees(defaultEmployees)
      }
    } catch (error) {
      console.error("Error loading employees:", error)
      setEmployees(defaultEmployees)
    }
  }, [])

  const handleLogin = () => {
    const user = employees.find((emp) => emp.username === username && emp.password === password)

    if (user) {
      onLogin(user.role as "admin" | "employee", user.name)
    } else {
      setError("Λάθος στοιχεία σύνδεσης")
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageOrder.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageOrder.length) % imageOrder.length)
  }

  const getCurrentImage = () => {
    if (imageOrder.length === 0) return images[0]
    return images[imageOrder[currentImageIndex]]
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Αριστερή πλευρά - Slideshow */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0">
          {imageOrder.length > 0 && (
            <div className="absolute inset-0">
              <img
                src={getCurrentImage().src || "/placeholder.svg"}
                alt={getCurrentImage().alt}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 z-10"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Content Overlay - Χωρίς σήμα */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white z-10 p-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4 text-shadow-lg tracking-wide">ΤΟ ΜΠΕΛΛΕΣ</h1>
            <p className="text-2xl mb-6 text-red-200 font-medium">Κρεοπωλείο</p>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Εξυπηρετούμε τους πελάτες μας εδώ και δεκαετίες με φρέσκα και ποιοτικά κρέατα
            </p>
          </div>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {imageOrder.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentImageIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Δεξιά πλευρά - Φόρμα Σύνδεσης */}
      <div className="w-96 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-red-600 p-3 rounded-full">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Σύνδεση</h2>
            <p className="text-gray-600">Πρόγραμμα Διαχείρισης Παραγγελιών</p>
          </div>

          {/* Login Form */}
          <Card className="bg-white/90 backdrop-blur shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg text-gray-800">Εισάγετε τα στοιχεία σας</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium">
                  Όνομα Χρήστη
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Εισάγετε το όνομα χρήστη"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Κωδικός Πρόσβασης
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Εισάγετε τον κωδικό"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                    onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <Button
                onClick={handleLogin}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Σύνδεση στο Σύστημα
              </Button>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="bg-white/70 backdrop-blur border-0">
            <CardContent className="p-4">
              <div className="text-xs text-gray-600 text-center space-y-1">
                <p className="font-semibold text-gray-700">Demo Στοιχεία:</p>
                <p>
                  <span className="font-medium">Διαχειριστής:</span> admin / admin123
                </p>
                <p className="text-xs text-gray-500">Ή χρησιμοποιήστε τα στοιχεία υπαλλήλων που έχετε καταχωρήσει</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
