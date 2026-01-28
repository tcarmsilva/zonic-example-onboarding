"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { CheckCircle, Calendar, Clock } from "lucide-react"
import { Banner } from "./banner"
import { BotMessage } from "./bot-message"
import { UserMessage } from "./user-message"
import { TextInput } from "./text-input"
import { PhoneInput } from "./phone-input"
import { EmailInput } from "./email-input"
import { ChoiceButtons } from "./choice-buttons"
import { MultiSelect } from "./multi-select"
import { TimezoneSelect } from "./timezone-select"
import { OperatingHoursInput } from "./operating-hours-input"
import { DeactivationScheduleInput } from "./deactivation-schedule-input"
import { NumberInput } from "./number-input"
import { TextareaInput } from "./textarea-input"
import { MultiTextInput } from "./multi-text-input"
import { ConversationFlowSelect } from "./conversation-flow-select"
import { CaptureInfoInput } from "./capture-info-input"
import { CalendarScheduler } from "./calendar-scheduler"
import { TypingIndicator } from "./typing-indicator"
import { MetaEvents, GTMEvents } from "@/lib/tracking"
import { MetaCAPI } from "@/lib/meta-capi"
import { prefetchSlots } from "@/lib/cal-api"
// import { sendLeadToSupabase } from "@/lib/supabase-leads" // Commented out - not saving to DB for now
import type { ChatbotConfig, ChatStep } from "@/lib/chatbot-config"
import type { CalendarId } from "@/lib/cal-config"

interface Message {
  id: string
  type: "bot" | "user"
  content: string | React.ReactNode
  showAvatar?: boolean
}

interface ChatContainerProps {
  config: ChatbotConfig
}

