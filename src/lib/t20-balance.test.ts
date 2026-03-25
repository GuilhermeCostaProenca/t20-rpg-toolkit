import { describe, expect, it } from "vitest";

import { analyzeT20Encounter } from "@/lib/t20-balance";

describe("analyzeT20Encounter - non-trivial compositions", () => {
  const party = [
    { level: 5, role: "tank" },
    { level: 5, role: "healer" },
    { level: 5, role: "striker" },
    { level: 5, role: "control" },
  ];

  it("applies swarm pressure modifier and explanation factors", () => {
    const swarm = Array.from({ length: 7 }, (_, index) => ({
      id: `swarm-${index}`,
      type: "enemy" as const,
      hpMax: 18,
      defenseFinal: 12,
      damageFormula: "1d4",
      name: `Minion ${index + 1}`,
    }));

    const result = analyzeT20Encounter(party, swarm);

    expect(result.factors.some((item) => item.includes("enxame"))).toBe(true);
    expect(result.confidence).not.toBe("high");
  });

  it("detects mixed elite composition as lower-confidence", () => {
    const mixed = [
      {
        id: "boss",
        type: "enemy" as const,
        hpMax: 320,
        defenseFinal: 27,
        damageFormula: "4d10+12",
        name: "Arconte da Ruina",
      },
      ...Array.from({ length: 4 }, (_, index) => ({
        id: `support-${index}`,
        type: "enemy" as const,
        hpMax: 34,
        defenseFinal: 14,
        damageFormula: "1d8+2",
        name: `Cultista ${index + 1}`,
      })),
    ];

    const result = analyzeT20Encounter(party, mixed);

    expect(result.factors.some((item) => item.includes("mista"))).toBe(true);
    expect(result.recommendation.includes("ajustes pequenos por rodada")).toBe(true);
    expect(result.confidence).toBe("low");
  });

  it("surfaces party profile axes in factors", () => {
    const profileParty = [
      { level: 5, role: "tank", className: "guerreiro" },
      { level: 5, role: "healer", className: "clerigo" },
      { level: 5, role: "striker", className: "ladino" },
      { level: 5, role: "controle", className: "mago" },
    ];
    const enemies = [
      {
        id: "enemy-1",
        type: "enemy" as const,
        hpMax: 85,
        defenseFinal: 18,
        damageFormula: "2d8+5",
        name: "Capitao",
      },
    ];

    const result = analyzeT20Encounter(profileParty, enemies);

    expect(result.partyProfile.frontliners).toBeGreaterThan(0);
    expect(result.partyProfile.sustain).toBeGreaterThan(0);
    expect(result.partyProfile.offense).toBeGreaterThan(0);
    expect(result.partyProfile.control).toBeGreaterThan(0);
    expect(result.partyProfile.diversity).toBe("high");
    expect(result.factors.some((item) => item.includes("Perfil do grupo"))).toBe(true);
  });
});
