# Onboarding Chat – Questions & Database Schema

This document lists all onboarding steps from `app/chat-1/data.tsx` and how each answer is stored by the edge function `supabase/functions/onboarding_records_chatbot/index.ts` in the `chatbot_onboarding` table.

**Summary:** Some answers go to **dedicated columns** (one column per field). Others go into **JSON columns** (multiple fields stored inside a single `json`/`jsonb` column).

---

## 1. Dedicated columns

These **dataKeys** are stored in their **own column** on `chatbot_onboarding`. The column name may differ from the dataKey (e.g. `clinic_name` → `name`, `conversation_flow` → `template_type`).

| dataKey (chat) | Column name | Column type | Notes |
|----------------|-------------|-------------|--------|
| `clinic_name` | **name** | text | |
| `clinic_whatsapp_phone` | **phone** | bigint | Converted from string |
| `clinic_timezone` | **timezone** | text | |
| `clinic_address` | **address** | text | |
| `clinic_google_maps_link` | **google_maps_link** | text | |
| `instagram_links` | **instagram_links** | text[] | Array of strings |
| `operating_hours` | **operating_hours** | text | JSON string; see Special formats |
| `operating_hours` | **opening_hours** | json | Same object (not stringified) |
| `operating_hours` | **availability_blocks** | json | Array `[{ rrule, start_time, end_time }]` |
| `parking` | **parking** | text | Or JSON `{ option, value }` when parking_value |
| `assistant_name` | **assistant_name** | text | |
| `bot_reply_to` | **bot_reply_to** | text | |
| `is_group_bot_activated` | **is_group_bot_activated** | boolean | Sim/Não → true/false |
| `is_voice_reply_activated` | **is_voice_reply_activated** | boolean | Sim/Não → true/false |
| `conversation_flow` | **template_type** | text | id/name extracted from selection |
| `conversation_style` | **communication_style** | text | |
| `crm_provider` | **crm_provider** | text | |
| `is_ai_allow_to_book_appointments` | **is_ai_allow_to_book_appointments** | boolean | Specificity also in calendar_logic_json |
| `is_booking_reminders_activated` | **is_booking_reminders_activated** | boolean | Sim/Não → true/false |
| `booking_reminder_today` | **booking_reminder_today** | text | |
| `booking_reminder_tomorrow` | **booking_reminder_tomorrow** | text | |
| `deactivate_on_human_reply` | **deactivate_on_human_reply** | boolean | Sim/Não → true/false |
| `ai_reactivation_interval` | **ai_reactivation_interval** | integer | e.g. "4 horas" → 4 |
| `deactivation_schedule` | **deactivation_schedule** | json | Object by day `{ day: { start_h, end_h } }`; null when "sempre ligada" |
| `deactivation_schedule` | **availability_blocks** | json | Array `[{ rrule, start_time, end_time }]` when scheduled |
| `is_smart_followups_activated` | **is_smart_followups_activated** | boolean | Sim/Não → true/false |
| `reactivation_lead_status_ids` | **reactivation_lead_status_ids** | int4[] | Names → IDs (1–8, 999); frontend sends comma-separated |
| `clinic_notification_phone` | **clinic_notification_phone** | bigint | Converted from string |

**Computed / always set:**

- **is_clinic_info_added** – always set to `true` when saving.
- **is_ai_allow_to_book_appointments** – also writes `booking_permission_specificity` and `is_ai_allow_to_book_appointments_raw` into **calendar_logic_json**.

---

## 2. JSON columns (variables stored inside JSON)

These **dataKeys** do **not** have their own column. They are stored as **keys inside** one of the JSON columns below.

### 2.1 `custom_instructions_inputs` (json)

| dataKey | Step type | Stored as |
|---------|-----------|-----------|
| `greeting` | textarea | text |
| `ai_assistant_role` | choices | value |
| `conversation_flow` | conversation_flow | (copy; main value goes to column **template_type**) |
| `needs_review` | textarea | text |
| `tasks` | textarea | text |
| `is_clinic_pix_shared` | choices | value |
| `accepted_payment_methods` | multi_select | array |
| `is_health_insurance_accepted` | choices | value |
| `health_insurances_accepted` | textarea | text |
| `health_insurance_specifics` | textarea | text |
| `if_booking_fails_send_needs_review` | choices | value |
| `capture_info` | capture_info | json |
| `is_ai_allowed_to_send_product_prices` | choices | value |
| `is_ai_allowed_to_send_product_pictures` | choices | value |
| `hot_lead` | hot_lead | json |
| `notification` | multi_select | value/array |
| `when_lost_lead` | textarea | text |
| `clinic_pix_key` | text | text |

### 2.2 `client_data` (json)

| dataKey | Step type | Stored as |
|---------|-----------|-----------|
| `project_responsible_role` | single_role_choice | text |
| `project_responsible_name` | (project_responsible_details) | text |
| `project_responsible_phone` | (project_responsible_details) | text |
| `project_responsible_email` | (project_responsible_details) | text |
| `platform_users` | team_members | text or "Mais ninguém" |
| `clinic_cnpj` | cnpj | text |
| `clinic_type` | choices | text |
| `clinic_type_other` | text | text (conditional) |
| `clinic_website` | text | text |
| `lead_status_ai_activated` | multi_select | comma-separated or array |

