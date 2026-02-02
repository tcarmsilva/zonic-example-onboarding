"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  COUNTRIES,
  parseFullPhone,
  formatLocalDisplay,
  formatLocalInput,
} from "@/lib/phone-countries"

interface PhoneInputFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export function PhoneInputField({
  value,
  onChange,
  placeholder,
  className,
  id,
}: PhoneInputFieldProps) {
  const parsed = parseFullPhone(value)
  const initialCountry = parsed?.country ?? COUNTRIES[0]
  const initialLocal = parsed ? formatLocalDisplay(parsed.country, parsed.localDigits) : ""

  const [selectedCountry, setSelectedCountry] = useState(initialCountry)
  const [localValue, setLocalValue] = useState(initialLocal)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Sincronizar com value externo (ex.: reset)
  useEffect(() => {
    const p = parseFullPhone(value)
    if (p) {
      setSelectedCountry(p.country)
      setLocalValue(formatLocalDisplay(p.country, p.localDigits))
    } else if (!value) {
      setLocalValue("")
    }
  }, [value])

  useEffect(() => {
    if (dropdownOpen) {
      setSearchQuery("")
      searchInputRef.current?.focus()
    }
  }, [dropdownOpen])

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

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      c.dial.includes(searchQuery.trim()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLocalInput(selectedCountry, e.target.value)
    setLocalValue(formatted)
    const digits = formatted.replace(/\D/g, "")
    onChange(digits ? `${selectedCountry.dial}${digits}` : "")
  }

  const handleCountrySelect = (country: (typeof COUNTRIES)[0]) => {
    setSelectedCountry(country)
    setDropdownOpen(false)
    setLocalValue("")
    onChange("")
  }

  const displayPlaceholder =
    placeholder ?? (selectedCountry.code === "BR" ? "(11) 99999-9999" : "999 999-9999")

  return (
    <div className={cn("flex items-center gap-2 bg-white/80 border border-[#0051fe]/20 rounded-lg px-3 py-2", className)}>
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-1 text-[#04152b] rounded-lg py-0.5 pr-0.5 hover:bg-[#0051fe]/10 transition-colors"
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-label="Selecionar país"
        >
          <span className="text-base">{selectedCountry.flag}</span>
          <span className="text-sm font-medium">+{selectedCountry.dial}</span>
          <ChevronDown
            className={cn("size-4 text-[#04152b]/50 transition-transform", dropdownOpen && "rotate-180")}
          />
        </button>
        {dropdownOpen && (
          <div
            className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border-2 border-[#0051fe] bg-white shadow-lg"
            role="listbox"
          >
            <div className="sticky top-0 border-b border-[#0051fe]/20 bg-white p-2">
              <div className="flex items-center gap-2 rounded-lg bg-[#04152b]/5 px-2 py-1.5">
                <Search className="size-4 shrink-0 text-[#04152b]/50" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filteredCountries[0]) {
                      e.preventDefault()
                      handleCountrySelect(filteredCountries[0])
                    }
                  }}
                  placeholder="Buscar país ou código..."
                  className="flex-1 bg-transparent text-sm text-[#04152b] placeholder:text-[#04152b]/50 outline-none"
                />
              </div>
            </div>
            <div className="max-h-56 overflow-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={selectedCountry.code === country.code}
                    onClick={() => handleCountrySelect(country)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-[#04152b] hover:bg-[#0051fe]/10 transition-colors",
                      selectedCountry.code === country.code && "bg-[#0051fe]/15 font-medium"
                    )}
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span className="flex-1">{country.name}</span>
                    <span className="font-medium text-[#0051fe]">+{country.dial}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-4 text-center text-sm text-[#04152b]/60">Nenhum país encontrado</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="h-5 w-px bg-[#0051fe]/20 shrink-0" />

      <input
        id={id}
        type="tel"
        value={localValue}
        onChange={handleLocalChange}
        placeholder={displayPlaceholder}
        className="flex-1 min-w-0 bg-transparent text-sm text-[#04152b] placeholder:text-[#04152b]/40 outline-none"
        maxLength={20}
      />
    </div>
  )
}
