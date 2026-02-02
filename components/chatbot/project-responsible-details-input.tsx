"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, User, Phone, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { getRoleByLabel } from "@/lib/role-options"
import { PhoneInputField } from "./phone-input-field"
import { validateFullPhone } from "@/lib/phone-countries"

interface ProjectResponsibleDetailsInputProps {
  roleLabel: string
  onSubmit: (value: string) => void
  className?: string
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export function ProjectResponsibleDetailsInput({
  roleLabel,
  onSubmit,
  className,
}: ProjectResponsibleDetailsInputProps) {
  const role = getRoleByLabel(roleLabel)
  const icon = role?.icon ?? ""

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = () => {
    const payload = {
      project_responsible_name: name.trim(),
      project_responsible_phone: phone,
      project_responsible_email: email.trim(),
    }
    onSubmit(JSON.stringify(payload))
  }

  const isValid =
    name.trim() !== "" && validateFullPhone(phone) && isValidEmail(email)

  return (
    <div className={cn("space-y-4 px-4", className)}>
      <p className="text-sm text-[#04152b]/70 text-center">
        Preencha o nome, telefone e e-mail do responsável:
      </p>

      <div className="rounded-xl border-2 border-[#0051fe]/20 bg-white/60 p-3 space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b border-[#0051fe]/10">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-[#04152b]">{roleLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <User className="size-4 text-[#0051fe] shrink-0" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome completo"
            className="flex-1 bg-white/80 border border-[#0051fe]/20 rounded-lg px-3 py-2 text-sm text-[#04152b] placeholder:text-[#04152b]/40 outline-none focus:border-[#0051fe]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Phone className="size-4 text-[#0051fe] shrink-0" />
          <div className="flex-1 min-w-0">
            <PhoneInputField value={phone} onChange={setPhone} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="size-4 text-[#0051fe] shrink-0" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className="flex-1 bg-white/80 border border-[#0051fe]/20 rounded-lg px-3 py-2 text-sm text-[#04152b] placeholder:text-[#04152b]/40 outline-none focus:border-[#0051fe]"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="rounded-full bg-[#0051fe]/80 hover:bg-[#0051fe] disabled:opacity-50 px-8"
        >
          Continuar
          <ArrowUp className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
