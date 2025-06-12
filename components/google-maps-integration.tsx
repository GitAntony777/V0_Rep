"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Clock, Route } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface GoogleMapsIntegrationProps {
  customerAddress: string
  customerName?: string
  onClose?: () => void
}

interface RouteInfo {
  distance: string
  duration: string
  estimatedDeliveryTime: string
}

export function GoogleMapsIntegration({ customerAddress, customerName, onClose }: GoogleMapsIntegrationProps) {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Διεύθυνση κρεοπωλείου
  const butcherAddress = "Καπετάν Γκόνη 34, 55131 Καλαμαρια, Θεσσαλονίκη"

  // Προσομοίωση Google Maps Distance Matrix API
  const calculateRoute = async () => {
    setIsLoading(true)

    try {
      // Εδώ θα χρησιμοποιούσαμε το πραγματικό Google Maps Distance Matrix API
      // const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(butcherAddress)}&destinations=${encodeURIComponent(customerAddress)}&key=${API_KEY}`)

      // Προσομοίωση API call με πιο ρεαλιστικά δεδομένα
      setTimeout(() => {
        // Υπολογισμός βάσει απόστασης (προσεγγιστικά)
        const addressParts = customerAddress.toLowerCase()
        let estimatedDistance = 5.0 // Default 5km
        let estimatedTime = 15 // Default 15 minutes

        // Προσεγγιστικός υπολογισμός βάσει περιοχής
        if (addressParts.includes("καλαμαρια") || addressParts.includes("καλαμαριά")) {
          estimatedDistance = 2.5
          estimatedTime = 8
        } else if (addressParts.includes("θεσσαλονίκη") || addressParts.includes("κέντρο")) {
          estimatedDistance = 8.0
          estimatedTime = 20
        } else if (addressParts.includes("πανόραμα") || addressParts.includes("πυλαία")) {
          estimatedDistance = 12.0
          estimatedTime = 25
        } else if (addressParts.includes("περιστέρα") || addressParts.includes("εύοσμος")) {
          estimatedDistance = 15.0
          estimatedTime = 30
        } else if (addressParts.includes("γλυφάδα") || addressParts.includes("βούλα")) {
          estimatedDistance = 25.0
          estimatedTime = 45
        }

        // Προσθήκη τυχαίας παραλλαγής για ρεαλισμό
        const variation = 0.8 + Math.random() * 0.4 // 0.8 to 1.2 multiplier
        estimatedDistance *= variation
        estimatedTime = Math.ceil(estimatedTime * variation)

        // Υπολογισμός εκτιμώμενης ώρας παράδοσης (+ 15 λεπτά προετοιμασία)
        const deliveryTime = new Date()
        deliveryTime.setMinutes(deliveryTime.getMinutes() + estimatedTime + 15)

        setRouteInfo({
          distance: `${estimatedDistance.toFixed(1)} km`,
          duration: `${estimatedTime} λεπτά`,
          estimatedDeliveryTime: deliveryTime.toLocaleTimeString("el-GR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
        setIsLoading(false)
      }, 1500) // Προσομοίωση network delay
    } catch (error) {
      console.error("Error calculating route:", error)
      setIsLoading(false)
    }
  }

  const openInGoogleMaps = () => {
    const origin = encodeURIComponent(butcherAddress)
    const destination = encodeURIComponent(customerAddress)
    const url = `https://www.google.com/maps/dir/${origin}/${destination}`
    window.open(url, "_blank")
  }

  // Αυτόματος υπολογισμός όταν φορτώνει το component
  useEffect(() => {
    calculateRoute()
  }, [customerAddress])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-red-600" />
          Πληροφορίες Διαδρομής
        </CardTitle>
        {customerName && <CardDescription>Πελάτης: {customerName}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
            <div>
              <p className="text-sm font-medium">Αφετηρία</p>
              <p className="text-sm text-gray-600">{butcherAddress}</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-px h-6 bg-gray-300"></div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
            <div>
              <p className="text-sm font-medium">Προορισμός</p>
              <p className="text-sm text-gray-600">{customerAddress}</p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700 text-center">Υπολογισμός διαδρομής...</p>
          </div>
        )}

        {routeInfo && !isLoading && (
          <div className="bg-blue-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Route className="h-4 w-4" />
                Απόσταση:
              </span>
              <Badge variant="outline">{routeInfo.distance}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Navigation className="h-4 w-4" />
                Χρόνος οδήγησης:
              </span>
              <Badge variant="outline">{routeInfo.duration}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Εκτιμώμενη παράδοση:
              </span>
              <Badge variant="secondary">{routeInfo.estimatedDeliveryTime}</Badge>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={calculateRoute} disabled={isLoading} variant="outline" className="flex-1">
            {isLoading ? "Υπολογισμός..." : "Ανανέωση"}
          </Button>
          <Button variant="outline" onClick={openInGoogleMaps} className="flex-1">
            Άνοιγμα Maps
          </Button>
        </div>

        {onClose && (
          <Button variant="outline" onClick={onClose} className="w-full">
            Κλείσιμο
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
