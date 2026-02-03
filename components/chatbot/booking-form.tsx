"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Loader2, Calendar, Clock } from "lucide-react"
import { createBooking, cancelBooking, prefetchSlots } from "@/lib/cal-api"
import { updateOnboardingRecord } from "@/lib/supabase-onboarding"
import type { CalendarId } from "@/lib/cal-config"

interface BookingFormProps {
  selectedSlot: string
  userData: {
    name: string
    phone: string
    clinicName: string
    companyType?: string
    data_json?: any
  }
  onSuccess: (bookingInfo?: { date: string; time: string; shortFormat: string }, isClinic?: boolean) => void
  onBack: () => void
  onboardingId?: number | null
  calendarId?: CalendarId
  calendarIds?: CalendarId[] // Se fornecido, tentará criar booking nos calendários até um funcionar
}

export function BookingForm({ selectedSlot, userData, onSuccess, onBack, onboardingId, calendarId = "1", calendarIds }: BookingFormProps) {
  const [step, setStep] = useState<"confirm" | "email-choice" | "email-input">("confirm")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingUid, setBookingUid] = useState<string | null>(null)

  const slotDate = new Date(selectedSlot)
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  const formattedDateRaw = slotDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: userTimezone,
  })

  const formattedDate = formattedDateRaw.replace(/^(\w)/, (match) => match.toUpperCase())

  const formattedTime = slotDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: userTimezone,
  })

  // Formato curto: "quarta-feira 21/01 às 17:15"
  const weekday = slotDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    timeZone: userTimezone,
  })
  const dayMonth = slotDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: userTimezone,
  })
  const shortFormat = `${weekday} ${dayMonth} às ${formattedTime}`

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValid = validateEmail(email)

  const handleConfirmBooking = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("[v0] Creating booking with provisional email")
      
      // Obter a timezone do usuário
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      console.log("[v0] User timezone:", userTimezone)
      console.log("[v0] Selected slot (UTC):", selectedSlot)
      // Log para debug: mostra o horário selecionado na timezone do usuário
      const selectedDate = new Date(selectedSlot)
      const localTime = selectedDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: userTimezone,
      })
      console.log(`[v0] Selected slot in user timezone (${userTimezone}):`, localTime)
      
      // Se temos múltiplos calendários, randomizamos a ordem antes de tentar criar o booking
      const calendarsToTry = calendarIds && calendarIds.length > 0 
        ? [...calendarIds].sort(() => Math.random() - 0.5) // Randomiza a ordem
        : [calendarId]
      
      console.log("[v0] Randomized calendar order:", calendarsToTry)
      
      let result = null
      let usedCalendarId: CalendarId = calendarId

      for (const calId of calendarsToTry) {
        try {
          result = await createBooking(
            selectedSlot,
            userData.name,
            "email@email.com",
            userData.phone,
            userData.clinicName,
            calId,
            `Telefone: ${userData.phone}`,
            userTimezone,
          )
          usedCalendarId = calId
          console.log("[v0] Booking created successfully on calendar", calId, ":", result)
          break
        } catch (err) {
          console.log("[v0] Failed to create booking on calendar", calId, ", trying next...")
          // Continua para o próximo calendário
        }
      }

      if (!result) {
        throw new Error("Não foi possível criar o agendamento em nenhum calendário")
      }

      setBookingUid(result.data.uid)
      // Armazenar o calendarId usado para uso posterior
      ;(userData as any).usedCalendarId = usedCalendarId

      if (onboardingId) {
        console.log("[v0] Saving schedule_event to chatbot_onboarding.onboarding_data")
        await updateOnboardingRecord(onboardingId, { schedule_event: result.data })
      }

      setStep("email-choice")
    } catch (err) {
      console.error("[v0] Booking error:", err)
      setError("Erro ao criar agendamento. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChoice = async (choice: string) => {
    if (choice === "Sim, quero receber") {
      setStep("email-input")
    } else if (choice === "Não precisa") {
      // Verificar se é clínica (não é Agência nem Franqueadora)
      const isClinic = !!(userData.companyType && userData.companyType !== "Agência" && userData.companyType !== "Franqueadora")
      onSuccess({ date: formattedDate, time: formattedTime, shortFormat }, isClinic)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid) {
      setError("Digite um e-mail válido")
      return
    }

    if (!bookingUid) {
      setError("ID do agendamento não encontrado")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Usar o calendarId que foi usado para criar o booking original
      const usedCalendarId = (userData as any).usedCalendarId || calendarId
      
      console.log("[v0] Cancelling old booking:", bookingUid)
      await cancelBooking(bookingUid, usedCalendarId, "User wants to receive email confirmation")

      // Obter a timezone do usuário
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      
      console.log("[v0] Creating new booking with real email:", email)
      const newBooking = await createBooking(
        selectedSlot,
        userData.name,
        email,
        userData.phone,
        userData.clinicName,
        usedCalendarId,
        `Telefone: ${userData.phone}`,
        userTimezone,
      )

      console.log("[v0] Booking recreated successfully with email!")

      if (onboardingId) {
        console.log("[v0] Updating onboarding_data with email and schedule_event")
        await updateOnboardingRecord(onboardingId, {
          schedule_event: newBooking.data,
        })
      }

      // Verificar se é clínica (não é Agência nem Franqueadora)
      const isClinic = !!(userData.companyType && userData.companyType !== "Agência" && userData.companyType !== "Franqueadora")
      onSuccess({ date: formattedDate, time: formattedTime, shortFormat }, isClinic)
    } catch (err) {
      console.error("[v0] Update error:", err)
      setError("Erro ao atualizar e-mail. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && isValid && !loading) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  useEffect(() => {
    prefetchSlots(calendarId)
  }, [calendarId])

  return (
    <div className="space-y-6 px-4">
      {/* Selected slot summary */}
      <div className="bg-white/80 border-2 border-[#0051fe]/25 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-[#04152b]">
          <Calendar className="h-4 w-4 text-[#0051fe]" />
          <span className="font-medium">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#04152b]">
          <Clock className="h-4 w-4 text-[#0051fe]" />
          <span className="font-medium">{formattedTime}</span>
        </div>
      </div>

      {step === "confirm" && (
        <div className="space-y-3">
          <Button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="w-full rounded-3xl bg-[#0051fe] px-6 py-7 text-lg font-semibold text-white hover:bg-[#0046d9] transition-colors shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Confirmando...
              </>
            ) : (
              "Confirmar agendamento"
            )}
          </Button>
          <Button
            onClick={onBack}
            disabled={loading}
            variant="outline"
            className="w-full rounded-3xl !bg-white !border-2 !border-[#0051fe] !text-[#04152b] hover:!bg-[#0051fe]/10 py-3 transition-colors"
          >
            Escolher outro horário
          </Button>
          {error && <p className="text-sm text-[#04152b] text-center">{error}</p>}
        </div>
      )}

      {step === "email-choice" && (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-[#0051fe] text-lg font-semibold">Agendamento confirmado!</p>
            <p className="text-[#04152b] text-base">Você quer receber a confirmação e o convite por e-mail?</p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => handleEmailChoice("Sim, quero receber")}
              disabled={loading}
              className="w-full rounded-full bg-[#0051fe] px-6 py-3 text-base font-medium text-white hover:bg-[#0046d9] transition-colors"
            >
              Sim, quero receber
            </Button>
            <Button
              onClick={() => handleEmailChoice("Não precisa")}
              disabled={loading}
              variant="outline"
              className="w-full rounded-full !bg-white border-2 border-[#0051fe]/30 !text-[#04152b] hover:!bg-[#0051fe]/10 py-3 transition-colors"
            >
              Não precisa
            </Button>
          </div>
        </div>
      )}

      {step === "email-input" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-2xl border-2 border-[#0051fe] bg-white/80 px-4 py-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                onKeyDown={handleKeyDown}
                placeholder="seuemail@exemplo.com"
                disabled={loading}
                className="flex-1 bg-transparent text-[#04152b] placeholder:text-[#04152b]/50 outline-none text-base"
              />
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!isValid || loading}
                type="button"
                className="size-10 shrink-0 rounded-full bg-[#0051fe] hover:bg-[#0046d9] disabled:opacity-50 text-white"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : <ArrowUp className="size-5" />}
              </Button>
            </div>
            {error && <p className="text-sm text-[#04152b] px-2">{error}</p>}
          </div>
          <Button
            type="submit"
            className="w-full rounded-3xl bg-[#0051fe] px-6 py-7 text-lg font-semibold text-white hover:bg-[#0046d9] transition-colors shadow-lg"
            disabled={!isValid || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar convite"
            )}
          </Button>
        </form>
      )}
    </div>
  )
}
