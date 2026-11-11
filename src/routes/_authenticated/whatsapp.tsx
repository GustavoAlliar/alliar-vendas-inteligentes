import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, RefreshCw, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { seo } from "@/lib/seo";
import { waSend, waStatus, waTemplates } from "@/lib/whatsapp.functions";
import { PageHeader } from "@/components/alliar/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/whatsapp")({
  head: () => seo("Conexão WhatsApp", "Status da conexão oficial do WhatsApp Business, modelos aprovados e disparos."),
  component: WhatsAppPage,
});

function WhatsAppPage() {
  const { leads, tenantId } = useApp();
  const status = useServerFn(waStatus), templates = useServerFn(waTemplates), send = useServerFn(waSend);
  const st = useQuery({ queryKey: ["wa-status"], queryFn: () => status() });
  const tp = useQuery({ queryKey: ["wa-templates"], enabled: !!st.data?.connected, queryFn: () => templates() });
  const [tpl, setTpl] = useState(""); const [leadId, setLead] = useState(""); const [params, setParams] = useState(""); const [busy, setBusy] = useState(false);
  const chosen = tp.data?.templates.find((t) => `${t.name}|${t.language}` === tpl);
  const vars = chosen ? (chosen.body.match(/\{\{\d+\}\}/g) ?? []).length : 0;
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Conexão WhatsApp" sub="WhatsApp Business oficial (Cloud API da Meta)." />
      <section className="rounded-lg border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {st.isPending ? <Loader2 className="size-6 animate-spin" /> : st.data?.connected ? <CheckCircle2 className="size-6 text-primary" /> : <XCircle className="size-6 text-destructive" />}
            <div><div className="font-semibold">{st.isPending ? "Verificando…" : st.data?.connected ? "Conectado" : "Desconectado"}</div>
              <div className="text-sm text-muted-foreground">{st.data?.number ?? st.data?.error ?? "Nenhum número conectado ainda."}{st.data?.quality && ` · qualidade ${st.data.quality}`}</div></div>
          </div>
          <Button variant="outline" size="sm" onClick={() => st.refetch()}><RefreshCw className="size-3.5" />Atualizar</Button>
        </div>
        {!st.data?.connected && !st.isPending && <p className="mt-4 rounded-md bg-muted p-3 text-sm">A conexão usa a API oficial da Meta. Em vez de QR Code, o número é autorizado uma vez pela tela da Meta (login do Facebook + código por SMS). Peça ao assistente da Lovable para conectar o WhatsApp.</p>}
      </section>
      {st.data?.connected && <section className="rounded-lg border bg-card p-5">
        <h2 className="mb-1 font-semibold">Disparar modelo aprovado</h2>
        <p className="mb-4 text-sm text-muted-foreground">Para iniciar conversa (ou após 24h sem resposta do cliente) o WhatsApp exige um modelo aprovado pela Meta.</p>
        {tp.isPending ? <p className="text-sm">Carregando modelos…</p> : tp.data?.error ? <p className="text-sm text-destructive">{tp.data.error}</p> : !tp.data?.templates.length ? <p className="text-sm text-muted-foreground">Nenhum modelo cadastrado.</p> : (
          <form className="grid gap-3" onSubmit={async (e) => { e.preventDefault(); if (!chosen || !leadId || !tenantId) return; setBusy(true); try { const r = await send({ data: { tenantId, leadId, template: { name: chosen.name, language: chosen.language, params: params ? params.split(";").map((s) => s.trim()) : [] } } }); if (r.ok) toast.success("Modelo enviado"); else toast.error(r.error ?? "Falha"); } finally { setBusy(false); } }}>
            <select className="h-9 rounded-md border bg-background px-2 text-sm" value={tpl} onChange={(e) => setTpl(e.target.value)} required>
              <option value="">Escolha o modelo…</option>
              {tp.data.templates.map((t) => <option key={`${t.name}|${t.language}`} value={`${t.name}|${t.language}`} disabled={t.status !== "APPROVED"}>{t.name} ({t.language}) {t.status !== "APPROVED" ? `— ${t.status}` : ""}</option>)}
            </select>
            {chosen && <p className="rounded-md bg-muted p-3 text-sm">{chosen.body}</p>}
            <select className="h-9 rounded-md border bg-background px-2 text-sm" value={leadId} onChange={(e) => setLead(e.target.value)} required>
              <option value="">Para qual cliente?</option>
              {leads.filter((l) => l.phone).map((l) => <option key={l.id} value={l.id}>{l.name} · {l.phone}</option>)}
            </select>
            {vars > 0 && <Input value={params} onChange={(e) => setParams(e.target.value)} placeholder={`${vars} valor(es) separados por ; (preenchem {{1}}, {{2}}…)`} required />}
            <Button disabled={busy} className="justify-self-start"><Send className="size-3.5" />Enviar</Button>
          </form>
        )}
      </section>}
    </div>
  );
}
