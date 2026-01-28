import { getStoredUTMParams } from "./tracking"

interface LeadData {
  name: string
  phone: string
  email?: string
  clinic_name?: string
  origin_url: string
  utms_json: Record<string, string> | null
  data_json?: Record<string, any> | null
  first_name?: string
  schedule_event?: any
}

export async function sendLeadToSupabase(fieldsToUpdate: Record<string, any>, leadId?: number | null): Promise<any> {
  try {
    // Usar API route interna ao invés da edge function do Supabase
    const apiUrl = "/api/leads"

    const payload: any = { ...fieldsToUpdate }

    // Add lead_id if this is an update
    if (leadId) {
      payload.lead_id = leadId
    }

    // Add origin_url and UTMs only on initial insert (when creating new lead with phone)
    if (!leadId) {
      const originUrl = `${window.location.origin}${window.location.pathname}`
      const utms = getStoredUTMParams() || {}

      payload.origin_url = originUrl
      payload.utms_json = Object.keys(utms).length > 0 ? utms : null
    }

    console.log("[v0] Sending to API:", Object.keys(payload))

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API error:", response.status, errorText)
      throw new Error(`API error: ${response.status}`)
    }

    const result = await response.json()
    console.log("[v0] API response:", result)
    return result
  } catch (error) {
    console.error("[v0] Error sending to API:", error)
    throw error
  }
}
