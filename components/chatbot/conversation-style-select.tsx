"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConversationStyleSelectProps {
  onSubmit: (value: string) => void
  className?: string
}

// Mini chat bubble component
function ChatBubble({ text, isUser = false }: { text: string; isUser?: boolean }) {
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "px-2 py-1 rounded-lg text-[10px] max-w-[90%] leading-tight",
          isUser
            ? "bg-[#0051fe] text-white rounded-br-sm"
            : "bg-gray-200 text-gray-700 rounded-bl-sm"
        )}
      >
        {text}
      </div>
    </div>
  )
}

const STYLE_OPTIONS = [
  {
    id: "comercial_agendar",
    title: "Comercial - Foco em Agendar",
    description: "Abordagem proativa para converter leads em agendamentos",
    example: [
      { text: "Oi! Vi que você tem interesse em harmonização facial! 😍" },
      { text: "Sim, quero saber mais", isUser: true },
      { text: "Que ótimo! Posso já agendar sua avaliação gratuita? Temos horários amanhã! 🗓️" },
    ],
    color: "bg-green-50 border-green-200",
  },
  {
    id: "comercial_vender",
    title: "Comercial - Foco em Vender",
    description: "Abordagem focada em apresentar procedimentos e fechar vendas",
    example: [
      { text: "Olá! Você sabia que nosso Botox tem 98% de satisfação? ✨" },
      { text: "Quanto custa?", isUser: true },
      { text: "Por apenas R$890 você transforma seu rosto! E hoje temos 20% OFF! Posso reservar?" },
    ],
    color: "bg-orange-50 border-orange-200",
  },
  {
    id: "profissional_sobria",
    title: "Profissional e Sóbria",
    description: "Comunicação formal focada em informar e agendar",
    example: [
      { text: "Olá, bem-vindo(a) à Clínica Derma. Como posso ajudá-lo(a)?" },
      { text: "Gostaria de informações sobre botox", isUser: true },
      { text: "Claro. O procedimento de toxina botulínica é realizado por nossos dermatologistas. Posso agendar uma consulta de avaliação?" },
    ],
    color: "bg-blue-50 border-blue-200",
  },
]

export function ConversationStyleSelect({ onSubmit, className }: ConversationStyleSelectProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSubmit = () => {
    if (selected) {
      const style = STYLE_OPTIONS.find(s => s.id === selected)
      onSubmit(style?.title || selected)
    }
  }

  return (
    <div className={cn("space-y-4 px-4", className)}>
      <div className="space-y-3">
        {STYLE_OPTIONS.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => setSelected(style.id)}
            className={cn(
              "w-full text-left rounded-2xl border-2 p-3 transition-all",
              selected === style.id
                ? "border-[#0051fe] bg-[#0051fe]/5"
                : "border-[#0051fe]/20 hover:border-[#0051fe]/50"
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#04152b]">{style.title}</span>
                {selected === style.id && (
                  <Check className="size-4 text-[#0051fe]" />
                )}
              </div>
              <p className="text-xs text-[#04152b]/60">{style.description}</p>
              
              {/* Example chat */}
              <div className={cn("rounded-lg p-2 space-y-1 border", style.color)}>
                <p className="text-[9px] text-gray-500 font-medium mb-1">EXEMPLO:</p>
                {style.example.map((msg, i) => (
                  <ChatBubble key={i} text={msg.text} isUser={msg.isUser} />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!selected}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-8"
        >
          Confirmar
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
