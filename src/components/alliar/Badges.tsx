import { Flame, Snowflake, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/store";

export function TempBadge({ t }: { t: Lead["temp"] }) {
  const m = {
    quente: ["text-destructive bg-destructive/10", Flame],
    morno: ["text-warning bg-warning/10", Thermometer],
    frio: ["text-info bg-info/10", Snowflake],
  } as const;
  const [c, I] = m[t];
  return <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium", c)}><I className="size-3" />{t}</span>;
}
export function PriorityBadge({ p }: { p: Lead["priority"] }) {
  return <span className={cn("rounded border px-1.5 py-0.5 text-[10px]", p === "alta" ? "border-primary/40 text-primary" : "text-muted-foreground")}>{p}</span>;
}
