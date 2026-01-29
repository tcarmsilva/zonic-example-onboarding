"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingInputProps {
  onSubmit: (value: string) => void
  className?: string
}

export function RatingInput({ onSubmit, className }: RatingInputProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  const display = hovered ?? selected

  const handleSubmit = () => {
    if (selected !== null) {
      onSubmit(String(selected))
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-center gap-1 sm:gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setSelected(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "rounded-lg p-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#0051fe] focus:ring-offset-2",
              (display ?? 0) >= star ? "text-[#f59e0b]" : "text-[#04152b]/25"
            )}
            aria-label={`Nota ${star}`}
          >
            <Star
              className={cn("size-10 sm:size-12", (display ?? 0) >= star ? "fill-[#f59e0b]" : "fill-none")}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-[#04152b]/70">
        {selected === null ? "Clique na nota de 1 a 5" : `${selected} de 5 estrelas`}
      </p>
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={selected === null}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-8"
        >
          Confirmar
        </Button>
      </div>
    </div>
  )
}
