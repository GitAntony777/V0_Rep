"use client"

import { useState } from "react"
import { format } from "date-fns"
import { el } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Search, CalendarIcon, Filter } from "lucide-react"
import { FilterBadge } from "@/components/ui/filter-badge"

interface Category {
  id: string
  name: string
}

interface OrderFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  dateFilter: string
  onDateFilterChange: (value: string) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  categories: Category[]
}

export function OrderFilters({
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
}: OrderFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        {/* Αναζήτηση */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Αναζήτηση με κωδικό, πελάτη ή τηλέφωνο..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Ημερομηνία */}
        <DateFilterPopover dateFilter={dateFilter} onDateFilterChange={onDateFilterChange} />

        {/* Κατηγορία */}
        <CategoryFilterPopover
          categories={categories}
          onCategoryFilterChange={onCategoryFilterChange}
          categoryFilter={categoryFilter}
        />
      </div>

      {/* Ενεργά φίλτρα */}
      <div className="flex flex-wrap gap-2">
        {dateFilter && (
          <FilterBadge
            label="Ημερομηνία"
            value={format(new Date(dateFilter), "dd/MM/yyyy")}
            onClear={() => onDateFilterChange("")}
          />
        )}
        {categoryFilter && (
          <FilterBadge label="Κατηγορία" value={categoryFilter} onClear={() => onCategoryFilterChange("")} />
        )}
        {(dateFilter || categoryFilter || searchTerm) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              onSearchChange("")
              onDateFilterChange("")
              onCategoryFilterChange("")
            }}
          >
            Καθαρισμός όλων
          </Button>
        )}
      </div>
    </div>
  )
}

// Υπο-component για το φίλτρο ημερομηνίας
function DateFilterPopover({ dateFilter, onDateFilterChange }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto justify-start">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateFilter ? format(new Date(dateFilter), "dd/MM/yyyy") : "Ημερομηνία παράδοσης"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateFilter ? new Date(dateFilter) : undefined}
          onSelect={(date) => {
            if (date) {
              onDateFilterChange(format(date, "yyyy-MM-dd"))
            } else {
              onDateFilterChange("")
            }
            setOpen(false)
          }}
          locale={el}
          initialFocus
        />
        <div className="p-3 border-t flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onDateFilterChange("")
              setOpen(false)
            }}
          >
            Καθαρισμός
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Υπο-component για το φίλτρο κατηγορίας
function CategoryFilterPopover({ categories, categoryFilter, onCategoryFilterChange }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto justify-start">
          <Filter className="mr-2 h-4 w-4" />
          {categoryFilter ? `Κατηγορία: ${categoryFilter}` : "Φίλτρο κατηγορίας"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="p-2">
          <p className="font-medium mb-2">Επιλογή Κατηγορίας</p>
          <div className="space-y-1">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onCategoryFilterChange(category.name)
                  setOpen(false)
                }}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="p-2 border-t flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onCategoryFilterChange("")
              setOpen(false)
            }}
          >
            Καθαρισμός
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
