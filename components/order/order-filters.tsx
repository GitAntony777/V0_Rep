"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { el } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface OrderFiltersProps {
  onSearch: (searchTerm: string) => void
  onDateSelect: (date: Date | undefined) => void
}

export function OrderFilters({ onSearch, onDateSelect }: OrderFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    onSearch(e.target.value)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    onDateSelect(date)
  }

  const clearDate = () => {
    setSelectedDate(undefined)
    onDateSelect(undefined)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="search">Αναζήτηση Παραγγελίας</Label>
          <Input
            id="search"
            placeholder="Αναζήτηση με κωδικό, όνομα πελάτη..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div>
          <Label>Ημερομηνία Παράδοσης</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("flex-1 justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: el }) : "Επιλέξτε ημερομηνία"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={el}
                  initialFocus
                  showOutsideDays={true}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
            {selectedDate && (
              <Button variant="outline" size="icon" onClick={clearDate} className="shrink-0 bg-transparent">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
