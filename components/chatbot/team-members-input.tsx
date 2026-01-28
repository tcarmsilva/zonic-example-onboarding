"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, User, Phone, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamMembersInputProps {
  onSubmit: (value: string) => void
  className?: string
}

const ROLE_OPTIONS = [
  { id: "dono", label: "Dono(a) da clínica", icon: "👨‍⚕️" },
  { id: "gerente", label: "Gerente", icon: "👔" },
  { id: "atendente", label: "Atendente", icon: "💬" },
  { id: "agencia", label: "Agência", icon: "📊" },
]

interface TeamMember {
  role: string
  roleLabel: string
  name: string
  phone: string
}

// Format phone as user types: (11) 99999-9999
const formatPhone = (input: string) => {
  const numbers = input.replace(/\D/g, "")
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

export function TeamMembersInput({ onSubmit, className }: TeamMembersInputProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [step, setStep] = useState<"select" | "fill">("select")

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(r => r !== roleId)
      }
      return [...prev, roleId]
    })
  }

  const proceedToFill = () => {
    const newMembers = selectedRoles.map(roleId => {
      const role = ROLE_OPTIONS.find(r => r.id === roleId)
      return {
        role: roleId,
        roleLabel: role?.label || roleId,
        name: "",
        phone: "",
      }
    })
    setMembers(newMembers)
    setStep("fill")
  }

  const updateMember = (index: number, field: "name" | "phone", value: string) => {
    setMembers(prev => prev.map((m, i) => {
      if (i === index) {
        if (field === "phone") {
          return { ...m, [field]: formatPhone(value) }
        }
        return { ...m, [field]: value }
      }
      return m
    }))
  }

  const handleSubmit = () => {
    const formatted = members.map(m => {
      const phoneClean = m.phone.replace(/\D/g, "")
      return `${m.roleLabel}: ${m.name} (${phoneClean ? `55${phoneClean}` : "sem telefone"})`
    }).join("\n")
    
    onSubmit(formatted)
  }

  const isValidPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "")
    return numbers.length === 11 && numbers[2] === "9"
  }

  const allMembersValid = members.every(m => m.name.trim() && isValidPhone(m.phone))

  if (step === "select") {
    return (
      <div className={cn("space-y-4 px-4", className)}>
        <p className="text-sm text-[#04152b]/70 text-center">
          Selecione todos que vão usar a plataforma:
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map((role) => {
            const isSelected = selectedRoles.includes(role.id)
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleRole(role.id)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left",
                  isSelected
                    ? "border-[#0051fe] bg-[#0051fe]/10"
                    : "border-[#0051fe]/20 hover:border-[#0051fe]/50"
                )}
              >
                <span className="text-xl">{role.icon}</span>
                <span className="text-sm font-medium text-[#04152b]">{role.label}</span>
                {isSelected && <Check className="size-4 text-[#0051fe] ml-auto" />}
              </button>
            )
          })}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={proceedToFill}
            disabled={selectedRoles.length === 0}
            className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-8"
          >
            Continuar
            <ArrowUp className="size-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4 px-4", className)}>
      <p className="text-sm text-[#04152b]/70 text-center">
        Preencha o nome e telefone de cada pessoa:
      </p>

      <div className="space-y-3">
        {members.map((member, index) => {
          const role = ROLE_OPTIONS.find(r => r.id === member.role)
          return (
            <div
              key={member.role}
              className="rounded-xl border-2 border-[#0051fe]/20 bg-white/60 p-3 space-y-2"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-[#0051fe]/10">
                <span className="text-lg">{role?.icon}</span>
                <span className="font-medium text-[#04152b]">{member.roleLabel}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="size-4 text-[#0051fe] shrink-0" />
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateMember(index, "name", e.target.value)}
                  placeholder="Nome completo"
                  className="flex-1 bg-white/80 border border-[#0051fe]/20 rounded-lg px-3 py-2 text-sm text-[#04152b] placeholder:text-[#04152b]/40 outline-none focus:border-[#0051fe]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Phone className="size-4 text-[#0051fe] shrink-0" />
                <div className="flex-1 flex items-center gap-1 bg-white/80 border border-[#0051fe]/20 rounded-lg px-3 py-2">
                  <span className="text-sm text-[#04152b]/60">🇧🇷 +55</span>
                  <input
                    type="tel"
                    value={member.phone}
                    onChange={(e) => updateMember(index, "phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="flex-1 bg-transparent text-sm text-[#04152b] placeholder:text-[#04152b]/40 outline-none"
                    maxLength={16}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-center gap-3">
        <Button
          onClick={() => setStep("select")}
          variant="outline"
          className="rounded-full border-[#0051fe]/30 text-[#04152b] hover:bg-[#0051fe]/5 px-6"
        >
          Voltar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!allMembersValid}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-8"
        >
          Confirmar
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
