"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Banner } from "@/components/chatbot/banner"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#e6eefe" }}>
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto pb-8">
        <div className="mx-auto max-w-lg w-full">
          {/* Banner */}
          <div className="py-8">
            <Banner />
          </div>

          {/* Content */}
          <div className="text-center space-y-6 px-4">
            {/* Pill Badge */}
            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2" style={{ backgroundColor: "#e6eefe", borderColor: "#0051fe" }}>
                <span className="text-2xl">🚀</span>
                <span className="text-sm font-medium" style={{ color: "#04152b" }}>
                  Onboarding Zonic
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 delay-75">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                <span style={{ color: "#04152b" }}>Bem-vindo ao </span>
                <span style={{ color: "#0051fe" }}>Onboarding</span>
                <span style={{ color: "#04152b" }}> da Zonic</span>
              </h1>
            </div>

            {/* Description */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-150">
              <p className="text-base sm:text-lg leading-relaxed" style={{ color: "#04152b" }}>
                Esta é a página de onboarding da Zonic. Aqui você pode configurar e personalizar sua experiência com a IA para clínicas. Complete o processo de onboarding para começar a usar todas as funcionalidades da plataforma.
              </p>
            </div>

            {/* Button */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-300">
              <Link href="/chat-1">
                <Button
                  size="lg"
                  className="bg-[#0051fe] hover:bg-[#0051fe]/90 text-white px-8 py-6 text-lg rounded-full shadow-lg transition-all hover:shadow-xl"
                >
                  Iniciar Onboarding
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
