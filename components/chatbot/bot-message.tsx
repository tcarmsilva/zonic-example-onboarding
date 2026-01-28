"use client"

import type React from "react"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const AVATAR_URL = "/professional-woman-doctor-headshot.jpg"

interface BotMessageProps {
  message: string | React.ReactNode
  showAvatar?: boolean
  className?: string
}

export function BotMessage({ message, showAvatar = true, className }: BotMessageProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {showAvatar ? (
        <Avatar className="size-10 shrink-0 border-2 border-[#0051fe]/30">
          <AvatarImage src={AVATAR_URL || "/placeholder.svg"} alt="Assistente" />
          <AvatarFallback className="bg-[#0051fe] text-white">V</AvatarFallback>
        </Avatar>
      ) : (
        <div className="size-10 shrink-0" />
      )}
      <div className="text-base leading-relaxed" style={{ color: "#04152b" }}>
        {message}
      </div>
    </div>
  )
}
