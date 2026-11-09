import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Mic, QrCode, Send, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/alliar/Shell";
import { useVoice } from "@/components/alliar/Voice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/inbox")({
  head: () => seo("Conversas WhatsApp", "Caixa de entrada multi-atendente com áudios, respostas rápidas e copiloto de IA."),
  component: InboxPage,
});

type Msg = { me: boolean; text: string; audio?: boolean };
const SNIPPETS = ["Oi! Tudo bem? 😊", "Posso te mandar a proposta agora?", "Te envio o PIX para garantir o valor?", "Qual o melhor horário para conversarmos?"];
const OBJ: Record<string, string> = {
  caro: "Entendo! Se dividirmos o valor pelo mês, fica menos que um café por dia — e o retorno vem já na 1ª semana. Posso te mostrar como?",
  pensar: "Claro! Para te ajudar a decidir: o que falta para você ter certeza? Preço, prazo ou algo do produto?",
  depois: "Sem problemas! Só aviso que a condição especial vale até sexta. Quer que eu reserve para você?",
};

function InboxPage() {
  const { leads, select, structure } = useApp();
  const [active, setActive] = useState(leads[0].id);
  const [threads, setThreads] = useState<Record<string, Msg[]>>({});
  const [text, setText] = useState("");
  const lead = leads.find((l) => l.id === active)!;
  const msgs = threads[active] ?? [{ me: false, text: `Oi, aqui é ${lead.name.split(" ")[0]}. Achei um pouco caro, vou pensar...` }];
  const push = (m: Msg) => setThreads((t) => ({ ...t, [active]: [...msgs, m] }));
  const voice = useVoice((t) => push({ me: true, text: t, audio: true }));
  const last = msgs.filter((m) => !m.me).at(-1)?.text.toLowerCase() ?? "";
  const tip = Object.entries(OBJ).find(([k]) => last.includes(k))?.[1] ?? "Pergunte sobre o prazo ideal do cliente e ofereça o PIX com 5% off à vista.";
  const send = (t: string) => {
    if (!t.trim()) return;
    push({ me: true, text: t });
    setText("");
    setTimeout(() => setThreads((th) => ({ ...th, [active]: [...(th[active] ?? msgs), { me: false, text: "Hmm, faz sentido. Mas preciso falar com meu sócio depois." }] })), 1400);
  };
  return (
    <div>
      <PageHeader title="Conversas" sub={structure === "equipe" ? "Atendimento compartilhado · SLA anti-vácuo de 5 min" : "Seu WhatsApp, turbinado"} />
      <div className="grid h-[calc(100vh-11rem)] grid-cols-1 overflow-hidden rounded-lg border bg-card md:grid-cols-[240px_1fr_280px]">
        <ul className="hidden overflow-y-auto border-r md:block">
          {leads.map((l) => (
            <li key={l.id}><button onClick={() => setActive(l.id)} className={cn("w-full border-b px-3 py-2.5 text-left hover:bg-accent/50", active === l.id && "bg-accent")}>
              <div className="flex justify-between text-sm font-medium"><span className="truncate">{l.name}</span>{structure === "equipe" && <span className="text-[10px] text-muted-foreground">{l.owner}</span>}</div>
              <div className="truncate text-xs text-muted-foreground">{l.company}</div>
            </button></li>
          ))}
        </ul>
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <button className="text-sm font-medium hover:underline" onClick={() => select(lead.id)}>{lead.name}</button>
            <Button size="sm" variant="secondary" onClick={() => { select(lead.id); setTimeout(() => window.dispatchEvent(new Event("alliar:pix")), 50); }}><QrCode className="size-3.5" />Enviar PIX</Button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={cn("max-w-[75%] rounded-lg px-3 py-2 text-sm", m.me ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}>
                {m.audio && <div className="mb-1 flex items-center gap-1 text-xs opacity-80"><Mic className="size-3" />áudio · 0:12</div>}{m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 overflow-x-auto border-t px-3 pt-2">
            {SNIPPETS.map((s) => <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent">{s}</button>)}
          </div>
          <form className="flex gap-2 p-3" onSubmit={(e) => { e.preventDefault(); send(text); }}>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Digite uma mensagem…" />
            <Button type="button" size="icon" variant={voice.rec ? "destructive" : "secondary"} onClick={voice.toggle}><Mic className="size-4" /></Button>
            <Button size="icon"><Send className="size-4" /></Button>
          </form>
        </div>
        <aside className="hidden border-l p-4 md:block">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium"><Bot className="size-4 text-primary" />Copiloto IA</div>
          <p className="mb-2 text-xs text-muted-foreground">Resposta sugerida para a última mensagem:</p>
          <div className="mb-3 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">{tip}</div>
          <Button size="sm" className="w-full" onClick={() => send(tip)}><Sparkles className="size-3.5" />Usar resposta</Button>
        </aside>
      </div>
    </div>
  );
}
