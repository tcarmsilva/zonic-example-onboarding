// index.ts - Supabase Edge Function for Chatbot Onboarding Records
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.28.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://zonic.com.br",
  "https://zonic-onboarding.netlify.app/",
  "https://welcome.zonic.com.br",
];

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function extractOrigin(url: string | null): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.origin;
  } catch {
    return null;
  }
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, apikey",
    "Access-Control-Allow-Credentials": "true",
  };
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Allow backend-to-backend calls
  return ALLOWED_ORIGINS.includes(origin);
}

function sanitizeString(str: unknown): string | null {
  if (typeof str !== 'string') return null;
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 1000);
}

// Convert phone string to bigint-compatible number
function phoneToNumber(phone: string | null | undefined): number | null {
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) return null;
  // Parse as number (bigint in postgres)
  const phoneNumber = parseInt(cleanPhone, 10);
  return isNaN(phoneNumber) ? null : phoneNumber;
}

// Convert "Sim" / "Não" or similar to boolean
function stringToBoolean(value: string | null | undefined): boolean | null {
  if (!value) return null;
  const lowerValue = value.toLowerCase().trim();
  // Check for positive patterns
  if (lowerValue === 'sim' || 
      lowerValue.startsWith('sim,') || 
      lowerValue.startsWith('sim ') ||
      lowerValue === 'sim, desligar automaticamente' ||
      lowerValue === 'sim, responder com voz' ||
      lowerValue === 'sim, ativar follow-ups' ||
      lowerValue === 'sim, quero compartilhar') return true;
  // Check for negative patterns
  if (lowerValue === 'não' || 
      lowerValue === 'nao' || 
      lowerValue.startsWith('não,') ||
      lowerValue.startsWith('não ') ||
      lowerValue === 'não, manter ativa' ||
      lowerValue === 'não, responder com texto') return false;
  return null;
}

// Check if AI is allowed to book appointments (has specificity)
function parseBookingPermission(value: string | null | undefined): { allowed: boolean; specificity: string | null } {
  if (!value) return { allowed: false, specificity: null };
  const lowerValue = value.toLowerCase().trim();
  
  if (lowerValue.includes('nenhum') || lowerValue.includes('revisão humana')) {
    return { allowed: false, specificity: null };
  }
  
  // AI is allowed to book
  if (lowerValue.includes('apenas consultas')) {
    return { allowed: true, specificity: 'apenas_consultas' };
  }
  if (lowerValue.includes('apenas tratamentos')) {
    return { allowed: true, specificity: 'apenas_tratamentos' };
  }
  if (lowerValue.includes('consultas e tratamentos')) {
    return { allowed: true, specificity: 'consultas_e_tratamentos' };
  }
  
  return { allowed: true, specificity: null };
}

