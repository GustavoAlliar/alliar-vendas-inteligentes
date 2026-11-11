import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Check, CheckCheck, Loader2, QrCode, Send, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { aiAssist } from "@/lib/ai.functions";
import { waSend } from "@/lib/whatsapp.functions";
import { PageHeader } from "@/components/alliar/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/inbox")({
  head: () => seo("Conversas WhatsApp", "Caixa de entrada WhatsApp com envio real e copiloto de IA para quebrar objeções."),
  component: InboxPage,
});

const SNIPPETS = ["Oi! Tudo bem? 😊", "Posso te mandar a proposta agora?", "Te envio o PIX para garantir o valor?", "Qual o melhor horário para conversarmos?"];

function InboxPage() {
  const { leads, select, structure, tenantId } = useApp();
  const qc = useQueryClient();
  const ai = useServerFn(aiAssist);
  const send = useServerFn(waSend);
  const [activeId, setActive] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [tip, setTip] = useState("");
  const [busy, setBusy] = useState<"" | "send" | "ai">("");
  const lead = leads.find((l) => l.id === activeId) ?? leads[0];
  const msgs = useQuery({
    queryKey: ["wa", tenantId, lead?.id], enabled: !!lead && !!tenantId, refetchInterval: 5000,
    queryFn: async () => { const { data, error } = await supabase.from("whatsapp_messages").select("*").eq("tenant_id", tenantId!).eq("lead_id", lead!.id).order("created_at").limit(300); if (error) throw error; return data; },
  });
  if (!lead) return <div><PageHeader title="Conversas" /><p className="text-sm text-muted-foreground">Cadastre um negócio com telefone para começar a conversar.</p></div>;
  const doSend = async (t: string) => {
    if (!t.trim() || !tenantId) return;
    setBusy("send");
    try {
      const r = await send({ data: { tenantId, leadId: lead.id, text: t } });
      if (!r.ok) toast.error(r.error ?? "Falha no envio"); else setText("");
      await qc.invalidateQueries({ queryKey: ["wa", tenantId, lead.id] });
    } finally { setBusy(""); }
  };
  const suggest = async () => {
    setBusy("ai");
    try {
      const history = (msgs.data ?? []).slice(-20).map((m) => ({ role: (m.direction === "in" ? "user" : "assistant") as "user" | "assistant", content: m.body }));
      const r = await ai({ data: { task: "copilot", context: `Cliente: ${lead.name}, empresa ${lead.company || "-"}, negócio de R$ ${lead.value}, etapa ${lead.stage}.`, messages: history.length ? history : [{ role: "user", content: "(Ainda não há mensagens. Sugira uma abertura.)" }] } });
      if (r.error) toast.error(r.error); else setTip(r.text);
    } finally { setBusy(""); }
  };
  return (
    <div>
      <PageHeader title="Conversas" sub={structure === "equipe" ? "Atendimento compartilhado da equipe" : "Seu WhatsApp, turbinado"}>
        <Button asChild variant="outline" size="sm"><Link to="/whatsapp">Conexão WhatsApp</Link></Button>
      </PageHeader>
      <div className="grid h-[calc(100vh-11rem)] grid-cols-1 overflow-hidden rounded-lg border bg-card md:grid-cols-[240px_1fr_280px]">
        <ul className="hidden overflow-y-auto border-r md:block">
          {leads.map((l) => (
            <li key={l.id}><button onClick={() => { setActive(l.id); setTip(""); }} className={cn("w-full border-b px-3 py-2.5 text-left hover:bg-accent/50", lead.id === l.id && "bg-accent")}>
              <div className="flex justify-between gap-2 text-sm font-medium"><span className="truncate">{l.name}</span>{structure === "equipe" && <span className="truncate text-[10px] text-muted-foreground">{l.owner}</span>}</div>
              <div className="truncate text-xs text-muted-foreground">{l.phone || "sem telefone"}</div>
            </button></li>
          ))}
        </ul>
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <button className="text-sm font-medium hover:underline" onClick={() => select(lead.id)}>{lead.name}</button>
            <Button size="sm" variant="secondary" onClick={() => { select(lead.id); setTimeout(() => window.dispatchEvent(new Event("alliar:pix")), 50); }}><QrCode className="size-3.5" />Enviar PIX</Button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {msgs.isPending ? <p className="text-sm text-muted-foreground">Carregando…</p> : !msgs.data?.length ? <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma mensagem ainda. Fora da janela de 24h, o primeiro contato precisa ser por um modelo aprovado (em Conexão WhatsApp).</p> :
              msgs.data.map((m) => (
                <div key={m.id} className={cn("max-w-[75%] rounded-lg px-3 py-2 text-sm", m.direction === "out" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}>
                  {m.body}
                  {m.direction === "out" && <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-80" title={m.error ?? m.status}>
                    {m.status === "failed" ? <><AlertCircle className="size-3" />falhou</> : m.status === "read" ? <><CheckCheck className="size-3" />lida</> : m.status === "delivered" ? <><CheckCheck className="size-3" />entregue</> : <><Check className="size-3" />{m.status === "sent" ? "enviada" : "aceita"}</>}
                  </div>}
                </div>
              ))}
          </div>
          <div className="flex gap-1.5 overflow-x-auto border-t px-3 pt-2">
            {SNIPPETS.map((s) => <button key={s} onClick={() => setText(s)} className="shrink-0 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent">{s}</button>)}
          </div>
          <form className="flex gap-2 p-3" onSubmit={(e) => { e.preventDefault(); void doSend(text); }}>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Digite uma mensagem…" maxLength={4000} />
            <Button size="icon" disabled={busy === "send"} aria-label="Enviar">{busy === "send" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</Button>
          </form>
        </div>
        <aside className="hidden border-l p-4 md:block">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium"><Bot className="size-4 text-primary" />Copiloto IA</div>
          <p className="mb-2 text-xs text-muted-foreground">A IA lê a conversa e sugere uma resposta para quebrar a objeção.</p>
          <Button size="sm" variant="secondary" className="mb-3 w-full" onClick={suggest} disabled={busy === "ai"}>{busy === "ai" ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}Sugerir resposta</Button>
          {tip && <><div className="mb-3 whitespace-pre-wrap rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">{tip}</div><Button size="sm" className="w-full" onClick={() => setText(tip)}>Usar resposta</Button></>}
        </aside>
      </div>
    </div>
  );
}
