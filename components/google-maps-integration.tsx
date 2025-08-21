"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation } from "lucide-react"

interface GoogleMapsIntegrationProps {
  customerAddress?: string
  customerName?: string
  onClose?: () => void
}

export function GoogleMapsIntegration({ customerAddress, customerName, onClose }: GoogleMapsIntegrationProps) {
  const [distance, setDistance] = useState<string>("")
  const [duration, setDuration] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Διεύθυνση καταστήματος
  const storeAddress = "Καπετάν Γκόνη 34, 55131 Καλαμαρια, Θεσσαλονίκη"

  const calculateRoute = async () => {
    if (!customerAddress || customerAddress.trim() === "") {
      console.log("Δεν υπάρχει διεύθυνση πελάτη")
      return
    }

    setIsLoading(true)
    try {
      // Προσομοίωση υπολογισμού διαδρομής
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock δεδομένα για την απόσταση και τον χρόνο
      const mockDistance = Math.floor(Math.random() * 15) + 2 // 2-17 km
      const mockDuration = Math.floor(mockDistance * 2.5) + Math.floor(Math.random() * 10) // περίπου 2.5 λεπτά ανά km

      setDistance(`${mockDistance} km`)
      setDuration(`${mockDuration} λεπτά`)
    } catch (error) {
      console.error("Σφάλμα κατά τον υπολογισμό διαδρομής:", error)
      setDistance("Μη διαθέσιμο")
      setDuration("Μη διαθέσιμο")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (customerAddress && customerAddress.trim() !== "") {
      calculateRoute()
    }
  }, [customerAddress])

  const openInGoogleMaps = () => {
    if (!customerAddress || customerAddress.trim() === "") {
      alert("Δεν υπάρχει διεύθυνση πελάτη")
      return
    }

    const encodedAddress = encodeURIComponent(customerAddress)
    const url = `https://www.google.com/maps/dir/${encodeURIComponent(storeAddress)}/${encodedAddress}`
    window.open(url, "_blank")
  }

  const openCustomerLocation = () => {
    if (!customerAddress || customerAddress.trim() === "") {
      alert("Δεν υπάρχει διεύθυνση πελάτη")
      return
    }

    const encodedAddress = encodeURIComponent(customerAddress)
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    window.open(url, "_blank")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Πληροφορίες Διαδρομής
        </CardTitle>
        <CardDescription>{customerName && `Πελάτης: ${customerName}`}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">Από:</div>
          <div className="text-sm bg-blue-50 p-2 rounded">
            <MapPin className="h-4 w-4 inline mr-1" />
            {storeAddress}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">Προς:</div>
          <div className="text-sm bg-green-50 p-2 rounded">
            <MapPin className="h-4 w-4 inline mr-1" />
            {customerAddress || "Δεν έχει καταχωρηθεί διεύθυνση"}
          </div>
        </div>

        {customerAddress && customerAddress.trim() !== "" && (
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{isLoading ? "..." : distance}</div>
              <div className="text-xs text-gray-500">Απόσταση</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{isLoading ? "..." : duration}</div>
              <div className="text-xs text-gray-500">Χρόνος</div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={openInGoogleMaps}
            className="w-full"
            disabled={!customerAddress || customerAddress.trim() === ""}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Άνοιγμα Διαδρομής
          </Button>
          <Button
            variant="outline"
            onClick={openCustomerLocation}
            className="w-full bg-transparent"
            disabled={!customerAddress || customerAddress.trim() === ""}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Προβολή Τοποθεσίας
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
              Κλείσιμο
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
