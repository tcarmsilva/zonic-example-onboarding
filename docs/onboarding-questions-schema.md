# Onboarding Chat – Question Constants & Database Schema

This document lists all question constants (data keys) from the onboarding chatbot (`app/chat-1/data.tsx`) and the recommended column type for each when storing in a database.

---

## Question Constants & Column Types

| Constant (dataKey) | Step Type | Column Type | Description |
|--------------------|-----------|-------------|-------------|
| `project_responsible_role` | single_role_choice | **text** | Who is responsible for the implementation project (Dono, Gerente, Atendente, Agência) |
| `project_responsible_name` | text | **text** | Full name of project responsible |
| `project_responsible_phone` | phone | **text** | Phone of project responsible |
| `project_responsible_email` | email | **text** | Email of project responsible |
| `platform_users` | team_members | **jsonb** | Array of users who will use the platform (excludes implementation responsible; Dono mandatory if responsible is not Dono) `[{ name, role, phone?, email? }]` |
| `clinic_name` | text | **text** | Clinic name |
| `clinic_cnpj` | cnpj | **text** | Clinic CNPJ (formatted) |
| `clinic_type` | choices | **text** | Clinic type (Estética, Médica, Odonto, Outro) |
| `clinic_type_other` | text | **text** | Custom clinic type when "Outro" (conditional) |
| `clinic_whatsapp_phone` | phone | **text** | Clinic WhatsApp number |
| `clinic_timezone` | choices | **text** | Timezone (e.g. Brasília GMT-3) |
| `clinic_address` | text | **text** | Full clinic address |
| `clinic_google_maps_link` | text | **text** | Google Maps URL |
| `clinic_website` | text | **text** | Clinic website (or "não tenho") |
| `instagram_links` | instagram | **jsonb** | Array of Instagram profiles `[{ username, type }]` |
| `operating_hours` | operating_hours | **jsonb** | Opening hours per day (structured object) |
| `parking` | choices + text (cond.) | **text** | Parking option (Sim gratuito, Sim pago, etc.). If "Sim, pago" or "Sim, conveniado", a follow-up asks the value; stored as JSON `{ "option": "...", "value": "..." }` in the same variable. |
| `is_clinic_pix_shared` | choices | **text** | Share clinic PIX key with patients (Sim/Não) |
| `clinic_pix_key` | text | **text** | Clinic PIX key (conditional) |
| `accepted_payment_methods` | multi_select | **jsonb** | Payment methods accepted (PIX, crédito, débito, etc.) |
| `is_health_insurance_accepted` | choices | **boolean** | Accept health insurance (Sim/Não) |
| `health_insurances_accepted` | textarea | **text** | List of accepted health plans (conditional) |
| `health_insurance_specifics` | textarea | **text** | Plans accepted only for certain procedures (conditional) |
| `assistant_name` | text | **text** | AI assistant name |
| `ai_assistant_role` | choices | **text** | How assistant presents itself (Assistente virtual, Atendente, Doutor(a)) |
| `greeting` | textarea | **text** | Initial greeting message |
| `bot_reply_to` | choices | **text** | All leads vs only paid traffic |
| `is_group_bot_activated` | choices | **boolean** | Reply in WhatsApp groups (Sim/Não) |
| `is_voice_reply_activated` | choices | **boolean** | Reply with voice (Sim/Não) |
| `conversation_flow` | conversation_flow | **text** | Conversation flow choice |
| `conversation_style` | conversation_style | **text** | Communication style |
| `is_ai_allowed_to_send_product_prices` | choices | **text** | AI may send prices (só consulta, só tratamento, consulta e tratamento, nunca) |
| `is_ai_allowed_to_send_product_pictures` | choices | **boolean** | AI may send procedure photos (Sim/Não) |
| `crm_provider` | choices | **text** | Calendar/CRM system name |
| `crm_provider_other` | text | **text** | Custom CRM name when "Outro sistema" (conditional) |
| `familiar_to_crm` | choices | **text** | CRM familiarity (Sim, Não, Treinamento) |
| `is_ai_allow_to_book_appointments` | choices | **text** | AI booking scope: apenas consultas, apenas tratamentos, consultas e tratamentos, ou enviar para revisão humana |
| `if_booking_fails_send_needs_review` | choices | **boolean** | Mark conversation for human review when booking fails (Sim/Não) |
| `capture_info` | capture_info | **jsonb** | Questions to ask before booking `[{ question, acceptedValues }]` |
| `is_booking_reminders_activated` | choices | **boolean** | Booking reminders (Sim/Não) |
| `booking_reminder_today` | textarea | **text** | Message for same-day reminder (conditional) |
| `booking_reminder_tomorrow` | textarea | **text** | Message for day-before reminder (conditional) |
| `deactivate_on_human_reply` | choices | **text** | Deactivate AI when human replies |
| `ai_reactivation_interval` | choices | **text** | When to reactivate AI (conditional) |
| `deactivation_schedule` | deactivation_schedule | **jsonb** | Times when AI is off (structured) |
| `is_smart_followups_activated` | choices | **boolean** | Smart follow-ups (Sim/Não) |
| `reactivation_lead_status_ids` | multi_select | **jsonb** | Lead statuses that reactivate AI (array of strings) |
| `lead_status_ai_activated` | multi_select | **jsonb** | Lead statuses where AI stops (array of strings) |
| `how_many_doctors` | number | **integer** | Number of doctors/professionals |
| `how_many_products` | number | **integer** | Number of services/procedures |
| `main_pain_points` | multi_text | **jsonb** | List of main pain points (array of strings) |
| `hot_lead` | hot_lead | **text** or **jsonb** | Lead qualification: 3 fields (muito_quente, quente, morno). Stored as JSON string. |
| `needs_review` | textarea | **text** | When to send to human review |
| `when_lost_lead` | textarea | **text** | Situations to mark lead as lost |
| `notification` | multi_select | **jsonb** | Notification triggers (array of strings) |
| `clinic_notification_phone` | phone | **text** | Phone for notifications (asked after notification types) |
| `tasks` | textarea | **text** | When to create tasks |
| `import_contacts` | choices | **boolean** | Import contacts (Sim/Não) |
| `import_ai_off_contacts` | choices | **boolean** | Import AI-off contacts (Sim/Não) |
| `ads` | multi_select | **jsonb** | Ad platforms to integrate (array of strings) |
| `metricas` | textarea | **text** | Desired metrics/indicators |
| `extra_infos` | textarea | **text** | Extra info for AI config (before booking) |
| `onboarding_rating` | rating | **integer** | User rating 1–5 for onboarding process |
| `onboarding_rating_feedback` | textarea | **text** | How to improve (conditional, when rating ≠ 5) |