### 2.3 `calendar_logic_json` (json)

| dataKey / source | Stored as |
|------------------|-----------|
| `crm_provider_other` | text (when "Outro sistema") |
| From `is_ai_allow_to_book_appointments` | **booking_permission_specificity** (e.g. "apenas_tratamentos") |
| From `is_ai_allow_to_book_appointments` | **is_ai_allow_to_book_appointments_raw** (e.g. "Apenas tratamentos") |

### 2.4 `products` (json)

| dataKey | Step type | Stored as |
|---------|-----------|-----------|
| `how_many_doctors` | number | number |
| `how_many_products` | number | number |

### 2.5 `pain_points` (json)

| dataKey | Step type | Stored as |
|---------|-----------|-----------|
| `main_pain_points` | multi_text | array |

### 2.6 `onboarding_data` (json)

| dataKey | Step type | Stored as |
|---------|-----------|-----------|
| `ads` | multi_select | value/array |
| `familiar_to_crm` | choices | value |
| `import_contacts` | choices | value |
| `import_ai_off_contacts` | choices | value |
| `extra_infos` | textarea | text |
| `metricas` | textarea | text |
| `onboarding_rating` | rating | value |
| `onboarding_rating_feedback` | textarea | text |
| **schedule_event** | (agendamento Cal.com) | object | Dados completos do agendamento (resposta da API Cal.com), gravado quando o usuário agenda no fluxo de onboarding. |

---

## Quick reference: dataKey → storage

| Storage | dataKeys |
|---------|----------|
| **Dedicated columns** | clinic_name→name, clinic_whatsapp_phone→phone, clinic_timezone→timezone, clinic_address→address, clinic_google_maps_link→google_maps_link, instagram_links, operating_hours→operating_hours+opening_hours+availability_blocks, parking, assistant_name, bot_reply_to, is_group_bot_activated, is_voice_reply_activated, conversation_flow→template_type, conversation_style→communication_style, crm_provider, is_ai_allow_to_book_appointments, is_booking_reminders_activated, booking_reminder_today, booking_reminder_tomorrow, deactivate_on_human_reply, ai_reactivation_interval, deactivation_schedule→deactivation_schedule+availability_blocks, is_smart_followups_activated, reactivation_lead_status_ids, clinic_notification_phone |
| **custom_instructions_inputs** | greeting, ai_assistant_role, conversation_flow (copy), needs_review, tasks, is_clinic_pix_shared, accepted_payment_methods, is_health_insurance_accepted, health_insurances_accepted, health_insurance_specifics, if_booking_fails_send_needs_review, capture_info, is_ai_allowed_to_send_product_prices, is_ai_allowed_to_send_product_pictures, hot_lead, notification, when_lost_lead, clinic_pix_key |
| **client_data** | project_responsible_role, project_responsible_name, project_responsible_phone, project_responsible_email, platform_users, clinic_cnpj, clinic_type, clinic_type_other, clinic_website, lead_status_ai_activated |
| **calendar_logic_json** | crm_provider_other, booking_permission_specificity, is_ai_allow_to_book_appointments_raw |
| **products** | how_many_doctors, how_many_products |
| **pain_points** | main_pain_points |
| **onboarding_data** | ads, familiar_to_crm, import_contacts, import_ai_off_contacts, extra_infos, metricas, onboarding_rating, onboarding_rating_feedback, **schedule_event** (objeto do agendamento) |

---

## Special formats

### `operating_hours` (horários de funcionamento da clínica)

- **operating_hours** (text): JSON string of day-based object, e.g. `{"monday":{"enabled":true,"start":"09:00","end":"18:00"},...}`.
- **opening_hours** (json): same object (not stringified).
- **availability_blocks** (json): array `[{ "rrule": "FREQ=WEEKLY;BYDAY=MO,TU,...", "start_time": "09:00", "end_time": "17:00" }, ...]`. Consecutive days with same hours are grouped.

### `deactivation_schedule` (IA desligada em horários específicos)

- **deactivation_schedule** (json): `{ "sunday": { "start_h": 9, "end_h": 18 }, ... }`. Null when "sempre ligada".
- **availability_blocks** (json): same array format as above, converted from the day-based object.

### `reactivation_lead_status_ids`

- Column: **int4[]**.
- Frontend sends comma-separated names; backend maps to IDs (1–8, 999 for Lost).

### `instagram_links`

- Column: **text[]**. Stored as array of strings (e.g. "@user (clínica)").

### Agendamento (`schedule_event` em `onboarding_data`)

- Quando o usuário agenda no calendário do onboarding, as informações completas do agendamento (resposta da API Cal.com) são salvas na coluna **onboarding_data** da tabela **chatbot_onboarding**, na chave **schedule_event** (objeto com uid, start, etc.).
