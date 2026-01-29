"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const COUNTRIES: { code: string; dial: string; flag: string; name: string }[] = [
  { code: "BR", dial: "55", flag: "🇧🇷", name: "Brasil" },
  { code: "US", dial: "1", flag: "🇺🇸", name: "Estados Unidos" },
  { code: "AR", dial: "54", flag: "🇦🇷", name: "Argentina" },
  { code: "MX", dial: "52", flag: "🇲🇽", name: "México" },
  { code: "GB", dial: "44", flag: "🇬🇧", name: "Reino Unido" },
  { code: "PT", dial: "351", flag: "🇵🇹", name: "Portugal" },
  { code: "ES", dial: "34", flag: "🇪🇸", name: "Espanha" },
  { code: "CO", dial: "57", flag: "🇨🇴", name: "Colômbia" },
  { code: "CL", dial: "56", flag: "🇨🇱", name: "Chile" },
  { code: "PE", dial: "51", flag: "🇵🇪", name: "Peru" },
  { code: "UY", dial: "598", flag: "🇺🇾", name: "Uruguai" },
  { code: "PY", dial: "595", flag: "🇵🇾", name: "Paraguai" },
  { code: "EC", dial: "593", flag: "🇪🇨", name: "Equador" },
  { code: "BO", dial: "591", flag: "🇧🇴", name: "Bolívia" },
  { code: "VE", dial: "58", flag: "🇻🇪", name: "Venezuela" },
  { code: "CA", dial: "1", flag: "🇨🇦", name: "Canadá" },
  { code: "DE", dial: "49", flag: "🇩🇪", name: "Alemanha" },
  { code: "FR", dial: "33", flag: "🇫🇷", name: "França" },
  { code: "IT", dial: "39", flag: "🇮🇹", name: "Itália" },
  { code: "JP", dial: "81", flag: "🇯🇵", name: "Japão" },
  { code: "AU", dial: "61", flag: "🇦🇺", name: "Austrália" },
]

interface PhoneInputProps {
  onSubmit: (value: string) => void
  className?: string
}

export function PhoneInput({ onSubmit, className }: PhoneInputProps) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  const formatPhone = (input: string) => {
    const numbers = input.replace(/\D/g, "")
    if (selectedCountry.code === "BR") {
      if (numbers.length <= 2) {
        return numbers.length ? `(${numbers}` : ""
      }
      if (numbers.length <= 7) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
      }
      if (numbers.length <= 11) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
      }
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue(formatted)
    setError("")
  }

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "")
    if (selectedCountry.code === "BR") {
      if (numbers.length !== 11) return "Digite um número válido com DDD"
      if (numbers[2] !== "9") return "Digite um número de celular válido"
      return ""
    }
    if (numbers.length < 8) return "Digite um número válido"
    return ""
  }

  const handleSubmit = () => {
    const validationError = validatePhone(value)
    if (validationError) {
      setError(validationError)
      return
    }
    const numbers = value.replace(/\D/g, "")
    onSubmit(`${selectedCountry.dial}${numbers}`)
    setValue("")
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const numbers = value.replace(/\D/g, "")
  const isValid =
    selectedCountry.code === "BR"
      ? numbers.length === 11 && numbers[2] === "9"
      : numbers.length >= 8

  const placeholder =
    selectedCountry.code === "BR" ? "(11) 99999-9999" : "999 999-9999"

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 rounded-2xl border-2 border-[#0051fe] bg-white/60 px-3 py-3">
        {/* Country code selector with dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-1 text-[#04152b] rounded-lg py-1 pr-1 hover:bg-[#0051fe]/10 transition-colors"
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            aria-label="Selecionar país"
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">+{selectedCountry.dial}</span>
            <ChevronDown
              className={cn("size-4 text-[#04152b]/50 transition-transform", dropdownOpen && "rotate-180")}
            />
          </button>
          {dropdownOpen && (
            <div
              className="absolute left-0 top-full z-50 mt-1 max-h-64 w-56 overflow-auto rounded-xl border-2 border-[#0051fe] bg-white shadow-lg"
              role="listbox"
            >
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  role="option"
                  aria-selected={selectedCountry.code === country.code}
                  onClick={() => {
                    setSelectedCountry(country)
                    setDropdownOpen(false)
                    setValue("")
                    setError("")
                    inputRef.current?.focus()
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-[#04152b] hover:bg-[#0051fe]/10 transition-colors",
                    selectedCountry.code === country.code && "bg-[#0051fe]/15 font-medium"
                  )}
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                  <span className="font-medium text-[#0051fe]">+{country.dial}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-border" />

        <input
          ref={inputRef}
          type="tel"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[#04152b] placeholder:text-[#04152b]/50 outline-none text-base"
          maxLength={16}
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
