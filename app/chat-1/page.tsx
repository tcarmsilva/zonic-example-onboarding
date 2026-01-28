"use client"

import { ChatContainer } from "@/components/chatbot/chat-container"
import { chatConfig } from "./data"

export default function Chat1Page() {
  return <ChatContainer config={chatConfig} />
}
