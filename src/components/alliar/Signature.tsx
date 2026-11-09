import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function SignaturePad({ onSigned }: { onSigned: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [has, setHas] = useState(false);
  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const ctx = () => {
    const c = ref.current!.getContext("2d")!;
    c.strokeStyle = getComputedStyle(ref.current!).color;
    c.lineWidth = 2.5; c.lineCap = "round";
    return c;
  };
  return (
    <div className="space-y-2">
      <canvas
        ref={ref} width={420} height={140}
        className="w-full touch-none rounded-md border border-dashed bg-muted/40 text-foreground"
        onPointerDown={(e) => { drawing.current = true; const [x, y] = pos(e); const c = ctx(); c.beginPath(); c.moveTo(x, y); }}
        onPointerMove={(e) => { if (!drawing.current) return; const [x, y] = pos(e); const c = ctx(); c.lineTo(x, y); c.stroke(); setHas(true); }}
        onPointerUp={() => (drawing.current = false)}
      />
      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => { ref.current!.getContext("2d")!.clearRect(0, 0, 420, 140); setHas(false); }}>Limpar</Button>
        <Button size="sm" disabled={!has} onClick={onSigned}>Assinar contrato</Button>
      </div>
    </div>
  );
}
