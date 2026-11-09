// Gera payload PIX "Copia e Cola" (BR Code / EMV) estático com CRC16-CCITT.
function f(id: string, v: string) {
  return id + String(v.length).padStart(2, "0") + v;
}
export function crc16(s: string) {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
export function pixPayload(opts: { key: string; name: string; city: string; amount: number; txid: string }) {
  const clean = (s: string, n: number) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "").slice(0, n);
  const body =
    f("00", "01") +
    f("26", f("00", "br.gov.bcb.pix") + f("01", opts.key)) +
    f("52", "0000") +
    f("53", "986") +
    f("54", opts.amount.toFixed(2)) +
    f("58", "BR") +
    f("59", clean(opts.name, 25)) +
    f("60", clean(opts.city, 15)) +
    f("62", f("05", clean(opts.txid, 25).replace(/ /g, "") || "***")) +
    "6304";
  return body + crc16(body);
}
export function applyDiscount(price: number, pct: number) {
  const p = Math.min(Math.max(pct, 0), 100);
  return Math.round(price * (1 - p / 100) * 100) / 100;
}
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
