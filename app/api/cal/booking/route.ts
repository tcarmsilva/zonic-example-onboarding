import { NextResponse } from "next/server"
import { getCalendarConfig, validateCalendarConfig, type CalendarId } from "@/lib/cal-config"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { start, name, email, phone, notes, company, bookingId, calendarId, timeZone } = body
    const calId = (calendarId || "1") as CalendarId
    // Usar a timezone do usuário se fornecida, caso contrário usar São Paulo como padrão
    const attendeeTimeZone = timeZone || "America/Sao_Paulo"
    console.log("[v0] Booking timezone info:", {
      attendeeTimeZone,
      start,
      // Cal.com salvará convertendo para a timezone do calendário (SP)
      // O vendedor verá em SP, o attendee verá na timezone dele
    })

    const config = getCalendarConfig(calId)
    
    try {
      validateCalendarConfig(config, calId)
    } catch (error: any) {
      console.error(`[v0] Calendar ${calId} config error:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (bookingId) {
      console.log("[v0] Rescheduling booking:", { bookingId, start, name, email })

      const response = await fetch(`https://api.cal.com/v2/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "cal-api-version": "2024-08-13",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start,
          attendee: {
            name,
            email,
            timeZone: attendeeTimeZone,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Cal.com reschedule error:", response.status, errorText)
        return NextResponse.json(
          { error: `Reschedule error: ${response.status}`, details: errorText },
          { status: response.status },
        )
      }

      const data = await response.json()
      console.log("[v0] Booking rescheduled:", data)

      return NextResponse.json(data)
    } else {
      console.log("[v0] Creating booking:", { start, name, email, company, phone, eventTypeId: config.eventId, calendarId: calId })

      const response = await fetch("https://api.cal.com/v2/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "cal-api-version": "2024-08-13",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventTypeId: config.eventId,
          start,
          attendee: {
            name,
            email,
            timeZone: attendeeTimeZone,
            phoneNumber: phone,
            language: "pt",
          },
          bookingFieldsResponses: {
            company: company || "Não informado",
          },
          metadata: {
            notes: notes || "",
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Cal.com booking error:", response.status, errorText)
        return NextResponse.json(
          { error: `Booking error: ${response.status}`, details: errorText },
          { status: response.status },
        )
      }

      const data = await response.json()
      console.log("[v0] Booking created:", data)

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("[v0] Error creating or rescheduling booking:", error)
    return NextResponse.json({ error: "Failed to create or reschedule booking" }, { status: 500 })
  }
}
