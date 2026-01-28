"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimezoneSelectProps {
  onSubmit: (value: string) => void
  className?: string
}

const BRAZIL_TIMEZONES = [
  { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
  { value: "America/Manaus", label: "Manaus (GMT-4)" },
  { value: "America/Cuiaba", label: "Cuiabá (GMT-4)" },
  { value: "America/Rio_Branco", label: "Rio Branco (GMT-5)" },
  { value: "America/Noronha", label: "Fernando de Noronha (GMT-2)" },
]

export function TimezoneSelect({ onSubmit, className }: TimezoneSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (value: string) => {
    setSelected(value)
    setIsOpen(false)
  }

  const handleSubmit = () => {
    if (selected) {
      const timezone = BRAZIL_TIMEZONES.find(tz => tz.value === selected)
      onSubmit(timezone?.label || selected)
    }
  }

  const selectedTimezone = BRAZIL_TIMEZONES.find(tz => tz.value === selected)

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between gap-2 rounded-2xl border-2 border-[#0051fe] bg-white/60 px-4 py-3 text-left"
          >
            <span className={cn("text-base", selected ? "text-[#04152b]" : "text-[#04152b]/50")}>
              {selectedTimezone?.label || "Selecione o timezone..."}
            </span>
            <ChevronDown className={cn("size-5 text-[#04152b]/50 transition-transform", isOpen && "rotate-180")} />
          </button>

          {isOpen && (
            <div className="absolute z-10 mt-2 w-full rounded-2xl border-2 border-[#0051fe]/20 bg-white shadow-lg overflow-hidden">
              {BRAZIL_TIMEZONES.map((timezone) => (
                <button
                  key={timezone.value}
                  type="button"
                  onClick={() => handleSelect(timezone.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#0051fe]/5 transition-colors",
                    selected === timezone.value && "bg-[#0051fe]/10"
                  )}
                >
                  <span className="text-[#04152b]">{timezone.label}</span>
                  {selected === timezone.value && <Check className="size-4 text-[#0051fe]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!selected}
          className="size-12 shrink-0 rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50"
        >
          <ArrowUp className="size-5" />
        </Button>
      </div>
    </div>
  )
}