// Convert ai_reactivation_interval to integer (hours)
function intervalToInteger(value: string | null | undefined): number | null {
  if (!value) return null;
  if (value.toLowerCase().includes('nunca')) return null;
  const match = value.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Convert lead status names to IDs
function leadStatusToIds(statuses: string[] | string | null | undefined): number[] | null {
  if (!statuses) return null;
  
  const statusArray = typeof statuses === 'string' 
    ? JSON.parse(statuses) 
    : statuses;
  
  if (!Array.isArray(statusArray)) return null;
  
  // Map status names to IDs (example mapping - adjust based on your actual status IDs)
  const statusMap: Record<string, number> = {
    "Novo Lead": 1,
    "Em Contato": 2,
    "Interessado": 3,
    "Quer Agendar": 4,
    "Não Compareceu": 5,
    "Agendado": 6,
    "Disposto a Comprar": 7,
    "Comprou": 8,
  };
  
  return statusArray.map(s => statusMap[s]).filter(id => id !== undefined);
}

// Parse JSON safely
function parseJsonSafe(value: string | unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// Parse deactivation schedule to availability_blocks format
// Expected output format:
// {
//   "monday": { "start_h": 8, "end_h": 19 },
//   "tuesday": { "start_h": 8, "end_h": 19 },
//   ...
// }
function parseDeactivationSchedule(value: string | unknown): Record<string, { start_h: number; end_h: number }> | null {
  const parsed = typeof value === 'string' ? parseJsonSafe(value) : value;
  
  if (!parsed || typeof parsed !== 'object') return null;
  
  const data = parsed as { mode?: string; schedule?: Record<string, { start_h: number; end_h: number }> };
  
  // If mode is "always_on", return null (no deactivation schedule)
  if (data.mode === 'always_on') {
    return null;
  }
  
  // If we have a schedule object, return it directly
  if (data.schedule && typeof data.schedule === 'object') {
    return data.schedule;
  }
  
  // If the parsed value is already in the correct format (has day keys), return it
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hasValidDays = dayKeys.some(day => {
    const dayData = (parsed as Record<string, unknown>)[day];
    return dayData && typeof dayData === 'object' && 'start_h' in (dayData as object);
  });
  
  if (hasValidDays) {
    return parsed as Record<string, { start_h: number; end_h: number }>;
  }
  
  return null;
}

// ============================================
// FIELD MAPPING: Data Keys to Database Columns
// ============================================

// Direct column mappings
const DIRECT_COLUMN_MAP: Record<string, string> = {
  // Clinic basic info
  "clinic_name": "name",
  "clinic_timezone": "timezone",
  "clinic_address": "address",
  "clinic_google_maps_link": "google_maps_link",
  "operating_hours": "operating_hours",
  "parking": "parking",
  
  // AI Configuration
  "assistant_name": "assistant_name",
  "bot_reply_to": "bot_reply_to",
  "is_group_bot_activated": "is_group_bot_activated", // needs boolean conversion
  "is_voice_reply_activated": "is_voice_reply_activated", // needs boolean conversion
  
  // Booking - is_ai_allow_to_book_appointments handled separately for specificity
  "is_booking_reminders_activated": "is_booking_reminders_activated", // needs boolean conversion
  "booking_reminder_today": "booking_reminder_today",
  "booking_reminder_tomorrow": "booking_reminder_tomorrow",
  
  // AI Behavior
  "deactivate_on_human_reply": "deactivate_on_human_reply", // needs boolean conversion
  "deactivation_schedule": "availability_blocks", // Maps to availability_blocks column
  "is_smart_followups_activated": "is_smart_followups_activated", // needs boolean conversion
  "ai_reactivation_interval": "ai_reactivation_interval", // needs integer conversion
  "reactivation_lead_status_ids": "reactivation_lead_status_ids", // needs array conversion
  
  // CRM
  "crm_provider": "crm_provider",
  "conversation_style": "communication_style",
};

// Fields that trigger is_clinic_info_added = true
const CLINIC_INFO_FIELDS = new Set([
  "clinic_name",
  "clinic_address",
  "clinic_whatsapp_phone",
  "clinic_timezone",
  "operating_hours",
]);

// Phone fields (need bigint conversion)
const PHONE_FIELDS: Record<string, string> = {
  "clinic_whatsapp_phone": "phone",
  "clinic_notification_phone": "clinic_notification_phone",
};

// Boolean fields (need Sim/Não conversion)
const BOOLEAN_FIELDS = new Set([
  "is_group_bot_activated",
  "is_voice_reply_activated",
  "is_ai_allow_to_book_appointments",
  "is_booking_reminders_activated",
  "is_smart_followups_activated",
  "deactivate_on_human_reply",
]);

// ============================================
// JSON COLUMN MAPPINGS
// ============================================

// custom_instructions_inputs: AI instructions and custom behavior
const CUSTOM_INSTRUCTIONS_FIELDS = new Set([
  "greeting",
  "ai_assistant_role",
  "conversation_flow",
  "needs_review",
  "tasks",
  // Payment and health insurance info
  "is_clinic_pix_shared",
  "accepted_payment_methods",
  "is_health_insurance_accepted",
  "health_insurances_accepted",
  "health_insurance_specifics",
  // Booking behavior
  "if_booking_fails_send_needs_review",
  "capture_info",
  // AI sending behavior
  "is_ai_allowed_to_send_product_prices",
  "is_ai_allowed_to_send_product_pictures",
  // Lead qualification
  "lead_status_ai_activated",
  "hot_lead",
]);

// calendar_logic_json: Calendar and booking settings
const CALENDAR_LOGIC_FIELDS = new Set([
  "crm_provider_other",
]);

// client_data: Client/clinic information
const CLIENT_DATA_FIELDS = new Set([
  "project_responsible_role",
  "project_responsible_name",
  "project_responsible_phone",
  "owner_name",
  "owner_phone",
  "platform_users",
  "clinic_cnpj",
  "clinic_type",
  "clinic_type_other",
  "clinic_website",
  "clinic_pix_key",
]);

// products: Product/service information
const PRODUCTS_FIELDS = new Set([
  "how_many_products",
  "how_many_doctors",
]);

// pain_points: Customer pain points
const PAIN_POINTS_FIELDS = new Set([
  "main_pain_points",
]);

// onboarding_data: General onboarding data
const ONBOARDING_DATA_FIELDS = new Set([
  "notification",
  "ads",
  "when_lost_lead",
  // CRM familiarity and imports
  "familiar_to_crm",
  "import_contacts",
  "import_ai_off_contacts",
  "extra_infos",
  "metricas",
  "onboarding_rating",
  "onboarding_rating_feedback",
]);

// Instagram links (special handling for text[])
const INSTAGRAM_FIELDS = new Set([
  "instagram_links",
]);

// Build the database payload from incoming data
function buildPayload(data: Record<string, unknown>, existingRecord?: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  
  // Initialize JSON columns from existing record or empty objects
  const customInstructions = existingRecord?.custom_instructions_inputs 
    ? (typeof existingRecord.custom_instructions_inputs === 'string' 
        ? JSON.parse(existingRecord.custom_instructions_inputs) 
        : existingRecord.custom_instructions_inputs)
    : {};
  
  const calendarLogic = existingRecord?.calendar_logic_json
    ? (typeof existingRecord.calendar_logic_json === 'string'
        ? JSON.parse(existingRecord.calendar_logic_json)
        : existingRecord.calendar_logic_json)
    : {};
  
  const clientData = existingRecord?.client_data
    ? (typeof existingRecord.client_data === 'string'
        ? JSON.parse(existingRecord.client_data)
        : existingRecord.client_data)
    : {};
  
  const products = existingRecord?.products
    ? (typeof existingRecord.products === 'string'
        ? JSON.parse(existingRecord.products)
        : existingRecord.products)
    : {};
  
  const painPoints = existingRecord?.pain_points
    ? (typeof existingRecord.pain_points === 'string'
        ? JSON.parse(existingRecord.pain_points)
        : existingRecord.pain_points)
    : {};
  
  const onboardingData = existingRecord?.onboarding_data
    ? (typeof existingRecord.onboarding_data === 'string'
        ? JSON.parse(existingRecord.onboarding_data)
        : existingRecord.onboarding_data)
    : {};

  let hasCustomInstructionsChanges = false;
  let hasCalendarLogicChanges = false;
  let hasClientDataChanges = false;
  let hasProductsChanges = false;
  let hasPainPointsChanges = false;
  let hasOnboardingDataChanges = false;
  let hasClinicInfoField = false;

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null || value === '') continue;
    
    // Track if clinic info fields are being set
    if (CLINIC_INFO_FIELDS.has(key)) {
      hasClinicInfoField = true;
    }
    
    // Handle phone fields
    if (PHONE_FIELDS[key]) {
      const phoneNumber = phoneToNumber(String(value));
      if (phoneNumber !== null) {
        payload[PHONE_FIELDS[key]] = phoneNumber;
      }
      // Also track clinic info for phone
      if (key === "clinic_whatsapp_phone") {
        hasClinicInfoField = true;
      }
      continue;
    }
    
    // Handle is_ai_allow_to_book_appointments specially (boolean + specificity)
    if (key === "is_ai_allow_to_book_appointments") {
      const bookingPerm = parseBookingPermission(String(value));
      payload.is_ai_allow_to_book_appointments = bookingPerm.allowed;
      // Store the specificity and raw value in custom_instructions_inputs
      customInstructions.booking_permission_specificity = bookingPerm.specificity;
      customInstructions.is_ai_allow_to_book_appointments_raw = String(value);
      hasCustomInstructionsChanges = true;
      continue;
    }
    
    // Handle direct column mappings
    if (DIRECT_COLUMN_MAP[key]) {
      const columnName = DIRECT_COLUMN_MAP[key];
      let processedValue: unknown = value;
      
      // Convert booleans
      if (BOOLEAN_FIELDS.has(key)) {
        processedValue = stringToBoolean(String(value));
        // Also store raw value in custom_instructions for context
        if (processedValue !== null) {
          customInstructions[`${key}_raw`] = String(value);
          hasCustomInstructionsChanges = true;
        }
      }
      // Convert ai_reactivation_interval to integer
      else if (key === "ai_reactivation_interval") {
        processedValue = intervalToInteger(String(value));
        // Also store raw value
        customInstructions.ai_reactivation_interval_raw = String(value);
        hasCustomInstructionsChanges = true;
      }
      // Convert reactivation_lead_status_ids to integer array
      else if (key === "reactivation_lead_status_ids") {
        processedValue = leadStatusToIds(value as string[] | string);
      }
      // Parse deactivation_schedule to availability_blocks format
      else if (key === "deactivation_schedule") {
        processedValue = parseDeactivationSchedule(value);
        // Also store raw value for reference
        customInstructions.deactivation_schedule_raw = parseJsonSafe(value);
        hasCustomInstructionsChanges = true;
      }
      // Parse JSON for operating_hours
      else if (key === "operating_hours") {
        processedValue = parseJsonSafe(value);
      }
      // Sanitize strings
      else if (typeof value === 'string') {
        processedValue = sanitizeString(value);
      }
      
      if (processedValue !== null && processedValue !== undefined) {
        payload[columnName] = processedValue;
      }
      continue;
    }
    
    // Handle instagram_links (text[] array)
    if (INSTAGRAM_FIELDS.has(key)) {
      const parsed = parseJsonSafe(value);
      if (Array.isArray(parsed)) {
        // Convert instagram objects to simple array of strings for text[]
        const links = parsed.map((item: { username?: string; type?: string }) => {
          if (typeof item === 'string') return item;
          return item.username ? `@${item.username}${item.type ? ` (${item.type})` : ''}` : null;
        }).filter(Boolean) as string[];
        
        if (links.length > 0) {
          payload.instagram_links = links;
        }
      } else if (typeof parsed === 'string') {
        // If it's a single string, wrap in array
        payload.instagram_links = [parsed];
      }
      continue;
    }
    
    // Handle JSON column fields
    if (CUSTOM_INSTRUCTIONS_FIELDS.has(key)) {
      customInstructions[key] = parseJsonSafe(value);
      hasCustomInstructionsChanges = true;
      continue;
    }
    
    if (CALENDAR_LOGIC_FIELDS.has(key)) {
      calendarLogic[key] = parseJsonSafe(value);
      hasCalendarLogicChanges = true;
      continue;
    }
    
    if (CLIENT_DATA_FIELDS.has(key)) {
      clientData[key] = parseJsonSafe(value);
      hasClientDataChanges = true;
      continue;
    }
    
    if (PRODUCTS_FIELDS.has(key)) {
      products[key] = parseJsonSafe(value);
      hasProductsChanges = true;
      continue;
    }
    
    if (PAIN_POINTS_FIELDS.has(key)) {
      painPoints[key] = parseJsonSafe(value);
      hasPainPointsChanges = true;
      continue;
    }
    
    if (ONBOARDING_DATA_FIELDS.has(key)) {
      onboardingData[key] = parseJsonSafe(value);
      hasOnboardingDataChanges = true;
      continue;
    }
    
    // If field doesn't match any category, add to onboarding_data as fallback
    // This ensures ALL captured info is stored
    onboardingData[key] = parseJsonSafe(value);
    hasOnboardingDataChanges = true;
  }

  // Set is_clinic_info_added to true if any clinic info field was provided
  if (hasClinicInfoField) {
    payload.is_clinic_info_added = true;
  }

  // Only add JSON columns if they have changes
  if (hasCustomInstructionsChanges || Object.keys(customInstructions).length > 0) {
    payload.custom_instructions_inputs = customInstructions;
  }
  if (hasCalendarLogicChanges || Object.keys(calendarLogic).length > 0) {
    payload.calendar_logic_json = calendarLogic;
  }
  if (hasClientDataChanges || Object.keys(clientData).length > 0) {
    payload.client_data = clientData;
  }
  if (hasProductsChanges || Object.keys(products).length > 0) {
    payload.products = products;
  }
  if (hasPainPointsChanges || Object.keys(painPoints).length > 0) {
    payload.pain_points = painPoints;
  }
  if (hasOnboardingDataChanges || Object.keys(onboardingData).length > 0) {
    payload.onboarding_data = onboardingData;
  }

  return payload;
}

