"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  onSubmit: (value: string) => void
  className?: string
}

export function PhoneInput({ onSubmit, className }: PhoneInputProps) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus when component mounts
    inputRef.current?.focus()
  }, [])

  // Format phone as user types: (11) 99999-9999
  const formatPhone = (input: string) => {
    const numbers = input.replace(/\D/g, "")

    if (numbers.length <= 2) {
      return numbers.length ? `(${numbers}` : ""
    }
    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    }
    if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue(formatted)
    setError("")
  }

  // Validate Brazilian mobile phone
  const validateBrazilianPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "")
    // Brazilian mobile: 11 digits, starts with 9 after DDD
    if (numbers.length !== 11) {
      return "Digite um número válido com DDD"
    }
    // Check if it's a mobile (starts with 9)
    if (numbers[2] !== "9") {
      return "Digite um número de celular válido"
    }
    return ""
  }

  const handleSubmit = () => {
    const validationError = validateBrazilianPhone(value)
    if (validationError) {
      setError(validationError)
      return
    }

    const numbers = value.replace(/\D/g, "")
    // Format: countrycode+area_code+phone (no special chars)
    onSubmit(`55${numbers}`)
    setValue("")
    // Re-focus after submit
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const numbers = value.replace(/\D/g, "")
  const isValid = numbers.length === 11 && numbers[2] === "9"

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 rounded-2xl border-2 border-[#0051fe] bg-white/60 px-3 py-3">
        {/* Country code selector */}
        <div className="flex items-center gap-1 text-[#04152b] shrink-0">
          <span className="text-lg">🇧🇷</span>
          <span className="text-sm font-medium">+55</span>
          <ChevronDown className="size-4 text-[#04152b]/50" />
        </div>

        <div className="h-6 w-px bg-border" />

        <input
          ref={inputRef}
          type="tel"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="(11) 99999-9999"
          className="flex-1 bg-transparent text-[#04152b] placeholder:text-[#04152b]/50 outline-none text-base"
          maxLength={16}
        />

        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!isValid}
          className="size-10 shrink-0 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          <ArrowUp className="size-5" />
        </Button>
      </div>

      {error && <p className="text-sm text-destructive px-2">{error}</p>}
    </div>
  )
}
