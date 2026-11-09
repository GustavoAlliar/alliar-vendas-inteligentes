import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Stage = "novo" | "contato" | "proposta" | "negociacao" | "ganho";
export const STAGES: { id: Stage; label: string }[] = [
  { id: "novo", label: "Novos" },
  { id: "contato", label: "Em contato" },
  { id: "proposta", label: "Proposta enviada" },
  { id: "negociacao", label: "Negociação" },
  { id: "ganho", label: "Ganho" },
];
export type Event = { at: string; kind: "msg" | "call" | "proposta" | "audio" | "pix" | "nota"; text: string };
export type Lead = {
  id: string; name: string; company: string; phone: string; value: number;
  stage: Stage; temp: "quente" | "morno" | "frio"; priority: "alta" | "média" | "baixa";
  owner: string; lastContact: string; proposalOpen?: boolean; timeline: Event[];
};

const seed: Lead[] = [
  ["Mariana Costa", "Clínica Sorriso", 4800, "negociacao", "quente", "alta", "Você"],
  ["Rafael Lima", "Lima Contabilidade", 2200, "proposta", "quente", "alta", "Ana"],
  ["Juliana Alves", "Estúdio Ju Pilates", 1500, "contato", "morno", "média", "Você"],
  ["Carlos Souza", "Souza Materiais", 9800, "proposta", "morno", "alta", "Bruno"],
  ["Patrícia Rocha", "Doce Rocha Confeitaria", 750, "novo", "frio", "baixa", "Ana"],
  ["Diego Martins", "Martins Auto Peças", 3600, "contato", "quente", "média", "Bruno"],
  ["Fernanda Dias", "FD Arquitetura", 6200, "negociacao", "morno", "alta", "Você"],
  ["Lucas Ferreira", "Academia Fit+", 2900, "novo", "morno", "média", "Ana"],
  ["Beatriz Nunes", "Pet Shop Amigo", 1200, "ganho", "quente", "baixa", "Você"],
].map(([name, company, value, stage, temp, priority, owner], i) => ({
  id: `l${i + 1}`, name: name as string, company: company as string, value: value as number,
  stage: stage as Stage, temp: temp as Lead["temp"], priority: priority as Lead["priority"], owner: owner as string,
  phone: `(11) 9${8000 + i * 137}-${1000 + i * 311}`, lastContact: `${i + 1}d atrás`,
  proposalOpen: i === 1,
  timeline: [
    { at: "há 5 dias", kind: "msg", text: "Primeiro contato pelo WhatsApp (anúncio Instagram)" },
    { at: "há 3 dias", kind: "call", text: "Ligação de 6 min — interesse no plano anual" },
    { at: "há 1 dia", kind: "proposta", text: "Proposta enviada · aberta 2x" },
  ],
}));

type Settings = { structure: "solo" | "equipe"; view: "focado" | "completo"; theme: "dark" | "light"; tourDone: boolean };
type Ctx = Settings & {
  set: (p: Partial<Settings>) => void;
  leads: Lead[];
  updateLead: (id: string, p: Partial<Lead>) => void;
  addEvent: (id: string, e: Omit<Event, "at">) => void;
  selected: string | null; select: (id: string | null) => void;
};
const C = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Settings>({ structure: "solo", view: "focado", theme: "dark", tourDone: true });
  const [leads, setLeads] = useState<Lead[]>(seed);
  const [selected, select] = useState<string | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("alliar:settings");
      setS(raw ? JSON.parse(raw) : { structure: "solo", view: "focado", theme: "dark", tourDone: false });
      const l = localStorage.getItem("alliar:leads");
      if (l) setLeads(JSON.parse(l));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", s.theme === "dark");
    localStorage.setItem("alliar:settings", JSON.stringify(s));
  }, [s]);
  useEffect(() => { localStorage.setItem("alliar:leads", JSON.stringify(leads)); }, [leads]);
  const updateLead = (id: string, p: Partial<Lead>) => setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...p } : l)));
  const addEvent = (id: string, e: Omit<Event, "at">) =>
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, timeline: [...l.timeline, { ...e, at: "agora" }] } : l)));
  return (
    <C.Provider value={{ ...s, set: (p) => setS((o) => ({ ...o, ...p })), leads, updateLead, addEvent, selected, select }}>
      {children}
    </C.Provider>
  );
}
export function useApp() {
  const c = useContext(C);
  if (!c) throw new Error("useApp fora do AppProvider");
  return c;
}
