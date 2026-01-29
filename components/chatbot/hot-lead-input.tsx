"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

const LABELS = [
  { key: "muito_quente", label: "Muito quente" },
  { key: "quente", label: "Quente" },
  { key: "morno", label: "Morno" },
] as const

interface HotLeadInputProps {
  onSubmit: (value: string) => void
  className?: string
}

export function HotLeadInput({ onSubmit, className }: HotLeadInputProps) {
  const [values, setValues] = useState<Record<string, string>>({
    muito_quente: "",
    quente: "",
    morno: "",
  })
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
  }, [])

  const setValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    const trimmed = {
      muito_quente: values.muito_quente.trim(),
      quente: values.quente.trim(),
      morno: values.morno.trim(),
    }
    if (trimmed.muito_quente || trimmed.quente || trimmed.morno) {
      onSubmit(JSON.stringify(trimmed))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const hasAny = values.muito_quente.trim() || values.quente.trim() || values.morno.trim()

  return (
    <div className={cn("space-y-4", className)}>
      {LABELS.map(({ key, label }) => (
        <div key={key} className="space-y-1.5">
          <label className="block text-sm font-medium text-[#04152b]/80">
            {label}
          </label>
          <div className="flex items-center gap-2 rounded-2xl border-2 border-[#0051fe] bg-white/60 px-4 py-3">
            <input
              ref={key === "muito_quente" ? firstRef : undefined}
              type="text"
              value={values[key]}
              onChange={(e) => setValue(key, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, key)}
              placeholder={`Ex: ${key === "muito_quente" ? "Quer agendar hoje" : key === "quente" ? "Perguntou preço" : "Só tirou dúvidas"}...`}
              className="flex-1 bg-transparent text-[#04152b] placeholder:text-[#04152b]/50 outline-none text-base"
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!hasAny}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-6"
        >
          Confirmar
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
