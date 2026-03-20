import type { NarrativeGraphEdge, NarrativeGraphNode } from "@/components/graph/narrative-graph-board";

export const GENEALOGY_RELATION_TYPES = [
  { value: "parent_of", label: "Pai / Mae de" },
  { value: "child_of", label: "Filho / Filha de" },
  { value: "sibling_of", label: "Irmao / Irma de" },
  { value: "spouse_of", label: "Casado com" },
  { value: "betrothed_to", label: "Prometido a" },
  { value: "adopted_child_of", label: "Adotado por" },
  { value: "bastard_child_of", label: "Bastardo de" },
  { value: "branch_of", label: "Ramo de casa" },
] as const;

export const GENEALOGY_MARKER_OPTIONS = [
  { value: "legitimate", label: "Legitimo" },
  { value: "bastard", label: "Bastardo" },
  { value: "adopted", label: "Adotado" },
  { value: "cadet_branch", label: "Ramo menor" },
  { value: "secret_union", label: "Uniao secreta" },
] as const;

const genealogyKeywords = [
  "parent",
  "child",
  "sibling",
  "spouse",
  "betrothed",
  "adopted",
  "bastard",
  "branch",
  "pai",
  "mae",
  "filho",
  "filha",
  "irma",
  "irmao",
  "marido",
  "esposa",
  "linhagem",
  "herdeiro",
  "herdeira",
  "bastardo",
];

export function isGenealogyRelation(type: string) {
  const normalized = type.toLowerCase();
  return genealogyKeywords.some((keyword) => normalized.includes(keyword));
}

export function getHouseScopedGenealogyGraph(
  nodes: NarrativeGraphNode[],
  edges: NarrativeGraphEdge[],
  houseId?: string | null
) {
  const allowedNodeTypes = new Set(["house", "character", "npc"]);
  const genealogyNodes = nodes.filter((node) => allowedNodeTypes.has(node.type));
  const genealogyNodeIds = new Set(genealogyNodes.map((node) => node.id));

  const genealogyEdges = edges.filter((edge) => {
    if (!genealogyNodeIds.has(edge.fromEntityId) || !genealogyNodeIds.has(edge.toEntityId)) {
      return false;
    }

    const fromNode = genealogyNodes.find((node) => node.id === edge.fromEntityId);
    const toNode = genealogyNodes.find((node) => node.id === edge.toEntityId);
    return isGenealogyRelation(edge.type) || fromNode?.type === "house" || toNode?.type === "house";
  });

  if (!houseId) {
    const nodeIdsInEdges = new Set<string>();
    genealogyEdges.forEach((edge) => {
      nodeIdsInEdges.add(edge.fromEntityId);
      nodeIdsInEdges.add(edge.toEntityId);
    });

    return {
      nodes: genealogyNodes.filter((node) => nodeIdsInEdges.has(node.id) || node.type === "house"),
      edges: genealogyEdges,
    };
  }

  const connectedIds = new Set<string>([houseId]);
  genealogyEdges.forEach((edge) => {
    if (edge.fromEntityId === houseId) connectedIds.add(edge.toEntityId);
    if (edge.toEntityId === houseId) connectedIds.add(edge.fromEntityId);
  });

  const houseScopedEdges = genealogyEdges.filter(
    (edge) =>
      (connectedIds.has(edge.fromEntityId) && connectedIds.has(edge.toEntityId)) ||
      edge.fromEntityId === houseId ||
      edge.toEntityId === houseId
  );

  houseScopedEdges.forEach((edge) => {
    connectedIds.add(edge.fromEntityId);
    connectedIds.add(edge.toEntityId);
  });

  return {
    nodes: genealogyNodes.filter((node) => connectedIds.has(node.id)),
    edges: houseScopedEdges,
  };
}

export function parseGenealogyMetadata(metadata: unknown) {
  const meta = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : undefined;
  const genealogy =
    meta?.genealogy && typeof meta.genealogy === "object"
      ? (meta.genealogy as Record<string, unknown>)
      : undefined;

  return {
    marker: typeof genealogy?.marker === "string" ? genealogy.marker : "",
  };
}

export function getGenealogyMarkerLabel(marker?: string | null) {
  const option = GENEALOGY_MARKER_OPTIONS.find((item) => item.value === marker);
  return option?.label ?? marker ?? "";
}
