"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface OperatingHoursInputProps {
  onSubmit: (value: string) => void
  className?: string
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
]

const TIME_OPTIONS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
  "22:00", "22:30", "23:00"
]

interface DayHours {
  enabled: boolean
  start: string
  end: string
}

type HoursState = Record<string, DayHours>

const DEFAULT_HOURS: HoursState = {
  monday: { enabled: true, start: "08:00", end: "18:00" },
  tuesday: { enabled: true, start: "08:00", end: "18:00" },
  wednesday: { enabled: true, start: "08:00", end: "18:00" },
  thursday: { enabled: true, start: "08:00", end: "18:00" },
  friday: { enabled: true, start: "08:00", end: "18:00" },
  saturday: { enabled: false, start: "08:00", end: "12:00" },
  sunday: { enabled: false, start: "08:00", end: "12:00" },
}

export function OperatingHoursInput({ onSubmit, className }: OperatingHoursInputProps) {
  const [hours, setHours] = useState<HoursState>(DEFAULT_HOURS)

  const toggleDay = (dayKey: string) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], enabled: !prev[dayKey].enabled }
    }))
  }

  const updateTime = (dayKey: string, field: "start" | "end", value: string) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value }
    }))
  }

  const handleSubmit = () => {
    // Format as JSON string for storage
    const formattedHours = DAYS_OF_WEEK.map(day => {
      const dayHours = hours[day.key]
      if (!dayHours.enabled) return `${day.label}: Fechado`
      return `${day.label}: ${dayHours.start} - ${dayHours.end}`
    }).join("\n")
    
    onSubmit(formattedHours)
  }

  const hasAnyEnabled = Object.values(hours).some(h => h.enabled)

  return (
    <div className={cn("space-y-4 px-4", className)}>
      <div className="rounded-2xl border-2 border-[#0051fe]/20 bg-white/60 p-4 space-y-3">
        {DAYS_OF_WEEK.map((day) => {
          const dayHours = hours[day.key]
          return (
            <div key={day.key} className="flex items-center gap-3">
              {/* Day toggle */}
              <button
                type="button"
                onClick={() => toggleDay(day.key)}
                className={cn(
                  "w-20 shrink-0 py-1.5 px-2 rounded-lg text-sm font-medium transition-colors",
                  dayHours.enabled
                    ? "bg-[#0051fe] text-white"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {day.label}
              </button>

              {dayHours.enabled ? (
                <div className="flex items-center gap-2 flex-1">
                  <select
                    value={dayHours.start}
                    onChange={(e) => updateTime(day.key, "start", e.target.value)}
                    className="flex-1 rounded-lg border border-[#0051fe]/30 bg-white px-2 py-1.5 text-sm outline-none focus:border-[#0051fe]"
                  >
                    {TIME_OPTIONS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  <span className="text-[#04152b]/50">até</span>
                  <select
                    value={dayHours.end}
                    onChange={(e) => updateTime(day.key, "end", e.target.value)}
                    className="flex-1 rounded-lg border border-[#0051fe]/30 bg-white px-2 py-1.5 text-sm outline-none focus:border-[#0051fe]"
                  >
                    {TIME_OPTIONS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-[#04152b]/50 text-sm">Fechado</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!hasAnyEnabled}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-8"
        >
          Confirmar horários
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
