export type LiveCombatCondition = {
  id: string;
  targetCombatantId: string;
  condition?: {
    id?: string;
    key?: string;
    name?: string;
  };
};

export type LiveCombatant = {
  id: string;
  refId: string;
  kind: string;
  name: string;
  initiative: number;
  hpCurrent: number;
  hpMax: number;
};

export type LiveCombat = {
  id: string;
  isActive: boolean;
  round: number;
  turnIndex: number;
  combatants: LiveCombatant[];
  conditions?: LiveCombatCondition[];
};

export type LiveOpsStatusMessage = {
  kind: "success" | "error" | "info";
  message: string;
};

export type CampaignCharacterSheet = {
  des?: number;
  pvCurrent?: number;
  pvMax?: number;
  pmCurrent?: number;
  pmMax?: number;
};

export type CampaignCharacter = {
  id: string;
  name: string;
  sheet?: CampaignCharacterSheet;
};

export type CampaignNpc = {
  id: string;
  name: string;
  type?: string | null;
  hpMax?: number;
  defenseFinal?: number;
  damageFormula?: string | null;
};

export type ApplyConditionPayload = {
  targetCombatantId: string;
  conditionKey: string;
  visibility: "MASTER" | "PLAYERS";
};

export type RemoveConditionPayload = {
  appliedConditionId: string;
  visibility: "MASTER" | "PLAYERS";
};

export const LIVE_COMBAT_POLL_MS = 4000;
export const SQUAD_MONITOR_POLL_MS = 5000;
export const LIVE_SPAWN_STATUS_MS = 5000;
export const CONDITION_APPLY_COOLDOWN_MS = 900;

export function getCampaignCombatPath(campaignId: string) {
  return `/api/campaigns/${campaignId}/combat`;
}

export function getCampaignCombatTurnPath(campaignId: string) {
  return `/api/campaigns/${campaignId}/combat/turn`;
}

export function getCampaignCombatInitiativePath(campaignId: string) {
  return `/api/campaigns/${campaignId}/combat/initiative`;
}

export function getCampaignCombatantsPath(campaignId: string) {
  return `/api/campaigns/${campaignId}/combat/combatants`;
}

export function getCampaignNpcsPath(campaignId: string) {
  return `/api/campaigns/${campaignId}/npcs`;
}

export function getCampaignConditionsPath(campaignId: string) {
  return `/api/campaigns/${campaignId}/conditions`;
}

export function getCombatConditionApplyPath(combatId: string) {
  return `/api/combat/${combatId}/conditions/apply`;
}

export function getCombatConditionRemovePath(combatId: string) {
  return `/api/combat/${combatId}/conditions/remove`;
}
