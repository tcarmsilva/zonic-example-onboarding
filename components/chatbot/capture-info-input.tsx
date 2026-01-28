"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Plus, X, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface CaptureInfoInputProps {
  onSubmit: (value: string) => void
  className?: string
}

interface InfoItem {
  id: string
  question: string
  acceptedValues: string
  isExpanded: boolean
}

const SUGGESTED_QUESTIONS = [
  "Idade",
  "Plano de saúde",
  "Número da carteirinha",
  "CPF",
  "Data de nascimento",
  "Já é paciente?",
  "Como conheceu a clínica?",
  "Qual procedimento tem interesse?",
]

export function CaptureInfoInput({ onSubmit, className }: CaptureInfoInputProps) {
  const [items, setItems] = useState<InfoItem[]>([
    { id: "1", question: "", acceptedValues: "", isExpanded: true }
  ])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now().toString(), question: "", acceptedValues: "", isExpanded: true }
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: "question" | "acceptedValues", value: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const toggleExpanded = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    ))
  }

  const addSuggestion = (suggestion: string) => {
    // Find the first empty item or add a new one
    const emptyItem = items.find(item => !item.question.trim())
    if (emptyItem) {
      updateItem(emptyItem.id, "question", suggestion)
    } else {
      setItems(prev => [
        ...prev,
        { id: Date.now().toString(), question: suggestion, acceptedValues: "", isExpanded: true }
      ])
    }
    setShowSuggestions(false)
  }

  const handleSubmit = () => {
    const validItems = items.filter(item => item.question.trim())
    if (validItems.length === 0) {
      onSubmit("Nenhuma informação adicional")
      return
    }

    const formatted = validItems.map(item => {
      if (item.acceptedValues.trim()) {
        return `${item.question}: [Aceitos: ${item.acceptedValues}]`
      }
      return item.question
    }).join("\n")

    onSubmit(formatted)
  }

  const hasValidItems = items.some(item => item.question.trim())

  return (
    <div className={cn("space-y-4 px-4", className)}>
      {/* Suggestions */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-sm text-[#0051fe] flex items-center gap-1 hover:underline"
        >
          💡 Ver sugestões de perguntas
          {showSuggestions ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </button>
        
        {showSuggestions && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addSuggestion(suggestion)}
                className="px-3 py-1 text-xs rounded-full bg-[#0051fe]/10 text-[#0051fe] hover:bg-[#0051fe]/20 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-xl border-2 border-[#0051fe]/20 bg-white/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 p-3 bg-[#0051fe]/5">
              <span className="text-[#0051fe] font-medium text-sm">{index + 1}.</span>
              <input
                type="text"
                value={item.question}
                onChange={(e) => updateItem(item.id, "question", e.target.value)}
                placeholder="Ex: Qual seu plano de saúde?"
                className="flex-1 bg-transparent text-[#04152b] placeholder:text-[#04152b]/50 outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => toggleExpanded(item.id)}
                className="p-1 hover:bg-[#0051fe]/10 rounded-full transition-colors"
              >
                {item.isExpanded ? (
                  <ChevronUp className="size-4 text-[#04152b]/50" />
                ) : (
                  <ChevronDown className="size-4 text-[#04152b]/50" />
                )}
              </button>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="size-4 text-red-500" />
                </button>
              )}
            </div>

            {/* Expanded content */}
            {item.isExpanded && (
              <div className="p-3 border-t border-[#0051fe]/10">
                <label className="block text-xs text-[#04152b]/60 mb-1">
                  Valores aceitos (opcional - deixe vazio se aceitar qualquer resposta):
                </label>
                <input
                  type="text"
                  value={item.acceptedValues}
                  onChange={(e) => updateItem(item.id, "acceptedValues", e.target.value)}
                  placeholder="Ex: Unimed, Bradesco, SulAmérica, Particular"
                  className="w-full bg-white/80 border border-[#0051fe]/20 rounded-lg px-3 py-2 text-sm text-[#04152b] placeholder:text-[#04152b]/40 outline-none focus:border-[#0051fe]"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1 text-sm text-[#0051fe] hover:text-[#0051fe]/80 transition-colors"
      >
        <Plus className="size-4" />
        Adicionar outra pergunta
      </button>

      {/* Submit */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={() => onSubmit("Nenhuma informação adicional")}
          variant="outline"
          className="rounded-full border-[#0051fe]/30 text-[#04152b] hover:bg-[#0051fe]/5 px-6"
        >
          Pular
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!hasValidItems}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-8"
        >
          Confirmar
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
