"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomTimePickerProps {
  value: string
  onChange: (time: string) => void
  onBlur?: () => void
  availableTimes: string[]
  disabledTimes?: string[]
}

export function CustomTimePicker({ 
  value, 
  onChange, 
  onBlur, 
  availableTimes, 
  disabledTimes = [] 
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTimeSelect = (time: string) => {
    onChange(time)
    setIsOpen(false)
    // Wywołaj onBlur po wybraniu czasu
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

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={handleButtonBlur}
        className="w-full justify-start text-left font-normal"
      >
        <Clock className="mr-2 h-4 w-4" />
        {value || "Wybierz godzinę"}
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
              <Card className="p-4 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => {
                    const isDisabled = disabledTimes.includes(time)
                    const isSelected = value === time

                    return (
                      <Button
                        key={time}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        disabled={isDisabled}
                        onClick={() => handleTimeSelect(time)}
                        className={cn(
                          "h-10",
                          isSelected && "bg-accent text-accent-foreground hover:bg-accent/90",
                          isDisabled && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        {time}
                      </Button>
                    )
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