---

## Column Type Reference

| Step type in code | Recommended DB type | Notes |
|-------------------|---------------------|--------|
| `text` | **text** | Single line string |
| `textarea` | **text** | Multi-line string |
| `phone` | **text** | E.164 or formatted string |
| `email` | **text** | Email string |
| `choices` | **text** or **boolean** | Single option value; use **boolean** when options are Sim/Não |
| `number` | **integer** | Integer (use `numeric` if decimals needed) |
| `multi_select` | **jsonb** | Array of selected option strings |
| `multi_text` | **jsonb** | Array of strings |
| `team_members` | **jsonb** | Array of objects |
| `instagram` | **jsonb** | Array of `{ username, type }` |
| `operating_hours` | **jsonb** | Structured opening hours |
| `deactivation_schedule` | **jsonb** | Structured schedule |
| `capture_info` | **jsonb** | Array of `{ question, acceptedValues }` |
| `conversation_flow` | **text** | Single selected value |
| `conversation_style` | **text** | Single selected value |
| `cnpj` | **text** | CNPJ string (formatted or digits) |
| `rating` | **integer** | 1–5 star rating value |

---

## Database Schema Suggestion

Use this SQL as a reference to create your onboarding responses table (e.g. in Supabase). Adjust table name, primary key, and constraints as needed.

