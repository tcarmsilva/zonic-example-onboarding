"use client"

import { useEffect } from "react"
import { storeUTMParams, pushToDataLayer } from "@/lib/tracking"

export function UTMTracker() {
  useEffect(() => {
    // Store UTM params on mount
    const utms = storeUTMParams()

    // Push UTMs to dataLayer for GTM
    pushToDataLayer("utm_captured", {
      utm_source: utms.utm_source,
      utm_medium: utms.utm_medium,
      utm_campaign: utms.utm_campaign,
      utm_id: utms.utm_id,
      utm_term: utms.utm_term,
      utm_content: utms.utm_content,
    })
  }, [])

  return null
}
