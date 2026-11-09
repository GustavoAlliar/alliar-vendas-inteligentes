import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shuffle, Timer } from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { brl } from "@/lib/pix";
import { nextRoundRobin, SLA_MINUTES } from "@/lib/rules";
import { PageHeader } from "@/components/alliar/Shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/equipe")({
  head: () => seo("Equipe e metas", "Round-robin com SLA anti-vácuo, metas e comissões transparentes."),
  component: Team,
});

const TEAM = [
  { n: "Você", sold: 18400, goal: 25000, rate: 8 },
  { n: "Ana", sold: 22100, goal: 25000, rate: 8 },
  { n: "Bruno", sold: 12900, goal: 20000, rate: 7 },
];

function Team() {
  const [idx, setIdx] = useState(0);
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader title="Equipe & metas" sub="Distribuição justa, ninguém fica no vácuo.">
        <Button size="sm" variant="secondary" onClick={() => { const n = nextRoundRobin(TEAM.map((t) => t.n), idx); setIdx(n); toast.success(`Novo lead distribuído para ${TEAM[n].n}`); }}><Shuffle className="size-3.5" />Simular novo lead</Button>
      </PageHeader>
      <div className="flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs"><Timer className="size-4 text-warning" />SLA anti-vácuo: lead sem resposta em {SLA_MINUTES} min passa automaticamente para o próximo da fila.</div>
      <section className="rounded-lg border bg-card">
        {TEAM.map((t, i) => (
          <div key={t.n} className="grid grid-cols-[1fr_2fr_auto] items-center gap-4 border-b px-4 py-3 last:border-0">
            <div className="text-sm font-medium">{t.n} {i === (idx + 1) % TEAM.length && <span className="ml-1 rounded bg-primary/15 px-1.5 text-[10px] text-primary">próximo</span>}</div>
            <div><Progress value={(t.sold / t.goal) * 100} /><div className="mt-1 text-xs text-muted-foreground">{brl(t.sold)} de {brl(t.goal)}</div></div>
            <div className="text-right text-sm"><div className="font-semibold text-primary">{brl((t.sold * t.rate) / 100)}</div><div className="text-[10px] text-muted-foreground">comissão {t.rate}%</div></div>
          </div>
        ))}
      </section>
    </div>
  );
}
