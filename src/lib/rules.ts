// Regras de negócio puras (testáveis).
export const DISCOUNT_APPROVAL_THRESHOLD = 15; // % acima disso exige gestor no Modo Equipe

export function needsApproval(structure: "solo" | "equipe", discountPct: number) {
  return structure === "equipe" && discountPct > DISCOUNT_APPROVAL_THRESHOLD;
}

export const SLA_MINUTES = 5; // anti-vácuo: lead sem resposta em 5 min é redistribuído

export function nextRoundRobin(team: string[], lastIndex: number) {
  return (lastIndex + 1) % team.length;
}

export function beep(freq = 880, ms = 180) {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    o.start();
    o.stop(ctx.currentTime + ms / 1000);
  } catch { /* sem áudio */ }
}
