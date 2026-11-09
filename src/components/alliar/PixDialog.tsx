import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useApp, type Lead } from "@/lib/store";
import { applyDiscount, brl, pixPayload } from "@/lib/pix";
import { beep, needsApproval } from "@/lib/rules";
import { SignaturePad } from "./Signature";

export function PixDialog({ lead, open, onOpenChange }: { lead: Lead; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { structure, updateLead, addEvent } = useApp();
  const [base, setBase] = useState(lead.value);
  const [disc, setDisc] = useState(0);
  const [step, setStep] = useState<"proposta" | "pix" | "pago" | "assinado">("proposta");
  const [approved, setApproved] = useState(false);
  useEffect(() => { if (open) { setBase(lead.value); setDisc(0); setStep("proposta"); setApproved(false); } }, [open, lead.value]);
  const total = applyDiscount(base, disc);
  const blocked = needsApproval(structure, disc) && !approved;
  const code = useMemo(
    () => pixPayload({ key: "pix@alliar.com.br", name: "Alliar Demo", city: "Sao Paulo", amount: total, txid: `ALR${lead.id}` }),
    [total, lead.id],
  );
  const paid = () => {
    beep(660); setTimeout(() => beep(990, 250), 160);
    updateLead(lead.id, { stage: "ganho", value: total });
    addEvent(lead.id, { kind: "pix", text: `PIX aprovado · ${brl(total)}` });
    setStep("pago");
    toast.success(`PIX de ${brl(total)} aprovado — ${lead.name} movido para Ganho`);
  };
  useEffect(() => {
    if (step !== "pix") return;
    const t = setTimeout(paid, 9000);
    return () => clearTimeout(t);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Proposta expressa · {lead.company}</DialogTitle></DialogHeader>
        {step === "proposta" && (
          <div className="space-y-4">
            <label className="block text-xs text-muted-foreground">Valor base
              <Input type="number" value={base} onChange={(e) => setBase(Number(e.target.value))} className="mt-1" />
            </label>
            <div>
              <div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>Desconto</span><span className="font-mono">{disc}%</span></div>
              <Slider value={[disc]} max={40} step={1} onValueChange={([v]) => setDisc(v)} />
            </div>
            <div className="flex items-baseline justify-between rounded-md bg-muted p-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-semibold tracking-tight">{brl(total)}</span>
            </div>
            {blocked && (
              <div className="flex items-center justify-between gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs">
                <span className="flex items-center gap-2"><ShieldAlert className="size-4 text-warning" />Acima de 15% precisa do gestor</span>
                <Button size="sm" variant="outline" onClick={() => { toast.info("Pedido enviado ao gestor…"); setTimeout(() => { setApproved(true); toast.success("Gestor aprovou o desconto"); }, 1500); }}>Pedir aprovação</Button>
              </div>
            )}
            <Button className="w-full" disabled={blocked} onClick={() => { setStep("pix"); addEvent(lead.id, { kind: "proposta", text: `Proposta ${brl(total)} + PIX enviados no WhatsApp` }); }}>
              Gerar PIX e enviar no WhatsApp
            </Button>
          </div>
        )}
        {step === "pix" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto w-fit rounded-lg bg-card p-3 ring-1 ring-border"><QRCodeSVG value={code} size={180} bgColor="transparent" fgColor="currentColor" /></div>
            <div className="flex gap-2">
              <Input readOnly value={code} className="font-mono text-[10px]" />
              <Button size="icon" variant="secondary" onClick={() => { navigator.clipboard?.writeText(code); toast.success("Copia e Cola copiado"); }}><Copy className="size-4" /></Button>
            </div>
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><span className="size-2 animate-pulse rounded-full bg-warning" />Aguardando pagamento de {brl(total)}…</p>
            <Button variant="outline" size="sm" onClick={paid}>Simular pagamento agora</Button>
          </div>
        )}
        {step === "pago" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 py-2 text-primary"><div className="grid size-14 place-items-center rounded-full bg-primary/15"><Check className="size-7" /></div><span className="font-semibold">Pago! Negócio ganho.</span></div>
            <p className="text-xs text-muted-foreground">Contrato: assine com o dedo (ou envie o link para o cliente assinar no celular).</p>
            <SignaturePad onSigned={() => { addEvent(lead.id, { kind: "nota", text: "Contrato assinado digitalmente" }); setStep("assinado"); toast.success("Contrato assinado"); }} />
          </div>
        )}
        {step === "assinado" && <p className="py-6 text-center text-sm">Contrato assinado e enviado para {lead.name}. 🎉</p>}
      </DialogContent>
    </Dialog>
  );
}
