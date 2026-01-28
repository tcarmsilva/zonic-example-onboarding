"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: string[]
  onSubmit: (value: string) => void
  minSelect?: number
  maxSelect?: number
  className?: string
}

export function MultiSelect({ options, onSubmit, minSelect = 1, maxSelect, className }: MultiSelectProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggleOption = (option: string) => {
    setSelected(prev => {
      if (prev.includes(option)) {
        return prev.filter(o => o !== option)
      }
      if (maxSelect && prev.length >= maxSelect) {
        return prev
      }
      return [...prev, option]
    })
  }

  const handleSubmit = () => {
    if (selected.length >= minSelect) {
      onSubmit(selected.join(", "))
    }
  }

  const isValid = selected.length >= minSelect

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap justify-center gap-2 px-4">
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                isSelected
                  ? "bg-[#0051fe] text-white"
                  : "bg-[#0051fe]/10 text-[#0051fe] hover:bg-[#0051fe]/20"
              )}
            >
              {isSelected && <Check className="size-4" />}
              {option}
            </button>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-8"
        >
          Confirmar seleção
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>

      {minSelect > 1 && (
        <p className="text-center text-sm text-[#04152b]/50">
          Selecione pelo menos {minSelect} opções
        </p>
      )}
    </div>
  )
}
