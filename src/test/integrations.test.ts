import { describe, expect, it } from "vitest";
import { isValidCnpj, formatCnpj } from "@/lib/cnpj";
import { phoneKey, statusRank, toE164 } from "@/lib/whatsapp";
describe("cnpj", () => {
  it("aceita CNPJ válido", () => expect(isValidCnpj("19.131.243/0001-97")).toBe(true));
  it("rejeita dígito errado", () => expect(isValidCnpj("19131243000198")).toBe(false));
  it("formata", () => expect(formatCnpj("19131243000197")).toBe("19.131.243/0001-97"));
});
describe("whatsapp", () => {
  it("adiciona 55 a números brasileiros", () => expect(toE164("(11) 99999-0000")).toBe("5511999990000"));
  it("casa números com e sem nono dígito", () => expect(phoneKey("551199990000")).toBe(phoneKey("(11) 9 9999-0000")));
  it("status não regride de lida para enviada", () => expect(statusRank("sent")).toBeLessThan(statusRank("read")));
});
