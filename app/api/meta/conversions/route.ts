import { NextResponse } from "next/server"
import crypto from "crypto"

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const META_CONVERSIONS_API_TOKEN = process.env.META_CONVERSIONS_API_TOKEN

// Hash function for PII data (required by Meta)
function hashData(data: string): string {
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex")
}

interface EventData {
  event_name: string
  event_time?: number
  event_source_url?: string
  action_source?: string
  user_data?: {
    em?: string // email (will be hashed)
    ph?: string // phone (will be hashed)
    fn?: string // first name (will be hashed)
    ln?: string // last name (will be hashed)
    client_ip_address?: string
    client_user_agent?: string
    fbc?: string // Facebook click ID
    fbp?: string // Facebook browser ID
  }
  custom_data?: {
    content_name?: string
    content_category?: string
    value?: number
    currency?: string
    [key: string]: unknown
  }
}

export async function POST(request: Request) {
  try {
    if (!META_PIXEL_ID) {
      console.error("[Meta CAPI] META_PIXEL_ID not configured")
      return NextResponse.json({ error: "META_PIXEL_ID not configured" }, { status: 500 })
    }

    if (!META_CONVERSIONS_API_TOKEN) {
      console.error("[Meta CAPI] META_CONVERSIONS_API_TOKEN not configured")
      return NextResponse.json({ error: "META_CONVERSIONS_API_TOKEN not configured" }, { status: 500 })
    }

    const body: EventData = await request.json()
    const { event_name, event_source_url, user_data, custom_data } = body

    // Get client info from headers
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || ""
    const userAgent = request.headers.get("user-agent") || ""

    // Prepare user data with hashing
    const hashedUserData: Record<string, string> = {}

    if (user_data?.em) {
      hashedUserData.em = hashData(user_data.em)
    }
    if (user_data?.ph) {
      // Remove non-numeric characters before hashing
      const cleanPhone = user_data.ph.replace(/\D/g, "")
      hashedUserData.ph = hashData(cleanPhone)
    }
    if (user_data?.fn) {
      hashedUserData.fn = hashData(user_data.fn)
    }
    if (user_data?.ln) {
      hashedUserData.ln = hashData(user_data.ln)
    }
    if (clientIp) {
      hashedUserData.client_ip_address = clientIp
    }
    if (userAgent) {
      hashedUserData.client_user_agent = userAgent
    }
    if (user_data?.fbc) {
      hashedUserData.fbc = user_data.fbc
    }
    if (user_data?.fbp) {
      hashedUserData.fbp = user_data.fbp
    }

    const eventPayload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: event_source_url || "",
          action_source: "website",
          user_data: hashedUserData,
          custom_data: custom_data || {},
        },
      ],
    }

    console.log("[Meta CAPI] Sending event:", event_name)

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_CONVERSIONS_API_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Meta CAPI] Error:", response.status, errorText)
      return NextResponse.json({ error: `Meta API error: ${response.status}`, details: errorText }, { status: response.status })
    }

    const result = await response.json()
    console.log("[Meta CAPI] Success:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[Meta CAPI] Error:", error)
    return NextResponse.json({ error: "Failed to send event" }, { status: 500 })
  }
}
