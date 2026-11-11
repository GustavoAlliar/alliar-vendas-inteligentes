export const cnpjDigits = (v: string) => v.replace(/\D/g, "");
/** Valida os dígitos verificadores do CNPJ. */
export function isValidCnpj(v: string) {
  const d = cnpjDigits(v);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const calc = (len: number) => {
    const w = len === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
    const s = w.reduce((a, x, i) => a + x * Number(d[i]), 0) % 11;
    return s < 2 ? 0 : 11 - s;
  };
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13]);
}
export const formatCnpj = (v: string) => cnpjDigits(v).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
export type CnpjData = { cnpj: string; razao_social: string; nome_fantasia: string; cnae: string; endereco: string; socios: { nome: string; qualificacao: string }[]; telefone: string; email: string };
