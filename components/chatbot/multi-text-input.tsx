"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiTextInputProps {
  onSubmit: (value: string) => void
  placeholder?: string
  addButtonText?: string
  minItems?: number
  maxItems?: number
  className?: string
}

export function MultiTextInput({
  onSubmit,
  placeholder = "Digite aqui...",
  addButtonText = "Adicionar",
  minItems = 1,
  maxItems = 10,
  className,
}: MultiTextInputProps) {
  const [items, setItems] = useState<string[]>([""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus the first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const updateItem = (index: number, value: string) => {
    setItems(prev => {
      const newItems = [...prev]
      newItems[index] = value
      return newItems
    })
  }

  const addItem = () => {
    if (items.length < maxItems) {
      setItems(prev => [...prev, ""])
      // Focus new input after render
      setTimeout(() => {
        inputRefs.current[items.length]?.focus()
      }, 0)
    }
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (items[index].trim() && items.length < maxItems) {
        addItem()
      }
    }
  }

  const handleSubmit = () => {
    const validItems = items.filter(item => item.trim())
    if (validItems.length >= minItems) {
      onSubmit(validItems.join("\n"))
    }
  }

  const validItems = items.filter(item => item.trim())
  const isValid = validItems.length >= minItems

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2 px-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-2xl border-2 border-[#0051fe]/50 bg-white/60 px-4 py-2">
              <span className="text-[#0051fe] font-medium text-sm">{index + 1}.</span>
              <input
                ref={el => { inputRefs.current[index] = el }}
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-[#04152b] placeholder:text-[#04152b]/50 outline-none text-base"
              />
            </div>
            
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="size-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 transition-colors"
              >
                <X className="size-4 text-red-500" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4">
        {items.length < maxItems && (
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-[#0051fe] hover:text-[#0051fe]/80 transition-colors"
          >
            <Plus className="size-4" />
            {addButtonText}
          </button>
        )}
        
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="ml-auto rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-6"
        >
          Confirmar
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
