type BalanceCharacterInput = {
  level: number;
  role?: string | null;
  className?: string | null;
  pvCurrent?: number | null;
  pvMax?: number | null;
  pmCurrent?: number | null;
  pmMax?: number | null;
};

type BalanceNpcInput = {
  id?: string | null;
  type?: "npc" | "enemy";
  hpMax?: number | null;
  defenseFinal?: number | null;
  damageFormula?: string | null;
  name?: string | null;
};

type BalanceRating = "trivial" | "manageable" | "risky" | "deadly";
type BalanceConfidence = "low" | "medium" | "high";
type LivePressureState = "stable" | "rising" | "critical";
type BalanceUncertaintySignal = {
  code:
    | "no_party"
    | "no_enemies"
    | "missing_enemy_stats"
    | "missing_roles"
    | "unclear_party_roles"
    | "missing_sheet_data"
    | "volatile_composition";
  impact: "low" | "medium" | "high";
  message: string;
  action: string;
};

export type EncounterBalanceSnapshot = {
  rating: BalanceRating;
  confidence: BalanceConfidence;
  partyScore: number;
  threatScore: number;
  pressureRatio: number;
  avgPartyLevel: number;
  enemyCount: number;
  partyProfile: {
    frontliners: number;
    sustain: number;
    offense: number;
    control: number;
    unknown: number;
    diversity: "low" | "medium" | "high";
  };
  breakdown: {
    party: {
      baseLevelScore: number;
      roleScore: number;
      diversityBonus: number;
      readinessModifier: number;
      sheetCoverage: number;
      finalScore: number;
    };
    threat: {
      rawThreatScore: number;
      compositionBonus: number;
      profile: "standard" | "swarm" | "elite" | "mixed" | "soloBoss";
      strongestShare: number;
      finalScore: number;
    };
    ratio: {
      base: number;
      effective: number;
    };
  };
  confidenceScore: number;
  uncertaintySignals: BalanceUncertaintySignal[];
  partySummary: string;
  dataGaps: {
    missingRoles: number;
    missingSheets: number;
    missingEnemyStats: number;
    severity: "none" | "attention" | "critical";
  };
  factors: string[];
  recommendation: string;
};

type LiveCombatantInput = {
  id?: string | null;
  kind?: string | null;
  name?: string | null;
  hpCurrent?: number | null;
  hpMax?: number | null;
};

export type LivePartyResourceSnapshot = {
  total: number;
  lowPm: number;
  lowSan: number;
  avgPmPercent: number;
  avgSanPercent: number;
};

export type LivePressureSnapshot = {
  state: LivePressureState;
  playerCount: number;
  hostileCount: number;
  playerHpRatio: number;
  hostileHpRatio: number;
  avgPmPercent: number | null;
  avgSanPercent: number | null;
  lowPmCount: number;
  lowSanCount: number;
  downedPlayers: number;
  downedHostiles: number;
  countDelta: number;
  summary: string;
  recommendation: string;
  factors: string[];
};

export type LiveAdjustmentGuide = {
  title: string;
  posture: "hold" | "ease" | "escalate";
  actions: string[];
};

export type PublicScenePacingGuide = {
  label: string;
  posture: "hold" | "ease" | "escalate";
  guidance: string;
};

function normalizeRole(role?: string | null) {
  return role?.trim().toLowerCase() ?? "";
}

function normalizeClassName(className?: string | null) {
  return className?.trim().toLowerCase() ?? "";
}

function averageDiceFormula(formula?: string | null) {
  if (!formula?.trim()) return 0;

  const normalized = formula.replace(/\s+/g, "").toLowerCase();
  const match = normalized.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) return 0;

  const diceCount = Number(match[1] ?? 0);
  const diceFaces = Number(match[2] ?? 0);
  const flatBonus = Number(match[3] ?? 0);
  if (!diceCount || !diceFaces) return 0;

  return diceCount * ((diceFaces + 1) / 2) + flatBonus;
}

export function estimateEnemyUnitScore(enemy: BalanceNpcInput) {
  const hp = Math.max(enemy.hpMax ?? 0, 0);
  const defense = Math.max(enemy.defenseFinal ?? 10, 0);
  const damage = Math.max(averageDiceFormula(enemy.damageFormula), 0);
  const durabilityScore = hp / 8;
  const defenseScore = defense / 3;
  const damageScore = damage * 1.75;
  return Number((durabilityScore + defenseScore + damageScore).toFixed(1));
}

