import { NextResponse } from "next/server"
import { getCalendarConfig, validateCalendarConfig, type CalendarId } from "@/lib/cal-config"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const calendarId = (searchParams.get("calendarId") || "1") as CalendarId

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Missing date parameters" }, { status: 400 })
    }

    const config = getCalendarConfig(calendarId)
    
    try {
      validateCalendarConfig(config, calendarId)
    } catch (error: any) {
      console.error(`[v0] Calendar ${calendarId} config error:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Fetching slots from Cal.com:", { startDate, endDate, eventTypeId: config.eventId, calendarId })

    const startDateTime = `${startDate}T00:00:00Z`
    const endDateTime = `${endDate}T23:59:59Z`

    const url = new URL("https://api.cal.com/v2/slots/available")
    url.searchParams.set("eventTypeId", config.eventId.toString())
    url.searchParams.set("startTime", startDateTime)
    url.searchParams.set("endTime", endDateTime)

    console.log("[v0] Cal.com API URL:", url.toString())

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "cal-api-version": "2024-08-13",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Cal.com API error:", response.status, errorText)
      return NextResponse.json(
        { error: `Cal.com API error: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[v0] Cal.com API response:", JSON.stringify(data).slice(0, 500))

    const transformedData = {
      status: data.status || "success",
      data: {
        slots: data.data?.slots || {},
      },
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("[v0] Error fetching slots:", error)
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 })
  }
}
