import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Columns3, GraduationCap, Gift, Headset, Home, Inbox, Moon, PhoneCall, Search, Sun, Users, LifeBuoy, HelpCircle, Menu,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LeadSheet } from "./LeadSheet";
import { beep } from "@/lib/rules";

type NavItem = { to: string; label: string; icon: typeof Home; full?: boolean; team?: boolean };
export const NAV: NavItem[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/pipeline", label: "Funil", icon: Columns3 },
  { to: "/inbox", label: "Conversas", icon: Inbox },
  { to: "/dialer", label: "Discador", icon: PhoneCall, full: true },
  { to: "/portal", label: "Pós-venda", icon: Headset },
  { to: "/indicacoes", label: "Indicações", icon: Gift, full: true },
  { to: "/treino", label: "Treino com IA", icon: GraduationCap, full: true },
  { to: "/equipe", label: "Equipe & metas", icon: Users, team: true },
];

const TOUR = [
  ["Bem-vindo à Alliar 👋", "Seu CRM feito para vender pelo WhatsApp. Vamos te mostrar tudo em 30 segundos."],
  ["Início", "Toda manhã mostramos os 3 negócios com mais chance de fechar hoje. Comece por eles."],
  ["Funil", "Seus clientes em colunas, do primeiro contato até o 'Ganho'. Arraste os cartões para avançar."],
  ["Conversas", "Seu WhatsApp aqui dentro, com respostas prontas e uma IA que sugere o que dizer."],
  ["Cobrar na hora", "Gere um PIX em 1 clique. Quando o cliente paga, o app apita e marca a venda como ganha."],
  ["Do seu jeito", "Trabalha sozinho ou com equipe? Prefere tela limpa ou completa? Troque no topo quando quiser."],
];

