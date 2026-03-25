"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Crown, RefreshCw, Sparkles, Trash2, Users2, Waypoints } from "lucide-react";

import { CockpitDetailSheet } from "@/components/cockpit/cockpit-detail-sheet";
import { EmptyState } from "@/components/empty-state";
import {
  NarrativeGraphBoard,
  type NarrativeGraphEdge,
  type NarrativeGraphNode,
} from "@/components/graph/narrative-graph-board";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getGenealogyMarkerLabel,
  getHouseScopedGenealogyGraph,
  GENEALOGY_MARKER_OPTIONS,
  GENEALOGY_RELATION_TYPES,
  parseGenealogyMetadata,
} from "@/lib/genealogy";

type GenealogyLens = "all" | "blood" | "unions" | "branches";

const GENEALOGY_LENS_OPTIONS: Array<{ value: GenealogyLens; label: string }> = [
  { value: "all", label: "Tudo" },
  { value: "blood", label: "Sangue" },
  { value: "unions", label: "Unioes" },
  { value: "branches", label: "Ramos" },
];

const BLOOD_RELATIONS = new Set(["parent_of", "child_of", "sibling_of", "bastard_child_of", "adopted_child_of"]);
const UNION_RELATIONS = new Set(["spouse_of", "betrothed_to"]);
const BRANCH_RELATIONS = new Set(["branch_of"]);

type GraphPayload = {
  world: {
    id: string;
    title: string;
    description?: string | null;
    campaigns: Array<{ id: string; name: string }>;
  };
  stats: { nodes: number; edges: number };
  nodes: NarrativeGraphNode[];
  edges: NarrativeGraphEdge[];
};

type EntityDetail = {
  id: string;
  name: string;
  type: string;
  subtype?: string | null;
  summary?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  portraitImageUrl?: string | null;
  coverImageUrl?: string | null;
  outgoingRelations: Array<{
    id: string;
    type: string;
    notes?: string | null;
    metadata?: Record<string, unknown> | null;
    toEntityId?: string;
    toEntity?: { id: string; name: string; type: string };
  }>;
  incomingRelations: Array<{
    id: string;
    type: string;
    notes?: string | null;
    metadata?: Record<string, unknown> | null;
    fromEntityId?: string;
    fromEntity?: { id: string; name: string; type: string };
  }>;
};

