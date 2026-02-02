# Onboarding Records Chatbot Edge Function

Esta edge function é responsável por persistir os dados coletados no chatbot de onboarding na tabela `chatbot_onboarding` do Supabase.

## Uso

### Criar novo registro

```bash
POST /functions/v1/onboarding_records_chatbot
Content-Type: application/json

{
  "data": {
    "clinic_name": "Clínica Exemplo",
    "clinic_whatsapp_phone": "5511999999999"
  }
}
```

### Atualizar registro existente

```bash
POST /functions/v1/onboarding_records_chatbot
Content-Type: application/json

{
  "onboarding_id": 123,
  "data": {
    "assistant_name": "Clara",
    "conversation_style": "Formal"
  }
}
```

## Mapeamento de Campos

### Colunas Diretas

Os seguintes campos do chatbot são salvos diretamente em colunas específicas:

| Campo do Chat | Coluna do Banco | Notas |
|---------------|-----------------|-------|
| `clinic_name` | `name` | texto |
| `clinic_timezone` | `timezone` | texto |
| `clinic_whatsapp_phone` | `phone` | bigint |
| `clinic_notification_phone` | `clinic_notification_phone` | bigint |
| `clinic_address` | `address` | texto |
| `clinic_google_maps_link` | `google_maps_link` | texto |
| `instagram_links` | `instagram_links` | text[] - array de strings |
| `operating_hours` | `operating_hours` | json |
| `parking` | `parking` | texto |
| `assistant_name` | `assistant_name` | texto |
| `bot_reply_to` | `bot_reply_to` | texto |
| `is_group_bot_activated` | `is_group_bot_activated` | boolean (converte Sim/Não) |
| `is_voice_reply_activated` | `is_voice_reply_activated` | boolean (converte Sim/Não) |
| `is_ai_allow_to_book_appointments` | `is_ai_allow_to_book_appointments` | boolean + especificidade em custom_instructions |
| `is_booking_reminders_activated` | `is_booking_reminders_activated` | boolean |
| `booking_reminder_today` | `booking_reminder_today` | texto |
| `booking_reminder_tomorrow` | `booking_reminder_tomorrow` | texto |
| `deactivate_on_human_reply` | `deactivate_on_human_reply` | boolean (converte Sim/Não) |
| `deactivation_schedule` | `availability_blocks` | json - horários de desativação (ver formato abaixo) |
| `is_smart_followups_activated` | `is_smart_followups_activated` | boolean |
| `ai_reactivation_interval` | `ai_reactivation_interval` | integer (extrai horas) |
| `reactivation_lead_status_ids` | `reactivation_lead_status_ids` | integer[] |
| `crm_provider` | `crm_provider` | texto |
| `conversation_style` | `communication_style` | texto |

### Campos Automáticos

| Coluna | Comportamento |
|--------|---------------|
| `is_clinic_info_added` | Setado para `true` automaticamente quando campos de info da clínica são preenchidos |

### Colunas JSON

Campos sem coluna específica são agrupados em colunas JSON:

#### `custom_instructions_inputs`
- `greeting`
- `ai_assistant_role`
- `conversation_flow`
- `needs_review`
- `tasks`
- `is_clinic_pix_shared`
- `accepted_payment_methods`
- `is_health_insurance_accepted`
- `health_insurances_accepted`
- `health_insurance_specifics`
- `if_booking_fails_send_needs_review`
- `capture_info`
- `is_ai_allowed_to_send_product_prices`
- `is_ai_allowed_to_send_product_pictures`
- `lead_status_ai_activated`
- `hot_lead`

#### `calendar_logic_json`
- `crm_provider_other`

#### `client_data`
- `project_responsible_role`
- `project_responsible_name`
- `project_responsible_phone`
- `owner_name`
- `owner_phone`
- `platform_users`
- `clinic_cnpj`
- `clinic_type`
- `clinic_type_other`
- `clinic_website`
- `clinic_pix_key`

#### `products`
- `how_many_products`
- `how_many_doctors`

#### `pain_points`
- `main_pain_points`

#### `onboarding_data`
- `notification`
- `ads`
- `when_lost_lead`
- `familiar_to_crm`
- `import_contacts`
- `import_ai_off_contacts`
- `extra_infos`
- `metricas`
- `onboarding_rating`
- `onboarding_rating_feedback`
- **Qualquer campo não mapeado** (fallback para garantir que TODOS os dados são salvos)

### Campos Especiais

#### `deactivation_schedule` → `availability_blocks`
O campo `deactivation_schedule` do chat é transformado para o formato `availability_blocks`:

```json
{
  "monday": { "start_h": 8, "end_h": 19 },
  "tuesday": { "start_h": 8, "end_h": 19 },
  "wednesday": { "start_h": 8, "end_h": 19 },
  "thursday": { "start_h": 8, "end_h": 19 },
  "friday": { "start_h": 8, "end_h": 19 }
}
```

- Dias da semana em inglês minúsculo: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`
- `start_h`: hora de início (inteiro, 0-23)
- `end_h`: hora de término (inteiro, 0-23)
- Se modo "sempre ligada", o campo fica `null`
- O valor original é salvo em `custom_instructions_inputs.deactivation_schedule_raw`

#### `is_ai_allow_to_book_appointments`
Este campo é tratado de forma especial:
- O valor boolean (`true`/`false`) é salvo na coluna `is_ai_allow_to_book_appointments`
- A especificidade ("apenas consultas", "apenas tratamentos", etc.) é salva em `custom_instructions_inputs.booking_permission_specificity`
- O valor original é salvo em `custom_instructions_inputs.is_ai_allow_to_book_appointments_raw`

#### Campos Boolean com Valor Original
Para campos boolean, além do valor convertido, o valor original também é salvo em `custom_instructions_inputs`:
- `deactivate_on_human_reply` → `custom_instructions_inputs.deactivate_on_human_reply_raw`
- `is_voice_reply_activated` → `custom_instructions_inputs.is_voice_reply_activated_raw`
- etc.

## Deploy

Para fazer deploy da edge function:

```bash
supabase functions deploy onboarding_records_chatbot
```

## Variáveis de Ambiente

A função utiliza as seguintes variáveis de ambiente (configuradas automaticamente pelo Supabase):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Resposta

### Sucesso (201 - Criação)
```json
{
  "ok": true,
  "record": {
    "id": 123,
    "name": "Clínica Exemplo",
    ...
  }
}
```

### Sucesso (200 - Atualização)
```json
{
  "ok": true,
  "record": {
    "id": 123,
    ...
  }
}
```

### Erro
```json
{
  "error": "db_error",
  "details": "Mensagem de erro"
}
```
