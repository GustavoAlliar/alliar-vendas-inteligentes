import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, FileText, Link2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/alliar/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/portal")({
  head: () => seo("Pós-venda", "Portal do cliente com link mágico, rastreio de entrega e chamados com SLA."),
  component: Portal,
});

const STEPS = ["Pagamento confirmado", "Contrato assinado", "Onboarding agendado", "Configuração", "Entregue"];

function Portal() {
  const [tickets, setTickets] = useState([{ id: "ALR-1042", title: "Dúvida sobre fatura", sla: "Responder em 2h", done: false }]);
  const [t, setT] = useState("");
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageHeader title="Pós-venda" sub="Tudo que o cliente precisa depois da compra, sem senha.">
        <Button variant="secondary" size="sm" onClick={() => { navigator.clipboard?.writeText("https://alliar.app/c/m4g1c"); toast.success("Link mágico copiado — o cliente entra sem senha"); }}><Link2 className="size-3.5" />Copiar link mágico</Button>
      </PageHeader>
      <section className="rounded-lg border bg-card p-5">
        <h2 className="mb-4 text-sm font-medium">Rastreio da implantação · Clínica Sorriso</h2>
        <ol className="flex flex-col gap-3 md:flex-row md:gap-0">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2 md:flex-col md:text-center">
              <span className={cn("grid size-7 place-items-center rounded-full border text-xs", i < 3 ? "border-primary bg-primary text-primary-foreground" : i === 3 ? "animate-pulse border-primary text-primary" : "text-muted-foreground")}>{i < 3 ? <Check className="size-3.5" /> : i + 1}</span>
              <span className={cn("text-xs", i > 3 && "text-muted-foreground")}>{s}</span>
            </li>
          ))}
        </ol>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 text-sm font-medium">Documentos do cliente</h2>
          {[["Fatura nov/2026", QrCode, "2ª via PIX"], ["Contrato assinado", FileText, "Baixar"], ["Fatura out/2026 · paga", FileText, "Recibo"]].map(([n, I, a]) => {
            const Icon = I as typeof QrCode;
            return (
              <div key={n as string} className="flex items-center justify-between border-b py-2 text-sm last:border-0">
                <span className="flex items-center gap-2"><Icon className="size-4 text-muted-foreground" />{n as string}</span>
                <Button variant="ghost" size="sm" onClick={() => toast.success(`${a} enviado`)}>{a as string}</Button>
              </div>
            );
          })}
        </section>
        <section className="rounded-lg border bg-card p-5">
          <h2 className="mb-3 text-sm font-medium">Chamados</h2>
          <form className="mb-3 space-y-2" onSubmit={(e) => { e.preventDefault(); if (!t) return; const id = `ALR-${1043 + tickets.length}`; setTickets([{ id, title: t, sla: "Responder em 4h", done: false }, ...tickets]); setT(""); toast.success(`Chamado aberto · protocolo ${id}`); }}>
            <Textarea value={t} onChange={(e) => setT(e.target.value)} placeholder="Descreva o problema…" rows={2} />
            <Button size="sm">Abrir chamado</Button>
          </form>
          {tickets.map((k) => (
            <div key={k.id} className="flex items-center justify-between border-t py-2 text-sm">
              <div><span className="font-mono text-xs text-muted-foreground">{k.id}</span> {k.title}</div>
              <button onClick={() => setTickets(tickets.map((x) => x.id === k.id ? { ...x, done: !x.done } : x))} className={cn("text-xs", k.done ? "text-primary" : "text-warning")}>{k.done ? "Resolvido" : k.sla}</button>
            </div>
          ))}
        </section>
      </div>
      <div className="hidden"><Input /><Copy /></div>
    </div>
  );
}
