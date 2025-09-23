"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { el } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface OrderFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  dateSearchTerm: Date | undefined
  onDateSearchChange: (date: Date | undefined) => void
  onClearFilters: () => void
}

export function OrderFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateSearchTerm,
  onDateSearchChange,
  onClearFilters,
}: OrderFiltersProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const hasActiveFilters = searchTerm || statusFilter !== "all" || dateSearchTerm

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Αναζήτηση</Label>
          <div className="relative">
            <Input
              id="search"
              placeholder="Αναζήτηση με αρ. παραγγελίας, όνομα πελάτη..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => onSearchChange("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Κατάσταση</Label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Όλες οι καταστάσεις" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλες</SelectItem>
              <SelectItem value="pending">Εκκρεμής</SelectItem>
              <SelectItem value="confirmed">Επιβεβαιωμένη</SelectItem>
              <SelectItem value="preparing">Προετοιμασία</SelectItem>
              <SelectItem value="ready">Έτοιμη</SelectItem>
              <SelectItem value="delivered">Παραδόθηκε</SelectItem>
              <SelectItem value="cancelled">Ακυρώθηκε</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Ημερομηνία Παράδοσης</Label>
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !dateSearchTerm && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateSearchTerm ? format(dateSearchTerm, "PPP", { locale: el }) : "Επιλέξτε ημερομηνία"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateSearchTerm}
                onSelect={(date) => {
                  onDateSearchChange(date)
                  setDatePickerOpen(false)
                }}
                initialFocus
                showOutsideDays={true}
                className="rounded-md border"
              />
              {dateSearchTerm && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDateSearchChange(undefined)
                      setDatePickerOpen(false)
                    }}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Καθαρισμός Ημερομηνίας
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-700">
            Ενεργά φίλτρα: {searchTerm && "Αναζήτηση"} {statusFilter !== "all" && "Κατάσταση"}{" "}
            {dateSearchTerm && "Ημερομηνία"}
          </div>
          <Button variant="outline" size="sm" onClick={onClearFilters} className="bg-white">
            <X className="h-4 w-4 mr-2" />
            Καθαρισμός Όλων
          </Button>
        </div>
      )}
    </div>
  )
}
