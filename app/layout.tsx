import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { MetaPixel } from "@/components/tracking/meta-pixel"
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/components/tracking/google-tag-manager"
import { UTMTracker } from "@/components/tracking/utm-tracker"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "YOUR_PIXEL_ID"
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-XXXXXXX"

export const metadata: Metadata = {
  title: "Zonic - Onboarding",
  description: "Onboarding da Zonic - Configure sua clínica na plataforma",
  generator: "v0.app",
  openGraph: {
    title: "Zonic - Onboarding",
    description: "Onboarding da Zonic - Configure sua clínica na plataforma",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <MetaPixel pixelId={META_PIXEL_ID} />
        <GoogleTagManager gtmId={GTM_ID} />
      </head>
      <body className={`font-sans antialiased`}>
        <GoogleTagManagerNoscript gtmId={GTM_ID} />
        <UTMTracker />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
