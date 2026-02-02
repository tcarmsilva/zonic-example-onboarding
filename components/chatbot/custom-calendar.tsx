"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { getAvailableSlots, getAggregatedSlots } from "@/lib/cal-api"
import { cn } from "@/lib/utils"
import type { CalendarId } from "@/lib/cal-config"

interface TimeSlot {
  start: string
  formatted: string
}

interface DayAvailability {
  date: string
  dayLabel: string
  dayNumber: string
  slots: TimeSlot[]
  isAvailable: boolean
}

interface CustomCalendarProps {
  onSlotSelect: (slot: string) => void
  calendarId?: CalendarId
  calendarIds?: CalendarId[] // Se fornecido, agrega slots de múltiplos calendários
}

export function CustomCalendar({ onSlotSelect, calendarId = "1", calendarIds }: CustomCalendarProps) {
  const [days, setDays] = useState<DayAvailability[]>([])
  const [selectedDay, setSelectedDay] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAvailability()
  }, [calendarId, calendarIds])

  const loadAvailability = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Loading availability...")

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const now = new Date()

      console.log("[v0] User timezone:", userTimezone)
      console.log("[v0] Current time:", now)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const startDate = today.toISOString().split("T")[0]

      const endDateObj = new Date(today)
      endDateObj.setDate(today.getDate() + 14)
      const endDate = endDateObj.toISOString().split("T")[0]

      let response

      // Se calendarIds for fornecido, agrega slots de múltiplos calendários
      if (calendarIds && calendarIds.length > 0) {
        console.log("[v0] Fetching aggregated slots for 15 days:", startDate, "to", endDate, "calendars:", calendarIds)
        response = await getAggregatedSlots(startDate, endDate, calendarIds)
      } else {
        console.log("[v0] Fetching slots for 15 days:", startDate, "to", endDate, "calendar:", calendarId)
        response = await getAvailableSlots(startDate, endDate, calendarId)
      }

      console.log("[v0] Received slots response:", response)

      if (!response.data || !response.data.slots) {
        throw new Error("Invalid response format")
      }

      const allDays: DayAvailability[] = []

      for (let i = 0; i < 15; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        const dateStr = date.toISOString().split("T")[0]

        const slotsForDay = response.data.slots[dateStr] || []

        const filteredSlots = slotsForDay
          .map((slot: any) => {
            const slotTime = typeof slot === "string" ? slot : slot.time
            const slotDate = new Date(slotTime)
            // Log para debug: mostra o slot original (UTC) e como aparece para o usuário
            const hours = slotDate.getHours().toString().padStart(2, "0")
            const minutes = slotDate.getMinutes().toString().padStart(2, "0")
            const localTime = `${hours}:${minutes}`
            console.log(`[v0] Slot: ${slotTime} (UTC) -> ${localTime} (${userTimezone})`)
            return slotDate
          })
          .filter((slotDate: Date) => {
            if (i === 0) {
              return slotDate > now
            }
            return true
          })
          .map((slotDate: Date) => {
            const hours = slotDate.getHours().toString().padStart(2, "0")
            const minutes = slotDate.getMinutes().toString().padStart(2, "0")
            return {
              start: slotDate.toISOString(), // Mantém UTC para envio ao Cal.com
              formatted: `${hours}:${minutes}`, // Exibe na timezone local do usuário
            }
          })

        if (filteredSlots.length > 0) {
          allDays.push({
            date: dateStr,
            dayLabel: "",
            dayNumber: `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`,
            slots: filteredSlots,
            isAvailable: true,
          })
        }
      }

      console.log("[v0] Days with availability:", allDays.length)

      const daysToShow = allDays.slice(0, 3)

      const dayNames = [
        "Domingo",
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado",
      ]

      daysToShow.forEach((day, index) => {
        const dayDate = new Date(day.date + "T00:00:00")
        const daysDiff = Math.floor((dayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff === 0) {
          day.dayLabel = "Hoje"
        } else if (daysDiff === 1) {
          day.dayLabel = "Amanhã"
        } else {
          day.dayLabel = dayNames[dayDate.getDay()]
        }
      })

      console.log("[v0] Days to show:", daysToShow)

      setDays(daysToShow)
      setSelectedDay(0)
    } catch (err) {
      console.error("[v0] Error loading availability:", err)
      setError("Erro ao carregar disponibilidade. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0051fe]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[#04152b] mb-4">{error}</p>
        <Button onClick={loadAvailability} variant="outline" size="sm" className="border-[#0051fe] text-[#0051fe] hover:bg-[#0051fe]/10">
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (days.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#04152b]/80 mb-4">Não há horários disponíveis nos próximos 15 dias.</p>
        <Button onClick={loadAvailability} variant="outline" size="sm" className="border-[#0051fe] text-[#0051fe] hover:bg-[#0051fe]/10">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4">
      {/* Days selector */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[#04152b]/80">Selecione um dia:</h3>
        <div className="grid grid-cols-3 gap-3">
          {days.map((day, index) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(index)}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg p-4 border-2 transition-all",
                "border-[#0051fe]/30 hover:border-[#0051fe] hover:bg-[#0051fe]/10 cursor-pointer",
                selectedDay === index && "border-[#0051fe] bg-[#0051fe]/15",
              )}
            >
              <span className="text-base font-semibold text-[#04152b]">{day.dayLabel}</span>
              <span className="text-sm text-[#04152b]/70 mt-1">{day.dayNumber}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      {selectedDay !== null && days[selectedDay]?.slots.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-sm font-medium text-[#04152b]/80">Selecione um horário:</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {days[selectedDay].slots.map((slot, index) => (
              <Button
                key={index}
                onClick={() => onSlotSelect(slot.start)}
                className="rounded-full bg-[#0051fe] px-5 py-2 text-sm font-medium text-white hover:bg-[#0046d9] transition-colors"
              >
                {slot.formatted}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
