import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const RUN = "X-Lovable-AIG-Run-ID";

/** Runs one Lovable AI Gateway call (streamed server-side) and returns the final text. */
export async function runAi(system: string, messages: ModelMessage[]): Promise<string> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("IA não configurada");
  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const h = new Headers(init?.headers);
      if (runId) h.set(RUN, runId);
      const r = await fetch(input, { ...init, headers: h });
      runId ??= r.headers.get(RUN) ?? undefined;
      if (r.status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos no seu workspace.");
      if (r.status === 429) throw new Error("Muitas solicitações à IA. Aguarde alguns segundos.");
      if (r.status === 403) throw new Error("O uso de IA está bloqueado para este workspace.");
      return r;
    },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: system,
    messages,
    maxRetries: 0,
    onError: ({ error }) => console.error("ai stream", error),
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false, include: ["reasoning.encrypted_content"] } },
  });
  const text = (await result.text).trim();
  if (!text) throw new Error("A IA não retornou resposta");
  return text;
}
