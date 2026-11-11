/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { statusRank, phoneKey } from "./whatsapp";

const GATEWAY = "https://connector-gateway.lovable.dev/whatsapp";

export async function waGateway(path: string, init: RequestInit = {}) {
  const lk = process.env['LOVABLE_API_KEY'], wk = process.env['WHATSAPP_API_KEY'];
  if (!lk || !wk) throw new Error("WhatsApp não conectado");
  const r = await fetch(`${GATEWAY}${path}`, { ...init, headers: { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": wk, "Content-Type": "application/json", ...(init.headers ?? {}) } });
  const text = await r.text();
  let body: any = null; try { body = JSON.parse(text); } catch { body = text; }
  if (!r.ok) { console.error("whatsapp gateway", r.status, text); throw new Error(body?.error?.message ?? `Erro do WhatsApp (${r.status})`); }
  return body;
}

async function findTenantLead(phone: string) {
  const key = phoneKey(phone);
  const { data } = await supabaseAdmin.from("contacts").select("id,tenant_id,phone").neq("phone", "").limit(5000);
  const c = (data ?? []).find((x) => phoneKey(x.phone) === key);
  if (!c) return { tenant_id: null, lead_id: null };
  const { data: l } = await supabaseAdmin.from("leads").select("id").eq("contact_id", c.id).limit(1).maybeSingle();
  return { tenant_id: c.tenant_id, lead_id: l?.id ?? null };
}

/** Processes one stored webhook row. Returns true when complete, false when it must wait (e.g. status before send saved). */
async function processRow(row: { id: string; event: string; payload: any }) {
  const value = row.payload?.entry?.[0]?.changes?.[0]?.value ?? {};
  if (row.event === "whatsapp.message") {
    for (const m of value.messages ?? []) {
      const owner = await findTenantLead(m.from);
      const body = m.text?.body ?? m.button?.text ?? m.interactive?.button_reply?.title ?? m[m.type]?.caption ?? `[${m.type}]`;
      const { error } = await supabaseAdmin.from("whatsapp_messages").upsert({ ...owner, phone: m.from, direction: "in", kind: m.type, body, wa_id: m.id, status: "received", created_at: m.timestamp ? new Date(Number(m.timestamp) * 1000).toISOString() : new Date().toISOString() }, { onConflict: "wa_id", ignoreDuplicates: true });
      if (error) throw error;
    }
    return true;
  }
  if (row.event === "whatsapp.status") {
    let waiting = false;
    for (const s of value.statuses ?? []) {
      const { data: msg, error } = await supabaseAdmin.from("whatsapp_messages").select("id,status").eq("wa_id", s.id).maybeSingle();
      if (error) throw error;
      if (!msg) { waiting = true; continue; }
      if (s.status !== "failed" && statusRank(s.status) <= statusRank(msg.status)) continue;
      const { error: e2 } = await supabaseAdmin.from("whatsapp_messages").update({ status: s.status, status_at: s.timestamp ? new Date(Number(s.timestamp) * 1000).toISOString() : null, error: s.errors?.[0] ? `${s.errors[0].code}: ${s.errors[0].title}` : null }).eq("id", msg.id);
      if (e2) throw e2;
    }
    return !waiting;
  }
  return true; // eventos desconhecidos ficam guardados
}

export async function handleRow(row: { id: string; event: string; payload: any; attempts: number }) {
  try {
    const done = await processRow(row);
    await supabaseAdmin.from("whatsapp_webhook_events").update(done ? { processed_at: new Date().toISOString(), processing_error: null } : { attempts: row.attempts + 1 }).eq("id", row.id);
    return true;
  } catch (e) {
    await supabaseAdmin.from("whatsapp_webhook_events").update({ attempts: row.attempts + 1, processing_error: String(e instanceof Error ? e.message : e).slice(0, 500) }).eq("id", row.id);
    return false;
  }
}

/** Bounded recovery: retries unfinished rows, least-attempted first so blocked rows don't starve others. */
export async function processPending(limit = 15) {
  const { data } = await supabaseAdmin.from("whatsapp_webhook_events").select("id,event,payload,attempts").is("processed_at", null).lt("attempts", 50).order("attempts").order("received_at").limit(limit);
  for (const r of data ?? []) await handleRow(r);
}
