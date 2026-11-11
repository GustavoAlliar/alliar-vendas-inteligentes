import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Award, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { aiAssist } from "@/lib/ai.functions";
import { PageHeader } from "@/components/alliar/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/treino")({
  head: () => seo("Treino com IA", "Roleplay de vendas: a IA simula clientes difíceis no WhatsApp e dá nota."),
  component: Train,
});

const PERSONAS = {
  Pechincheiro: { open: "Tá caro demais. O concorrente faz pela metade.", desc: "Dono de pequena empresa que só pensa em preço e pede desconto o tempo todo." },
  Desconfiado: { open: "Nunca ouvi falar de vocês. Como sei que é confiável?", desc: "Cliente cético, já foi enganado antes, pede provas e referências." },
  Apressado: { open: "Seja rápido, tenho 1 minuto.", desc: "Executivo sem tempo, impaciente, quer respostas curtas e diretas." },
};
type P = keyof typeof PERSONAS;
type M = { me: boolean; t: string };
const ROUNDS = 4;

function Train() {
  const ai = useServerFn(aiAssist);
  const [p, setP] = useState<P>("Pechincheiro");
  const [msgs, setMsgs] = useState<M[]>([{ me: false, t: PERSONAS.Pechincheiro.open }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const mine = msgs.filter((m) => m.me).length;
  const history = (list: M[]) => list.map((m) => ({ role: (m.me ? "user" : "assistant") as "user" | "assistant", content: m.t }));
  const start = (np: P) => { setP(np); setResult(""); setMsgs([{ me: false, t: PERSONAS[np].open }]); };
  const send = async () => {
    if (!text.trim() || busy || result) return;
    const n = [...msgs, { me: true, t: text.trim() }];
    setMsgs(n); setText(""); setBusy(true);
    try {
      if (n.filter((m) => m.me).length >= ROUNDS) {
        const r = await ai({ data: { task: "grade", context: `Persona: ${PERSONAS[p].desc}`, messages: [{ role: "user", content: n.map((m) => `${m.me ? "VENDEDOR" : "CLIENTE"}: ${m.t}`).join("\n") }] } });
        if (r.error) toast.error(r.error); else setResult(r.text);
      } else {
        const r = await ai({ data: { task: "roleplay", context: PERSONAS[p].desc, messages: history(n).map((m) => ({ ...m, role: m.role === "user" ? "user" : "assistant" })) } });
        if (r.error) toast.error(r.error); else setMsgs([...n, { me: false, t: r.text }]);
      }
    } finally { setBusy(false); }
  };
  const score = Number(result.match(/NOTA:\s*(\d+)/i)?.[1] ?? NaN);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Treino com IA" sub={`A IA interpreta um cliente difícil. Após ${ROUNDS} respostas, você recebe nota e feedback.`} />
      <div className="mb-3 flex gap-2">{(Object.keys(PERSONAS) as P[]).map((k) => <Button key={k} size="sm" variant={k === p ? "default" : "secondary"} onClick={() => start(k)}>{k}</Button>)}</div>
      <div className="rounded-lg border bg-card">
        <div className="min-h-72 space-y-2 p-4">
          {msgs.map((m, i) => <div key={i} className={cn("max-w-[75%] rounded-lg px-3 py-2 text-sm", m.me ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}>{m.t}</div>)}
          {busy && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" />{mine >= ROUNDS ? "Avaliando…" : "Cliente digitando…"}</div>}
        </div>
        {result ? (
          <div className="flex items-start justify-between gap-4 border-t p-4">
            <div className="flex gap-3"><Award className="size-6 shrink-0 text-warning" /><div>{!Number.isNaN(score) && <div className="text-2xl font-semibold">{score}<span className="text-sm text-muted-foreground">/100</span></div>}<div className="whitespace-pre-wrap text-sm text-muted-foreground">{result.replace(/NOTA:\s*\d+\s*/i, "")}</div></div></div>
            <Button size="sm" onClick={() => start(p)}>Treinar de novo</Button>
          </div>
        ) : (
          <form className="flex gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); void send(); }}>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Sua resposta (${mine}/${ROUNDS})…`} maxLength={1000} disabled={busy} />
            <Button size="icon" disabled={busy} aria-label="Enviar"><Send className="size-4" /></Button>
          </form>
        )}
      </div>
    </div>
  );
}
