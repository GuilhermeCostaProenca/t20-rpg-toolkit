export const VISUAL_KIND_OPTIONS = [
  { value: "cover", label: "Capa", description: "Hero principal da entidade ou lugar." },
  { value: "portrait", label: "Retrato", description: "Rosto principal para consulta rapida." },
  { value: "reference", label: "Referencia", description: "Moodboard ou apoio visual geral." },
  { value: "scene", label: "Cena", description: "Ambiente, momento ou composicao narrativa." },
  { value: "reveal", label: "Reveal", description: "Asset preparado para mostrar na mesa." },
] as const;

const VISUAL_KIND_PRIORITY: Record<string, number> = {
  reveal: 0,
  scene: 1,
  portrait: 2,
  cover: 3,
  reference: 4,
};

export function normalizeVisualKind(kind?: string | null) {
  return (kind || "reference").trim().toLowerCase();
}

export function getVisualKindPriority(kind?: string | null) {
  return VISUAL_KIND_PRIORITY[normalizeVisualKind(kind)] ?? VISUAL_KIND_PRIORITY.reference;
}

export function getVisualKindLabel(kind?: string | null) {
  switch (normalizeVisualKind(kind)) {
    case "cover":
      return "Capa";
    case "portrait":
      return "Retrato";
    case "scene":
      return "Cena";
    case "reveal":
      return "Reveal";
    default:
      return "Referencia";
  }
}

export function getVisualKindDescription(kind?: string | null) {
  const normalized = normalizeVisualKind(kind);
  return (
    VISUAL_KIND_OPTIONS.find((option) => option.value === normalized)?.description ||
    "Referencia visual ligada ao mundo."
  );
}

type VisualReadinessInput = {
  kind?: string | null;
  caption?: string | null;
  isEntityCover?: boolean;
  isEntityPortrait?: boolean;
  entityType?: string | null;
  entitySubtype?: string | null;
};

export function getVisualReadiness(input: VisualReadinessInput) {
  const kind = normalizeVisualKind(input.kind);
  const hasCaption = Boolean(input.caption?.trim());
  const isPlace = input.entityType === "place";
  const hasSubtype = Boolean(input.entitySubtype?.trim());
  const isHero = Boolean(input.isEntityCover || input.isEntityPortrait);

  if (kind === "reveal" && hasCaption) {
    return {
      status: "ready" as const,
      label: "Pronto para mesa",
      description: "Este asset ja tem papel claro e contexto suficiente para reveal.",
    };
  }

  if ((kind === "scene" || isPlace) && hasCaption && hasSubtype) {
    return {
      status: "ready" as const,
      label: "Cena pronta",
      description: "Lugar ou cena com contexto suficiente para entrar na mesa rapidamente.",
    };
  }

  if ((kind === "portrait" || isHero) && (hasCaption || !isPlace)) {
    return {
      status: "ready" as const,
      label: "Consulta pronta",
      description: "Retrato forte para leitura rapida de personagem ou entidade.",
    };
  }

  if (hasCaption || kind !== "reference") {
    return {
      status: "curating" as const,
      label: "Em curadoria",
      description: "O asset ja entrou no fluxo certo, mas ainda pode ganhar contexto melhor.",
    };
  }

  return {
    status: "draft" as const,
    label: "Precisa contexto",
    description: "Ainda falta legenda, papel claro ou contexto de uso para a mesa.",
  };
}
