import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Msg = z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) });
const Input = z.object({
  task: z.enum(["copilot", "teleprompter", "roleplay", "grade", "summary"]),
  context: z.string().max(4000).default(""),
  messages: z.array(Msg).max(40).default([]),
});

const SYSTEM: Record<z.infer<typeof Input>["task"], string> = {
  copilot: "Você é o copiloto de vendas da Alliar no WhatsApp (Brasil). Leia a conversa e escreva UMA resposta curta, natural e em português do Brasil que o vendedor pode enviar ao cliente, quebrando objeções com empatia e conduzindo ao fechamento (ex.: PIX). Retorne só a mensagem.",
  teleprompter: "Você é um teleprompter de vendas ao vivo para ligações no Brasil. Com base no contexto do cliente e nas anotações da chamada, retorne 3 a 5 falas curtas numeradas que o vendedor deve dizer agora (abertura, descoberta, valor, objeção, fechamento). Português do Brasil, sem introdução.",
  roleplay: "Você está interpretando um cliente brasileiro difícil numa conversa de WhatsApp para treinar um vendedor. Persona descrita no contexto. Responda como o cliente, em 1-2 frases, mantendo a resistência realista. Nunca saia do personagem.",
  grade: "Você avalia vendedores. Analise a conversa de treino (as mensagens 'user' são do vendedor). Responda exatamente no formato:\nNOTA: <0-100>\nPONTOS FORTES: <1 frase>\nMELHORAR: <1 frase>\nDICA: <1 frase>. Português do Brasil.",
  summary: "Você preenche CRM. A partir da transcrição de áudio de um vendedor, escreva um resumo objetivo em português com: Resumo; Interesse/temperatura; Próximo passo (com data/hora se citada); Valores ou produtos citados. Use tópicos curtos.",
};

export const aiAssist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { runAi } = await import("./ai.server");
    const msgs = [...data.messages];
    if (data.context) msgs.unshift({ role: "user", content: `Contexto: ${data.context}` });
    if (!msgs.length || msgs.at(-1)!.role !== "user") msgs.push({ role: "user", content: "Continue." });
    try {
      return { text: await runAi(SYSTEM[data.task], msgs), error: null as string | null };
    } catch (e) {
      console.error("aiAssist", e);
      return { text: "", error: e instanceof Error ? e.message : "Falha na IA" };
    }
  });
