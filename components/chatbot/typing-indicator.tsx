"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const AVATAR_URL = "/professional-woman-doctor-headshot.jpg"

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="size-10 border-2 border-[#0051fe]/30">
        <AvatarImage src={AVATAR_URL || "/placeholder.svg"} alt="Assistente" />
        <AvatarFallback className="bg-[#0051fe] text-white">V</AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1 rounded-2xl bg-white/60 border border-[#0051fe]/10 px-4 py-3">
        <span className="typing-dot size-2 rounded-full bg-[#04152b]/40" />
        <span className="typing-dot size-2 rounded-full bg-[#04152b]/40" />
        <span className="typing-dot size-2 rounded-full bg-[#04152b]/40" />
      </div>
    </div>
  )
}
