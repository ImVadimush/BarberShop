"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomDatePickerProps {
  value: string
  onChange: (date: string) => void
  onBlur?: () => void
  disabledDates?: string[]
  minDate?: Date
}

export function CustomDatePicker({ 
  value, 
  onChange, 
  onBlur, 
  disabledDates = [], 
  minDate = new Date() 
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const monthNames = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ]

  const dayNames = ["Nd", "Pn", "Wt", "Śr", "Czw", "Pt", "Sb"]

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), day))
    const dateString = selectedDate.toISOString().split("T")[0]
    onChange(dateString)
    setIsOpen(false)
    // Wywołaj onBlur po wybraniu daty
    if (onBlur) {
      onBlur()
    }
  }

  const handleButtonBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    // Zapobiegaj natychmiastowemu wywołaniu onBlur gdy klikamy na picker
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setTimeout(() => {
        if (!isOpen && onBlur) {
          onBlur()
        }
      }, 100)
    }
  }

  const isDateDisabled = (day: number) => {
    const date = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), day))
    const dateString = date.toISOString().split("T")[0]
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today || disabledDates.includes(dateString)
  }

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Wybierz datę"
    const [year, month, day] = dateString.split("-").map(Number)
    return `${day} ${monthNames[month - 1]} ${year}`
  }

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={handleButtonBlur}
        className="w-full justify-start text-left font-normal"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formatDisplayDate(value)}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => {
                setIsOpen(false)
                if (onBlur) {
                  onBlur()
                }
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-2 w-full"
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Button type="button" variant="ghost" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="font-semibold">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    if (typeof day === "number") {
                      const disabled = isDateDisabled(day)
                      const selectedDate = new Date(Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), day))
                      const isSelected = value === selectedDate.toISOString().split("T")[0]

                      return (
                        <Button
                          key={index}
                          type="button"
                          variant={isSelected ? "default" : "ghost"}
                          size="sm"
                          disabled={disabled}
                          onClick={() => handleDateSelect(day)}
                          className={cn(
                            "h-10 w-full",
                            isSelected && "bg-accent text-accent-foreground hover:bg-accent/90",
                            disabled && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          {day}
                        </Button>
                      )
                    }
                    return day
                  })}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}