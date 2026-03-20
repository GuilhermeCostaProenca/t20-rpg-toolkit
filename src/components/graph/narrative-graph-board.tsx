"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type NarrativeGraphNode = {
  id: string;
  name: string;
  type: string;
  status: string;
  summary?: string | null;
  campaignName?: string | null;
  portraitImageUrl?: string | null;
  tags?: string[] | null;
  relationCount: number;
};

export type NarrativeGraphEdge = {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: string;
  visibility: string;
  weight?: number | null;
  metadata?: Record<string, unknown> | null;
};

type NarrativeGraphBoardProps = {
  nodes: NarrativeGraphNode[];
  edges: NarrativeGraphEdge[];
  selectedNodeId?: string | null;
  focusNodeId?: string | null;
  mode?: "narrative" | "genealogy";
  onSelectNode: (nodeId: string) => void;
};

const narrativeLaneOrder = ["house", "faction", "institution", "office", "character", "npc", "place", "artifact", "event"];
const genealogyLaneOrder = ["house", "character", "npc"];

const laneMeta = {
  house: { label: "Casas", accent: "text-fuchsia-200" },
  faction: { label: "Faccoes", accent: "text-rose-200" },
  institution: { label: "Instituicoes", accent: "text-violet-200" },
  office: { label: "Cargos", accent: "text-cyan-100" },
  character: { label: "Personagens", accent: "text-sky-200" },
  npc: { label: "NPCs", accent: "text-amber-100" },
  place: { label: "Lugares", accent: "text-emerald-100" },
  artifact: { label: "Artefatos", accent: "text-yellow-100" },
  event: { label: "Marcos", accent: "text-red-100" },
} as const;

function getLaneMeta(type: string) {
  return laneMeta[type as keyof typeof laneMeta] ?? { label: type, accent: "text-white" };
}

function getEdgeTone(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes("morreu") || normalized.includes("matou")) return "rgba(239, 68, 68, 0.55)";
  if (normalized.includes("ama") || normalized.includes("casou")) return "rgba(244, 114, 182, 0.55)";
  if (normalized.includes("serve") || normalized.includes("aliad")) return "rgba(59, 130, 246, 0.55)";
  if (normalized.includes("odeia") || normalized.includes("trai")) return "rgba(249, 115, 22, 0.55)";
  return "rgba(255,255,255,0.22)";
}