```sql
-- Table: onboarding_responses
-- Stores one row per completed onboarding (e.g. per clinic/session).
-- Replace table name and add your primary key (id, clinic_id, etc.) as needed.

CREATE TABLE onboarding_responses (
  -- Primary key / identifiers (customize as needed)
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Section 0: Project responsible & platform users
  project_responsible_role text,
  project_responsible_name text,
  project_responsible_phone text,
  project_responsible_email text,
  platform_users jsonb,

  -- Section 1: Clinic info
  clinic_name text,
  clinic_cnpj text,
  clinic_type text,
  clinic_type_other text,
  clinic_whatsapp_phone text,
  clinic_timezone text,
  clinic_address text,
  clinic_google_maps_link text,
  clinic_website text,
  instagram_links jsonb,
  operating_hours jsonb,
  parking text,
  is_clinic_pix_shared text,
  clinic_pix_key text,
  accepted_payment_methods jsonb,
  is_health_insurance_accepted boolean,
  health_insurances_accepted text,
  health_insurance_specifics text,

  -- Section 2: AI config
  assistant_name text,
  ai_assistant_role text,
  greeting text,
  bot_reply_to text,
  is_group_bot_activated boolean,
  is_voice_reply_activated boolean,
  conversation_flow text,
  conversation_style text,
  is_ai_allowed_to_send_product_prices text,
  is_ai_allowed_to_send_product_pictures boolean,

  -- Section 3: Calendar & bookings
  crm_provider text,
  crm_provider_other text,
  familiar_to_crm text,
  is_ai_allow_to_book_appointments text,
  if_booking_fails_send_needs_review boolean,
  capture_info jsonb,
  is_booking_reminders_activated boolean,
  booking_reminder_today text,
  booking_reminder_tomorrow text,

  -- Section 4: AI behavior
  deactivate_on_human_reply text,
  ai_reactivation_interval text,
  deactivation_schedule jsonb,
  is_smart_followups_activated boolean,
  reactivation_lead_status_ids jsonb,
  lead_status_ai_activated jsonb,

  -- Section 5: Business info
  how_many_doctors integer,
  how_many_products integer,
  main_pain_points jsonb,

  -- Section 6: Lead qualification
  hot_lead text,
  needs_review text,
  when_lost_lead text,

  -- Section 7: Notifications & tasks
  notification jsonb,
  clinic_notification_phone text,
  tasks text,

  -- Section 8: Integrations
  import_contacts boolean,
  import_ai_off_contacts boolean,
  ads jsonb,
  metricas text,

  -- Before booking: extra info & rating
  extra_infos text,
  onboarding_rating integer,
  onboarding_rating_feedback text
);

-- Optional: trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER onboarding_responses_updated_at
  BEFORE UPDATE ON onboarding_responses
  FOR EACH ROW
  EXECUTE PROCEDURE set_updated_at();
```

**Notes:**

- **text**: Use for single values (choices, names, phones, long text).
- **boolean**: Use for Sim/Não fields; store `true` for "Sim" and `false` for "Não" when persisting from the chat.
- **integer**: Use for `how_many_doctors` and `how_many_products`.
- **jsonb**: Use for arrays or structured data (`platform_users`, `instagram_links`, `operating_hours`, `capture_info`, `deactivation_schedule`, `multi_select` / `multi_text` results).
- Add your own columns for: user/session id, clinic id, UTM params, or any other metadata you need.
- Conditional fields (e.g. `clinic_type_other`, `booking_reminder_today`) can stay nullable; they are only filled when the condition is met in the flow.
