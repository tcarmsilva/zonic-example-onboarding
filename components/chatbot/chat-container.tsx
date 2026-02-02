"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
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
import { ConversationStyleSelect } from "./conversation-style-select"
import { CaptureInfoInput } from "./capture-info-input"
import { TeamMembersInput } from "./team-members-input"
import { InstagramInput } from "./instagram-input"
import { CnpjInput } from "./cnpj-input"
import { RatingInput } from "./rating-input"
import { HotLeadInput } from "./hot-lead-input"
import { CalendarScheduler } from "./calendar-scheduler"
import { TypingIndicator } from "./typing-indicator"
import { ResumePrompt } from "./resume-prompt"
import { MetaEvents, GTMEvents } from "@/lib/tracking"
import { MetaCAPI } from "@/lib/meta-capi"
import { prefetchSlots } from "@/lib/cal-api"
import { 
  saveChatState, 
  loadChatState, 
  clearChatState, 
  getSavedProgressSummary,
  getSavedOnboardingId,
  type ChatPersistenceState 
} from "@/lib/chat-persistence"
import { 
  initializeOnboarding, 
  saveOnboardingField 
} from "@/lib/supabase-onboarding"
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
  const [showConversationStyle, setShowConversationStyle] = useState(false)
  const [showCaptureInfo, setShowCaptureInfo] = useState(false)
  const [showTeamMembers, setShowTeamMembers] = useState(false)
  const [showInstagram, setShowInstagram] = useState(false)
  const [showCnpj, setShowCnpj] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [showHotLead, setShowHotLead] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [userData, setUserData] = useState<Record<string, string>>({})
  const [welcomeComplete, setWelcomeComplete] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [bookingInfo, setBookingInfo] = useState<{ date: string; time: string; shortFormat: string } | null>(null)
  
  // Database persistence
  const [onboardingId, setOnboardingId] = useState<number | null>(null)

  // Persistence state
  const [isCheckingResume, setIsCheckingResume] = useState(true)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [savedProgressSummary, setSavedProgressSummary] = useState<{
    answeredQuestions: number
    percentage: number
    clinicName?: string
    responsibleName?: string
  } | null>(null)
  const [isResuming, setIsResuming] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Filter steps based on showIf conditions
  const getFilteredSteps = useCallback((currentUserData: Record<string, string>): ChatStep[] => {
    return config.steps.filter(step => {
      if (!step.showIf) return true
      return step.showIf(currentUserData)
    })
  }, [config.steps])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // ============================================
  // PERSISTENCE: Check for saved state on mount
  // ============================================
  useEffect(() => {
    const checkSavedState = () => {
      const savedState = loadChatState()
      
      if (savedState && savedState.currentStepIndex >= 0 && Object.keys(savedState.userData).length > 0) {
        // User has progress saved - show resume prompt
        const summary = getSavedProgressSummary(config.steps.length)
        if (summary) {
          setSavedProgressSummary(summary)
          setShowResumePrompt(true)
        } else {
          // No valid summary, start fresh
          setShowResumePrompt(false)
        }
      } else {
        // No saved state, start fresh
        setShowResumePrompt(false)
      }
      
      setIsCheckingResume(false)
    }

    checkSavedState()
  }, [config.steps.length])

  // ============================================
  // PERSISTENCE: Save state after changes
  // ============================================
  const saveCurrentState = useCallback(() => {
    // Don't save if still checking or showing resume prompt
    if (isCheckingResume || showResumePrompt) return
    
    saveChatState({
      userData,
      currentStepIndex,
      welcomeComplete,
      isComplete,
      bookingInfo,
      onboardingId,
    })
  }, [userData, currentStepIndex, welcomeComplete, isComplete, bookingInfo, onboardingId, isCheckingResume, showResumePrompt])

  // Save state whenever relevant data changes
  useEffect(() => {
    // Only save if we've made progress and not showing resume prompt
    if (!showResumePrompt && !isCheckingResume && (welcomeComplete || currentStepIndex >= 0)) {
      saveCurrentState()
    }
  }, [userData, currentStepIndex, welcomeComplete, isComplete, bookingInfo, saveCurrentState, showResumePrompt, isCheckingResume])

  // ============================================
  // PERSISTENCE: Handle resume/start fresh
  // ============================================
  const handleResume = () => {
    const savedState = loadChatState()
    if (!savedState) {
      // Fallback: start fresh if state is gone
      handleStartFresh()
      return
    }

    setIsResuming(true)
    setShowResumePrompt(false)
    
    // Restore state
    setUserData(savedState.userData)
    setWelcomeComplete(true)
    setIsComplete(savedState.isComplete)
    setBookingInfo(savedState.bookingInfo)
    setOnboardingId(savedState.onboardingId)
    
    // Show resuming message
    setMessages([{
      id: Date.now().toString(),
      type: "bot",
      content: (
        <span>
          Bem-vindo de volta! 👋 Vamos continuar de onde você parou.
        </span>
      ),
      showAvatar: true,
    }])

    // Set step index after a short delay to trigger the step display
    setTimeout(() => {
      setCurrentStepIndex(savedState.currentStepIndex)
      setIsResuming(false)
    }, 500)
  }

  const handleStartFresh = () => {
    clearChatState()
    setShowResumePrompt(false)
    setSavedProgressSummary(null)
    // Reset will happen naturally as all states are already at initial values
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
  }, [messagesLength, messagesLastId, isTyping, showInput, showChoices, showMultiSelect, showTimezone, showOperatingHours, showDeactivationSchedule, showNumber, showTextarea, showMultiText, showConversationFlow, showConversationStyle, showCaptureInfo, showTeamMembers, showInstagram, showCnpj, showRating, showHotLead, showCalendar])

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
    setShowConversationStyle(false)
    setShowCaptureInfo(false)
    setShowTeamMembers(false)
    setShowInstagram(false)
    setShowCnpj(false)
    setShowRating(false)
    setShowHotLead(false)
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
    // Don't start welcome if still checking for resume state or showing resume prompt
    if (isCheckingResume || showResumePrompt || isResuming) return
    
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

        // Initialize database record for this onboarding session
        const existingId = getSavedOnboardingId()
        const result = await initializeOnboarding(existingId)
        if (result.success && result.id) {
          setOnboardingId(result.id)
          console.log('[Onboarding] Initialized with ID:', result.id)
        } else {
          console.warn('[Onboarding] Failed to initialize record:', result.error)
        }

        // Show first step
        setWelcomeComplete(true)
        setCurrentStepIndex(0)
      }

      showWelcomeMessages()
    }
  }, [currentStepIndex, welcomeComplete, config, isCheckingResume, showResumePrompt, isResuming])

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
      case "conversation_style":
        setShowConversationStyle(true)
        break
      case "capture_info":
        setShowCaptureInfo(true)
        break
      case "team_members":
        setShowTeamMembers(true)
        break
      case "instagram":
        setShowInstagram(true)
        break
      case "cnpj":
        setShowCnpj(true)
        break
      case "rating":
        setShowRating(true)
        break
      case "hot_lead":
        setShowHotLead(true)
        break
      default:
        setShowInput(true)
        break
    }
  }

  // Show current step
  useEffect(() => {
    // Don't show step if checking resume or showing resume prompt
    if (isCheckingResume || showResumePrompt) return
    
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
  }, [currentStepIndex, welcomeComplete, isComplete, isCheckingResume, showResumePrompt, getFilteredSteps, userData])

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

    // For certain types we store JSON but show a readable summary in the chat
    let displayMessage: string = value
    
    // Hot lead display
    if (step.type === "hot_lead") {
      try {
        const parsed = JSON.parse(value) as { muito_quente?: string; quente?: string; morno?: string }
        const parts: string[] = []
        if (parsed.muito_quente) parts.push(`Muito quente: ${parsed.muito_quente}`)
        if (parsed.quente) parts.push(`Quente: ${parsed.quente}`)
        if (parsed.morno) parts.push(`Morno: ${parsed.morno}`)
        if (parts.length) displayMessage = parts.join("\n")
      } catch {
        // keep raw value if not valid JSON
      }
    }
    
    // Deactivation schedule display
    if (step.type === "deactivation_schedule") {
      try {
        const parsed = JSON.parse(value) as { 
          mode: string; 
          schedule?: Record<string, { start_h: number; end_h: number }> 
        }
        if (parsed.mode === "always_on") {
          displayMessage = "IA sempre ligada"
        } else if (parsed.schedule) {
          const dayLabels: Record<string, string> = {
            monday: "Seg", tuesday: "Ter", wednesday: "Qua",
            thursday: "Qui", friday: "Sex", saturday: "Sáb", sunday: "Dom"
          }
          const parts = Object.entries(parsed.schedule).map(([day, times]) => {
            const label = dayLabels[day] || day
            return `${label}: ${times.start_h}h - ${times.end_h}h`
          })
          displayMessage = parts.length > 0 
            ? `Desligada: ${parts.join(", ")}` 
            : "Nenhum horário de desativação configurado"
        }
      } catch {
        // keep raw value if not valid JSON
      }
    }

    addUserMessage(displayMessage)
    hideAllInputs()

    // When parking_value step: save option + value in same variable (parking)
    const isParkingValueStep = step.id === "parking_value"
    const valueToSave = isParkingValueStep
      ? JSON.stringify({ option: userData.parking, value })
      : value

    // Save data
    const updatedUserData = { ...userData, [step.dataKey]: valueToSave }
    setUserData(updatedUserData)

    // Track event
    if (step.trackingEvent) {
      GTMEvents.formStep(step.trackingEvent, { [step.dataKey]: valueToSave })
    }

    // Save to database
    if (onboardingId) {
      saveOnboardingField(onboardingId, step.dataKey, valueToSave)
        .then((result) => {
          if (result.success) {
            console.log(`[Onboarding] Saved ${step.dataKey} to record ${onboardingId}`)
          } else {
            console.warn(`[Onboarding] Failed to save ${step.dataKey}:`, result.error)
          }
        })
        .catch((error) => {
          console.error(`[Onboarding] Error saving ${step.dataKey}:`, error)
        })
    }

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

    // Clear saved state when completing (will be saved again with isComplete=true)
    // The final state will be saved with isComplete=true by the useEffect

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
      // Clear saved state since onboarding is complete
      clearChatState()
      
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
    
    // Clear saved state since onboarding is complete
    clearChatState()

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
      case "cnpj":
        return <CnpjInput onSubmit={handleSubmit} />
      default:
        return (
          <TextInput onSubmit={handleSubmit} type="text" placeholder={step.placeholder || "Digite sua resposta..."} />
        )
    }
  }

  const currentStep = getCurrentStep()

  // Show loading state while checking for resume
  if (isCheckingResume) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center" style={{ backgroundColor: "#e6eefe" }}>
        <div className="animate-pulse text-[#0051fe]">
          <svg className="w-12 h-12 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    )
  }

  // Show resume prompt if user has saved progress
  if (showResumePrompt && savedProgressSummary) {
    return (
      <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#e6eefe" }}>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
            {/* Banner */}
            <div className="py-8">
              <Banner />
            </div>

            {/* Resume prompt */}
            <div className="py-8">
              <ResumePrompt
                progressSummary={savedProgressSummary}
                onResume={handleResume}
                onStartFresh={handleStartFresh}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#e6eefe" }}>
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
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

          {/* Conversation Style Select */}
          {showConversationStyle && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <ConversationStyleSelect onSubmit={handleSubmit} />
            </div>
          )}

          {/* Capture Info Input */}
          {showCaptureInfo && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <CaptureInfoInput onSubmit={handleSubmit} />
            </div>
          )}

          {/* Team Members Input */}
          {showTeamMembers && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <TeamMembersInput onSubmit={handleSubmit} />
            </div>
          )}

          {/* Instagram Input */}
          {showInstagram && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
              <InstagramInput onSubmit={handleSubmit} />
            </div>
          )}

          {/* CNPJ Input (fixed bottom like text/phone) - rendered in fixed section when showCnpj */}

          {/* Rating Input */}
          {showRating && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4 px-4">
              <RatingInput onSubmit={handleSubmit} />
            </div>
          )}

          {/* Hot Lead Input (3 fields: muito quente, quente, morno) */}
          {showHotLead && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4 px-4">
              <HotLeadInput onSubmit={handleSubmit} />
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

      {/* Fixed input at bottom - for text, phone, email, cnpj */}
      {(showInput || showCnpj) && (
        <div
          className="fixed inset-x-0 bottom-0 backdrop-blur-sm p-4 animate-in slide-in-from-bottom duration-300"
          style={{ backgroundColor: "rgba(230, 238, 254, 0.95)" }}
        >
          <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">{renderInput()}</div>
        </div>
      )}
    </div>
  )
}
