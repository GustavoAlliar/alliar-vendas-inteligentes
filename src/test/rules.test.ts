import { describe, expect, it } from "vitest";
import { needsApproval, nextRoundRobin } from "@/lib/rules";
import { applyDiscount, crc16 } from "@/lib/pix";

describe("regras Alliar", () => {
  it("desconto acima de 15% exige aprovação só no Modo Equipe", () => {
    expect(needsApproval("equipe", 16)).toBe(true);
    expect(needsApproval("equipe", 15)).toBe(false);
    expect(needsApproval("solo", 40)).toBe(false);
  });
  it("calcula desconto", () => {
    expect(applyDiscount(1000, 10)).toBe(900);
  });
  it("round-robin volta ao primeiro", () => {
    expect(nextRoundRobin(["a", "b", "c"], 2)).toBe(0);
  });
  it("CRC16 do PIX segue CCITT-FALSE", () => {
    expect(crc16("123456789")).toBe("29B1");
  });
});
