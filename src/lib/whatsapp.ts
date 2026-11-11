const RANK: Record<string, number> = { accepted: 0, sent: 1, delivered: 2, read: 3, failed: 4 };
export const statusRank = (s: string) => RANK[s] ?? 0;
/** Normaliza telefone brasileiro para E.164 sem "+". */
export function toE164(phone: string) {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 || d.length === 11 ? `55${d}` : d;
}
/** Chave para casar números com/sem 55 e com/sem o nono dígito: DDD + últimos 8 dígitos. */
export function phoneKey(phone: string) {
  const d = toE164(phone);
  const local = d.startsWith("55") ? d.slice(2) : d;
  return local.length >= 10 ? local.slice(0, 2) + local.slice(-8) : local;
}
