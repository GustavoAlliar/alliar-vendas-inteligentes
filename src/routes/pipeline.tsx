import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye } from "lucide-react";
import { useApp, STAGES, type Stage } from "@/lib/store";
import { brl } from "@/lib/pix";
import { beep } from "@/lib/rules";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/alliar/Shell";
import { PriorityBadge, TempBadge } from "@/components/alliar/Badges";

export const Route = createFileRoute("/pipeline")({
  head: () => seo("Funil de vendas", "Pipeline Kanban com temperatura, prioridade e raio-X do lead em 5 segundos."),
  component: Pipeline,
});

function Pipeline() {
  const { leads, updateLead, select, selected, structure } = useApp();
  const [over, setOver] = useState<Stage | null>(null);
  return (
    <div>
      <PageHeader title="Funil" sub="Arraste os cartões entre colunas. Clique para ver o raio-X." />
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((s) => {
          const col = leads.filter((l) => l.stage === s.id);
          return (
            <div key={s.id}
              onDragOver={(e) => { e.preventDefault(); setOver(s.id); }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => { const id = e.dataTransfer.getData("id"); updateLead(id, { stage: s.id }); if (s.id === "ganho") beep(990); setOver(null); }}
              className={cn("flex w-64 shrink-0 flex-col rounded-lg bg-muted/40 p-2", over === s.id && "ring-1 ring-primary")}>
              <div className="flex items-center justify-between px-1 pb-2 text-xs">
                <span className="font-medium">{s.label} <span className="text-muted-foreground">{col.length}</span></span>
                <span className="text-muted-foreground">{brl(col.reduce((a, l) => a + l.value, 0))}</span>
              </div>
              <div className="space-y-2">
                {col.map((l) => (
                  <div key={l.id} draggable onDragStart={(e) => e.dataTransfer.setData("id", l.id)} onClick={() => select(l.id)}
                    className={cn("cursor-pointer rounded-md border bg-card p-3 transition hover:border-primary/50", selected === l.id && "border-primary")}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0"><div className="truncate text-sm font-medium">{l.name}</div><div className="truncate text-xs text-muted-foreground">{l.company}</div></div>
                      {l.proposalOpen && <Eye className="size-3.5 shrink-0 animate-pulse text-info" />}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5"><TempBadge t={l.temp} /><PriorityBadge p={l.priority} /></div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-semibold">{brl(l.value)}</span>
                      <span className="text-muted-foreground">{structure === "equipe" ? l.owner : l.lastContact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
