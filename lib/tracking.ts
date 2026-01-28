// UTM Parameters type
export interface UTMParams {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_id: string | null
  utm_term: string | null
  utm_content: string | null
}

// Get UTM parameters from URL
export function getUTMParams(): UTMParams {
  if (typeof window === "undefined") {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_id: null,
      utm_term: null,
      utm_content: null,
    }
  }

  const params = new URLSearchParams(window.location.search)

  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_id: params.get("utm_id"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
  }
}

// Store UTMs in sessionStorage for persistence
export function storeUTMParams(): UTMParams {
  const utms = getUTMParams()

  if (typeof window !== "undefined") {
    // Only store if we have at least one UTM param
    const hasUtm = Object.values(utms).some((v) => v !== null)
    if (hasUtm) {
      sessionStorage.setItem("utm_params", JSON.stringify(utms))
    } else {
      // Try to retrieve from storage if no UTMs in URL
      const stored = sessionStorage.getItem("utm_params")
      if (stored) {
        return JSON.parse(stored)
      }
    }
  }

  return utms
}

// Get stored UTMs
export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === "undefined") return null

  const stored = sessionStorage.getItem("utm_params")
  if (stored) {
    return JSON.parse(stored)
  }

  return null
}

// Meta Pixel Events
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
    _fbq: unknown
    dataLayer: unknown[]
  }
}

export function trackMetaEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params)
  }
}

export function trackMetaCustomEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, params)
  }
}

// Standard Meta Pixel Events
export const MetaEvents = {
  // Conversion events
  Lead: (params?: { content_name?: string; value?: number; currency?: string }) => trackMetaEvent("Lead", params),

  CompleteRegistration: (params?: { content_name?: string; value?: number; currency?: string }) =>
    trackMetaEvent("CompleteRegistration", params),

  Schedule: (params?: { content_name?: string }) => trackMetaCustomEvent("Schedule", params),

  Contact: (params?: { content_name?: string }) => trackMetaEvent("Contact", params),

  // Page/Content events
  ViewContent: (params?: { content_name?: string; content_category?: string }) => trackMetaEvent("ViewContent", params),

  InitiateCheckout: (params?: { content_name?: string; value?: number; currency?: string }) =>
    trackMetaEvent("InitiateCheckout", params),
}

// GTM Data Layer Push
export function pushToDataLayer(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event,
      ...data,
    })
  }
}

// GTM Events
export const GTMEvents = {
  formStart: () => pushToDataLayer("form_start"),

  formStep: (step: string, data?: Record<string, unknown>) => pushToDataLayer("form_step", { step, ...data }),

  formSubmit: (data?: Record<string, unknown>) => pushToDataLayer("form_submit", data),

  lead: (data?: Record<string, unknown>) => pushToDataLayer("generate_lead", data),

  scheduleClick: () => pushToDataLayer("schedule_click"),

  calendarView: () => pushToDataLayer("calendar_view"),
}
