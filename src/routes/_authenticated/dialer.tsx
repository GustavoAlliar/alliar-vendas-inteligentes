import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, PhoneOff, QrCode } from "lucide-react";
import { useApp } from "@/lib/store";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/alliar/Shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dialer")({
  head: () => seo("Discador", "Click-to-call com teleprompter de IA ao vivo e envio de PIX durante a chamada."),
  component: Dialer,
});

const SCRIPT = [
  "Abertura: \"Oi {nome}, aqui é da Alliar. Tem 2 minutinhos?\"",
  "Descoberta: pergunte qual o maior desafio hoje para vender mais.",
  "Valor: conecte a dor ao resultado — \"clientes como você aumentaram 30% as vendas\".",
  "Objeção de preço? Ofereça 5% off no PIX à vista.",
  "Fechamento: \"Posso te mandar o PIX agora pelo WhatsApp?\" → envie pelo botão.",
];

function Dialer() {
  const { leads, select } = useApp();
  const [call, setCall] = useState<string | null>(null);
  const [sec, setSec] = useState(0);
  useEffect(() => { if (!call) return; setSec(0); const t = setInterval(() => setSec((s) => s + 1), 1000); return () => clearInterval(t); }, [call]);
  const lead = leads.find((l) => l.id === call);
  const step = Math.min(Math.floor(sec / 6), SCRIPT.length - 1);
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Discador" sub="Clique para ligar. A IA te guia durante a conversa." />
      <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
        <ul className="rounded-lg border bg-card">
          {leads.filter((l) => l.stage !== "ganho").map((l) => (
            <li key={l.id} className="flex items-center justify-between border-b px-4 py-2.5 last:border-0">
              <div><div className="text-sm font-medium">{l.name}</div><div className="font-mono text-xs text-muted-foreground">{l.phone}</div></div>
              <Button size="sm" variant={call === l.id ? "destructive" : "secondary"} onClick={() => setCall(call === l.id ? null : l.id)}>
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
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Teleprompter IA</div>
              <ol className="mt-3 space-y-2">
                {SCRIPT.map((s, i) => (
                  <li key={i} className={cn("rounded-md p-3 text-sm transition", i === step ? "bg-primary/10 text-foreground ring-1 ring-primary/40" : "text-muted-foreground")}>{s.replace("{nome}", lead.name.split(" ")[0] ?? "")}</li>
                ))}
              </ol>
            </>
          ) : <p className="py-16 text-center text-sm text-muted-foreground">Escolha um contato para ligar.</p>}
        </div>
      </div>
    </div>
  );
}
