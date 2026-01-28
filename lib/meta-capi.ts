// Meta Conversions API Client-side helper

interface UserData {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
}

interface CustomData {
  content_name?: string
  content_category?: string
  value?: number
  currency?: string
  [key: string]: unknown
}

// Get Facebook click ID from cookie
function getFbc(): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(/_fbc=([^;]+)/)
  return match ? match[1] : undefined
}

// Get Facebook browser ID from cookie
function getFbp(): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(/_fbp=([^;]+)/)
  return match ? match[1] : undefined
}

export async function sendMetaConversionsEvent(
  eventName: string,
  userData?: UserData,
  customData?: CustomData,
): Promise<void> {
  try {
    const eventSourceUrl = typeof window !== "undefined" ? window.location.href : ""

    const payload = {
      event_name: eventName,
      event_source_url: eventSourceUrl,
      user_data: {
        em: userData?.email,
        ph: userData?.phone,
        fn: userData?.firstName,
        ln: userData?.lastName,
        fbc: getFbc(),
        fbp: getFbp(),
      },
      custom_data: customData,
    }

    const response = await fetch("/api/meta/conversions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[Meta CAPI] Error sending event:", error)
    } else {
      console.log("[Meta CAPI] Event sent successfully:", eventName)
    }
  } catch (error) {
    console.error("[Meta CAPI] Error:", error)
  }
}

// Pre-defined events for easy use
export const MetaCAPI = {
  Lead: (userData?: UserData, customData?: CustomData) => sendMetaConversionsEvent("Lead", userData, customData),

  CompleteRegistration: (userData?: UserData, customData?: CustomData) =>
    sendMetaConversionsEvent("CompleteRegistration", userData, customData),

  Schedule: (userData?: UserData, customData?: CustomData) =>
    sendMetaConversionsEvent("Schedule", userData, customData),

  Contact: (userData?: UserData, customData?: CustomData) => sendMetaConversionsEvent("Contact", userData, customData),

  ViewContent: (userData?: UserData, customData?: CustomData) =>
    sendMetaConversionsEvent("ViewContent", userData, customData),

  InitiateCheckout: (userData?: UserData, customData?: CustomData) =>
    sendMetaConversionsEvent("InitiateCheckout", userData, customData),

  Purchase: (userData?: UserData, customData?: CustomData) =>
    sendMetaConversionsEvent("Purchase", userData, customData),
}
