"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerField } from "@/components/ui/date-picker-field"
import { Badge } from "@/components/ui/badge"

interface OrderFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  dateFilter: string
  onDateFilterChange: (value: string) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  categories: any[]
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(dateFilter ? new Date(dateFilter) : undefined)

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      onDateFilterChange(format(date, "yyyy-MM-dd"))
    } else {
      onDateFilterChange("")
    }
  }

  const handleClearFilters = () => {
    onSearchChange("")
    onDateFilterChange("")
    onCategoryFilterChange("")
    setSelectedDate(undefined)
  }

  const hasActiveFilters = searchTerm || dateFilter || categoryFilter

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Αναζήτηση παραγγελίας..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <DatePickerField label="" date={selectedDate} onDateChange={handleDateChange} disablePastDates={false} />

        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Κατηγορία προϊόντος" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Όλες οι κατηγορίες</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Ενεργά φίλτρα:</span>
          {searchTerm && (
            <Badge variant="outline" className="flex items-center gap-1">
              Αναζήτηση: {searchTerm}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onSearchChange("")} />
            </Badge>
          )}
          {dateFilter && (
            <Badge variant="outline" className="flex items-center gap-1">
              Ημερομηνία: {new Date(dateFilter).toLocaleDateString("el-GR")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  onDateFilterChange("")
                  setSelectedDate(undefined)
                }}
              />
            </Badge>
          )}
          {categoryFilter && (
            <Badge variant="outline" className="flex items-center gap-1">
              Κατηγορία: {categoryFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onCategoryFilterChange("")} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="ml-auto">
            Καθαρισμός όλων
          </Button>
        </div>
      )}
    </div>
  )
}
