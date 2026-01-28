// index.ts - Supabase Edge Function Adjusted
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.28.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WEBHOOK_URL = "https://ramp-flows.yaneq.com/webhook/leads-typebot-zonic";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://zonic.com.br",
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
  // 🔥 CORREÇÃO 3: Segurança ativada.
  // Se estiver testando no Postman/n8n direto, o origin pode ser null, então permitimos null temporariamente ou usamos um header específico.
  if (!origin) return true; // Permite chamadas sem origin (backend-to-backend ou Postman) se necessário, ou mude para false para rigor total.
  return ALLOWED_ORIGINS.includes(origin);
}

function sanitizeString(str: unknown): string | null {
  if (typeof str !== 'string') return null;
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 500);
}

// 🔥 CORREÇÃO 2: Validação de telefone mais inteligente
function formatAndValidatePhone(phone: string): string | null {
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Se vier vazio ou muito curto
  if (cleanPhone.length < 10) return null;

  // Se vier com 10 ou 11 dígitos (DDD + Número), adiciona o 55
  if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
    cleanPhone = '55' + cleanPhone;
  }

  // Aceita 12 ou 13 dígitos final
  if (cleanPhone.length >= 12 && cleanPhone.length <= 13) {
    return cleanPhone;
  }
  
  return null;
}

async function sendWebhook(webhookUrl: string, leadData: any): Promise<void> {
  try {
    console.log("Sending webhook for lead ID:", leadData.id);
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leads_mkt: { id: leadData.id },
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email // Útil enviar o email também se tiver
      }),
    });
    if (!response.ok) {
      console.error("Webhook error:", response.status, await response.text());
    } else {
      console.log("Webhook sent successfully");
    }
  } catch (err) {
    console.error("Error sending webhook:", err);
  }
}

serve(async (req: Request) => {
  console.log("=== Edge Function Called ===");
  
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
    const lead_id = body.lead_id as number | undefined;
    
    // Validação do ID
    if (lead_id !== undefined && (typeof lead_id !== 'number' || lead_id <= 0)) {
      return new Response(JSON.stringify({ error: "validation_error", details: "Invalid lead_id" }), {
        status: 400,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    const payload: any = {};
    
    // Mapeamento simples
    if (body.name) payload.name = sanitizeString(body.name);
    if (body.first_name) payload.first_name = sanitizeString(body.first_name);
    if (body.clinic_name !== undefined) payload.clinic_name = sanitizeString(body.clinic_name) || null;
    if (body.origin_url) payload.origin_url = sanitizeString(body.origin_url);
    
    // 🔥 CORREÇÃO 2: Uso da nova função de telefone
    if (body.phone) {
      const formattedPhone = formatAndValidatePhone(String(body.phone));
      if (formattedPhone) {
        payload.phone = formattedPhone;
      } else {
        return new Response(JSON.stringify({ error: "validation_error", details: "Invalid phone format" }), {
          status: 400,
          headers: { "content-type": "application/json", ...corsHeaders },
        });
      }
    }
    
    if (body.email) payload.email = sanitizeString(body.email);
    
    // Qualification type (Franqueadora Grande, Franqueadora Pequena, etc.)
    if (body.qualification_type !== undefined) {
      payload.qualification_type = sanitizeString(body.qualification_type) || null;
    }
    
    if (body.data_json) payload.data_json = body.data_json;
    if (body.schedule_event) payload.schedule_event = body.schedule_event;
    if (body.utms_json) payload.utms_json = body.utms_json;

    let data, error;

    if (lead_id) {
      // UPDATE
      console.log(`Updating lead ${lead_id}`);
      const result = await supabaseAdmin
        .from("leads_mkt")
        .update(payload)
        .eq("id", lead_id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // INSERT
      if (!payload.origin_url) {
        return new Response(JSON.stringify({ error: "validation_error", details: "origin_url is required" }), {
          status: 400,
          headers: { "content-type": "application/json", ...corsHeaders },
        });
      }

      console.log("Creating new lead");
      const result = await supabaseAdmin
        .from("leads_mkt")
        .insert([payload])
        .select()
        .single();
      data = result.data;
      error = result.error;

      // 🔥 CORREÇÃO 1: Webhook seguro com waitUntil
      if (!error && data && payload.phone) {
        console.log("Scheduling webhook for lead ID:", data.id);
        
        const webhookPromise = sendWebhook(WEBHOOK_URL, data);
        
        // Verifica se o ambiente suporta execução em segundo plano (Supabase suporta)
        if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
          EdgeRuntime.waitUntil(webhookPromise);
        } else {
          // Fallback para segurança
          await webhookPromise;
        }
      }
    }

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "db_error" }), {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true, lead: data }), {
      status: lead_id ? 200 : 201,
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
