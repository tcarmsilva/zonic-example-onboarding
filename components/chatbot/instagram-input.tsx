"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface InstagramInputProps {
  onSubmit: (value: string) => void
  className?: string
}

type InstagramType = "clinic" | "doctor"

interface InstagramItem {
  username: string
  type: InstagramType
}

export function InstagramInput({ onSubmit, className }: InstagramInputProps) {
  const [items, setItems] = useState<InstagramItem[]>([{ username: "", type: "clinic" }])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const updateItem = (index: number, field: "username" | "type", value: string) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const addItem = () => {
    if (items.length < 5) {
      setItems(prev => [...prev, { username: "", type: "clinic" }])
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
      if (items[index].username.trim() && items.length < 5) {
        addItem()
      }
    }
  }

  const handleSubmit = () => {
    const validItems = items.filter(item => item.username.trim())
    if (validItems.length === 0) {
      onSubmit("Nenhum")
      return
    }
    const formatted = validItems.map(item => {
      const typeLabel = item.type === "clinic" ? "Clínica" : "Doutor(a)"
      return `@${item.username.trim()} (${typeLabel})`
    }).join("\n")
    onSubmit(formatted)
  }

  const validItems = items.filter(item => item.username.trim())
  const isValid = validItems.length >= 1

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-3 px-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border-2 border-[#0051fe]/30 bg-white/60 p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[#0051fe] font-medium text-sm">{index + 1}.</span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="size-4 text-red-500" />
                </button>
              )}
            </div>

            {/* Type selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateItem(index, "type", "clinic")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                  item.type === "clinic"
                    ? "bg-[#0051fe] text-white"
                    : "bg-[#0051fe]/10 text-[#0051fe] hover:bg-[#0051fe]/20"
                )}
              >
                Clínica
              </button>
              <button
                type="button"
                onClick={() => updateItem(index, "type", "doctor")}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                  item.type === "doctor"
                    ? "bg-[#0051fe] text-white"
                    : "bg-[#0051fe]/10 text-[#0051fe] hover:bg-[#0051fe]/20"
                )}
              >
                Doutor(a)
              </button>
            </div>

            {/* Username with @ prefix */}
            <div className="flex items-center gap-0 rounded-lg border border-[#0051fe]/30 bg-white overflow-hidden">
              <span className="pl-3 pr-2 py-2.5 text-[#04152b]/60 bg-gray-50 text-base font-medium border-r border-[#0051fe]/20">
                @
              </span>
              <input
                ref={el => { inputRefs.current[index] = el }}
                type="text"
                value={item.username}
                onChange={(e) => {
                  const val = e.target.value.replace(/@/g, "")
                  updateItem(index, "username", val)
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder="usuario"
                className="flex-1 px-3 py-2.5 bg-transparent text-[#04152b] placeholder:text-[#04152b]/40 outline-none text-base"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4">
        {items.length < 5 && (
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-[#0051fe] hover:text-[#0051fe]/80 transition-colors"
          >
            <Plus className="size-4" />
            Adicionar outro Instagram
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
