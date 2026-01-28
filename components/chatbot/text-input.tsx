"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface TextInputProps {
  placeholder?: string
  onSubmit: (value: string) => void
  type?: "text" | "email" | "tel"
  className?: string
}

export function TextInput({
  placeholder = "Digite sua resposta...",
  onSubmit,
  type = "text",
  className,
}: TextInputProps) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus when component mounts
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim())
      setValue("")
      // Re-focus after submit
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div
      className={cn("flex items-center gap-2 rounded-2xl border-2 border-[#0051fe] bg-white/60 px-4 py-3", className)}
    >
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[#04152b] placeholder:text-[#04152b]/50 outline-none text-base"
      />
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="size-10 shrink-0 rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50"
      >
        <ArrowUp className="size-5" />
      </Button>
    </div>
  )
}
