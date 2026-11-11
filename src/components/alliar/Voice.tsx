import { useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { aiAssist } from "@/lib/ai.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Captures speech (pt-BR) with the browser's recognizer and hands back the transcript. */
export function useVoice(onText: (t: string) => void) {
  const [rec, setRec] = useState(false);
  const r = useRef<any>(null);
  const start = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Seu navegador não permite gravar voz. Use o Chrome ou Edge."); return; }
    const s = new SR();
    s.lang = "pt-BR"; s.continuous = true; s.interimResults = false;
    let text = "";
    s.onresult = (e: any) => { text = Array.from(e.results).map((x: any) => x[0].transcript).join(" "); };
    s.onend = () => { setRec(false); r.current = null; if (text.trim()) onText(text.trim()); else toast.error("Não entendi o áudio. Tente de novo."); };
    s.onerror = (e: any) => { if (e.error === "not-allowed") toast.error("Permita o uso do microfone."); };
    try { s.start(); r.current = s; setRec(true); } catch { toast.error("Não foi possível iniciar a gravação."); }
  };
  const stop = () => { r.current?.stop(); };
  return { rec, toggle: () => (rec ? stop() : start()) };
}

/** Records a voice note, then asks the AI to turn it into a CRM summary. */
export function VoiceButton({ onText, label = "Resumo de voz" }: { onText: (t: string) => void; label?: string }) {
  const ai = useServerFn(aiAssist);
  const [busy, setBusy] = useState(false);
  const { rec, toggle } = useVoice(async (t) => {
    setBusy(true);
    try {
      const r = await ai({ data: { task: "summary", context: "", messages: [{ role: "user", content: t }] } });
      if (r.error) { toast.error(r.error); onText(t); } else onText(r.text);
    } finally { setBusy(false); }
  });
  return (
    <Button variant={rec ? "destructive" : "secondary"} size="sm" onClick={toggle} disabled={busy}>
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : rec ? <Square className="size-3.5 animate-pulse" /> : <Mic className="size-3.5" />}
      {busy ? "Resumindo…" : rec ? "Parar e resumir" : label}
    </Button>
  );
}
