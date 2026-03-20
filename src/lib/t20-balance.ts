type BalanceCharacterInput = {
  level: number;
  role?: string | null;
  className?: string | null;
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

export type EncounterBalanceSnapshot = {
  rating: BalanceRating;
  confidence: BalanceConfidence;
  partyScore: number;
  threatScore: number;
  pressureRatio: number;
  avgPartyLevel: number;
  enemyCount: number;
  factors: string[];
  recommendation: string;
};

function normalizeRole(role?: string | null) {
  return role?.trim().toLowerCase() ?? "";
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

  const partyScore = characters.reduce((total, character) => {
    const base = Math.max(character.level || 1, 1) * 10;
    const roleWeight = getRoleWeight(character.role);
    return total + base + roleWeight;
  }, 0);

  const threatScore = enemies.reduce((total, enemy) => {
    return total + estimateEnemyUnitScore(enemy);
  }, 0);

  const pressureRatio = partyScore > 0 ? threatScore / partyScore : 0;

  let rating: BalanceRating = "manageable";
  if (pressureRatio < 0.55) rating = "trivial";
  else if (pressureRatio < 0.95) rating = "manageable";
  else if (pressureRatio < 1.3) rating = "risky";
  else rating = "deadly";

  const factors: string[] = [];
  if (partyCount === 0) {
    factors.push("Sem personagens suficientes para leitura confiavel.");
  } else {
    factors.push(`${partyCount} personagens com nivel medio ${avgPartyLevel.toFixed(1)}.`);
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

  let confidence: BalanceConfidence = "high";
  if (partyCount === 0 || enemies.length === 0 || missingEnemyStats >= 2) confidence = "low";
  else if (missingEnemyStats > 0 || lowRoleSignal > 0) confidence = "medium";

  let recommendation = "Composicao em faixa jogavel para a campanha.";
  if (rating === "trivial") {
    recommendation = "Aumente pressao hostil, quantidade de ameacas ou dano medio para evitar combate frouxo.";
  } else if (rating === "risky") {
    recommendation = "Encontro ja pressiona bem; revise economia de acao e saidas de cura antes da mesa.";
  } else if (rating === "deadly") {
    recommendation = "Revise imediatamente HP, dano ou numero de ameacas para evitar um pico punitivo.";
  }

  return {
    rating,
    confidence,
    partyScore: Number(partyScore.toFixed(1)),
    threatScore: Number(threatScore.toFixed(1)),
    pressureRatio: Number(pressureRatio.toFixed(2)),
    avgPartyLevel: Number(avgPartyLevel.toFixed(1)),
    enemyCount: enemies.length,
    factors,
    recommendation,
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