export function ChatContainer({ config }: ChatContainerProps) {
  // -1 = welcome, 0+ = step index, >= filteredSteps.length = complete
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [showChoices, setShowChoices] = useState(false)
  const [showMultiSelect, setShowMultiSelect] = useState(false)
  const [showTimezone, setShowTimezone] = useState(false)
  const [showOperatingHours, setShowOperatingHours] = useState(false)
  const [showDeactivationSchedule, setShowDeactivationSchedule] = useState(false)
  const [showNumber, setShowNumber] = useState(false)
  const [showTextarea, setShowTextarea] = useState(false)
  const [showMultiText, setShowMultiText] = useState(false)
  const [showConversationFlow, setShowConversationFlow] = useState(false)
  const [showCaptureInfo, setShowCaptureInfo] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [userData, setUserData] = useState<Record<string, string>>({})
  const [welcomeComplete, setWelcomeComplete] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [bookingInfo, setBookingInfo] = useState<{ date: string; time: string; shortFormat: string } | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Filter steps based on showIf conditions
  const getFilteredSteps = (currentUserData: Record<string, string>): ChatStep[] => {
    return config.steps.filter(step => {
      if (!step.showIf) return true
      return step.showIf(currentUserData)
    })
  }

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Use stable primitive values for dependencies to prevent array size changes
  const messagesLength = messages.length
  const messagesLastId = messages[messages.length - 1]?.id

  useEffect(() => {
    // Don't scroll on first typing indicator (before any messages) to avoid cutting the banner
    if (isTyping && messages.length === 0) {
      return
    }
    scrollToBottom()
  }, [messagesLength, messagesLastId, isTyping, showInput, showChoices, showMultiSelect, showTimezone, showOperatingHours, showDeactivationSchedule, showNumber, showTextarea, showMultiText, showConversationFlow, showCaptureInfo, showCalendar])

  const addBotMessage = (content: string | React.ReactNode, showAvatar = true) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        type: "bot",
        content,
        showAvatar,
      },
    ])
  }

  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        type: "user",
        content,
      },
    ])
  }

  const simulateTyping = (callback: () => void, delay = 1500) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      callback()
    }, delay)
  }

  const hideAllInputs = () => {
    setShowInput(false)
    setShowChoices(false)
    setShowMultiSelect(false)
    setShowTimezone(false)
    setShowOperatingHours(false)
    setShowDeactivationSchedule(false)
    setShowNumber(false)
    setShowTextarea(false)
    setShowMultiText(false)
    setShowConversationFlow(false)
    setShowCaptureInfo(false)
    setShowCalendar(false)
  }

  // Prefetch calendar slots when near the end of the flow
  useEffect(() => {
    const filteredSteps = getFilteredSteps(userData)
    if (config.calendar && currentStepIndex >= filteredSteps.length - 3) {
      prefetchSlots((config.calendar.calendarId || "1") as CalendarId)
    }
  }, [currentStepIndex, config.calendar, userData])

  // Welcome sequence
  useEffect(() => {
    if (currentStepIndex === -1 && !welcomeComplete) {
      MetaEvents.ViewContent({ content_name: config.tracking.contentName })
      MetaCAPI.ViewContent(undefined, { content_name: config.tracking.contentName })
      GTMEvents.formStart()

      const showWelcomeMessages = async () => {
        await new Promise((r) => setTimeout(r, 500))

        for (let i = 0; i < config.welcomeMessages.length; i++) {
          const msg = config.welcomeMessages[i]
          await new Promise<void>((resolve) => {
            simulateTyping(
              () => {
                addBotMessage(msg.content, msg.showAvatar ?? true)
                resolve()
              },
              i === 0 ? 1000 : 1500,
            )
          })
        }

        // Show first step
        setWelcomeComplete(true)
        setCurrentStepIndex(0)
      }

      showWelcomeMessages()
    }
  }, [currentStepIndex, welcomeComplete, config])

  // Helper function to replace template variables
  const replaceTemplate = (template: string, data: Record<string, string>): string => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match)
  }

  // Show input based on step type
  const showInputForStep = (step: ChatStep) => {
    hideAllInputs()
    
    switch (step.type) {
      case "choices":
        setShowChoices(true)
        break
      case "multi_select":
        setShowMultiSelect(true)
        break
      case "timezone":
        setShowTimezone(true)
        break
      case "operating_hours":
        setShowOperatingHours(true)
        break
      case "deactivation_schedule":
        setShowDeactivationSchedule(true)
        break
      case "number":
        setShowNumber(true)
        break
      case "textarea":
        setShowTextarea(true)
        break
      case "multi_text":
        setShowMultiText(true)
        break
      case "conversation_flow":
        setShowConversationFlow(true)
        break
      case "capture_info":
        setShowCaptureInfo(true)
        break
      default:
        setShowInput(true)
        break
    }
  }

  // Show current step
  useEffect(() => {
    const filteredSteps = getFilteredSteps(userData)
    
    if (currentStepIndex >= 0 && currentStepIndex < filteredSteps.length && welcomeComplete && !isComplete) {
      const step = filteredSteps[currentStepIndex]

      simulateTyping(() => {
        // Show greeting if exists
        if (step.greetingTemplate) {
          const greetingText = replaceTemplate(step.greetingTemplate, userData)
          addBotMessage(
            <span>
              {greetingText}
              <br />
              {typeof step.botMessage === "function" ? step.botMessage(userData) : step.botMessage}
            </span>,
          )
        } else {
          const messageContent = typeof step.botMessage === "function" ? step.botMessage(userData) : step.botMessage
          addBotMessage(messageContent)
        }

        // Show appropriate input
        showInputForStep(step)
      }, 1000)
    }
  }, [currentStepIndex, welcomeComplete, isComplete])

  const getCurrentStep = (): ChatStep | null => {
    const filteredSteps = getFilteredSteps(userData)
    if (currentStepIndex >= 0 && currentStepIndex < filteredSteps.length) {
      return filteredSteps[currentStepIndex]
    }
    return null
  }

  const handleSubmit = (value: string) => {
    const step = getCurrentStep()
    if (!step) return

    addUserMessage(value)
    hideAllInputs()

    // Save data
    const updatedUserData = { ...userData, [step.dataKey]: value }
    setUserData(updatedUserData)

    // Track event
    if (step.trackingEvent) {
      GTMEvents.formStep(step.trackingEvent, { [step.dataKey]: value })
    }

    // Database saving is commented out for now
    // TODO: Uncomment when ready to save to database
    /*
    if (step.dataKey === "clinic_whatsapp_phone") {
      sendLeadToSupabase({
        name: updatedUserData.clinic_name,
        phone: value,
      })
        .then((result) => {
          console.log("[Onboarding] Lead created:", result)
        })
        .catch((error) => {
          console.error("[Onboarding] Failed to create lead:", error)
        })
    }
    */

    // Find next valid step (considering showIf conditions)
    const filteredSteps = getFilteredSteps(updatedUserData)
    const currentFilteredIndex = filteredSteps.findIndex(s => s.id === step.id)
    const nextIndex = currentFilteredIndex + 1

    if (nextIndex < filteredSteps.length) {
      // Find the actual index in the filtered steps array
      setCurrentStepIndex(nextIndex)
    } else {
      // Show completion message
      showCompletionMessage(updatedUserData)
    }
  }

  const showCompletionMessage = (finalUserData: Record<string, string>) => {
    MetaEvents.CompleteRegistration({
      content_name: config.tracking.completionName,
    })
    MetaCAPI.CompleteRegistration(
      {
        phone: finalUserData.clinic_whatsapp_phone,
      },
      { content_name: config.tracking.completionName },
    )
    GTMEvents.formSubmit(finalUserData)

    // If calendar is configured, show calendar instead of completion message
    if (config.calendar) {
      simulateTyping(() => {
        addBotMessage(config.calendar!.preScheduleMessage)
        setShowCalendar(true)
        
        // Track calendar view
        if (config.tracking.scheduleName) {
          MetaEvents.Schedule({ content_name: config.tracking.scheduleName })
          MetaCAPI.Schedule(
            { phone: finalUserData.clinic_whatsapp_phone },
            { content_name: config.tracking.scheduleName },
          )
        }
        GTMEvents.calendarView()
      })
    } else {
      setIsComplete(true)
      simulateTyping(() => {
        addBotMessage(
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-6 text-green-500" />
              <span className="font-bold text-lg text-[#0051fe]">{config.completionMessage.title}</span>
            </div>
            <div>{config.completionMessage.message}</div>
          </div>,
          false,
        )
      })
    }
  }

  // Handler for when booking is completed
  const handleBookingComplete = (info: { date: string; time: string; shortFormat: string }) => {
    setShowCalendar(false)
    setBookingInfo(info)
    setIsComplete(true)

    const calendarConfig = config.calendar!
    
    simulateTyping(() => {
      addBotMessage(
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-6 text-green-500" />
            <span className="font-bold text-lg text-[#0051fe]">{calendarConfig.completionMessage.title}</span>
          </div>
          <div>{calendarConfig.completionMessage.message}</div>
          <div className="bg-white/60 border-2 border-[#0051fe]/20 rounded-2xl p-4 space-y-3 mt-4">
            <div className="flex items-center gap-2 text-sm text-[#04152b]">
              <Calendar className="h-4 w-4 text-[#0051fe]" />
              <span className="font-medium">{info.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#04152b]">
              <Clock className="h-4 w-4 text-[#0051fe]" />
              <span className="font-medium">{info.time}</span>
            </div>
          </div>
        </div>,
        false,
      )
    }, 500)
  }

  // Get user data formatted for calendar scheduler
  const getCalendarUserData = () => {
    return {
      name: userData.clinic_name || "Cliente",
      phone: userData.clinic_whatsapp_phone || "",
      clinicName: userData.clinic_name || "",
    }
  }

  const renderInput = () => {
    const step = getCurrentStep()
    if (!step) return null

    switch (step.type) {
      case "phone":
        return <PhoneInput onSubmit={handleSubmit} />
      case "email":
        return <EmailInput onSubmit={handleSubmit} />
      default:
        return (
          <TextInput onSubmit={handleSubmit} type="text" placeholder={step.placeholder || "Digite sua resposta..."} />
        )
    }
  }

  const currentStep = getCurrentStep()

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#e6eefe" }}>
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="mx-auto max-w-lg">
          {/* Banner */}
          <div className="py-8">
            <Banner />
          </div>

          {/* Messages */}
          <div className="space-y-4 px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {message.type === "bot" ? (
                  <BotMessage message={message.content as string | React.ReactNode} showAvatar={message.showAvatar} />
                ) : (
                  <UserMessage message={message.content as string} />
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="animate-in fade-in duration-200">
                <TypingIndicator />
              </div>
            )}
          </div>

          {/* Choice Buttons */}
          {showChoices && currentStep?.options && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <ChoiceButtons options={currentStep.options} onSelect={handleSubmit} />
            </div>
          )}

          {/* Multi Select */}
          {showMultiSelect && currentStep?.options && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <MultiSelect 
                options={currentStep.options} 
                onSubmit={handleSubmit}
                minSelect={currentStep.minSelect || 1}
                maxSelect={currentStep.maxSelect}
              />
            </div>
          )}

          {/* Timezone Select */}
          {showTimezone && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4 px-4">
              <TimezoneSelect onSubmit={handleSubmit} />
            </div>
          )}

          {/* Operating Hours */}
          {showOperatingHours && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <OperatingHoursInput onSubmit={handleSubmit} />
            </div>
          )}

          {/* Deactivation Schedule */}
          {showDeactivationSchedule && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <DeactivationScheduleInput onSubmit={handleSubmit} />
            </div>
          )}

          {/* Number Input */}
          {showNumber && currentStep && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4 px-4">
              <NumberInput 
                onSubmit={handleSubmit}
                min={currentStep.minValue || 1}
                max={currentStep.maxValue || 999}
                placeholder={currentStep.placeholder}
              />
            </div>
          )}

          {/* Textarea Input */}
          {showTextarea && currentStep && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4 px-4">
              <TextareaInput 
                onSubmit={handleSubmit}
                placeholder={currentStep.placeholder}
                helpText={currentStep.helpText}
              />
            </div>
          )}

          {/* Multi Text Input */}
          {showMultiText && currentStep && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <MultiTextInput 
                onSubmit={handleSubmit}
                placeholder={currentStep.placeholder}
                addButtonText={currentStep.addButtonText}
                maxItems={currentStep.maxItems || 10}
              />
            </div>
          )}

          {/* Conversation Flow Select */}
          {showConversationFlow && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <ConversationFlowSelect onSubmit={handleSubmit} />
            </div>
          )}

          {/* Capture Info Input */}
          {showCaptureInfo && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <CaptureInfoInput onSubmit={handleSubmit} />
            </div>
          )}

          {/* Calendar Scheduler */}
          {showCalendar && config.calendar && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <CalendarScheduler 
                userData={getCalendarUserData()} 
                calendarIds={[(config.calendar.calendarId || "1") as CalendarId]}
                onBookingComplete={(info) => handleBookingComplete(info)}
              />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed input at bottom - only for text, phone, email */}
      {showInput && (
        <div
          className="fixed inset-x-0 bottom-0 backdrop-blur-sm p-4 animate-in slide-in-from-bottom duration-300"
          style={{ backgroundColor: "rgba(230, 238, 254, 0.95)" }}
        >
          <div className="mx-auto max-w-lg">{renderInput()}</div>
        </div>
      )}
    </div>
  )
}
