import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Phone, PhoneOff, QrCode, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { seo } from "@/lib/seo";
import { aiAssist } from "@/lib/ai.functions";
import { PageHeader } from "@/components/alliar/Shell";
import { useVoice } from "@/components/alliar/Voice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/dialer")({
  head: () => seo("Discador", "Click-to-call com teleprompter de IA ao vivo e envio de PIX durante a chamada."),
  component: Dialer,
});

function Dialer() {
  const { leads, select, addEvent } = useApp();
  const ai = useServerFn(aiAssist);
  const [call, setCall] = useState<string | null>(null);
  const [sec, setSec] = useState(0);
  const [notes, setNotes] = useState("");
  const [script, setScript] = useState("");
  const [busy, setBusy] = useState(false);
  const voice = useVoice((t) => setNotes((n) => `${n}${n ? "\n" : ""}${t}`));
  useEffect(() => { if (!call) return; setSec(0); const t = setInterval(() => setSec((s) => s + 1), 1000); return () => clearInterval(t); }, [call]);
  const lead = leads.find((l) => l.id === call);
  const prompt = async (n = notes) => {
    if (!lead) return;
    setBusy(true);
    try {
      const r = await ai({ data: { task: "teleprompter", context: `Cliente ${lead.name} (${lead.company || "sem empresa"}), negócio R$ ${lead.value}, etapa ${lead.stage}, temperatura ${lead.temp}. Histórico: ${lead.timeline.slice(-5).map((e) => e.text).join(" | ") || "nenhum"}`, messages: [{ role: "user", content: n ? `Anotações da chamada até agora: ${n}` : "A chamada acabou de começar." }] } });
      if (r.error) toast.error(r.error); else setScript(r.text);
    } finally { setBusy(false); }
  };
  const toggleCall = (id: string) => {
    if (call === id) {
      if (lead && notes.trim()) void addEvent(lead.id, { kind: "call", text: `Ligação (${Math.floor(sec / 60)}min): ${notes.slice(0, 900)}` });
      setCall(null); setNotes(""); setScript(""); return;
    }
    setCall(id); setNotes(""); setScript("");
    const l = leads.find((x) => x.id === id);
    if (l?.phone) window.open(`tel:${l.phone.replace(/[^\d+]/g, "")}`, "_self");
    setTimeout(() => void prompt(""), 0);
  };
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Discador" sub="Clique para ligar. A IA te guia durante a conversa." />
      <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
        <ul className="rounded-lg border bg-card">
          {leads.filter((l) => l.stage !== "ganho").map((l) => (
            <li key={l.id} className="flex items-center justify-between border-b px-4 py-2.5 last:border-0">
              <div><div className="text-sm font-medium">{l.name}</div><div className="font-mono text-xs text-muted-foreground">{l.phone || "sem telefone"}</div></div>
              <Button size="sm" variant={call === l.id ? "destructive" : "secondary"} onClick={() => toggleCall(l.id)} aria-label={call === l.id ? "Encerrar" : "Ligar"}>
                {call === l.id ? <PhoneOff className="size-3.5" /> : <Phone className="size-3.5" />}
              </Button>
            </li>
          ))}
        </ul>
        <div className="rounded-lg border bg-card p-5">
          {lead ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div><div className="text-xs text-primary">● Em chamada · <span className="font-mono">{String(Math.floor(sec / 60)).padStart(2, "0")}:{String(sec % 60).padStart(2, "0")}</span></div><div className="font-semibold">{lead.name}</div></div>
                <Button size="sm" onClick={() => { select(lead.id); setTimeout(() => window.dispatchEvent(new Event("alliar:pix")), 50); }}><QrCode className="size-3.5" />Enviar proposta/PIX</Button>
              </div>
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">Teleprompter IA {busy && <Loader2 className="size-3.5 animate-spin" />}</div>
              <div className="mt-2 min-h-32 whitespace-pre-wrap rounded-md bg-primary/10 p-3 text-sm ring-1 ring-primary/40">{script || (busy ? "Preparando roteiro…" : "—")}</div>
              <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">O que o cliente disse</div>
              <Textarea className="mt-2" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anote ou dite o que o cliente falou (ex.: achou caro)…" maxLength={3000} />
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant={voice.rec ? "destructive" : "secondary"} onClick={voice.toggle}>{voice.rec ? "Parar ditado" : "Ditar"}</Button>
                <Button size="sm" onClick={() => prompt()} disabled={busy}><Sparkles className="size-3.5" />Atualizar roteiro</Button>
              </div>
            </>
          ) : <p className="py-16 text-center text-sm text-muted-foreground">Escolha um contato para ligar.</p>}
        </div>
      </div>
    </div>
  );
}