export function Shell({ children }: { children: ReactNode }) {
  const app = useApp();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [cmd, setCmd] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [tour, setTour] = useState(0);
  const items = NAV.filter((n) => (!n.full || app.view === "completo") && (!n.team || app.structure === "equipe"));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmd((o) => !o); return; }
      const t = e.target as HTMLElement;
      if (t.closest("input,textarea,[contenteditable],[role=dialog]")) return;
      const ids = app.leads.filter((l) => l.stage !== "ganho").map((l) => l.id);
      const i = app.selected ? ids.indexOf(app.selected) : -1;
      if (e.key === "j") app.select(ids[Math.min(i + 1, ids.length - 1)] ?? null);
      else if (e.key === "k") app.select(ids[Math.max(i - 1, 0)] ?? null);
      else if (!app.selected) return;
      else if (e.key === "1") window.dispatchEvent(new Event("alliar:pix"));
      else if (e.key === "2") { app.updateLead(app.selected, { stage: "contato" }); toast("Retorno agendado"); }
      else if (e.key === "3") { app.updateLead(app.selected, { stage: "ganho" }); beep(990); toast.success("Movido para Ganho"); }
      else if (e.key === " ") { e.preventDefault(); toast("Use o botão 'Resumo de voz' para gravar"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [app]);

  // Radar de proposta: alerta quando o cliente abre o orçamento
  useEffect(() => {
    const t = setTimeout(() => {
      const l = app.leads.find((x) => x.proposalOpen);
      if (l) { beep(520, 120); toast.info(`📡 ${l.name} está abrindo sua proposta agora`, { action: { label: "Abrir", onClick: () => app.select(l.id) } }); }
    }, 7000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3">
      <Link to="/" className="mb-4 flex items-center gap-2 px-2 pt-1">
        <span className="grid size-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">A</span>
        <span className="text-[15px] font-semibold tracking-tight">Alliar</span>
      </Link>
      <button onClick={() => setCmd(true)} className="mb-3 flex items-center gap-2 rounded-md border bg-background/50 px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent">
        <Search className="size-3.5" />Buscar ou comandar<kbd className="ml-auto">⌘K</kbd>
      </button>
      {items.map((n) => (
        <Link key={n.to} to={n.to} onClick={() => setMobile(false)}
          className={cn("flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            path === n.to && "bg-sidebar-accent font-medium text-sidebar-foreground")}>
          <n.icon className="size-4" />{n.label}
        </Link>
      ))}
      <div className="mt-auto space-y-1">
        {app.structure === "equipe" && (
          <Button variant="outline" size="sm" className="w-full justify-start border-destructive/40 text-destructive" onClick={() => { beep(440); toast.warning("SOS enviado: seu gestor foi chamado para ajudar"); }}>
            <LifeBuoy className="size-4" />SOS do vendedor
          </Button>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => setTour(1)}><HelpCircle className="size-4" />Rever tour</Button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r bg-sidebar md:block">{Sidebar}</aside>
      {mobile && <div className="fixed inset-0 z-40 bg-background/70 md:hidden" onClick={() => setMobile(false)}><aside className="h-full w-64 border-r bg-sidebar" onClick={(e) => e.stopPropagation()}>{Sidebar}</aside></div>}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur md:px-5">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobile(true)}><Menu className="size-4" /></Button>
          <Seg value={app.structure} opts={[["solo", "Solo"], ["equipe", "Equipe"]]} onChange={(v) => app.set({ structure: v as "solo" | "equipe" })} />
          <Seg value={app.view} opts={[["focado", "Focado"], ["completo", "Completo"]]} onChange={(v) => app.set({ view: v as "focado" | "completo" })} />
          <div className="ml-auto hidden items-center gap-1 text-[11px] text-muted-foreground lg:flex"><kbd>J</kbd><kbd>K</kbd> navegar · <kbd>1</kbd> PIX · <kbd>2</kbd> retorno · <kbd>3</kbd> ganho</div>
          <Button variant="ghost" size="icon" className="ml-auto lg:ml-2" onClick={() => app.set({ theme: app.theme === "dark" ? "light" : "dark" })}>
            {app.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <LeadSheet />
      <CommandDialog open={cmd} onOpenChange={setCmd}>
        <CommandInput placeholder="Buscar cliente, página ou ação…" />
        <CommandList>
          <CommandEmpty>Nada encontrado.</CommandEmpty>
          <CommandGroup heading="Ir para">
            {items.map((n) => <CommandItem key={n.to} onSelect={() => { nav({ to: n.to }); setCmd(false); }}><n.icon />{n.label}</CommandItem>)}
          </CommandGroup>
          <CommandGroup heading="Clientes">
            {app.leads.map((l) => <CommandItem key={l.id} value={`${l.name} ${l.company}`} onSelect={() => { app.select(l.id); setCmd(false); }}>{l.name}<span className="text-muted-foreground">· {l.company}</span></CommandItem>)}
          </CommandGroup>
          <CommandGroup heading="Ações">
            <CommandItem onSelect={() => { app.set({ theme: app.theme === "dark" ? "light" : "dark" }); setCmd(false); }}>Alternar tema</CommandItem>
            <CommandItem onSelect={() => { app.set({ structure: app.structure === "solo" ? "equipe" : "solo" }); setCmd(false); }}>Alternar Solo / Equipe</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <Dialog open={!app.tourDone || tour > 0} onOpenChange={(o) => { if (!o) { app.set({ tourDone: true }); setTour(0); } }}>
        <DialogContent className="max-w-sm">
          {(() => { const idx = Math.max(tour - 1, 0); const [t, d] = TOUR[idx]!; return (
            <div className="space-y-4">
              <div className="flex gap-1">{TOUR.map((_, i) => <span key={i} className={cn("h-1 flex-1 rounded-full", i <= idx ? "bg-primary" : "bg-muted")} />)}</div>
              <h2 className="text-lg font-semibold">{t}</h2>
              <p className="text-sm text-muted-foreground">{d}</p>
              <div className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => { app.set({ tourDone: true }); setTour(0); }}>Pular</Button>
                <Button size="sm" onClick={() => { if (idx === TOUR.length - 1) { app.set({ tourDone: true }); setTour(0); } else setTour(idx + 2); }}>{idx === TOUR.length - 1 ? "Começar" : "Próximo"}</Button>
              </div>
            </div>); })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Seg({ value, opts, onChange }: { value: string; opts: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-md border p-0.5 text-xs">
      {opts.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} className={cn("rounded px-2 py-1", value === v ? "bg-secondary font-medium" : "text-muted-foreground")}>{l}</button>
      ))}
    </div>
  );
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-xl font-semibold tracking-tight">{title}</h1>{sub && <p className="text-sm text-muted-foreground">{sub}</p>}</div>
      {children}
    </div>
  );
}