function getRoleWeight(role?: string | null) {
  const normalized = normalizeRole(role);
  if (!normalized) return 0;
  if (/(tank|guardiao|frente|defensor)/.test(normalized)) return 2;
  if (/(caster|arcan|clerig|suporte|healer|cura)/.test(normalized)) return 2;
  if (/(striker|dano|assassin|atacante)/.test(normalized)) return 1.5;
  if (/(leader|lider|controle|tatico)/.test(normalized)) return 1;
  return 0.5;
}

function getRoleSignals(character: BalanceCharacterInput) {
  const role = normalizeRole(character.role);
  const className = normalizeClassName(character.className);
  const source = `${role} ${className}`;

  const frontliner =
    /(tank|guardiao|frente|defensor|guerreir|paladin|barbar)/.test(source);
  const sustain =
    /(suporte|healer|cura|clerig|sacerdot|druida|bardo)/.test(source);
  const offense =
    /(striker|dano|assassin|atacante|ladin|caçad|cacad|arcanista|feiticeir|mago)/.test(source);
  const control =
    /(controle|tatico|leader|lider|arcan|mago|brux)/.test(source);

  return { frontliner, sustain, offense, control };
}

function weakenConfidence(confidence: BalanceConfidence): BalanceConfidence {
  if (confidence === "high") return "medium";
  return "low";
}

