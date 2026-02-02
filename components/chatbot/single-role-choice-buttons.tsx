"use client"

import { cn } from "@/lib/utils"
import { getRoleByLabel } from "@/lib/role-options"

interface SingleRoleChoiceButtonsProps {
  options: string[]
  onSelect: (option: string) => void
  className?: string
}

export function SingleRoleChoiceButtons({ options, onSelect, className }: SingleRoleChoiceButtonsProps) {
  return (
    <div className={cn("space-y-4 px-4", className)}>
      <div className="grid grid-cols-2 gap-2">
        {options.map((label) => {
          const role = getRoleByLabel(label)
          const icon = role?.icon ?? ""
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left",
                "border-[#0051fe]/20 hover:border-[#0051fe]/50 hover:bg-[#0051fe]/5",
                "bg-white/90 text-[#04152b]"
              )}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
