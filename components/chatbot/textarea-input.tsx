"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface TextareaInputProps {
  placeholder?: string
  onSubmit: (value: string) => void
  minLines?: number
  maxLines?: number
  helpText?: string
  className?: string
}

export function TextareaInput({
  placeholder = "Digite sua resposta...",
  onSubmit,
  minLines = 3,
  maxLines = 10,
  helpText,
  className,
}: TextareaInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim())
      setValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl/Cmd + Enter
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="rounded-2xl border-2 border-[#0051fe] bg-white/60 p-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={minLines}
          className="w-full bg-transparent text-[#04152b] placeholder:text-[#04152b]/50 outline-none text-base resize-none"
          style={{ maxHeight: `${maxLines * 1.5}rem` }}
        />
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#0051fe]/10">
          {helpText && (
            <p className="text-xs text-[#04152b]/50">{helpText}</p>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="ml-auto rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-4"
          >
            Enviar
            <ArrowUp className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