export function NarrativeGraphBoard({
  nodes,
  edges,
  selectedNodeId,
  focusNodeId,
  mode = "narrative",
  onSelectNode,
}: NarrativeGraphBoardProps) {
  const layout = useMemo(() => {
    const laneOrder = mode === "genealogy" ? genealogyLaneOrder : narrativeLaneOrder;
    const grouped = laneOrder
      .map((type) => ({
        type,
        items: nodes
          .filter((node) => node.type === type)
          .sort((a, b) => b.relationCount - a.relationCount || a.name.localeCompare(b.name)),
      }))
      .filter((group) => group.items.length > 0);

    const nodeWidth = 248;
    const nodeHeight = 168;
    const laneGap = 64;
    const colGap = 36;
    const leftPad = 156;
    const topPad = 48;

    const positions = new Map<string, { x: number; y: number; width: number; height: number; lane: string }>();

    grouped.forEach((group, laneIndex) => {
      const baseY = topPad + laneIndex * (nodeHeight + laneGap);
      group.items.forEach((node, index) => {
        positions.set(node.id, {
          x: leftPad + index * (nodeWidth + colGap),
          y: baseY,
          width: nodeWidth,
          height: nodeHeight,
          lane: group.type,
        });
      });
    });

    const boardWidth =
      leftPad +
      Math.max(...grouped.map((group) => group.items.length), 1) * (nodeWidth + colGap) +
      120;
    const boardHeight = topPad + grouped.length * (nodeHeight + laneGap) + 60;

    return { grouped, positions, boardWidth, boardHeight, nodeHeight, leftPad };
  }, [mode, nodes]);

  const connectedNodeIds = useMemo(() => {
    if (!focusNodeId) return new Set<string>();
    const set = new Set<string>([focusNodeId]);
    for (const edge of edges) {
      if (edge.fromEntityId === focusNodeId) set.add(edge.toEntityId);
      if (edge.toEntityId === focusNodeId) set.add(edge.fromEntityId);
    }
    return set;
  }, [edges, focusNodeId]);

  return (
    <div className="cinematic-frame overflow-auto rounded-[32px] border border-white/10 p-4">
      <div
        className="relative rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(188,74,63,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]"
        style={{ width: layout.boardWidth, height: layout.boardHeight, minHeight: 440 }}
      >
        <svg className="pointer-events-none absolute inset-0" width={layout.boardWidth} height={layout.boardHeight}>
          {edges.map((edge) => {
            const from = layout.positions.get(edge.fromEntityId);
            const to = layout.positions.get(edge.toEntityId);
            if (!from || !to) return null;

            const x1 = from.x + from.width;
            const y1 = from.y + from.height / 2;
            const x2 = to.x;
            const y2 = to.y + to.height / 2;
            const curve = Math.max(Math.abs(x2 - x1) * 0.4, 90);
            const dimmed = focusNodeId
              ? !(connectedNodeIds.has(edge.fromEntityId) && connectedNodeIds.has(edge.toEntityId))
              : false;

            return (
              <path
                key={edge.id}
                d={`M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={getEdgeTone(edge.type)}
                strokeOpacity={dimmed ? 0.15 : 1}
                strokeWidth={(edge.weight ?? 1) * 0.35 + (focusNodeId && connectedNodeIds.has(edge.fromEntityId) && connectedNodeIds.has(edge.toEntityId) ? 2.2 : 1.4)}
                strokeDasharray={edge.visibility === "MASTER" ? "0" : "6 6"}
              />
            );
          })}
        </svg>

        {layout.grouped.map((group) => {
          const laneIndex = layout.grouped.findIndex((item) => item.type === group.type);
          const laneTop = 48 + laneIndex * (layout.nodeHeight + 64);
          const meta = getLaneMeta(group.type);

          return (
            <div key={group.type}>
              <div className="absolute left-5" style={{ top: laneTop + 12, width: layout.leftPad - 32 }}>
                <p className={cn("text-xs uppercase tracking-[0.18em] text-muted-foreground", meta.accent)}>
                  {meta.label}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {group.items.length} nos nesta camada
                </p>
              </div>

              {group.items.map((node) => {
                const position = layout.positions.get(node.id);
                if (!position) return null;

                const selected = selectedNodeId === node.id;
                const focused = focusNodeId === node.id;
                const connected = focusNodeId ? connectedNodeIds.has(node.id) : false;
                const dimmed = focusNodeId ? !connected : false;

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => onSelectNode(node.id)}
                    className={cn(
                      "absolute overflow-hidden rounded-[28px] border bg-black/30 p-4 text-left backdrop-blur transition",
                      selected
                        ? "border-primary/35 shadow-[0_0_24px_rgba(188,74,63,0.22)]"
                        : "border-white/10 hover:border-white/20",
                      focused && "ring-1 ring-primary/40",
                      dimmed && "opacity-35"
                    )}
                    style={{
                      left: position.x,
                      top: position.y,
                      width: position.width,
                      height: position.height,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage: node.portraitImageUrl
                          ? `linear-gradient(180deg, rgba(8,8,13,0.12), rgba(8,8,13,0.92)), url(${node.portraitImageUrl})`
                          : "linear-gradient(135deg, rgba(188,74,63,0.12), rgba(8,8,13,0.92))",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="border-white/10 bg-black/28 text-white">{getLaneMeta(node.type).label}</Badge>
                        <Badge className="border-white/10 bg-black/28 text-white/70">{node.status}</Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="line-clamp-2 text-lg font-black uppercase tracking-[0.04em] text-white">
                            {node.name}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/70">
                            {node.summary || "Sem resumo narrativo."}
                          </p>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/24 px-3 py-2 text-xs uppercase tracking-[0.16em] text-white/60">
                          <span>{node.campaignName || "Mundo base"}</span>
                          <span>{node.relationCount} relacoes</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