function confidenceFromScore(score: number): BalanceConfidence {
  if (score >= 75) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function ratio(current?: number | null, max?: number | null) {
  const safeMax = Math.max(max ?? 0, 0);
  const safeCurrent = Math.max(current ?? 0, 0);
  if (safeMax <= 0) return null;
  return Math.min(safeCurrent / safeMax, 1);
}

function averageHpRatio(combatants: LiveCombatantInput[]) {
  if (combatants.length === 0) return 0;

  const ratios = combatants.map((combatant) => {
    const hpMax = Math.max(combatant.hpMax ?? 0, 0);
    const hpCurrent = Math.max(combatant.hpCurrent ?? 0, 0);
    if (hpMax <= 0) return 0;
    return Math.min(hpCurrent / hpMax, 1);
  });

  return ratios.reduce((total, ratio) => total + ratio, 0) / ratios.length;
}

export function analyzeT20Encounter(
  characters: BalanceCharacterInput[],
  npcs: BalanceNpcInput[]
): EncounterBalanceSnapshot {
  const enemies = npcs.filter((npc) => npc.type === "enemy");
  const partyCount = characters.length;
  const avgPartyLevel =
    partyCount > 0
      ? characters.reduce((total, character) => total + Math.max(character.level || 1, 1), 0) /
        partyCount
      : 0;

  let frontliners = 0;
  let sustain = 0;
  let offense = 0;
  let control = 0;
  let unknown = 0;

  let baseLevelScore = 0;
  let roleScore = 0;
  characters.forEach((character) => {
    baseLevelScore += Math.max(character.level || 1, 1) * 10;
    roleScore += getRoleWeight(character.role);
    const signals = getRoleSignals(character);

    if (signals.frontliner) frontliners += 1;
    if (signals.sustain) sustain += 1;
    if (signals.offense) offense += 1;
    if (signals.control) control += 1;
    if (!signals.frontliner && !signals.sustain && !signals.offense && !signals.control) {
      unknown += 1;
    }

  });
  const partyScore = baseLevelScore + roleScore;

  const activeAxes = [frontliners, sustain, offense, control].filter((value) => value > 0).length;
  const diversity: "low" | "medium" | "high" =
    activeAxes >= 4 ? "high" : activeAxes >= 2 ? "medium" : "low";
  const diversityBonusPerCharacter = diversity === "high" ? 3 : diversity === "medium" ? 1.5 : 0;
  const diversityBonus = diversityBonusPerCharacter * partyCount;
  let profileAdjustedPartyScore = partyScore + diversityBonus;

  const hpRatios = characters
    .map((character) => ratio(character.pvCurrent, character.pvMax))
    .filter((value): value is number => value !== null);
  const pmRatios = characters
    .map((character) => ratio(character.pmCurrent, character.pmMax))
    .filter((value): value is number => value !== null);
  const avgHpRatio =
    hpRatios.length > 0 ? hpRatios.reduce((total, value) => total + value, 0) / hpRatios.length : null;
  const avgPmRatio =
    pmRatios.length > 0 ? pmRatios.reduce((total, value) => total + value, 0) / pmRatios.length : null;
  const sheetCoverage =
    partyCount > 0
      ? characters.filter(
          (character) =>
            ratio(character.pvCurrent, character.pvMax) !== null ||
            ratio(character.pmCurrent, character.pmMax) !== null
        ).length / partyCount
      : 0;

  let readinessModifier = 1;
  if (avgHpRatio !== null) {
    readinessModifier += (avgHpRatio - 0.6) * 0.2;
  }
  if (avgPmRatio !== null) {
    readinessModifier += (avgPmRatio - 0.5) * 0.1;
  }
  readinessModifier = Math.min(1.1, Math.max(0.9, readinessModifier));
  profileAdjustedPartyScore *= readinessModifier;

  const threatScore = enemies.reduce((total, enemy) => {
    return total + estimateEnemyUnitScore(enemy);
  }, 0);

  const pressureRatio = profileAdjustedPartyScore > 0 ? threatScore / profileAdjustedPartyScore : 0;

  const enemyUnitScores = enemies
    .map((enemy) => estimateEnemyUnitScore(enemy))
    .sort((left, right) => right - left);
  const strongestEnemyScore = enemyUnitScores[0] ?? 0;
  const weakestEnemyScore = enemyUnitScores[enemyUnitScores.length - 1] ?? 0;
  const averageEnemyScore =
    enemyUnitScores.length > 0
      ? enemyUnitScores.reduce((total, score) => total + score, 0) / enemyUnitScores.length
      : 0;
  const strongestShare = threatScore > 0 ? strongestEnemyScore / threatScore : 0;

  const hasSwarmProfile =
    partyCount > 0 &&
    enemies.length >= Math.max(4, partyCount + 2) &&
    averageEnemyScore > 0 &&
    averageEnemyScore <= 12;
  const hasEliteProfile =
    enemies.length > 0 && strongestEnemyScore >= 24 && strongestShare >= 0.5;
  const hasMixedProfile =
    enemies.length >= 4 &&
    strongestEnemyScore >= 24 &&
    weakestEnemyScore > 0 &&
    strongestEnemyScore / weakestEnemyScore >= 2.2;
  const hasSoloBossProfile = enemies.length === 1 && strongestEnemyScore >= 30;

  let ratioModifier = 0;
  if (hasSwarmProfile) ratioModifier += 0.08;
  if (hasEliteProfile) ratioModifier += 0.1;
  if (hasMixedProfile) ratioModifier += 0.08;

  const effectivePressureRatio = pressureRatio + ratioModifier;

  let rating: BalanceRating = "manageable";
  if (effectivePressureRatio < 0.55) rating = "trivial";
  else if (effectivePressureRatio < 0.95) rating = "manageable";
  else if (effectivePressureRatio < 1.3) rating = "risky";
  else rating = "deadly";

  const factors: string[] = [];
  if (partyCount === 0) {
    factors.push("Sem personagens suficientes para leitura confiavel.");
  } else {
    factors.push(`${partyCount} personagens com nivel medio ${avgPartyLevel.toFixed(1)}.`);
    factors.push(
      `Perfil do grupo: frente ${frontliners}, suporte ${sustain}, ofensiva ${offense}, controle ${control}.`
    );
  }
  if (avgHpRatio !== null || avgPmRatio !== null) {
    const hpLabel = avgHpRatio !== null ? `${Math.round(avgHpRatio * 100)}%` : "n/d";
    const pmLabel = avgPmRatio !== null ? `${Math.round(avgPmRatio * 100)}%` : "n/d";
    factors.push(`Leitura de ficha: PV medio ${hpLabel}, PM medio ${pmLabel}.`);
  }

  if (enemies.length === 0) {
    factors.push("Nenhuma ameaca do tipo enemy cadastrada nesta campanha.");
  } else {
    factors.push(`${enemies.length} ameacas hostis consideradas na leitura.`);
  }

  const missingEnemyStats = enemies.filter(
    (enemy) => !enemy.hpMax || !enemy.defenseFinal || !enemy.damageFormula?.trim()
  ).length;
  if (missingEnemyStats > 0) {
    factors.push(`${missingEnemyStats} ameacas com dados incompletos reduzem a confianca.`);
  }

  const lowRoleSignal = characters.filter((character) => !character.role?.trim()).length;
  if (lowRoleSignal > 0) {
    factors.push(`${lowRoleSignal} personagens sem funcao registrada deixam a leitura menos precisa.`);
  }
  if (sustain === 0 && partyCount > 0) {
    factors.push("Grupo sem sinal forte de suporte/cura; desgaste pode escalar mais rapido.");
  }
  if (frontliners === 0 && partyCount > 0) {
    factors.push("Grupo sem frente clara; combate tende a punir posicionamento e economia de acao.");
  }
  if (unknown > 0) {
    factors.push(`${unknown} personagem(ns) sem papel legivel no modelo atual.`);
  }
  const missingSheetSignal = characters.filter(
    (character) => ratio(character.pvCurrent, character.pvMax) === null && ratio(character.pmCurrent, character.pmMax) === null
  ).length;
  if (missingSheetSignal > 0) {
    factors.push(`${missingSheetSignal} personagem(ns) sem dados de PV/PM na ficha para leitura do grupo.`);
  }

  if (hasSwarmProfile) {
    factors.push("Composicao em enxame: muitas ameacas leves elevam economia de acao hostil.");
  }
  if (hasEliteProfile) {
    factors.push("Composicao de elite: uma ameaca concentra grande parte da pressao total.");
  }
  if (hasMixedProfile) {
    factors.push("Composicao mista (elite + base): encontro tende a oscilar mais entre picos de risco.");
  }
  if (hasSoloBossProfile) {
    factors.push("Boss solo: leitura de risco depende fortemente da economia de acao da mesa.");
  }

  const uncertaintySignals: BalanceUncertaintySignal[] = [];
  let confidenceScore = 100;

  if (partyCount === 0) {
    confidenceScore -= 70;
    uncertaintySignals.push({
      code: "no_party",
      impact: "high",
      message: "Nao ha personagens suficientes para ler poder real do grupo.",
      action: "Cadastre os personagens da campanha para destravar leitura confiavel.",
    });
  }

  if (enemies.length === 0) {
    confidenceScore -= 60;
    uncertaintySignals.push({
      code: "no_enemies",
      impact: "high",
      message: "Nao ha ameacas hostis para comparar com o grupo.",
      action: "Cadastre ao menos uma ameaca do tipo enemy para calcular risco.",
    });
  }

  if (missingEnemyStats > 0) {
    confidenceScore -= Math.min(missingEnemyStats * 12, 36);
    uncertaintySignals.push({
      code: "missing_enemy_stats",
      impact: missingEnemyStats >= 2 ? "high" : "medium",
      message: `${missingEnemyStats} ameaca(s) sem HP/DEF/dano completos.`,
      action: "Preencha HP maximo, defesa final e formula de dano das ameacas usadas.",
    });
  }

  if (lowRoleSignal > 0) {
    confidenceScore -= Math.min(lowRoleSignal * 8, 24);
    uncertaintySignals.push({
      code: "missing_roles",
      impact: lowRoleSignal >= 2 ? "medium" : "low",
      message: `${lowRoleSignal} personagem(ns) sem funcao registrada.`,
      action: "Defina a funcao do personagem (frente, suporte, ofensiva ou controle).",
    });
  }

  if (unknown >= Math.ceil(Math.max(1, partyCount) / 2) && partyCount > 0) {
    confidenceScore -= 12;
    uncertaintySignals.push({
      code: "unclear_party_roles",
      impact: "medium",
      message: "Boa parte do grupo nao foi reconhecida no perfil atual.",
      action: "Revise funcao e classe para o app reconhecer o perfil tatico do grupo.",
    });
  }

  if (missingSheetSignal > 0) {
    confidenceScore -= missingSheetSignal === partyCount ? 12 : 6;
    uncertaintySignals.push({
      code: "missing_sheet_data",
      impact: missingSheetSignal === partyCount ? "medium" : "low",
      message: `${missingSheetSignal} personagem(ns) sem dados de PV/PM para leitura de prontidao.`,
      action: "Atualize as fichas com PV/PM atuais para refinar o score de grupo.",
    });
  }

  if (hasMixedProfile || hasSoloBossProfile || hasEliteProfile || hasSwarmProfile) {
    confidenceScore -= hasMixedProfile ? 12 : 8;
    uncertaintySignals.push({
      code: "volatile_composition",
      impact: hasMixedProfile || hasSoloBossProfile ? "medium" : "low",
      message: "Composicao hostil com volatilidade acima do padrao (elite, enxame, mista ou boss solo).",
      action: "Use ajustes graduais por rodada e valide a pressao em campo durante a cena.",
    });
  }

  confidenceScore = Math.max(0, Math.min(100, confidenceScore));
  let confidence: BalanceConfidence = confidenceFromScore(confidenceScore);
  if (hasMixedProfile) {
    confidence = "low";
  } else if ((hasSwarmProfile || hasEliteProfile || hasSoloBossProfile) && confidence === "high") {
    confidence = "medium";
  }
  if (confidence === "high" && uncertaintySignals.some((signal) => signal.impact === "high")) {
    confidence = weakenConfidence(confidence);
  }

  const readinessLabel =
    avgHpRatio === null && avgPmRatio === null
      ? "prontidao desconhecida"
      : (avgHpRatio ?? 0) <= 0.45
        ? "grupo desgastado"
        : (avgHpRatio ?? 0) >= 0.75 && (avgPmRatio === null || avgPmRatio >= 0.6)
          ? "grupo pronto para pressao"
          : "prontidao moderada";
  const profileLabel =
    partyCount === 0
      ? "sem grupo definido"
      : frontliners === 0
        ? "sem frente clara"
        : sustain === 0
          ? "suporte fragil"
          : diversity === "high"
            ? "perfil equilibrado"
            : "perfil parcial";
  const partySummary =
    partyCount === 0 ? "Sem grupo suficiente para leitura resumida." : `${profileLabel}, ${readinessLabel}.`;

  const dataGapScore =
    missingEnemyStats * 2 +
    lowRoleSignal +
    (missingSheetSignal === partyCount && partyCount > 0 ? 2 : missingSheetSignal > 0 ? 1 : 0);
  const gapSeverity: "none" | "attention" | "critical" =
    partyCount === 0 || enemies.length === 0 || dataGapScore >= 4
      ? "critical"
      : dataGapScore > 0
        ? "attention"
        : "none";

  let recommendation = "Composicao em faixa jogavel para a campanha.";
  if (rating === "trivial") {
    recommendation = "Aumente pressao hostil, quantidade de ameacas ou dano medio para evitar combate frouxo.";
  } else if (rating === "risky") {
    recommendation = "Encontro ja pressiona bem; revise economia de acao e saidas de cura antes da mesa.";
  } else if (rating === "deadly") {
    recommendation = "Revise imediatamente HP, dano ou numero de ameacas para evitar um pico punitivo.";
  }
  if (hasMixedProfile) {
    recommendation += " Como a composicao e mista, prefira ajustes pequenos por rodada em vez de mudancas bruscas.";
  } else if (hasSwarmProfile) {
    recommendation += " Controle a economia de acao (menos corpos ou menos acoes secundarias) antes de mexer em HP.";
  } else if (hasEliteProfile) {
    recommendation += " Se precisar aliviar, reduza primeiro a ameaca principal em vez de remover varias unidades menores.";
  } else if (hasSoloBossProfile) {
    recommendation += " Boss solo pede atencao a cobertura, objetivo e acoes lendarias caseiras para manter tensao sem all-in.";
  }

  return {
    rating,
    confidence,
    partyScore: Number(profileAdjustedPartyScore.toFixed(1)),
    threatScore: Number(threatScore.toFixed(1)),
    pressureRatio: Number(effectivePressureRatio.toFixed(2)),
    avgPartyLevel: Number(avgPartyLevel.toFixed(1)),
    enemyCount: enemies.length,
    partyProfile: {
      frontliners,
      sustain,
      offense,
      control,
      unknown,
      diversity,
    },
    breakdown: {
      party: {
        baseLevelScore: Number(baseLevelScore.toFixed(1)),
        roleScore: Number(roleScore.toFixed(1)),
        diversityBonus: Number(diversityBonus.toFixed(1)),
        readinessModifier: Number(readinessModifier.toFixed(2)),
        sheetCoverage: Number(sheetCoverage.toFixed(2)),
        finalScore: Number(profileAdjustedPartyScore.toFixed(1)),
      },
      threat: {
        rawThreatScore: Number(threatScore.toFixed(1)),
        compositionBonus: Number(ratioModifier.toFixed(2)),
        profile: hasMixedProfile
          ? "mixed"
          : hasSoloBossProfile
            ? "soloBoss"
            : hasEliteProfile
              ? "elite"
              : hasSwarmProfile
                ? "swarm"
                : "standard",
        strongestShare: Number(strongestShare.toFixed(2)),
        finalScore: Number(threatScore.toFixed(1)),
      },
      ratio: {
        base: Number(pressureRatio.toFixed(2)),
        effective: Number(effectivePressureRatio.toFixed(2)),
      },
    },
    confidenceScore,
    uncertaintySignals,
    partySummary,
    dataGaps: {
      missingRoles: lowRoleSignal,
      missingSheets: missingSheetSignal,
      missingEnemyStats,
      severity: gapSeverity,
    },
    factors,
    recommendation,
  };
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function analyzeLiveCombatPressure(
  combatants: LiveCombatantInput[],
  resources?: LivePartyResourceSnapshot | null,
): LivePressureSnapshot {
  const players = combatants.filter((combatant) => combatant.kind === "CHARACTER");
  const hostiles = combatants.filter((combatant) => combatant.kind !== "CHARACTER");

  const playerHpRatio = averageHpRatio(players);
  const hostileHpRatio = averageHpRatio(hostiles);
  const downedPlayers = players.filter((combatant) => (combatant.hpCurrent ?? 0) <= 0).length;
  const downedHostiles = hostiles.filter((combatant) => (combatant.hpCurrent ?? 0) <= 0).length;
  const countDelta = players.length - hostiles.length;
  const hasResourceSnapshot = Boolean(resources && resources.total > 0);
  const avgPmPercent = hasResourceSnapshot ? clampPercent(resources!.avgPmPercent) : null;
  const avgSanPercent = hasResourceSnapshot ? clampPercent(resources!.avgSanPercent) : null;
  const lowPmCount = hasResourceSnapshot ? Math.max(0, resources!.lowPm) : 0;
  const lowSanCount = hasResourceSnapshot ? Math.max(0, resources!.lowSan) : 0;
  const lowPmRatio =
    hasResourceSnapshot && resources!.total > 0 ? lowPmCount / resources!.total : 0;
  const lowSanRatio =
    hasResourceSnapshot && resources!.total > 0 ? lowSanCount / resources!.total : 0;

  const factors: string[] = [];
  let pressureScore = 0;

  if (players.length === 0) {
    factors.push("Sem personagens de jogador no combate.");
    pressureScore += 3;
  }

  if (hostiles.length === 0) {
    factors.push("Sem hostis ativos no combate.");
    pressureScore -= 2;
  }

  if (playerHpRatio <= 0.35) {
    pressureScore += 3;
    factors.push("Grupo com HP medio muito baixo.");
  } else if (playerHpRatio <= 0.6) {
    pressureScore += 1;
    factors.push("Grupo ja sentindo desgaste relevante.");
  }

  if (hostileHpRatio <= 0.3) {
    pressureScore -= 2;
    factors.push("Hostis quase colapsando.");
  } else if (hostileHpRatio <= 0.55) {
    pressureScore -= 1;
    factors.push("Hostis ja perderam parte importante do folego.");
  }

  if (countDelta <= -2) {
    pressureScore += 2;
    factors.push("Hostis com vantagem numerica clara.");
  } else if (countDelta < 0) {
    pressureScore += 1;
    factors.push("Hostis com leve vantagem numerica.");
  } else if (countDelta >= 2) {
    pressureScore -= 1;
    factors.push("Grupo com vantagem numerica clara.");
  }

  if (downedPlayers > 0) {
    pressureScore += 2 + downedPlayers;
    factors.push(`${downedPlayers} personagem(ns) ja caiu(ra)m.`);
  }

  if (downedHostiles > 0) {
    pressureScore -= Math.min(downedHostiles, 2);
    factors.push(`${downedHostiles} hostil(is) ja saiu(ra)m do combate.`);
  }

  if (avgPmPercent !== null) {
    if (avgPmPercent <= 30) {
      pressureScore += 2;
      factors.push("Recursos de PM muito baixos no grupo.");
    } else if (avgPmPercent <= 50) {
      pressureScore += 1;
      factors.push("PM do grupo em faixa de desgaste.");
    }
  }

  if (avgSanPercent !== null) {
    if (avgSanPercent <= 30) {
      pressureScore += 2;
      factors.push("SAN do grupo em risco critico.");
    } else if (avgSanPercent <= 50) {
      pressureScore += 1;
      factors.push("SAN do grupo em faixa de atencao.");
    }
  }

  if (lowPmRatio >= 0.5) {
    pressureScore += 1;
    factors.push("Maioria do grupo ja esta com PM baixo.");
  }

  if (lowSanRatio >= 0.5) {
    pressureScore += 1;
    factors.push("Maioria do grupo ja esta com SAN baixa.");
  }

  let state: LivePressureState = "stable";
  if (pressureScore >= 4) state = "critical";
  else if (pressureScore >= 1) state = "rising";

  let summary = "Mesa sob controle.";
  let recommendation = "Se quiser elevar a tensao, mexa em objetivo, terreno ou reforco narrativo.";

  if (state === "rising") {
    summary = "Pressao subindo.";
    recommendation = "Economia de acao, cura e posicionamento ja importam. Escale com cuidado.";
  } else if (state === "critical") {
    summary = "Pressao critica.";
    recommendation = "Considere aliviar dano, cortar reforcos ou abrir uma saida tatica para nao quebrar a mesa.";
  }

  if (state !== "stable" && avgPmPercent !== null && avgPmPercent <= 40) {
    recommendation += " Preservar PM (ou aliviar custo de recursos) pode evitar colapso do grupo.";
  }
  if (state !== "stable" && avgSanPercent !== null && avgSanPercent <= 40) {
    recommendation += " Trate desgaste mental como prioridade antes de forcar nova escalada.";
  }

  return {
    state,
    playerCount: players.length,
    hostileCount: hostiles.length,
    playerHpRatio: Number(playerHpRatio.toFixed(2)),
    hostileHpRatio: Number(hostileHpRatio.toFixed(2)),
    avgPmPercent: avgPmPercent !== null ? Math.round(avgPmPercent) : null,
    avgSanPercent: avgSanPercent !== null ? Math.round(avgSanPercent) : null,
    lowPmCount,
    lowSanCount,
    downedPlayers,
    downedHostiles,
    countDelta,
    summary,
    recommendation,
    factors,
  };
}

export function formatEncounterRating(rating: BalanceRating) {
  switch (rating) {
    case "trivial":
      return "Trivial";
    case "manageable":
      return "Jogavel";
    case "risky":
      return "Arriscado";
    case "deadly":
      return "Punitivo";
    default:
      return rating;
  }
}

export function formatBalanceConfidence(confidence: BalanceConfidence) {
  switch (confidence) {
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    case "low":
      return "Baixa";
    default:
      return confidence;
  }
}

export function formatLivePressureState(state: LivePressureState) {
  switch (state) {
    case "stable":
      return "Sob controle";
    case "rising":
      return "Pressao subindo";
    case "critical":
      return "Critico";
    default:
      return state;
  }
}

export function suggestLiveAdjustment(
  pressure: LivePressureSnapshot,
  preparedRating?: string | null
): LiveAdjustmentGuide {
  const rating = preparedRating?.trim().toLowerCase() ?? "";
  const halfParty = Math.max(1, Math.ceil(pressure.playerCount / 2));
  const resourceCritical =
    (pressure.avgPmPercent !== null && pressure.avgPmPercent <= 25) ||
    (pressure.avgSanPercent !== null && pressure.avgSanPercent <= 25) ||
    pressure.lowPmCount >= halfParty ||
    pressure.lowSanCount >= halfParty;
  const resourceStressed =
    resourceCritical ||
    (pressure.avgPmPercent !== null && pressure.avgPmPercent <= 40) ||
    (pressure.avgSanPercent !== null && pressure.avgSanPercent <= 40) ||
    pressure.lowPmCount > 0 ||
    pressure.lowSanCount > 0;

  if (pressure.state === "critical") {
    return {
      title: "Alivie sem desmontar a cena",
      posture: "ease",
      actions: [
        "Corte uma acao hostil secundaria ou atrase reforcos narrativos.",
        "Abra cobertura, rota de fuga ou janela para reorganizacao do grupo.",
        resourceCritical
          ? "PM/SAN estao em colapso: priorize rodada de respiro para recuperacao e reduza custo de recurso imediato."
          : rating === "deadly" || rating === "punitivo"
            ? "Se o encontro ja era pesado no preparo, reduza dano ou HP de uma ameaca principal."
            : "Mantenha a tensao, mas alivie economia de acao antes de derrubar mais alguem.",
      ],
    };
  }

  if (pressure.state === "rising") {
    return {
      title: "Segure a escalada com cuidado",
      posture: "hold",
      actions: [
        "Evite empilhar reforcos agora; deixe a pressao vir da posicao ou do objetivo.",
        "Se quiser escalar, prefira custo narrativo ou terreno em vez de dano bruto.",
        resourceStressed
          ? "Ha desgaste de PM/SAN em curso: segure picos e force decisao taticamente, nao por exaustao de recurso."
          : pressure.countDelta < 0
            ? "A vantagem numerica hostil ja faz parte da pressao. Nao precisa adicionar mais corpos por enquanto."
            : "Observe recursos de cura e controle antes de decidir por um pico extra.",
      ],
    };
  }

  return {
    title: "Espaco para elevar a tensao",
    posture: "escalate",
    actions: [
      "Suba a pressao por objetivo, prazo ou ameaca lateral antes de inflar HP aleatoriamente.",
      resourceStressed
        ? "Mesmo sob controle, o grupo ja mostra desgaste de recurso: escale por objetivo/tempo e preserve PM/SAN."
        : rating === "trivial" || rating === "manageable" || rating === "jogavel"
          ? "O encontro preparado ainda comporta uma escalada leve em dano, reforco ou terreno."
          : "Mesmo sob controle, preserve o peso do encontro e escale em camadas pequenas.",
      "Prefira revelar uma complicacao de cena ou reforco pontual em vez de mudar tudo de uma vez.",
    ],
  };
}

export function suggestPublicScenePacing(
  pressure: LivePressureSnapshot | null,
  hasActiveScene: boolean
): PublicScenePacingGuide | null {
  if (!hasActiveScene) return null;

  if (!pressure) {
    return {
      label: "Ritmo em montagem",
      posture: "hold",
      guidance: "Sem combate ativo. A cena comporta exposicao gradual e reveal controlado.",
    };
  }

  if (pressure.state === "critical") {
    return {
      label: "Segure a exposicao",
      posture: "ease",
      guidance:
        "A mesa ja esta sob pressao. Evite empilhar novos estimulos visuais e preserve a leitura da cena.",
    };
  }

  if (pressure.state === "rising") {
    return {
      label: "Escalada com cuidado",
      posture: "hold",
      guidance:
        "A cena suporta revelacao pontual, mas ainda pede controle. Mostre o essencial antes de abrir mais camadas.",
    };
  }

  return {
    label: "Espaco para escalar",
    posture: "escalate",
    guidance:
      "A mesa esta sob controle. Ha espaco para um reveal forte ou para abrir a proxima camada visual da cena.",
  };
}

export function suggestEncounterAdjustment(
  snapshot: EncounterBalanceSnapshot,
  availableEnemies: BalanceNpcInput[]
) {
  const rankedEnemies = [...availableEnemies]
    .filter((enemy) => enemy.type === "enemy")
    .sort((left, right) => estimateEnemyUnitScore(right) - estimateEnemyUnitScore(left));

  const strongest = rankedEnemies[0];
  const weakest = rankedEnemies[rankedEnemies.length - 1];

  if (snapshot.rating === "trivial" && weakest) {
    return `Para subir a pressao, adicione mais uma ameaca como ${weakest.name || "o inimigo mais leve"} ou aumente o dano medio do encontro.`;
  }

  if (snapshot.rating === "manageable" && strongest) {
    return "Faixa jogavel. Se quiser um pico dramatico, aumente quantidade de ameacas ou traga uma figura elite.";
  }

  if (snapshot.rating === "risky" && weakest) {
    return `Se o grupo estiver sem recursos, remova uma ameaca menor como ${weakest.name || "uma ameaca leve"} ou reduza dano/acao inimiga.`;
  }

  if (snapshot.rating === "deadly" && strongest) {
    return `Pico punitivo. Considere remover ${strongest.name || "a ameaca mais forte"} ou reduzir HP e dano das ameacas principais.`;
  }

  return "Ainda faltam dados suficientes para sugerir ajuste de encontro com seguranca.";
}
