import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Domínios permitidos
const ALLOWED_ORIGINS = ["http://localhost:3000", "https://zonic.com.br"];

// Funções de validação e sanitização
function sanitizeString(str: unknown): string | null {
  if (typeof str !== "string") return null;
  return str
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 500);
}

function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, "");
  // Format: countrycode(2) + area_code(2) + phone(8-9) = 12-13 digits
  return cleanPhone.length >= 12 && cleanPhone.length <= 13;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  // Validar origem
  const origin = request.headers.get("origin");

  const corsHeaders = {
    "Access-Control-Allow-Origin":
      origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Verificar origem
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    console.log("[API] Origin not allowed:", origin);
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json();
    console.log("[API] Received request with keys:", Object.keys(body));

    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      console.error("[API] Missing Supabase credentials");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500, headers: corsHeaders }
      );
    }

    // Validar lead_id se fornecido
    const lead_id = body.lead_id as number | undefined;
    if (
      lead_id !== undefined &&
      (typeof lead_id !== "number" ||
        lead_id <= 0 ||
        !Number.isInteger(lead_id))
    ) {
      // return NextResponse.json(
      //   { error: "validation_error", details: "Invalid lead_id" },
      //   { status: 400, headers: corsHeaders }
      // );
    }

    // Construir payload sanitizado
    const payload: Record<string, unknown> = {};

    if (body.name) payload.name = sanitizeString(body.name);
    if (body.first_name) payload.first_name = sanitizeString(body.first_name);
    if (body.clinic_name !== undefined)
      payload.clinic_name = sanitizeString(body.clinic_name) || null;
    if (body.origin_url) payload.origin_url = sanitizeString(body.origin_url);

    // Validar telefone
    if (body.phone) {
      const phone = sanitizeString(body.phone);
      if (phone && isValidPhone(phone)) {
        payload.phone = phone;
      } else {
        // return NextResponse.json(
        //   { error: "validation_error", details: "Invalid phone format" },
        //   { status: 400, headers: corsHeaders }
        // );
      }
    }

    // Validar email
    if (body.email !== undefined) {
      const email = sanitizeString(body.email);
      if (email && !isValidEmail(email)) {
        return NextResponse.json(
          { error: "validation_error", details: "Invalid email format" },
          { status: 400, headers: corsHeaders }
        );
      }
      payload.email = email || null;
    }

    // Qualification type
    if (body.qualification_type !== undefined) {
      payload.qualification_type = sanitizeString(body.qualification_type) || null;
    }

    // JSON fields
    if (body.data_json !== undefined && typeof body.data_json === "object") {
      payload.data_json = body.data_json;
    }
    if (
      body.schedule_event !== undefined &&
      typeof body.schedule_event === "object"
    ) {
      payload.schedule_event = body.schedule_event;
    }
    if (body.utms_json !== undefined && typeof body.utms_json === "object") {
      payload.utms_json = body.utms_json;
    }

    // Add lead_id to payload if updating
    if (lead_id) {
      payload.lead_id = lead_id;
    }

    console.log("[API] Payload fields:", Object.keys(payload));

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Chamar Supabase diretamente via REST API
    const headers = {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=representation",
    };

    let result;
    let data;

    if (lead_id) {
      // UPDATE
      console.log("[API] Updating lead:", lead_id);

      const { data: responseUpdate, error: errorUpdate } =
        await supabase.functions.invoke("insert-mk-leads", {
          body: JSON.stringify(payload),
        });

      if (errorUpdate) {
        console.error("[API] Update error:", errorUpdate);
        return NextResponse.json(
          { error: "db_error", details: "Database operation failed" },
          { status: 500, headers: corsHeaders }
        );
      }

      data = responseUpdate.lead;
      console.log("[API] Update successful for lead:", lead_id);
    } else {
      // INSERT
      if (!payload.origin_url) {
        return NextResponse.json(
          { error: "validation_error", details: "origin_url is required" },
          { status: 400, headers: corsHeaders }
        );
      }

      console.log("[API] Creating new lead");

      const { data: response, error } = await supabase.functions.invoke(
        "insert-mk-leads",
        {
          body: JSON.stringify(payload),
        }
      );

      if (error) {
        return NextResponse.json(
          { error: "db_error", details: "Database operation failed" },
          { status: 500, headers: corsHeaders }
        );
      }

      // result = await response.json();
      data = response.lead;
      console.log("[API] Insert successful, lead ID:", data.id);
      // Webhook é enviado pela edge function (apenas no INSERT)
    }

    return NextResponse.json(
      { ok: true, lead: data },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error("[API] Error:", err);
    return NextResponse.json(
      { error: "unexpected_error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":
        origin && ALLOWED_ORIGINS.includes(origin)
          ? origin
          : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
