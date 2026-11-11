import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhookRequest } from "@lovable.dev/webhooks-js";

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env['WHATSAPP_API_KEY'];
        if (!secret) return new Response("not configured", { status: 503 });
        const delivery = request.headers.get("X-Lovable-Delivery"), event = request.headers.get("X-Lovable-Event");
        let payload: unknown;
        try { payload = (await verifyWebhookRequest({ req: request, secret, maxBodyBytes: 4 * 1024 * 1024 })).payload; }
        catch { return new Response("unauthorized", { status: 401 }); }
        if (!delivery || !event) return new Response("missing headers", { status: 400 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { handleRow, processPending } = await import("@/lib/whatsapp.server");
        const { error } = await supabaseAdmin.from("whatsapp_webhook_events").upsert({ delivery_id: delivery, event, payload: payload as never }, { onConflict: "delivery_id", ignoreDuplicates: true });
        if (error) return new Response("store failed", { status: 500 });
        const { data: row, error: e2 } = await supabaseAdmin.from("whatsapp_webhook_events").select("id,event,payload,attempts,processed_at").eq("delivery_id", delivery).single();
        if (e2 || !row) return new Response("store failed", { status: 500 });
        if (!row.processed_at && !(await handleRow(row))) return new Response("processing failed", { status: 500 });
        await processPending(10);
        return new Response("ok");
      },
    },
  },
});
