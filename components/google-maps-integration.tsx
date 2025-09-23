"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Route, AlertCircle } from "lucide-react"

interface GoogleMapsIntegrationProps {
  address: string
}

interface LocationInfo {
  distance: string
  duration: string
  traffic: string
  route: string
}

export function GoogleMapsIntegration({ address }: GoogleMapsIntegrationProps) {
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Βάση του καταστήματος - ΤΟ ΜΠΕΛΛΕΣ
  const storeLocation = "Καπετάν Γκόνη 34, 55131 Καλαμαρια, Θεσσαλονίκη"

  useEffect(() => {
    if (!address) {
      setError("Δεν έχει οριστεί διεύθυνση")
      setLoading(false)
      return
    }

    const calculateRouteInfo = () => {
      setLoading(true)
      setError(null)

      // Προσομοίωση υπολογισμού με βάση γνωστές περιοχές Θεσσαλονίκης
      setTimeout(() => {
        try {
          const routeInfo = getRouteInfoForAddress(address)
          setLocationInfo(routeInfo)
        } catch (err) {
          setError("Σφάλμα στον υπολογισμό της διαδρομής")
        } finally {
          setLoading(false)
        }
      }, 1500)
    }

    calculateRouteInfo()
  }, [address])

  const getRouteInfoForAddress = (addr: string): LocationInfo => {
    const addressLower = addr.toLowerCase()

    // Κεντρικές περιοχές Θεσσαλονίκης
    if (
      addressLower.includes("κέντρο") ||
      addressLower.includes("τσιμισκή") ||
      addressLower.includes("εγνατία") ||
      addressLower.includes("αριστοτέλους")
    ) {
      return {
        distance: "8.5 km",
        duration: "18-25 λεπτά",
        traffic: "Μέτρια κίνηση",
        route: "Καλαμαριά → Κέντρο μέσω Λεωφ. Μεγάλου Αλεξάνδρου",
      }
    }

    // Καλαμαριά - κοντινές περιοχές
    if (addressLower.includes("καλαμαριά") || addressLower.includes("αρετσού")) {
      return {
        distance: "2.1 km",
        duration: "6-10 λεπτά",
        traffic: "Ελαφρά κίνηση",
        route: "Εντός Καλαμαριάς - τοπικοί δρόμοι",
      }
    }

    // Πανόραμα, Πυλαία
    if (addressLower.includes("πανόραμα") || addressLower.includes("πυλαία")) {
      return {
        distance: "12.3 km",
        duration: "22-30 λεπτά",
        traffic: "Μέτρια κίνηση",
        route: "Καλαμαριά → Πυλαία μέσω Θέρμης",
      }
    }

    // Τούμπα, ΠΑΟΚ
    if (addressLower.includes("τούμπα") || addressLower.includes("παοκ")) {
      return {
        distance: "6.8 km",
        duration: "15-20 λεπτά",
        traffic: "Μέτρια κίνηση",
        route: "Καλαμαριά → Τούμπα μέσω 25ης Μαρτίου",
      }
    }

    // Εύοσμος, Νεάπολη
    if (addressLower.includes("εύοσμος") || addressLower.includes("νεάπολη")) {
      return {
        distance: "15.7 km",
        duration: "28-35 λεπτά",
        traffic: "Έντονη κίνηση",
        route: "Καλαμαριά → Εύοσμος μέσω Περιφερειακής",
      }
    }

    // Χαριλάου, Άγιος Παύλος
    if (addressLower.includes("χαριλάου") || addressLower.includes("άγιος παύλος")) {
      return {
        distance: "9.2 km",
        duration: "20-25 λεπτά",
        traffic: "Μέτρια κίνηση",
        route: "Καλαμαριά → Χαριλάου μέσω Λαγκαδά",
      }
    }

    // Σταυρούπολη, Πολίχνη
    if (addressLower.includes("σταυρούπολη") || addressLower.includes("πολίχνη")) {
      return {
        distance: "11.4 km",
        duration: "24-30 λεπτά",
        traffic: "Μέτρια κίνηση",
        route: "Καλαμαριά → Πολίχνη μέσω Λαγκαδά",
      }
    }

    // Περαία, Αγία Τριάδα
    if (addressLower.includes("περαία") || addressLower.includes("αγία τριάδα")) {
      return {
        distance: "16.8 km",
        duration: "25-32 λεπτά",
        traffic: "Ελαφρά κίνηση",
        route: "Καλαμαριά → Περαία μέσω παραλιακής",
      }
    }

    // Θέρμη, Βασιλικά
    if (addressLower.includes("θέρμη") || addressLower.includes("βασιλικά")) {
      return {
        distance: "18.5 km",
        duration: "30-38 λεπτά",
        traffic: "Μέτρια κίνηση",
        route: "Καλαμαριά → Θέρμη μέσω Λεωφ. Θέρμης",
      }
    }

    // Default για άγνωστες περιοχές
    return {
      distance: "10.5 km",
      duration: "20-28 λεπτά",
      traffic: "Μέτρια κίνηση",
      route: "Διαδρομή μέσω κεντρικών αρτηριών",
    }
  }

  const getTrafficColor = (traffic: string) => {
    switch (traffic) {
      case "Ελαφρά κίνηση":
        return "bg-green-100 text-green-800"
      case "Μέτρια κίνηση":
        return "bg-yellow-100 text-yellow-800"
      case "Έντονη κίνηση":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!address) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <p>Δεν έχει οριστεί διεύθυνση</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full space-y-4">
      {/* Χάρτης */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Χάρτης Διαδρομής
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">Διαδρομή προς:</p>
              <p className="text-sm">{address}</p>
              <p className="text-xs mt-2">Από: {storeLocation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Πληροφορίες Διαδρομής */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Πληροφορίες Διαδρομής
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : locationInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Route className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                  <p className="text-sm text-gray-600">Απόσταση</p>
                  <p className="font-semibold text-blue-600">{locationInfo.distance}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-1 text-green-600" />
                  <p className="text-sm text-gray-600">Χρόνος</p>
                  <p className="font-semibold text-green-600">{locationInfo.duration}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Κατάσταση Κίνησης:</span>
                  <Badge className={getTrafficColor(locationInfo.traffic)}>{locationInfo.traffic}</Badge>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Προτεινόμενη Διαδρομή:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{locationInfo.route}</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Σημείωση:</strong> Οι χρόνοι είναι ενδεικτικοί και μπορεί να διαφέρουν ανάλογα με την κίνηση
                  και τις συνθήκες του δρόμου.
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
