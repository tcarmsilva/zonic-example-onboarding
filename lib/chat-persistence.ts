"use client"

// ============================================
// CHAT PERSISTENCE - LocalStorage Manager
// ============================================
// This module handles saving and restoring chat state
// for unauthenticated users using localStorage.

const STORAGE_KEY = "zonic_chat_onboarding_state"
const STORAGE_VERSION = 2 // Increment when schema changes - v2 adds onboardingId

export interface ChatPersistenceState {
  version: number
  userData: Record<string, string>
  currentStepIndex: number
  welcomeComplete: boolean
  isComplete: boolean
  bookingInfo: { date: string; time: string; shortFormat: string } | null
  onboardingId: number | null // Database record ID for persistence
  savedAt: number // timestamp
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false
  try {
    const testKey = "__test__"
    window.localStorage.setItem(testKey, "test")
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Save chat state to localStorage
 */
export function saveChatState(state: Omit<ChatPersistenceState, "version" | "savedAt">): void {
  if (!isLocalStorageAvailable()) return

  const stateToSave: ChatPersistenceState = {
    ...state,
    version: STORAGE_VERSION,
    savedAt: Date.now(),
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
  } catch (error) {
    console.error("[ChatPersistence] Failed to save state:", error)
  }
}

/**
 * Load chat state from localStorage
 * Returns null if no valid state exists
 */
export function loadChatState(): ChatPersistenceState | null {
  if (!isLocalStorageAvailable()) return null

  try {
    const savedState = window.localStorage.getItem(STORAGE_KEY)
    if (!savedState) return null

    const parsed: ChatPersistenceState = JSON.parse(savedState)

    // Validate version - clear if schema changed
    if (parsed.version !== STORAGE_VERSION) {
      clearChatState()
      return null
    }

    // Check if state is too old (30 days)
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
    if (Date.now() - parsed.savedAt > THIRTY_DAYS_MS) {
      clearChatState()
      return null
    }

    // Validate required fields
    if (
      typeof parsed.userData !== "object" ||
      typeof parsed.currentStepIndex !== "number" ||
      typeof parsed.welcomeComplete !== "boolean" ||
      typeof parsed.isComplete !== "boolean"
    ) {
      clearChatState()
      return null
    }

    return parsed
  } catch (error) {
    console.error("[ChatPersistence] Failed to load state:", error)
    clearChatState()
    return null
  }
}

/**
 * Clear chat state from localStorage
 */
export function clearChatState(): void {
  if (!isLocalStorageAvailable()) return

  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("[ChatPersistence] Failed to clear state:", error)
  }
}

/**
 * Check if there's a saved chat state that can be resumed
 */
export function hasSavedChatState(): boolean {
  const state = loadChatState()
  // Only consider resumable if user has made some progress
  return state !== null && state.currentStepIndex >= 0 && Object.keys(state.userData).length > 0
}

/**
 * Get a summary of the saved progress for display
 */
export function getSavedProgressSummary(totalSteps: number): { 
  answeredQuestions: number
  percentage: number
  clinicName?: string
  responsibleName?: string
  onboardingId?: number | null
} | null {
  const state = loadChatState()
  if (!state || state.currentStepIndex < 0) return null

  const answeredQuestions = Object.keys(state.userData).length
  const percentage = Math.round((state.currentStepIndex / totalSteps) * 100)

  return {
    answeredQuestions,
    percentage: Math.min(percentage, 100),
    clinicName: state.userData.clinic_name,
    responsibleName: state.userData.project_responsible_name,
    onboardingId: state.onboardingId,
  }
}

/**
 * Get the saved onboarding ID if exists
 */
export function getSavedOnboardingId(): number | null {
  const state = loadChatState()
  return state?.onboardingId ?? null
}