export default function WorldForgeGenealogyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const worldId = params?.id as string;
  const focusHouseIdFromQuery = searchParams.get("houseId");

  const [payload, setPayload] = useState<GraphPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHouseId, setSelectedHouseId] = useState<string>(focusHouseIdFromQuery ?? "");
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [inspectEntity, setInspectEntity] = useState<EntityDetail | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [boardLinkMode, setBoardLinkMode] = useState(false);
  const [lens, setLens] = useState<GenealogyLens>("all");
  const [draft, setDraft] = useState({
    targetEntityId: "",
    relationType: "parent_of",
    marker: "",
    notes: "",
  });
  const [relationshipDeletingId, setRelationshipDeletingId] = useState<string | null>(null);
  const [orderingSubmitting, setOrderingSubmitting] = useState(false);

  const loadGraph = useCallback(async () => {
    if (!worldId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}/graph`, { cache: "no-store" });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Falha ao carregar genealogia");
      setPayload(response.data ?? null);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Erro inesperado ao carregar genealogia";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  const loadEntity = useCallback(
    async (entityId: string) => {
      if (!entityId || !worldId) return;
      setInspectLoading(true);
      try {
        const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}`, { cache: "no-store" });
        const response = await res.json().catch(() => ({}));
        if (res.ok) setInspectEntity(response.data ?? null);
      } catch (loadError) {
        console.error(loadError);
      } finally {
        setInspectLoading(false);
      }
    },
    [worldId]
  );

  useEffect(() => {
    void loadGraph();
  }, [loadGraph]);

  useEffect(() => {
    if (!inspectId) {
      setInspectEntity(null);
      return;
    }
    void loadEntity(inspectId);
  }, [inspectId, loadEntity]);

  const houses = useMemo(
    () => (payload?.nodes ?? []).filter((node) => node.type === "house").sort((a, b) => a.name.localeCompare(b.name)),
    [payload]
  );

  useEffect(() => {
    if (!selectedHouseId && houses[0]) {
      setSelectedHouseId(focusHouseIdFromQuery ?? houses[0].id);
    }
  }, [focusHouseIdFromQuery, houses, selectedHouseId]);

  const genealogyGraph = useMemo(
    () => getHouseScopedGenealogyGraph(payload?.nodes ?? [], payload?.edges ?? [], selectedHouseId || null),
    [payload, selectedHouseId]
  );

  const filteredGenealogyGraph = useMemo(() => {
    if (lens === "all") return genealogyGraph;

    const edges = genealogyGraph.edges.filter((edge) => {
      const marker = parseGenealogyMetadata(edge.metadata).marker;

      if (lens === "blood") {
        return BLOOD_RELATIONS.has(edge.type) || marker === "legitimate" || marker === "bastard" || marker === "adopted";
      }

      if (lens === "unions") {
        return UNION_RELATIONS.has(edge.type) || marker === "secret_union";
      }

      if (lens === "branches") {
        return BRANCH_RELATIONS.has(edge.type) || marker === "cadet_branch";
      }

      return true;
    });

    const nodeIds = new Set<string>();
    edges.forEach((edge) => {
      nodeIds.add(edge.fromEntityId);
      nodeIds.add(edge.toEntityId);
    });

    return {
      nodes: genealogyGraph.nodes.filter((node) => nodeIds.has(node.id) || node.id === selectedHouseId),
      edges,
    };
  }, [genealogyGraph, lens, selectedHouseId]);

  const selectableTargets = useMemo(
    () =>
      genealogyGraph.nodes
        .filter((node) => node.id !== inspectEntity?.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [genealogyGraph.nodes, inspectEntity?.id]
  );

  const genealogyLaneNodes = useMemo(() => {
    if (!inspectEntity) return [] as NarrativeGraphNode[];
    return genealogyGraph.nodes
      .filter((node) => node.type === inspectEntity.type)
      .sort((a, b) => {
        const leftOrder = typeof a.orderHint === "number" ? a.orderHint : Number.MAX_SAFE_INTEGER;
        const rightOrder = typeof b.orderHint === "number" ? b.orderHint : Number.MAX_SAFE_INTEGER;
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        return b.relationCount - a.relationCount || a.name.localeCompare(b.name);
      });
  }, [genealogyGraph.nodes, inspectEntity]);

  const inspectLaneIndex = useMemo(
    () => genealogyLaneNodes.findIndex((node) => node.id === inspectEntity?.id),
    [genealogyLaneNodes, inspectEntity?.id]
  );

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      targetEntityId:
        selectableTargets.find((node) => node.id === current.targetEntityId)?.id ??
        selectableTargets[0]?.id ??
        "",
    }));
  }, [selectableTargets]);

  async function handleCreateGenealogyRelation() {
    if (!inspectEntity?.id || !draft.targetEntityId || !draft.relationType) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEntityId: inspectEntity.id,
          toEntityId: draft.targetEntityId,
          type: draft.relationType,
          directionality:
            draft.relationType === "sibling_of" || draft.relationType === "spouse_of"
              ? "BIDIRECTIONAL"
              : "DIRECTED",
          visibility: "MASTER",
          notes: draft.notes || undefined,
          metadata: {
            genealogy: {
              marker: draft.marker || undefined,
            },
          },
        }),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Falha ao criar ligacao genealogica");
      setDraft((current) => ({ ...current, notes: "", marker: "" }));
      await Promise.all([loadGraph(), loadEntity(inspectEntity.id)]);
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Erro inesperado ao criar ligacao genealogica";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteRelationship(relationshipId: string) {
    setRelationshipDeletingId(relationshipId);
    setError(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships/${relationshipId}`, {
        method: "DELETE",
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Falha ao remover ligacao genealogica");
      if (inspectEntity?.id) {
        await Promise.all([loadGraph(), loadEntity(inspectEntity.id)]);
      }
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Erro inesperado ao remover ligacao genealogica";
      setError(message);
    } finally {
      setRelationshipDeletingId(null);
    }
  }

  function mergeGenealogyOrderMetadata(base: Record<string, unknown> | null | undefined, order: number) {
    const metadata =
      base && typeof base === "object" ? ({ ...base } as Record<string, unknown>) : ({} as Record<string, unknown>);
    const genealogyRaw = metadata.genealogy;
    const genealogy =
      genealogyRaw && typeof genealogyRaw === "object"
        ? ({ ...(genealogyRaw as Record<string, unknown>) } as Record<string, unknown>)
        : ({} as Record<string, unknown>);
    genealogy.order = order;
    metadata.genealogy = genealogy;
    return metadata;
  }

  async function handleReorderGenealogyNode(direction: "backward" | "forward") {
    if (!inspectEntity) return;
    const isGenealogyType = inspectEntity.type === "house" || inspectEntity.type === "character" || inspectEntity.type === "npc";
    if (!isGenealogyType) return;
    if (inspectLaneIndex < 0) return;

    const targetIndex = direction === "backward" ? inspectLaneIndex - 1 : inspectLaneIndex + 1;
    if (targetIndex < 0 || targetIndex >= genealogyLaneNodes.length) return;

    const currentNode = genealogyLaneNodes[inspectLaneIndex];
    const targetNode = genealogyLaneNodes[targetIndex];
    const currentOrder =
      typeof currentNode.orderHint === "number" ? currentNode.orderHint : inspectLaneIndex * 10;
    const targetOrder = typeof targetNode.orderHint === "number" ? targetNode.orderHint : targetIndex * 10;

    setOrderingSubmitting(true);
    setError(null);
    try {
      const [currentRes, targetRes] = await Promise.all([
        fetch(`/api/worlds/${worldId}/entities/${currentNode.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metadata: mergeGenealogyOrderMetadata(currentNode.metadata, targetOrder),
          }),
        }),
        fetch(`/api/worlds/${worldId}/entities/${targetNode.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metadata: mergeGenealogyOrderMetadata(targetNode.metadata, currentOrder),
          }),
        }),
      ]);

      if (!currentRes.ok || !targetRes.ok) {
        const currentJson = await currentRes.json().catch(() => ({}));
        const targetJson = await targetRes.json().catch(() => ({}));
        throw new Error(
          (currentJson.error as string | undefined) ||
            (targetJson.error as string | undefined) ||
            "Falha ao reorganizar ramo genealogico"
        );
      }

      await Promise.all([loadGraph(), loadEntity(inspectEntity.id)]);
    } catch (reorderError) {
      const message =
        reorderError instanceof Error
          ? reorderError.message
          : "Erro inesperado ao reorganizar ramo genealogico";
      setError(message);
    } finally {
      setOrderingSubmitting(false);
    }
  }

  function handleSelectNode(nodeId: string) {
    if (boardLinkMode && inspectId && nodeId !== inspectId) {
      setDraft((current) => ({ ...current, targetEntityId: nodeId }));
      return;
    }
    setInspectId(nodeId);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[280px] w-full rounded-[32px]" />
        <Skeleton className="h-[720px] w-full rounded-[32px]" />
      </div>
    );
  }

  if (!payload) {
    return (
      <EmptyState
        title="Genealogia indisponivel"
        description={error ?? "Nao foi possivel abrir a oficina genealogica deste mundo."}
        icon={<Waypoints className="h-6 w-6" />}
        action={<Button onClick={() => void loadGraph()}>Tentar novamente</Button>}
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Genealogia</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {filteredGenealogyGraph.nodes.length} nos em foco
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Forja do mundo</p>
              <h1 className="max-w-4xl text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl xl:text-6xl">
                Linhagens, herancas e ramos de casa em uma oficina dedicada.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Em vez de esconder parentesco em texto solto, a genealogia vira superficie de trabalho
                para casas, herdeiros, bastardos, adotados, casamentos e ramos menores.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-white/10 bg-white/5"
                onClick={() => void loadGraph()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/forge`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Voltar para forja
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/graph?mode=genealogy`}>
                  <Waypoints className="mr-2 h-4 w-4" />
                  Abrir no grafo
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Casas em foco</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {houses.map((house) => (
                  <Button
                    key={house.id}
                    variant="outline"
                    className={
                      selectedHouseId === house.id
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5"
                    }
                    onClick={() => {
                      setSelectedHouseId(house.id);
                      setInspectId(house.id);
                    }}
                  >
                    {house.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura da oficina</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  Casas, personagens e NPCs ja passam por um recorte focado em sangue, casamento, adocao e ramos.
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  Clique em um no para inspecionar. Com `Ligacao pelo board` ativa, o proximo clique escolhe o alvo da relacao.
                </div>
              </div>
            </div>
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Lentes do board</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {GENEALOGY_LENS_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    className={
                      lens === option.value
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5"
                    }
                    onClick={() => setLens(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <NarrativeGraphBoard
        nodes={filteredGenealogyGraph.nodes}
        edges={filteredGenealogyGraph.edges}
        selectedNodeId={inspectId}
        focusNodeId={selectedHouseId || null}
        mode="genealogy"
        onSelectNode={handleSelectNode}
      />

      <CockpitDetailSheet
        open={Boolean(inspectId)}
        onOpenChange={(open) => {
          if (!open) setInspectId(null);
        }}
        badge="Genealogia"
        title={inspectEntity?.name ?? "Inspecao genealogica"}
        description={
          inspectEntity
            ? "Estruture parentesco, casamento, heranca e ramos sem sair da oficina."
            : "Carregando entidade..."
        }
        footer={
          inspectEntity ? (
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href={`/app/worlds/${worldId}/codex/${inspectEntity.id}`}>
                  <Crown className="mr-2 h-4 w-4" />
                  Abrir no Codex
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/graph?mode=genealogy&focusEntityId=${inspectEntity.id}`}>
                  <Waypoints className="mr-2 h-4 w-4" />
                  Abrir no Grafo
                </Link>
              </Button>
            </div>
          ) : null
        }
      >
        {inspectLoading || !inspectEntity ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
              <div className="flex items-center gap-2 text-foreground">
                <Users2 className="h-4 w-4 text-amber-300/80" />
                <span className="font-semibold">{inspectEntity.type}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {inspectEntity.summary || inspectEntity.description || "Sem contexto textual ainda."}
              </p>
              {(inspectEntity.type === "house" || inspectEntity.type === "character" || inspectEntity.type === "npc") &&
              inspectLaneIndex >= 0 ? (
                <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Ordem do ramo
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Posicao {inspectLaneIndex + 1} de {genealogyLaneNodes.length} neste eixo genealogico.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      disabled={orderingSubmitting || inspectLaneIndex <= 0}
                      onClick={() => void handleReorderGenealogyNode("backward")}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Trazer para frente
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      disabled={orderingSubmitting || inspectLaneIndex >= genealogyLaneNodes.length - 1}
                      onClick={() => void handleReorderGenealogyNode("forward")}
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Enviar para tras
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
              <p className="section-eyebrow">Criar ligacao genealogica</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className={
                    boardLinkMode
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-white/10 bg-white/5"
                  }
                  onClick={() => setBoardLinkMode((current) => !current)}
                >
                  <Waypoints className="mr-2 h-4 w-4" />
                  {boardLinkMode ? "Ligacao pelo board ativa" : "Ligar pelo board"}
                </Button>
                {draft.targetEntityId ? (
                  <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                    Alvo escolhido no board ou na lista
                  </Badge>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {GENEALOGY_RELATION_TYPES.map((relation) => (
                  <Button
                    key={relation.value}
                    type="button"
                    variant="outline"
                    className={
                      draft.relationType === relation.value
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5"
                    }
                    onClick={() => setDraft((current) => ({ ...current, relationType: relation.value }))}
                  >
                    {relation.label}
                  </Button>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {GENEALOGY_MARKER_OPTIONS.map((marker) => (
                    <Button
                      key={marker.value}
                      type="button"
                      variant="outline"
                      className={
                        draft.marker === marker.value
                          ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                          : "border-white/10 bg-white/5"
                      }
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          marker: current.marker === marker.value ? "" : marker.value,
                        }))
                      }
                    >
                      {marker.label}
                    </Button>
                  ))}
                </div>
                <Input
                  value={draft.notes}
                  onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Notas opcionais: legitimidade, heranca, segredo de sangue..."
                />
                <div className="space-y-2">
                  {selectableTargets.slice(0, 12).map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        draft.targetEntityId === target.id
                          ? "border-primary/30 bg-primary/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                      onClick={() =>
                        setDraft((current) => ({ ...current, targetEntityId: target.id }))
                      }
                    >
                      <p className="text-sm font-semibold text-foreground">{target.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {target.type}
                      </p>
                    </button>
                  ))}
                </div>
                <Button className="w-full" onClick={handleCreateGenealogyRelation} disabled={submitting}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {submitting ? "Ligando..." : "Criar ligacao"}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
                <p className="section-eyebrow">Relacoes de saida</p>
                <div className="mt-4 space-y-3">
                  {inspectEntity.outgoingRelations.length > 0 ? (
                    inspectEntity.outgoingRelations.map((relation) => (
                      <div key={relation.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {relation.toEntity?.name || "Sem destino"}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {relation.type}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {relation.toEntity?.id ? (
                              <Button
                                variant="outline"
                                className="border-white/10 bg-white/5"
                                onClick={() => setInspectId(relation.toEntity?.id ?? null)}
                              >
                                <Waypoints className="h-4 w-4" />
                              </Button>
                            ) : null}
                            <Button
                              variant="outline"
                              className="border-white/10 bg-white/5"
                              onClick={() => void handleDeleteRelationship(relation.id)}
                              disabled={relationshipDeletingId === relation.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {parseGenealogyMetadata(relation.metadata).marker ? (
                          <Badge className="mt-3 border-amber-300/20 bg-amber-300/10 text-amber-100">
                            {getGenealogyMarkerLabel(parseGenealogyMetadata(relation.metadata).marker)}
                          </Badge>
                        ) : null}
                        {relation.notes ? (
                          <p className="mt-2 text-sm text-muted-foreground">{relation.notes}</p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
                      Nenhuma ligacao saindo desta entidade.
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
                <p className="section-eyebrow">Relacoes de entrada</p>
                <div className="mt-4 space-y-3">
                  {inspectEntity.incomingRelations.length > 0 ? (
                    inspectEntity.incomingRelations.map((relation) => (
                      <div key={relation.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {relation.fromEntity?.name || "Sem origem"}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {relation.type}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {relation.fromEntity?.id ? (
                              <Button
                                variant="outline"
                                className="border-white/10 bg-white/5"
                                onClick={() => setInspectId(relation.fromEntity?.id ?? null)}
                              >
                                <Waypoints className="h-4 w-4" />
                              </Button>
                            ) : null}
                            <Button
                              variant="outline"
                              className="border-white/10 bg-white/5"
                              onClick={() => void handleDeleteRelationship(relation.id)}
                              disabled={relationshipDeletingId === relation.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {parseGenealogyMetadata(relation.metadata).marker ? (
                          <Badge className="mt-3 border-amber-300/20 bg-amber-300/10 text-amber-100">
                            {getGenealogyMarkerLabel(parseGenealogyMetadata(relation.metadata).marker)}
                          </Badge>
                        ) : null}
                        {relation.notes ? (
                          <p className="mt-2 text-sm text-muted-foreground">{relation.notes}</p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
                      Nenhuma ligacao entrando nesta entidade.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        )}
      </CockpitDetailSheet>
    </div>
  );
}
