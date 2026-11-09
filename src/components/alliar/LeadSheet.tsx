import { useState } from "react";
import { FileText, MessageCircle, Mic, Phone, QrCode, StickyNote, Eye } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useApp, STAGES } from "@/lib/store";
import { brl } from "@/lib/pix";
import { VoiceButton } from "./Voice";
import { PixDialog } from "./PixDialog";
import { TempBadge } from "./Badges";

const ICON = { msg: MessageCircle, call: Phone, proposta: FileText, audio: Mic, pix: QrCode, nota: StickyNote };

export function LeadSheet() {
  const { leads, selected, select, addEvent, updateLead } = useApp();
  const [pix, setPix] = useState(false);
  const lead = leads.find((l) => l.id === selected);
  if (!lead) return null;
  return (
    <>
      <Sheet open={!!lead && !pix} onOpenChange={(o) => !o && select(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-left">{lead.name}</SheetTitle>
            <p className="text-left text-sm text-muted-foreground">{lead.company} · {lead.phone}</p>
          </SheetHeader>
          <div className="space-y-5 px-4 pb-6">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted p-2"><div className="text-[10px] uppercase text-muted-foreground">Valor</div><div className="text-sm font-semibold">{brl(lead.value)}</div></div>
              <div className="rounded-md bg-muted p-2"><div className="text-[10px] uppercase text-muted-foreground">Etapa</div><div className="text-sm font-semibold">{STAGES.find((s) => s.id === lead.stage)?.label}</div></div>
              <div className="flex flex-col items-center justify-center rounded-md bg-muted p-2"><div className="text-[10px] uppercase text-muted-foreground">Temp.</div><TempBadge t={lead.temp} /></div>
            </div>
            {lead.proposalOpen && (
              <div className="flex items-center gap-2 rounded-md border border-info/40 bg-info/10 p-2 text-xs"><Eye className="size-4 text-info" />Radar: o cliente está com a proposta aberta agora</div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setPix(true)}><QrCode className="size-3.5" />Proposta + PIX <kbd>1</kbd></Button>
              <Button size="sm" variant="secondary" onClick={() => { updateLead(lead.id, { stage: "contato" }); addEvent(lead.id, { kind: "nota", text: "Retorno agendado para amanhã 10h" }); }}>Retorno <kbd>2</kbd></Button>
              <VoiceButton onText={(t) => addEvent(lead.id, { kind: "audio", text: `Resumo de voz: ${t}` })} />
            </div>
            <div>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Raio-X · linha do tempo</h3>
              <ol className="relative space-y-4 border-l pl-5">
                {[...lead.timeline].reverse().map((e, i) => {
                  const I = ICON[e.kind];
                  return (
                    <li key={i} className="relative">
                      <span className="absolute -left-[29px] grid size-6 place-items-center rounded-full border bg-card"><I className="size-3 text-primary" /></span>
                      <p className="text-sm">{e.text}</p>
                      <p className="text-xs text-muted-foreground">{e.at}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <PixDialog lead={lead} open={pix} onOpenChange={setPix} />
    </>
  );
}
