"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, BarChart3, TrendingUp, Users, Package, DollarSign, Download, Printer } from "lucide-react"
import { format } from "date-fns"
import { el } from "date-fns/locale"

interface ReportsDashboardProps {
  userRole: "admin" | "employee" | null
}

export function ReportsDashboard({ userRole }: ReportsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("current")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  // Mock data για αναφορές
  const salesData = {
    totalRevenue: 8920.5,
    totalOrders: 89,
    averageOrderValue: 102.5,
    topCustomers: [
      { name: "Μαρία Παπαδοπούλου", orders: 8, total: 890.5 },
      { name: "Γιάννης Κωνσταντίνου", orders: 6, total: 720.3 },
      { name: "Ελένη Δημητρίου", orders: 5, total: 650.8 },
    ],
    topProducts: [
      { name: "Αρνί Ψητό", quantity: "45.5 kg", revenue: 840.75 },
      { name: "Κοκορέτσι", quantity: "32.0 kg", revenue: 384.0 },
      { name: "Κοντοσούβλι", quantity: "28.5 kg", revenue: 421.8 },
    ],
    dailySales: [
      { date: "2025-04-15", orders: 12, revenue: 1250.3 },
      { date: "2025-04-16", orders: 8, revenue: 890.5 },
      { date: "2025-04-17", orders: 15, revenue: 1680.75 },
      { date: "2025-04-18", orders: 10, revenue: 1120.4 },
      { date: "2025-04-19", orders: 14, revenue: 1540.2 },
    ],
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    // Simulation of export functionality
    const data = JSON.stringify(salesData, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `anaforες-${format(new Date(), "yyyy-MM-dd")}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Αναφορές & Στατιστικά
              </CardTitle>
              <CardDescription>Αναλυτικές αναφορές πωλήσεων και στατιστικά</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Εκτύπωση
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Εξαγωγή
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Επισκόπηση</TabsTrigger>
              <TabsTrigger value="sales">Πωλήσεις</TabsTrigger>
              <TabsTrigger value="products">Προϊόντα</TabsTrigger>
              <TabsTrigger value="customers">Πελάτες</TabsTrigger>
            </TabsList>

            {/* Φίλτρα */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε περίοδο" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Τρέχουσα Περίοδος</SelectItem>
                    <SelectItem value="last">Προηγούμενη Περίοδος</SelectItem>
                    <SelectItem value="custom">Προσαρμοσμένη Περίοδος</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedPeriod === "custom" && (
                <>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP", { locale: el }) : "Από"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} locale={el} />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP", { locale: el }) : "Έως"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} locale={el} />
                    </PopoverContent>
                  </Popover>
                </>
              )}
            </div>

            <TabsContent value="overview" className="space-y-6">
              {/* Κύρια Στατιστικά */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Συνολικά Έσοδα</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">€{salesData.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +12.5% από προηγούμενη περίοδο
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Συνολικές Παραγγελίες</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{salesData.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +8.2% από προηγούμενη περίοδο
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Μέση Αξία Παραγγελίας</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">€{salesData.averageOrderValue}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +3.8% από προηγούμενη περίοδο
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ενεργοί Πελάτες</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      +15.3% από προηγούμενη περίοδο
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Ημερήσιες Πωλήσεις */}
              <Card>
                <CardHeader>
                  <CardTitle>Ημερήσιες Πωλήσεις</CardTitle>
                  <CardDescription>Πωλήσεις των τελευταίων ημερών</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesData.dailySales.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{new Date(day.date).toLocaleDateString("el-GR")}</p>
                          <p className="text-sm text-gray-600">{day.orders} παραγγελίες</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">€{day.revenue.toLocaleString()}</p>
                          <Badge variant="secondary">€{(day.revenue / day.orders).toFixed(2)} μ.ο.</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Κορυφαίοι Πελάτες</CardTitle>
                    <CardDescription>Πελάτες με τις περισσότερες παραγγελίες</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salesData.topCustomers.map((customer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.orders} παραγγελίες</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">€{customer.total.toLocaleString()}</p>
                            <Badge variant="outline">#{index + 1}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Κορυφαία Προϊόντα</CardTitle>
                    <CardDescription>Προϊόντα με τα μεγαλύτερα έσοδα</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salesData.topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">€{product.revenue.toLocaleString()}</p>
                            <Badge variant="outline">#{index + 1}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ανάλυση Προϊόντων</CardTitle>
                  <CardDescription>Στατιστικά πωλήσεων ανά προϊόν</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Λεπτομερή στατιστικά προϊόντων θα προστεθούν σύντομα...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ανάλυση Πελατών</CardTitle>
                  <CardDescription>Στατιστικά και συμπεριφορά πελατών</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Λεπτομερή στατιστικά πελατών θα προστεθούν σύντομα...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
