import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Send } from "lucide-react";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/alliar/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/treino")({
  head: () => seo("Treino com IA", "Roleplay de vendas: a IA simula clientes difíceis no WhatsApp e dá nota."),
  component: Train,
});

const PERSONAS = {
  "Pechincheiro": ["Tá caro demais. O concorrente faz pela metade.", "Mas e se eu pagar à vista, quanto fica?", "Hmm… vou pensar e te falo."],
  "Desconfiado": ["Nunca ouvi falar de vocês. Como sei que é confiável?", "Tem algum cliente que eu possa conversar?", "Ok, e se não funcionar?"],
  "Apressado": ["Seja rápido, tenho 1 minuto.", "Resume: quanto e quando?", "Manda o link que eu vejo depois."],
};
type P = keyof typeof PERSONAS;

function grade(msgs: string[]) {
  const all = msgs.join(" ").toLowerCase();
  let s = 40;
  if (/\?/.test(all)) s += 15;
  if (/pix|à vista|desconto/.test(all)) s += 15;
  if (/entendo|compreendo|faz sentido/.test(all)) s += 15;
  if (/cliente|resultado|caso/.test(all)) s += 15;
  return Math.min(s, 100);
}

function Train() {
  const [p, setP] = useState<P>("Pechincheiro");
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([{ me: false, t: PERSONAS.Pechincheiro[0] }]);
  const [text, setText] = useState("");
  const mine = msgs.filter((m) => m.me).map((m) => m.t);
  const done = mine.length >= 3;
  const start = (np: P) => { setP(np); setMsgs([{ me: false, t: PERSONAS[np][0] }]); };
  const send = () => {
    if (!text.trim() || done) return;
    const n = [...msgs, { me: true, t: text }];
    const k = n.filter((m) => m.me).length;
    if (k < 3) n.push({ me: false, t: PERSONAS[p][k] });
    setMsgs(n); setText("");
  };
  const score = grade(mine);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Treino com IA" sub="Pratique com clientes difíceis. 3 respostas e você recebe sua nota." />
      <div className="mb-3 flex gap-2">{(Object.keys(PERSONAS) as P[]).map((k) => <Button key={k} size="sm" variant={k === p ? "default" : "secondary"} onClick={() => start(k)}>{k}</Button>)}</div>
      <div className="rounded-lg border bg-card">
        <div className="min-h-72 space-y-2 p-4">
          {msgs.map((m, i) => <div key={i} className={cn("max-w-[75%] rounded-lg px-3 py-2 text-sm", m.me ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}>{m.t}</div>)}
        </div>
        {done ? (
          <div className="flex items-center justify-between border-t p-4">
            <div className="flex items-center gap-3"><Award className="size-6 text-warning" /><div><div className="text-2xl font-semibold">{score}<span className="text-sm text-muted-foreground">/100</span></div><div className="text-xs text-muted-foreground">{score >= 80 ? "Excelente! Empatia e fechamento no ponto." : "Dica: mostre empatia, faça perguntas e ofereça o PIX."}</div></div></div>
            <Button size="sm" onClick={() => start(p)}>Treinar de novo</Button>
          </div>
        ) : (
          <form className="flex gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Sua resposta…" />
            <Button size="icon"><Send className="size-4" /></Button>
          </form>
        )}
      </div>
    </div>
  );
}
