type WorldForgeInput = {
  concept?: string;
  tone?: string;
  scope?: string;
  scale?: string;
  currentFocus?: string;
  stage?: string;
  pillars?: string[];
};

export type WorldForgeState = {
  concept: string;
  tone: string;
  scope: string;
  scale: string;
  currentFocus: string;
  stage: string;
  pillars: string[];
};

export const WORLD_FORGE_SCALE_OPTIONS = [
  { value: "court", label: "Corte e intriga" },
  { value: "kingdom", label: "Reino ou casa" },
  { value: "continent", label: "Continente" },
  { value: "mythic", label: "Era mitica" },
];

export const WORLD_FORGE_STAGE_OPTIONS = [
  { value: "seed", label: "Semente inicial" },
  { value: "structuring", label: "Estruturando pilares" },
  { value: "operational", label: "Pronto para mesa" },
];

export const WORLD_FORGE_SUGGESTED_PILLARS = [
  "Casas e familias",
  "Politica e conselhos",
  "Linhas de sangue",
  "Religiao e fe",
  "Guerra e legado",
  "Segredos antigos",
  "Cidades e fortalezas",
  "Magia e ruina",
];

export function getEmptyWorldForgeState(): WorldForgeState {
  return {
    concept: "",
    tone: "",
    scope: "",
    scale: "",
    currentFocus: "",
    stage: "seed",
    pillars: [],
  };
}

export function normalizeWorldForgeState(metadata: unknown): WorldForgeState {
  const forge = (metadata &&
    typeof metadata === "object" &&
    "forge" in metadata &&
    metadata.forge &&
    typeof metadata.forge === "object"
      ? (metadata.forge as WorldForgeInput)
      : {}) as WorldForgeInput;

  return {
    concept: forge.concept ?? "",
    tone: forge.tone ?? "",
    scope: forge.scope ?? "",
    scale: forge.scale ?? "",
    currentFocus: forge.currentFocus ?? "",
    stage: forge.stage ?? "seed",
    pillars: Array.isArray(forge.pillars)
      ? forge.pillars.filter((value): value is string => typeof value === "string")
      : [],
  };
}

export function buildWorldForgeMetadata(state: WorldForgeState, existingMetadata?: unknown) {
  const existing =
    existingMetadata && typeof existingMetadata === "object"
      ? { ...(existingMetadata as Record<string, unknown>) }
      : {};

  return {
    ...existing,
    forge: {
      concept: state.concept || undefined,
      tone: state.tone || undefined,
      scope: state.scope || undefined,
      scale: state.scale || undefined,
      currentFocus: state.currentFocus || undefined,
      stage: state.stage || undefined,
      pillars: state.pillars.length ? state.pillars : undefined,
    },
  };
}

export function getWorldForgeProgress(state: WorldForgeState) {
  const checks = [
    state.concept.trim().length > 0,
    state.tone.trim().length > 0,
    state.scope.trim().length > 0 || state.scale.trim().length > 0,
    state.pillars.length > 0,
    state.currentFocus.trim().length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return {
    completed,
    total: checks.length,
    percent: Math.round((completed / checks.length) * 100),
  };
}
