import { NextResponse } from "next/server"
import { getCalendarConfig, validateCalendarConfig, type CalendarId } from "@/lib/cal-config"

export async function POST(request: Request) {
  try {
    const { bookingUid, reason, calendarId } = await request.json()
    const calId = (calendarId || "1") as CalendarId

    const config = getCalendarConfig(calId)
    
    try {
      validateCalendarConfig(config, calId)
    } catch (error: any) {
      console.error(`[v0] Calendar ${calId} config error:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Cancelling booking:", { bookingUid, reason, calendarId: calId })

    const response = await fetch(`https://api.cal.com/v2/bookings/${bookingUid}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "cal-api-version": "2024-08-13",
      },
      body: JSON.stringify({
        cancellationReason: reason || "User requested cancellation",
      }),
    })

    const responseText = await response.text()
    console.log("[v0] Cal.com cancel response:", responseText)

    if (!response.ok) {
      console.error("[v0] Cal.com cancel booking error:", response.status, responseText)
      return NextResponse.json({ error: `Cancel error: ${response.status}`, details: responseText }, { status: 400 })
    }

    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Cancel booking route error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
