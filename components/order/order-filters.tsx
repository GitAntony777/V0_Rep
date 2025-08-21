"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  const [dateOpen, setDateOpen] = useState(false)

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-wrap gap-4">
        {/* Αναζήτηση */}
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search">Αναζήτηση</Label>
          <Input
            id="search"
            placeholder="Αναζήτηση παραγγελιών..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Φίλτρο Κατάστασης */}
        <div className="min-w-[150px]">
          <Label>Κατάσταση</Label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Όλες" />
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

        {/* Φίλτρο Ημερομηνίας Παράδοσης */}
        <div className="min-w-[200px]">
          <Label>Ημερομηνία Παράδοσης</Label>
          <div className="flex gap-2">
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !dateSearchTerm && "text-muted-foreground",
                  )}
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
                    setDateOpen(false)
                  }}
                  initialFocus
                  showOutsideDays={true}
                  className="rounded-md border"
                />
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDateSearchChange(undefined)
                      setDateOpen(false)
                    }}
                    className="w-full"
                  >
                    Καθαρισμός
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {dateSearchTerm && (
              <Button variant="outline" size="sm" onClick={() => onDateSearchChange(undefined)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Κουμπί Καθαρισμού */}
        <div className="flex items-end">
          <Button variant="outline" onClick={onClearFilters}>
            Καθαρισμός Φίλτρων
          </Button>
        </div>
      </div>
    </div>
  )
}
