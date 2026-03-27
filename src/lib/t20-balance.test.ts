import { describe, expect, it } from "vitest";

import {
  analyzeLiveCombatPressure,
  analyzeT20Encounter,
  suggestLiveAdjustment,
  type LivePressureSnapshot,
} from "@/lib/t20-balance";

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

describe("analyzeLiveCombatPressure - resource-aware pressure", () => {
  it("escalates pressure when PM/SAN are critically low", () => {
    const pressure = analyzeLiveCombatPressure(
      [
        { kind: "CHARACTER", hpCurrent: 20, hpMax: 50 },
        { kind: "CHARACTER", hpCurrent: 16, hpMax: 50 },
        { kind: "NPC", hpCurrent: 40, hpMax: 40 },
        { kind: "NPC", hpCurrent: 38, hpMax: 40 },
      ],
      {
        total: 2,
        lowPm: 2,
        lowSan: 2,
        avgPmPercent: 20,
        avgSanPercent: 25,
      },
    );

    expect(pressure.state).toBe("critical");
    expect(pressure.factors.some((item) => item.includes("PM muito baixos"))).toBe(true);
    expect(pressure.factors.some((item) => item.includes("SAN do grupo em risco critico"))).toBe(true);
    expect(pressure.lowPmCount).toBe(2);
    expect(pressure.lowSanCount).toBe(2);
  });

  it("keeps compatibility when no resource snapshot is provided", () => {
    const pressure = analyzeLiveCombatPressure([
      { kind: "CHARACTER", hpCurrent: 45, hpMax: 50 },
      { kind: "CHARACTER", hpCurrent: 40, hpMax: 50 },
      { kind: "NPC", hpCurrent: 25, hpMax: 40 },
    ]);

    expect(pressure.avgPmPercent).toBeNull();
    expect(pressure.avgSanPercent).toBeNull();
    expect(pressure.lowPmCount).toBe(0);
    expect(pressure.lowSanCount).toBe(0);
  });
});

describe("suggestLiveAdjustment - resource-aware guidance", () => {
  function buildPressure(overrides: Partial<LivePressureSnapshot>): LivePressureSnapshot {
    return {
      state: "stable",
      playerCount: 4,
      hostileCount: 4,
      playerHpRatio: 0.7,
      hostileHpRatio: 0.7,
      avgPmPercent: 60,
      avgSanPercent: 60,
      lowPmCount: 0,
      lowSanCount: 0,
      downedPlayers: 0,
      downedHostiles: 0,
      countDelta: 0,
      summary: "Mesa sob controle.",
      recommendation: "placeholder",
      factors: [],
      ...overrides,
    };
  }

  it("adds explicit resource recovery action when pressure is critical and PM/SAN collapse", () => {
    const guide = suggestLiveAdjustment(
      buildPressure({
        state: "critical",
        avgPmPercent: 18,
        avgSanPercent: 22,
        lowPmCount: 3,
        lowSanCount: 2,
      }),
      "deadly"
    );

    expect(guide.posture).toBe("ease");
    expect(guide.actions.some((action) => action.includes("PM/SAN estao em colapso"))).toBe(true);
  });

  it("prioritizes resource caution in rising state even without numeric disadvantage", () => {
    const guide = suggestLiveAdjustment(
      buildPressure({
        state: "rising",
        countDelta: 1,
        avgPmPercent: 35,
        avgSanPercent: 45,
        lowPmCount: 1,
      }),
      "manageable"
    );

    expect(guide.posture).toBe("hold");
    expect(guide.actions.some((action) => action.includes("desgaste de PM/SAN"))).toBe(true);
  });

  it("prioritizes recovery when there are downed players in rising pressure", () => {
    const guide = suggestLiveAdjustment(
      buildPressure({
        state: "rising",
        downedPlayers: 1,
        avgPmPercent: 55,
        avgSanPercent: 60,
      }),
      "manageable"
    );

    expect(guide.posture).toBe("hold");
    expect(guide.actions.some((action) => action.includes("personagem caido"))).toBe(true);
  });

  it("reinforces stabilization before escalation in critical pressure with downed players", () => {
    const guide = suggestLiveAdjustment(
      buildPressure({
        state: "critical",
        downedPlayers: 2,
        avgPmPercent: 30,
        avgSanPercent: 35,
      }),
      "deadly"
    );

    expect(guide.posture).toBe("ease");
    expect(guide.actions.some((action) => action.includes("priorize estabilizacao/recuperacao"))).toBe(
      true
    );
  });
});