serve(async (req: Request) => {
  console.log("=== Onboarding Records Edge Function Called ===");
  
  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");
  const origin = originHeader || extractOrigin(refererHeader);
  const corsHeaders = getCorsHeaders(origin);
  
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method === "POST" && !isOriginAllowed(origin)) {
      console.error("Origin not allowed:", origin);
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const onboarding_id = body.onboarding_id as number | undefined;
    const data = body.data as Record<string, unknown> | undefined;
    
    console.log("Received body:", { onboarding_id, dataKeys: data ? Object.keys(data) : [] });

    // Validation
    if (onboarding_id !== undefined && (typeof onboarding_id !== 'number' || onboarding_id <= 0)) {
      return new Response(JSON.stringify({ error: "validation_error", details: "Invalid onboarding_id" }), {
        status: 400,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    let existingRecord: Record<string, unknown> | null = null;
    
    // If updating, fetch existing record to merge JSON columns
    if (onboarding_id) {
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from("chatbot_onboarding")
        .select("*")
        .eq("id", onboarding_id)
        .single();
      
      if (fetchError) {
        console.error("Error fetching existing record:", fetchError);
      } else {
        existingRecord = existing;
      }
    }

    // Build the database payload
    const payload = data ? buildPayload(data, existingRecord ?? undefined) : {};
    
    console.log("Built payload:", payload);

    let resultData, error;

    if (onboarding_id) {
      // UPDATE existing record
      console.log(`Updating onboarding record ${onboarding_id}`);
      const result = await supabaseAdmin
        .from("chatbot_onboarding")
        .update(payload)
        .eq("id", onboarding_id)
        .select()
        .single();
      resultData = result.data;
      error = result.error;
    } else {
      // INSERT new record
      console.log("Creating new onboarding record");
      const result = await supabaseAdmin
        .from("chatbot_onboarding")
        .insert([payload])
        .select()
        .single();
      resultData = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "db_error", details: error.message }), {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    console.log("Success! Record ID:", resultData?.id);

    return new Response(JSON.stringify({ ok: true, record: resultData }), {
      status: onboarding_id ? 200 : 201,
      headers: { "content-type": "application/json", ...corsHeaders },
    });

  } catch (err) {
    console.error("Fatal Error:", err);
    return new Response(JSON.stringify({ error: "unexpected_error" }), {
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }
});
