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

  it("considers sheet readiness (PV/PM) in party evaluation", () => {
    const restedParty = [
      { level: 6, role: "tank", pvCurrent: 60, pvMax: 70, pmCurrent: 18, pmMax: 20 },
      { level: 6, role: "healer", pvCurrent: 42, pvMax: 50, pmCurrent: 30, pmMax: 35 },
      { level: 6, role: "striker", pvCurrent: 48, pvMax: 55, pmCurrent: 12, pmMax: 14 },
    ];
    const drainedParty = [
      { level: 6, role: "tank", pvCurrent: 14, pvMax: 70, pmCurrent: 2, pmMax: 20 },
      { level: 6, role: "healer", pvCurrent: 9, pvMax: 50, pmCurrent: 4, pmMax: 35 },
      { level: 6, role: "striker", pvCurrent: 12, pvMax: 55, pmCurrent: 1, pmMax: 14 },
    ];
    const enemies = [
      { type: "enemy" as const, hpMax: 95, defenseFinal: 18, damageFormula: "2d8+4" },
      { type: "enemy" as const, hpMax: 80, defenseFinal: 16, damageFormula: "2d6+4" },
    ];

    const rested = analyzeT20Encounter(restedParty, enemies);
    const drained = analyzeT20Encounter(drainedParty, enemies);

    expect(rested.partyScore).toBeGreaterThan(drained.partyScore);
    expect(drained.factors.some((item) => item.includes("Leitura de ficha"))).toBe(true);
  });

  it("exposes explicit breakdown so scoring is not black-box", () => {
    const analyzed = analyzeT20Encounter(
      [
        { level: 4, role: "tank", pvCurrent: 38, pvMax: 44, pmCurrent: 4, pmMax: 8 },
        { level: 4, role: "healer", pvCurrent: 27, pvMax: 35, pmCurrent: 15, pmMax: 20 },
        { level: 4, role: "striker", pvCurrent: 20, pvMax: 32, pmCurrent: 6, pmMax: 12 },
      ],
      [
        { type: "enemy", hpMax: 110, defenseFinal: 19, damageFormula: "2d10+4" },
        { type: "enemy", hpMax: 65, defenseFinal: 15, damageFormula: "2d6+3" },
      ]
    );

    expect(analyzed.breakdown.party.baseLevelScore).toBeGreaterThan(0);
    expect(analyzed.breakdown.party.roleScore).toBeGreaterThan(0);
    expect(analyzed.breakdown.party.readinessModifier).toBeGreaterThanOrEqual(0.9);
    expect(analyzed.breakdown.party.readinessModifier).toBeLessThanOrEqual(1.1);
    expect(analyzed.breakdown.party.sheetCoverage).toBeGreaterThan(0);
    expect(analyzed.breakdown.threat.rawThreatScore).toBe(analyzed.threatScore);
    expect(analyzed.breakdown.ratio.effective).toBe(analyzed.pressureRatio);
  });

  it("exposes confidence score and actionable uncertainty signals", () => {
    const uncertain = analyzeT20Encounter(
      [
        { level: 5, role: "", className: "guerreiro", pvCurrent: null, pvMax: null, pmCurrent: null, pmMax: null },
        { level: 5, role: "", className: "arcanista", pvCurrent: null, pvMax: null, pmCurrent: null, pmMax: null },
      ],
      [{ type: "enemy", hpMax: null, defenseFinal: null, damageFormula: "" }]
    );

    expect(uncertain.confidenceScore).toBeLessThan(75);
    expect(uncertain.uncertaintySignals.length).toBeGreaterThan(0);
    expect(uncertain.uncertaintySignals.some((signal) => signal.code === "missing_enemy_stats")).toBe(true);
    expect(uncertain.uncertaintySignals.some((signal) => signal.code === "missing_roles")).toBe(true);
    expect(uncertain.dataGaps.severity).not.toBe("none");
    expect(uncertain.partySummary.length).toBeGreaterThan(0);
  });
});
