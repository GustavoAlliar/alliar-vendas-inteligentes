import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { brl } from "@/lib/pix";
import { PageHeader } from "@/components/alliar/Shell";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/indicacoes")({
  head: () => seo("Indicações", "Programa Member-Get-Member com cashback e painel de recompensas."),
  component: Referral,
});

const REFS = [["Beatriz Nunes", 3, 2], ["Mariana Costa", 2, 1], ["Diego Martins", 1, 1]] as const;

function Referral() {
  const [pct, setPct] = useState(10);
  const [ticket] = useState(2500);
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader title="Indicações" sub="Clientes que indicam ganham cashback quando a indicação compra." />
      <section className="rounded-lg border bg-card p-5">
        <div className="mb-2 flex justify-between text-sm"><span>Cashback por indicação convertida</span><span className="font-mono">{pct}%</span></div>
        <Slider value={[pct]} max={30} step={1} onValueChange={([v]) => setPct(v)} />
        <p className="mt-3 text-xs text-muted-foreground">Em um ticket médio de {brl(ticket)}, quem indica recebe <b className="text-foreground">{brl((ticket * pct) / 100)}</b>.</p>
        <Button size="sm" className="mt-3" onClick={() => toast.success("Regra salva e enviada aos clientes pelo WhatsApp")}>Salvar regra</Button>
      </section>
      <section className="rounded-lg border bg-card">
        <div className="grid grid-cols-4 border-b px-4 py-2 text-xs text-muted-foreground"><span className="col-span-2">Cliente</span><span>Indicou / comprou</span><span className="text-right">Recompensa</span></div>
        {REFS.map(([n, a, b]) => (
          <div key={n} className="grid grid-cols-4 border-b px-4 py-2.5 text-sm last:border-0"><span className="col-span-2">{n}</span><span>{a} / {b}</span><span className="text-right font-semibold text-primary">{brl((ticket * pct * b) / 100)}</span></div>
        ))}
      </section>
    </div>
  );
}
