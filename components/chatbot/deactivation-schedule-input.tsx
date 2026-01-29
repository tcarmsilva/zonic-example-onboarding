"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface DeactivationScheduleInputProps {
  onSubmit: (value: string) => void
  className?: string
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Seg" },
  { key: "tuesday", label: "Ter" },
  { key: "wednesday", label: "Qua" },
  { key: "thursday", label: "Qui" },
  { key: "friday", label: "Sex" },
  { key: "saturday", label: "Sáb" },
  { key: "sunday", label: "Dom" },
]

const TIME_OPTIONS = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00",
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
]

interface DaySchedule {
  enabled: boolean
  start: string
  end: string
}

type ScheduleState = Record<string, DaySchedule>

const DEFAULT_SCHEDULE: ScheduleState = {
  monday: { enabled: true, start: "08:00", end: "18:00" },
  tuesday: { enabled: true, start: "08:00", end: "18:00" },
  wednesday: { enabled: true, start: "08:00", end: "18:00" },
  thursday: { enabled: true, start: "08:00", end: "18:00" },
  friday: { enabled: true, start: "08:00", end: "18:00" },
  saturday: { enabled: false, start: "08:00", end: "12:00" },
  sunday: { enabled: false, start: "08:00", end: "12:00" },
}

export function DeactivationScheduleInput({ onSubmit, className }: DeactivationScheduleInputProps) {
  const [mode, setMode] = useState<"always_on" | "scheduled">("always_on")
  const [schedule, setSchedule] = useState<ScheduleState>(DEFAULT_SCHEDULE)

  const toggleDay = (dayKey: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], enabled: !prev[dayKey].enabled }
    }))
  }

  const updateTime = (dayKey: string, field: "start" | "end", value: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value }
    }))
  }

  const handleSubmit = () => {
    if (mode === "always_on") {
      onSubmit("Sempre ligada")
    } else {
      const formatted = DAYS_OF_WEEK
        .filter(day => schedule[day.key].enabled)
        .map(day => {
          const s = schedule[day.key]
          return `${day.label}: ${s.start} - ${s.end}`
        })
        .join(", ")
      
      onSubmit(`Desligada: ${formatted || "Nenhum dia selecionado"}`)
    }
  }

  return (
    <div className={cn("space-y-4 px-4", className)}>
      {/* Mode selection */}
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={() => setMode("always_on")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            mode === "always_on"
              ? "bg-[#0051fe] text-white"
              : "bg-[#0051fe]/10 text-[#0051fe] hover:bg-[#0051fe]/20"
          )}
        >
          Sempre ligada
        </button>
        <button
          type="button"
          onClick={() => setMode("scheduled")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            mode === "scheduled"
              ? "bg-[#0051fe] text-white"
              : "bg-[#0051fe]/10 text-[#0051fe] hover:bg-[#0051fe]/20"
          )}
        >
          Desligar em horários específicos
        </button>
      </div>

      {mode === "scheduled" && (
        <div className="rounded-2xl border-2 border-[#0051fe]/20 bg-white/60 p-4 space-y-3">
          <p className="text-sm text-[#04152b]/70 text-center mb-3">
            Selecione os dias e horários em que a IA deve ficar <strong>DESLIGADA</strong>:
          </p>
          
          {DAYS_OF_WEEK.map((day) => {
            const daySchedule = schedule[day.key]
            return (
              <div key={day.key} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleDay(day.key)}
                  className={cn(
                    "w-12 shrink-0 py-1 px-2 rounded-lg text-xs font-medium transition-colors",
                    daySchedule.enabled
                      ? "bg-[#0051fe] text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  {day.label}
                </button>

                {daySchedule.enabled && (
                  <div className="flex items-center gap-1 flex-1 text-sm">
                    <select
                      value={daySchedule.start}
                      onChange={(e) => updateTime(day.key, "start", e.target.value)}
                      className="flex-1 rounded-lg border border-[#0051fe]/30 bg-white px-2 py-1 text-xs text-[#04152b] outline-none focus:border-[#0051fe] [&>option]:text-[#04152b] [&>option]:bg-white"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <span className="text-[#04152b]/50 text-xs">até</span>
                    <select
                      value={daySchedule.end}
                      onChange={(e) => updateTime(day.key, "end", e.target.value)}
                      className="flex-1 rounded-lg border border-[#0051fe]/30 bg-white px-2 py-1 text-xs text-[#04152b] outline-none focus:border-[#0051fe] [&>option]:text-[#04152b] [&>option]:bg-white"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] px-8"
        >
          Confirmar
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
