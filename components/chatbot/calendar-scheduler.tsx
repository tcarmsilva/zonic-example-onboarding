"use client"

import { useState } from "react"
import { CustomCalendar } from "./custom-calendar"
import { BookingForm } from "./booking-form"
import type { CalendarId } from "@/lib/cal-config"

interface CalendarSchedulerProps {
  userData: {
    name: string
    phone: string
    clinicName: string
    companyType?: string
  }
  leadId?: number | null
  calendarIds?: CalendarId[] // Lista de calendários para agregar slots
  onBookingComplete?: (bookingInfo: { date: string; time: string; shortFormat: string }, isClinic: boolean) => void
}

export function CalendarScheduler({ userData, leadId, calendarIds = ["1"], onBookingComplete }: CalendarSchedulerProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  // Usar o primeiro calendário como padrão para booking
  const primaryCalendarId = calendarIds[0]

  if (selectedSlot) {
    return (
      <BookingForm
        selectedSlot={selectedSlot}
        userData={userData}
        onSuccess={(bookingInfo, isClinic) => {
          if (bookingInfo && onBookingComplete) {
            onBookingComplete(bookingInfo, isClinic || false)
          }
        }}
        onBack={() => setSelectedSlot(null)}
        leadId={leadId}
        calendarId={primaryCalendarId}
        calendarIds={calendarIds}
      />
    )
  }

  return <CustomCalendar onSlotSelect={setSelectedSlot} calendarId={primaryCalendarId} calendarIds={calendarIds} />
}
