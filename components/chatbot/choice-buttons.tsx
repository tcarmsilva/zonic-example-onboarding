"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChoiceButtonsProps {
  options: string[]
  onSelect: (option: string) => void
  className?: string
}

export function ChoiceButtons({ options, onSelect, className }: ChoiceButtonsProps) {
  return (
    <div className={cn("flex flex-wrap justify-center gap-2 px-4", className)}>
      {options.map((option) => (
        <Button
          key={option}
          onClick={() => onSelect(option)}
          className="rounded-full bg-[#0051fe]/80 px-5 py-2 text-sm font-medium text-white hover:bg-[#0051fe] transition-colors"
        >
          {option}
        </Button>
      ))}
    </div>
  )
}
