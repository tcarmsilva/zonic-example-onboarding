import type { CalendarId } from "./cal-config"

interface CalSlotResponse {
  status: string
  data: {
    slots: {
      [date: string]: string[]
    }
  }
}

interface CacheEntry {
  slots: CalSlotResponse
  timestamp: number
}

const cache: Record<string, CacheEntry> = {}
const CACHE_DURATION = 30000 // 30 seconds

export async function prefetchSlots(calendarId: CalendarId = "1"): Promise<void> {
  const now = Date.now()
  const cacheKey = `calendar_${calendarId}`

  // Skip if cache is still valid
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    return
  }

  try {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + 6)

    const startDateStr = today.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    console.log("[v0] Prefetching slots for 7 days:", startDateStr, "to", endDateStr, "calendar:", calendarId)

    const url = new URL("/api/cal/slots", window.location.origin)
    url.searchParams.set("startDate", startDateStr)
    url.searchParams.set("endDate", endDateStr)
    url.searchParams.set("calendarId", calendarId)

    const response = await fetch(url.toString())

    if (response.ok) {
      const data = await response.json()
      cache[cacheKey] = {
        slots: data,
        timestamp: now,
      }
      console.log("[v0] Slots prefetched successfully for calendar", calendarId)
    }
  } catch (err) {
    console.error("[v0] Prefetch error:", err)
  }
}

export async function getAvailableSlots(
  startDate: string,
  endDate: string,
  calendarId: CalendarId = "1",
): Promise<CalSlotResponse> {
  console.log("[v0] Fetching slots via our API:", { startDate, endDate, calendarId })

  const cacheKey = `calendar_${calendarId}`
  const requestedRange = `${startDate}_${endDate}`
  const cachedEntry = cache[cacheKey]

  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
    console.log("[v0] Returning cached slots for calendar", calendarId)
    return cachedEntry.slots
  }

  console.log("[v0] Cache miss or expired, fetching fresh slots for calendar", calendarId)

  const url = new URL("/api/cal/slots", window.location.origin)
  url.searchParams.set("startDate", startDate)
  url.searchParams.set("endDate", endDate)
  url.searchParams.set("calendarId", calendarId)

  const response = await fetch(url.toString())

  if (!response.ok) {
    const error = await response.json()
    console.error("[v0] API error:", error)
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()

  cache[cacheKey] = {
    slots: data,
    timestamp: Date.now(),
  }

  return data
}

/**
 * Busca slots de múltiplos calendários e agrega os resultados, removendo duplicatas
 */
export async function getAggregatedSlots(
  startDate: string,
  endDate: string,
  calendarIds: CalendarId[],
): Promise<CalSlotResponse> {
  console.log("[v0] Fetching aggregated slots from multiple calendars:", { startDate, endDate, calendarIds })

  const allSlots: { [date: string]: Set<string> } = {}

  // Buscar slots de todos os calendários em paralelo
  const promises = calendarIds.map((calendarId) => 
    getAvailableSlots(startDate, endDate, calendarId).catch((err) => {
      console.error(`[v0] Error fetching slots for calendar ${calendarId}:`, err)
      return null
    })
  )

  const results = await Promise.all(promises)

  // Agregar slots, removendo duplicatas
  results.forEach((result) => {
    if (result?.data?.slots) {
      Object.keys(result.data.slots).forEach((date) => {
        if (!allSlots[date]) {
          allSlots[date] = new Set()
        }
        result.data.slots[date].forEach((slot: string) => {
          allSlots[date].add(slot)
        })
      })
    }
  })

  // Converter Sets para arrays e ordenar
  const aggregatedSlots: { [date: string]: string[] } = {}
  Object.keys(allSlots).forEach((date) => {
    aggregatedSlots[date] = Array.from(allSlots[date]).sort()
  })

  console.log("[v0] Aggregated slots:", Object.keys(aggregatedSlots).length, "days with availability")

  return {
    status: "success",
    data: {
      slots: aggregatedSlots,
    },
  }
}

export async function createBooking(
  start: string,
  name: string,
  email: string,
  phone: string,
  company: string,
  calendarId: CalendarId = "1",
  notes?: string,
  timeZone?: string,
) {
  console.log("[v0] Creating booking via our API:", { start, name, email, company, calendarId, timeZone })

  const response = await fetch("/api/cal/booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start,
      name,
      email,
      phone,
      company,
      calendarId,
      notes,
      timeZone,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("[v0] Booking API error:", error)
    throw new Error(error.error || `Booking error: ${response.status}`)
  }

  return response.json()
}

export async function cancelBooking(
  bookingUid: string,
  calendarId: CalendarId = "1",
  reason = "User requested cancellation",
) {
  console.log("[v0] Cancelling booking:", { bookingUid, reason, calendarId })

  const response = await fetch("/api/cal/booking/cancel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bookingUid,
      calendarId,
      reason,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("[v0] Cancel booking API error:", error)
    throw new Error(error.error || `Cancel error: ${response.status}`)
  }

  return response.json()
}
