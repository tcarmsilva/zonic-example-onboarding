"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, User, Phone, Mail, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { ROLE_OPTIONS } from "@/lib/role-options"
import { PhoneInputField } from "./phone-input-field"
import { validateFullPhone } from "@/lib/phone-countries"

interface TeamMembersInputProps {
  onSubmit: (value: string) => void
  className?: string
  /** Opção já escolhida como responsável pela implantação - não aparece na lista */
  excludedRoleLabel?: string
  /** Se informado, esta opção fica obrigatória (ex.: Dono quando responsável não é Dono) */
  requiredRoleLabel?: string
  /** Se true, mostra opção "Não ser mais ninguém" (apenas quando responsável é Dono) */
  showNoOneElse?: boolean
}

interface TeamMember {
  role: string
  roleLabel: string
  name: string
  phone: string
  email: string
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export function TeamMembersInput({ onSubmit, className, excludedRoleLabel, requiredRoleLabel, showNoOneElse }: TeamMembersInputProps) {
  const availableOptions = excludedRoleLabel
    ? ROLE_OPTIONS.filter((r) => r.label !== excludedRoleLabel)
    : [...ROLE_OPTIONS]

  const requiredRoleId = requiredRoleLabel ? ROLE_OPTIONS.find((r) => r.label === requiredRoleLabel)?.id : undefined
  const initialSelected = requiredRoleId && availableOptions.some((r) => r.id === requiredRoleId) ? [requiredRoleId] : []

  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialSelected)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [step, setStep] = useState<"select" | "fill">("select")

  const toggleRole = (roleId: string) => {
    if (requiredRoleId && roleId === requiredRoleId) return
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((r) => r !== roleId)
      }
      return [...prev, roleId]
    })
  }

  const proceedToFill = () => {
    const newMembers = selectedRoles.map((roleId) => {
      const role = ROLE_OPTIONS.find((r) => r.id === roleId)
      return {
        role: roleId,
        roleLabel: role?.label || roleId,
        name: "",
        phone: "",
        email: "",
      }
    })
    setMembers(newMembers)
    setStep("fill")
  }

  const updateMember = (index: number, field: "name" | "phone" | "email", value: string) => {
    setMembers(prev => prev.map((m, i) => {
      if (i === index) return { ...m, [field]: value }
      return m
    }))
  }

  const handleSubmit = () => {
    const formatted = members
      .map((m) => {
        const phonePart = m.phone ? m.phone : "sem telefone"
        const emailPart = m.email.trim() ? ` ${m.email.trim()}` : ""
        return `${m.roleLabel}: ${m.name} (${phonePart})${emailPart}`
      })
      .join("\n")
    onSubmit(formatted)
  }

  const allMembersValid = members.every(
    (m) => m.name.trim() && validateFullPhone(m.phone) && isValidEmail(m.email)
  )

  const handleNoOneElse = () => {
    onSubmit("Mais ninguém")
  }

  if (step === "select") {
    const canProceed = selectedRoles.length > 0
    return (
      <div className={cn("space-y-4 px-4", className)}>
        <p className="text-sm text-[#04152b]/70 text-center">
          Selecione todos que vão usar a plataforma:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {availableOptions.map((role) => {
            const isSelected = selectedRoles.includes(role.id)
            const isRequired = requiredRoleId === role.id
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
                {isRequired && (
                  <span className="text-xs text-[#04152b]/60 ml-1">(obrigatório)</span>
                )}
                {isSelected && <Check className="size-4 text-[#0051fe] ml-auto" />}
              </button>
            )
          })}
        </div>

        {showNoOneElse && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleNoOneElse}
              className="text-sm text-[#0051fe] hover:underline font-medium"
            >
              Mais ninguém
            </button>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            onClick={proceedToFill}
            disabled={!canProceed}
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
        Preencha o nome, telefone e e-mail de cada pessoa:
      </p>

      <div className="space-y-3">
        {members.map((member, index) => {
          const role = ROLE_OPTIONS.find((r) => r.id === member.role)
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
                <div className="flex-1 min-w-0">
                  <PhoneInputField
                    value={member.phone}
                    onChange={(value) => updateMember(index, "phone", value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="size-4 text-[#0051fe] shrink-0" />
                <input
                  type="email"
                  value={member.email}
                  onChange={(e) => updateMember(index, "email", e.target.value)}
                  placeholder="email@exemplo.com"
                  className="flex-1 bg-white/80 border border-[#0051fe]/20 rounded-lg px-3 py-2 text-sm text-[#04152b] placeholder:text-[#04152b]/40 outline-none focus:border-[#0051fe]"
                />
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
