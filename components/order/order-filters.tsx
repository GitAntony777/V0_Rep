"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Search, CalendarIcon, X } from "lucide-react"
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    onDateSearchChange(date)
    setIsDatePickerOpen(false)
  }

  const clearDate = () => {
    onDateSearchChange(undefined)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Αναζήτηση με αριθμό παραγγελίας ή όνομα πελάτη..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Date Picker */}
        <div className="flex-1">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !dateSearchTerm && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateSearchTerm ? (
                  <span className="flex items-center gap-2">
                    {format(dateSearchTerm, "PPP", { locale: el })}
                    <X
                      className="h-4 w-4 hover:bg-gray-200 rounded"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearDate()
                      }}
                    />
                  </span>
                ) : (
                  "Επιλογή ημερομηνίας παράδοσης..."
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateSearchTerm}
                onSelect={handleDateSelect}
                showOutsideDays={true}
                className="rounded-md border"
                initialFocus
              />
              {dateSearchTerm && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearDate()
                      setIsDatePickerOpen(false)
                    }}
                    className="w-full"
                  >
                    Καθαρισμός
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Filters Button */}
        <Button variant="outline" onClick={onClearFilters}>
          Καθαρισμός Φίλτρων
        </Button>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || dateSearchTerm) && (
        <div className="flex flex-wrap gap-2">
          <Label className="text-sm text-gray-600">Ενεργά φίλτρα:</Label>
          {searchTerm && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              <span>Αναζήτηση: "{searchTerm}"</span>
              <X className="h-3 w-3 cursor-pointer hover:bg-blue-200 rounded" onClick={() => onSearchChange("")} />
            </div>
          )}
          {dateSearchTerm && (
            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              <span>Ημερομηνία: {format(dateSearchTerm, "PPP", { locale: el })}</span>
              <X className="h-3 w-3 cursor-pointer hover:bg-green-200 rounded" onClick={clearDate} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
