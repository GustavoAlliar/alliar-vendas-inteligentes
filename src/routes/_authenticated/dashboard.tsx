import { createFileRoute } from "@tanstack/react-router";
import { Ghost, Mic, Sunrise, Zap } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { brl } from "@/lib/pix";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/alliar/Shell";
import { TempBadge } from "@/components/alliar/Badges";
import { VoiceButton } from "@/components/alliar/Voice";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => seo("Painel matinal", "Os 3 negócios com mais chance de fechar hoje, follow-ups automáticos e pedidos por áudio."),
  component: Index,
});

const score = { quente: 3, morno: 2, frio: 1 };

function Index() {
  const { leads, select, structure } = useApp();
  const open = leads.filter((l) => l.stage !== "ganho");
  const top = [...open].sort((a, b) => score[b.temp] * b.value - score[a.temp] * a.value).slice(0, 3);
  const won = leads.filter((l) => l.stage === "ganho").reduce((s, l) => s + l.value, 0);
  const pipe = open.reduce((s, l) => s + l.value, 0);
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Bom dia ☀️" sub={structure === "solo" ? "Seu dia em uma tela. Comece pelos 3 abaixo." : "Visão da equipe hoje."} />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Em aberto", brl(pipe)], ["Ganho no mês", brl(won)], ["Negócios ativos", String(open.length)], ["Taxa de resposta", "94%"]].map(([k, v]) => (
          <div key={k} className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">{k}</div><div className="mt-1 text-lg font-semibold tracking-tight">{v}</div></div>
        ))}
      </div>
      <section className="mb-6 rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium"><Sunrise className="size-4 text-warning" />Top 3 negócios do dia</div>
        {top.map((l, i) => (
          <button key={l.id} onClick={() => select(l.id)} className="flex w-full items-center gap-4 border-b px-4 py-3 text-left last:border-0 hover:bg-accent/50">
            <span className="font-mono text-xs text-muted-foreground">{i + 1}</span>
            <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{l.name}</div><div className="truncate text-xs text-muted-foreground">{l.company} · último contato {l.lastContact}</div></div>
            <TempBadge t={l.temp} />
            <span className="w-24 text-right text-sm font-semibold">{brl(l.value)}</span>
          </button>
        ))}
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Ghost className="size-4 text-info" />Cadência de follow-up fantasma</div>
          <p className="mb-3 text-xs text-muted-foreground">Se o cliente sumir, a Alliar manda lembretes gentis no WhatsApp por você: dia 1, 3 e 7.</p>
          <ul className="space-y-2 text-sm">
            {open.slice(3, 6).map((l, i) => (
              <li key={l.id} className="flex items-center justify-between"><span>{l.name}</span><span className="text-xs text-muted-foreground">mensagem {i + 1}/3 · {["hoje 14h", "amanhã 9h", "sexta 10h"][i]}</span></li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Mic className="size-4 text-primary" />Pedido por áudio com PIX</div>
          <p className="mb-3 text-xs text-muted-foreground">Fale o pedido. A Alliar transcreve, monta os itens e gera o PIX.</p>
          <VoiceButton label="Gravar pedido" onText={(t) => toast.success("Pedido transcrito", { description: t, action: { label: "Gerar PIX", onClick: () => { select(top[0]?.id ?? null); setTimeout(() => window.dispatchEvent(new Event("alliar:pix")), 50); } } })} />
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => select(top[0]?.id ?? null)}><Zap className="size-3.5" />Atacar o nº 1</Button>
        </section>
      </div>
    </div>
  );
}
