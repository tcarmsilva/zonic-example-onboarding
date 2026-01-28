"use client"

import { cn } from "@/lib/utils"

interface UserMessageProps {
  message: string
  className?: string
}

export function UserMessage({ message, className }: UserMessageProps) {
  return (
    <div className={cn("flex justify-end", className)}>
      <div className="rounded-2xl bg-white px-4 py-2 text-base text-slate-900">{message}</div>
    </div>
  )
}
