"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailInputProps {
  onSubmit: (value: string) => void
  className?: string
}

export function EmailInput({ onSubmit, className }: EmailInputProps) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus when component mounts
    inputRef.current?.focus()
  }, [])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      return "Digite seu e-mail"
    }
    if (!emailRegex.test(email)) {
      return "Digite um e-mail válido"
    }
    return ""
  }

  const handleSubmit = () => {
    const validationError = validateEmail(value)
    if (validationError) {
      setError(validationError)
      return
    }

    onSubmit(value.trim().toLowerCase())
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    setError("")
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(value)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 rounded-2xl border-2 border-brand-primary bg-white/60 px-4 py-3">
        <input
          ref={inputRef}
          type="email"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="seuemail@exemplo.com"
          className="flex-1 bg-transparent text-brand-foreground placeholder:text-brand-foreground/50 outline-none text-base"
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
