interface CalendarConfig {
  apiKey: string
  slug: string
  duration: number
  eventId: number
}

export type CalendarId = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"

export function getCalendarConfig(calendarId: CalendarId): CalendarConfig {
  const numId = calendarId as string
  return {
    apiKey: process.env[`CAL_API_KEY_${numId}` as keyof typeof process.env] || "",
    slug: process.env[`CAL_SLUG_${numId}` as keyof typeof process.env] || "",
    duration: parseInt(process.env[`CAL_DURATION_${numId}` as keyof typeof process.env] || "30", 10),
    eventId: parseInt(process.env[`CAL_EVENT_ID_${numId}` as keyof typeof process.env] || "0", 10),
  }
}

export function validateCalendarConfig(config: CalendarConfig, calendarId: string): void {
  if (!config.apiKey) {
    throw new Error(`CAL_API_KEY_${calendarId} not configured`)
  }
  if (!config.slug) {
    throw new Error(`CAL_SLUG_${calendarId} not configured`)
  }
  if (!config.eventId || config.eventId === 0) {
    throw new Error(`CAL_EVENT_ID_${calendarId} not configured or invalid`)
  }
  if (!config.duration || config.duration === 0) {
    throw new Error(`CAL_DURATION_${calendarId} not configured or invalid`)
  }
}
