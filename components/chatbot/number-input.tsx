"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface NumberInputProps {
  onSubmit: (value: string) => void
  min?: number
  max?: number
  placeholder?: string
  className?: string
}

export function NumberInput({ onSubmit, min = 1, max = 999, placeholder = "Digite um número...", className }: NumberInputProps) {
  const [value, setValue] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10)
    if (isNaN(num)) {
      setValue(null)
    } else if (num < min) {
      setValue(min)
    } else if (num > max) {
      setValue(max)
    } else {
      setValue(num)
    }
  }

  const increment = () => {
    setValue(prev => {
      const current = prev ?? min - 1
      return Math.min(current + 1, max)
    })
  }

  const decrement = () => {
    setValue(prev => {
      const current = prev ?? min + 1
      return Math.max(current - 1, min)
    })
  }

  const handleSubmit = () => {
    if (value !== null && value >= min && value <= max) {
      onSubmit(value.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isValid = value !== null && value >= min && value <= max

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 rounded-2xl border-2 border-[#0051fe] bg-white/60 px-3 py-2">
        <button
          type="button"
          onClick={decrement}
          disabled={value !== null && value <= min}
          className="size-10 flex items-center justify-center rounded-full bg-[#0051fe]/10 hover:bg-[#0051fe]/20 disabled:opacity-50 transition-colors"
        >
          <Minus className="size-4 text-[#0051fe]" />
        </button>

        <input
          ref={inputRef}
          type="number"
          value={value ?? ""}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          min={min}
          max={max}
          className="flex-1 bg-transparent text-center text-[#04152b] placeholder:text-[#04152b]/50 outline-none text-xl font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={increment}
          disabled={value !== null && value >= max}
          className="size-10 flex items-center justify-center rounded-full bg-[#0051fe]/10 hover:bg-[#0051fe]/20 disabled:opacity-50 transition-colors"
        >
          <Plus className="size-4 text-[#0051fe]" />
        </button>

        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!isValid}
          className="size-10 shrink-0 rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50"
        >
          <ArrowUp className="size-5" />
        </Button>
      </div>
    </div>
  )
}
