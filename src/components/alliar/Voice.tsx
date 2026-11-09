import { useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAKE = [
  "Cliente gostou da proposta, pediu 10% de desconto e quer fechar até sexta. Retornar quinta às 10h.",
  "Conversei com o sócio, ele aprovou o plano anual. Enviar PIX hoje.",
  "Pedido: 3 caixas do produto premium e 2 kits básicos, pagamento via PIX à vista.",
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useVoice(onText: (t: string) => void) {
  const [rec, setRec] = useState(false);
  const r = useRef<any>(null);
  const start = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setRec(true);
    if (!SR) return;
    const s = new SR();
    s.lang = "pt-BR";
    s.continuous = true;
    let text = "";
    s.onresult = (e: any) => { text = Array.from(e.results).map((x: any) => x[0].transcript).join(" "); };
    s.onend = () => { if (text) onText(text); r.current = "done"; };
    s.start();
    r.current = s;
  };
  const stop = () => {
    setRec(false);
    if (r.current && r.current !== "done") r.current.stop();
    else onText(FAKE[Math.floor(Math.random() * FAKE.length)]);
    if (!r.current) onText(FAKE[Math.floor(Math.random() * FAKE.length)]);
    r.current = null;
  };
  return { rec, toggle: () => (rec ? stop() : start()) };
}

export function VoiceButton({ onText, label = "Resumo de voz" }: { onText: (t: string) => void; label?: string }) {
  const { rec, toggle } = useVoice(onText);
  return (
    <Button variant={rec ? "destructive" : "secondary"} size="sm" onClick={toggle}>
      {rec ? <Square className="size-3.5 animate-pulse" /> : <Mic className="size-3.5" />}
      {rec ? "Parar e transcrever" : label}
    </Button>
  );
}
