"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConversationFlowSelectProps {
  onSubmit: (value: string) => void
  className?: string
}

// Mini chat bubble component
function ChatBubble({ text, isUser = false }: { text: string; isUser?: boolean }) {
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "px-2 py-1 rounded-lg text-[10px] max-w-[85%]",
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

// Flow preview component
function FlowPreview({ messages }: { messages: Array<{ text: string; isUser?: boolean }> }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 space-y-1 min-h-[80px]">
      {messages.map((msg, i) => (
        <ChatBubble key={i} text={msg.text} isUser={msg.isUser} />
      ))}
    </div>
  )
}

const FLOW_OPTIONS = [
  {
    id: "tipo_1",
    title: "Tipo 1: Foco em Dores",
    description: "Identifica dores do paciente e recomenda tratamentos",
    messages: [
      { text: "Olá! Qual seu nome?" },
      { text: "Maria", isUser: true },
      { text: "O que você quer melhorar?" },
      { text: "Rugas", isUser: true },
      { text: "Recomendo Botox! 📸" },
    ],
  },
  {
    id: "tipo_2",
    title: "Tipo 2: Menu Direto",
    description: "Oferece opções e responde/agenda diretamente",
    messages: [
      { text: "Olá! Como posso ajudar?" },
      { text: "Agendar consulta", isUser: true },
      { text: "Qual horário prefere?" },
      { text: "Amanhã às 14h", isUser: true },
      { text: "Agendado! ✅" },
    ],
  },
  {
    id: "tipo_3",
    title: "Tipo 3: Menu + Triagem",
    description: "Oferece opções e faz perguntas antes de agendar",
    messages: [
      { text: "Olá! Como posso ajudar?" },
      { text: "Agendar consulta", isUser: true },
      { text: "Qual seu plano de saúde?" },
      { text: "Unimed", isUser: true },
      { text: "Qual horário prefere?" },
    ],
  },
]

export function ConversationFlowSelect({ onSubmit, className }: ConversationFlowSelectProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSubmit = () => {
    if (selected) {
      const flow = FLOW_OPTIONS.find(f => f.id === selected)
      onSubmit(flow?.title || selected)
    }
  }

  return (
    <div className={cn("space-y-4 px-4", className)}>
      <div className="space-y-3">
        {FLOW_OPTIONS.map((flow) => (
          <button
            key={flow.id}
            type="button"
            onClick={() => setSelected(flow.id)}
            className={cn(
              "w-full text-left rounded-2xl border-2 p-3 transition-all",
              selected === flow.id
                ? "border-[#0051fe] bg-[#0051fe]/5"
                : "border-[#0051fe]/20 hover:border-[#0051fe]/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-[#04152b]">{flow.title}</span>
                  {selected === flow.id && (
                    <Check className="size-4 text-[#0051fe]" />
                  )}
                </div>
                <p className="text-xs text-[#04152b]/60 mb-2">{flow.description}</p>
                <FlowPreview messages={flow.messages} />
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
