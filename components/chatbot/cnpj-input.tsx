"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

// Formata como 00.000.000/0000-00
function formatCnpj(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 14)
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`
}

function validateCnpj(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, "")
  if (numbers.length !== 14) return false
  if (/^(\d)\1+$/.test(numbers)) return false
  let sum = 0
  let weight = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i], 10) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (parseInt(numbers[12], 10) !== digit) return false
  sum = 0
  weight = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i], 10) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return parseInt(numbers[13], 10) === digit
}

interface CnpjInputProps {
  onSubmit: (value: string) => void
  className?: string
}

export function CnpjInput({ onSubmit, className }: CnpjInputProps) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(formatCnpj(e.target.value))
    setError("")
  }

  const handleSubmit = () => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length !== 14) {
      setError("Digite um CNPJ válido (14 dígitos)")
      return
    }
    if (!validateCnpj(value)) {
      setError("CNPJ inválido. Verifique os dígitos.")
      return
    }
    onSubmit(value)
    setValue("")
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const numbers = value.replace(/\D/g, "")
  const isValid = numbers.length === 14 && validateCnpj(value)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 rounded-2xl border-2 border-[#0051fe] bg-white/60 px-4 py-3">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="00.000.000/0000-00"
          maxLength={18}
          className="flex-1 bg-transparent text-[#04152b] placeholder:text-[#04152b]/50 outline-none text-base"
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!isValid}
          className="size-10 shrink-0 rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50"
        >
          <ArrowUp className="size-5" />
        </Button>
      </div>
      {error && <p className="text-sm text-destructive px-2">{error}</p>}
    </div>
  )
}
