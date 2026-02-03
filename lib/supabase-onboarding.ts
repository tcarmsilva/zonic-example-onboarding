// ============================================
// SUPABASE ONBOARDING - Edge Function Client
// ============================================
// This module handles communication with the onboarding_records_chatbot edge function
// to persist chat data to the chatbot_onboarding table.

const EDGE_FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/onboarding_records_chatbot`
  : '';

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface OnboardingResponse {
  ok: boolean;
  record?: {
    id: number;
    [key: string]: unknown;
  };
  error?: string;
  details?: string;
}

/**
 * Create a new onboarding record
 * Called when user starts the chat to get an ID for subsequent updates
 */
export async function createOnboardingRecord(
  initialData?: Record<string, string>
): Promise<{ success: boolean; id?: number; error?: string }> {
  if (!EDGE_FUNCTION_URL) {
    console.warn('[OnboardingAPI] Edge function URL not configured');
    return { success: false, error: 'Edge function URL not configured' };
  }

  try {
    console.log('[OnboardingAPI] Creating new onboarding record...');
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        data: initialData || {},
      }),
    });

    const result: OnboardingResponse = await response.json();

    if (!response.ok || !result.ok) {
      console.error('[OnboardingAPI] Failed to create record:', result);
      return { 
        success: false, 
        error: result.details || result.error || 'Failed to create record' 
      };
    }

    console.log('[OnboardingAPI] Created record with ID:', result.record?.id);
    return { success: true, id: result.record?.id };
  } catch (error) {
    console.error('[OnboardingAPI] Error creating record:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Update an existing onboarding record with new data
 * Called after each chat step to save the user's response.
 * data values can be strings or objects (e.g. schedule_event for booking info).
 */
export async function updateOnboardingRecord(
  onboardingId: number,
  data: Record<string, string | unknown>
): Promise<{ success: boolean; error?: string }> {
  if (!EDGE_FUNCTION_URL) {
    console.warn('[OnboardingAPI] Edge function URL not configured');
    return { success: false, error: 'Edge function URL not configured' };
  }

  if (!onboardingId || onboardingId <= 0) {
    console.warn('[OnboardingAPI] Invalid onboarding ID:', onboardingId);
    return { success: false, error: 'Invalid onboarding ID' };
  }

  try {
    console.log(`[OnboardingAPI] Updating record ${onboardingId}:`, Object.keys(data));
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        onboarding_id: onboardingId,
        data: data,
      }),
    });

    const result: OnboardingResponse = await response.json();

    if (!response.ok || !result.ok) {
      console.error('[OnboardingAPI] Failed to update record:', result);
      return { 
        success: false, 
        error: result.details || result.error || 'Failed to update record' 
      };
    }

    console.log(`[OnboardingAPI] Updated record ${onboardingId} successfully`);
    return { success: true };
  } catch (error) {
    console.error('[OnboardingAPI] Error updating record:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Save a single field to the onboarding record
 * Convenience wrapper for updateOnboardingRecord
 */
export async function saveOnboardingField(
  onboardingId: number,
  fieldKey: string,
  fieldValue: string
): Promise<{ success: boolean; error?: string }> {
  return updateOnboardingRecord(onboardingId, { [fieldKey]: fieldValue });
}

/**
 * Initialize onboarding: create record if no ID exists, or return existing ID
 * Use this at the start of the chat flow
 */
export async function initializeOnboarding(
  existingId?: number | null
): Promise<{ success: boolean; id?: number; error?: string }> {
  // If we already have an ID, verify it's valid and return it
  if (existingId && existingId > 0) {
    console.log('[OnboardingAPI] Using existing onboarding ID:', existingId);
    return { success: true, id: existingId };
  }

  // Otherwise, create a new record
  return createOnboardingRecord();
}
