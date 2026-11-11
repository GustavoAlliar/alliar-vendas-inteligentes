import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { cnpjDigits, isValidCnpj, type CnpjData } from "./cnpj";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const lookupCnpj = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { cnpj: string }) => ({ cnpj: cnpjDigits(String(d.cnpj ?? "")) }))
  .handler(async ({ data }): Promise<{ data: CnpjData | null; error: string | null }> => {
    if (!isValidCnpj(data.cnpj)) return { data: null, error: "CNPJ inválido" };
    try {
      const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${data.cnpj}`);
      if (r.ok) {
        const j: any = await r.json();
        return { error: null, data: {
          cnpj: data.cnpj, razao_social: j.razao_social ?? "", nome_fantasia: j.nome_fantasia ?? "",
          cnae: [j.cnae_fiscal, j.cnae_fiscal_descricao].filter(Boolean).join(" - "),
          endereco: [[j.descricao_tipo_de_logradouro, j.logradouro].filter(Boolean).join(" "), j.numero, j.complemento, j.bairro, `${j.municipio ?? ""}/${j.uf ?? ""}`, j.cep].filter(Boolean).join(", "),
          socios: (j.qsa ?? []).map((s: any) => ({ nome: s.nome_socio ?? "", qualificacao: s.qualificacao_socio ?? "" })),
          telefone: j.ddd_telefone_1 ?? "", email: j.email ?? "",
        } };
      }
      if (r.status === 404) return { data: null, error: "CNPJ não encontrado" };
      const w = await fetch(`https://receitaws.com.br/v1/cnpj/${data.cnpj}`);
      const j: any = await w.json();
      if (j.status === "ERROR") return { data: null, error: j.message ?? "CNPJ não encontrado" };
      return { error: null, data: {
        cnpj: data.cnpj, razao_social: j.nome ?? "", nome_fantasia: j.fantasia ?? "",
        cnae: j.atividade_principal?.[0] ? `${j.atividade_principal[0].code} - ${j.atividade_principal[0].text}` : "",
        endereco: [j.logradouro, j.numero, j.complemento, j.bairro, `${j.municipio ?? ""}/${j.uf ?? ""}`, j.cep].filter(Boolean).join(", "),
        socios: (j.qsa ?? []).map((s: any) => ({ nome: s.nome ?? "", qualificacao: s.qual ?? "" })),
        telefone: j.telefone ?? "", email: j.email ?? "",
      } };
    } catch (e) {
      console.error("cnpj", e);
      return { data: null, error: "Consulta de CNPJ indisponível no momento" };
    }
  });
