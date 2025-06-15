"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, CalendarIcon } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { el } from "date-fns/locale"

interface OrderFiltersProps {
  onSearch: (searchTerm: string) => void
  onDateSelect: (date: Date | undefined) => void
}

export function OrderFilters({ onSearch, onDateSelect }: OrderFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    onSearch(e.target.value)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    onDateSelect(date)
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: el }) : "Επιλέξτε ημερομηνία"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} locale={el} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
