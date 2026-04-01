"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowRight, Filter, Network, Pencil, RefreshCw, Save, ScanSearch, Trash2 } from "lucide-react";

import { useAppFeedback } from "@/components/app-feedback-provider";
import { CockpitDetailSheet } from "@/components/cockpit/cockpit-detail-sheet";
import { EmptyState } from "@/components/empty-state";
import { ModeSwitcher } from "@/components/world/mode-switcher";
import {
  NarrativeGraphBoard,
  type NarrativeGraphEdge,
  type NarrativeGraphNode,
} from "@/components/graph/narrative-graph-board";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";

type Campaign = { id: string; name: string };
type GraphPayload = {
  world: {
    id: string;
    title: string;
    description?: string | null;
    campaigns: Campaign[];
  };
  stats: { nodes: number; edges: number };
  nodes: NarrativeGraphNode[];
  edges: NarrativeGraphEdge[];
  relationTypes: string[];
};

type EntityDetail = {
  id: string;
  name: string;
  type: string;
  subtype?: string | null;
  status: string;
  summary?: string | null;
  description?: string | null;
  visibility: string;
  tags?: string[] | null;
  portraitImageUrl?: string | null;
  coverImageUrl?: string | null;
  campaign?: { id: string; name: string } | null;
  outgoingRelations: Array<{
    id: string;
    type: string;
    weight?: number | null;
    directionality?: string | null;
    visibility?: string | null;
    notes?: string | null;
    fromEntityId?: string;
    toEntityId?: string;
    toEntity?: { id: string; name: string };
  }>;
  incomingRelations: Array<{
    id: string;
    type: string;
    weight?: number | null;
    directionality?: string | null;
    visibility?: string | null;
    notes?: string | null;
    fromEntityId?: string;
    toEntityId?: string;
    fromEntity?: { id: string; name: string };
  }>;
  recentEvents: Array<{ id: string; type: string; text?: string | null; ts: string; visibility: string }>;
};

const familyRelationKeywords = [
  "pai",
  "mae",
  "filho",
  "filha",
  "irma",
  "irmao",
  "irmã",
  "irmão",
  "marido",
  "esposa",
  "casado",
  "casada",
  "linhagem",
  "sangue",
  "herdeiro",
  "herdeira",
  "bastardo",
  "ancestral",
  "descendente",
  "familia",
  "família",
  "casa",
  "clã",
  "cla",
  "tio",
  "tia",
  "sobrinho",
  "sobrinha",
  "primo",
  "prima",
];

function isFamilyRelation(type: string) {
  const normalized = type.toLowerCase();
  return familyRelationKeywords.some((keyword) => normalized.includes(keyword));
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const entityTypeOptions = [
  { value: "character", label: "character" },
  { value: "npc", label: "npc" },
  { value: "faction", label: "faction" },
  { value: "house", label: "house" },
  { value: "place", label: "place" },
  { value: "artifact", label: "artifact" },
  { value: "event", label: "event" },
];

const statusFilterOptions = [
  { value: "alive", label: "alive" },
  { value: "dead", label: "dead" },
  { value: "missing", label: "missing" },
  { value: "retired", label: "retired" },
];

const directionalityOptions = [
  { value: "DIRECTED", label: "Direcional" },
  { value: "UNDIRECTED", label: "Bidirecional" },
];

const visibilityOptions = [
  { value: "MASTER", label: "MASTER" },
  { value: "PLAYERS", label: "PLAYERS" },
];

export default function WorldGraphPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { confirmDestructive, notifyError, notifySuccess } = useAppFeedback();
  const worldId = params?.id as string;
  const initialFocusId = searchParams.get("focusEntityId");

  const [payload, setPayload] = useState<GraphPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [relationTypeFilter, setRelationTypeFilter] = useState("");
  const [graphMode, setGraphMode] = useState<"narrative" | "genealogy">("narrative");
  const [focusNodeId, setFocusNodeId] = useState<string | null>(initialFocusId);
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [inspectEntity, setInspectEntity] = useState<EntityDetail | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [relationshipSubmitting, setRelationshipSubmitting] = useState(false);
  const [editingRelationshipId, setEditingRelationshipId] = useState<string | null>(null);
  const [relationshipDeletingId, setRelationshipDeletingId] = useState<string | null>(null);
  const [relationshipDraft, setRelationshipDraft] = useState({
    toEntityId: "",
    type: "",
    weight: "1",
    directionality: "DIRECTED",
    visibility: "MASTER",
    notes: "",
  });
  const [relationshipEditDraft, setRelationshipEditDraft] = useState({
    fromEntityId: "",
    toEntityId: "",
    type: "",
    weight: "1",
    directionality: "DIRECTED",
    visibility: "MASTER",
    notes: "",
  });

  const loadGraph = useCallback(async () => {
    if (!worldId) return;
    setLoading(true);
    setError(null);
    try {
      const search = new URLSearchParams();
      if (term.trim()) search.set("term", term.trim());
      if (typeFilter) search.set("type", typeFilter);
      if (statusFilter) search.set("status", statusFilter);
      if (tagFilter) search.set("tag", tagFilter);
      if (campaignFilter) search.set("campaignId", campaignFilter);
      if (relationTypeFilter) search.set("relationType", relationTypeFilter);

      const res = await fetch(`/api/worlds/${worldId}/graph?${search.toString()}`, {
        cache: "no-store",
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Falha ao carregar grafo");
      setPayload(response.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar grafo");
    } finally {
      setLoading(false);
    }
  }, [campaignFilter, relationTypeFilter, statusFilter, tagFilter, term, typeFilter, worldId]);

  useEffect(() => {
    void loadGraph();
  }, [loadGraph]);

  useEffect(() => {
    setFocusNodeId(initialFocusId);
  }, [initialFocusId]);

  const loadInspectEntity = useCallback(
    async (entityId: string) => {
      if (!entityId || !worldId) return;
      setInspectLoading(true);
      try {
        const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}`, { cache: "no-store" });
        const response = await res.json().catch(() => ({}));
        if (res.ok) setInspectEntity(response.data ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setInspectLoading(false);
      }
    },
    [worldId]
  );

  useEffect(() => {
    if (!inspectId || !worldId) {
      setInspectEntity(null);
      return;
    }
    void loadInspectEntity(inspectId);
  }, [inspectId, loadInspectEntity, worldId]);

  const visibleGraph = useMemo(() => {
    const nodes = payload?.nodes ?? [];
    const edges = payload?.edges ?? [];
    const baseGraph = !focusNodeId
      ? { nodes, edges }
      : (() => {
          const connectedIds = new Set<string>([focusNodeId]);
          for (const edge of edges) {
            if (edge.fromEntityId === focusNodeId) connectedIds.add(edge.toEntityId);
            if (edge.toEntityId === focusNodeId) connectedIds.add(edge.fromEntityId);
          }

          return {
            nodes: nodes.filter((node) => connectedIds.has(node.id)),
            edges: edges.filter(
              (edge) => connectedIds.has(edge.fromEntityId) && connectedIds.has(edge.toEntityId)
            ),
          };
        })();

    if (graphMode !== "genealogy") return baseGraph;

    const allowedNodeTypes = new Set(["house", "character", "npc"]);
    const allowedNodes = baseGraph.nodes.filter((node) => allowedNodeTypes.has(node.type));
    const allowedNodeIds = new Set(allowedNodes.map((node) => node.id));
    const filteredEdges = baseGraph.edges.filter((edge) => {
      if (!allowedNodeIds.has(edge.fromEntityId) || !allowedNodeIds.has(edge.toEntityId)) return false;
      const fromNode = allowedNodes.find((node) => node.id === edge.fromEntityId);
      const toNode = allowedNodes.find((node) => node.id === edge.toEntityId);
      return isFamilyRelation(edge.type) || fromNode?.type === "house" || toNode?.type === "house";
    });
    const nodesInEdges = new Set<string>();
    filteredEdges.forEach((edge) => {
      nodesInEdges.add(edge.fromEntityId);
      nodesInEdges.add(edge.toEntityId);
    });
    const filteredNodes = allowedNodes.filter(
      (node) => nodesInEdges.has(node.id) || node.type === "house"
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }, [focusNodeId, graphMode, payload]);

  const focusNode = useMemo(
    () => payload?.nodes.find((node) => node.id === focusNodeId) ?? null,
    [focusNodeId, payload]
  );

  const relationTargets = useMemo(
    () =>
      (payload?.nodes ?? [])
        .filter((node) => node.id !== inspectEntity?.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [inspectEntity?.id, payload]
  );

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    for (const node of payload?.nodes ?? []) {
      const nodeTags = node.tags;
      if (!Array.isArray(nodeTags)) continue;
      nodeTags.forEach((tag) => {
        const normalized = tag?.trim();
        if (normalized) tags.add(normalized);
      });
    }
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [payload]);

  useEffect(() => {
    setRelationshipDraft((current) => ({
      ...current,
      toEntityId:
        relationTargets.find((node) => node.id === current.toEntityId)?.id ??
        relationTargets[0]?.id ??
        "",
    }));
  }, [relationTargets]);

  async function handleCreateRelationshipFromGraph() {
    if (!inspectEntity?.id || !relationshipDraft.toEntityId || !relationshipDraft.type.trim()) return;
    setRelationshipSubmitting(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEntityId: inspectEntity.id,
          toEntityId: relationshipDraft.toEntityId,
          type: relationshipDraft.type,
          weight: relationshipDraft.weight ? Number(relationshipDraft.weight) : undefined,
          directionality: relationshipDraft.directionality,
          visibility: relationshipDraft.visibility,
          notes: relationshipDraft.notes || undefined,
        }),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Falha ao criar relacao");
      setRelationshipDraft((current) => ({
        ...current,
        type: "",
        weight: "1",
        notes: "",
      }));
      await Promise.all([loadGraph(), loadInspectEntity(inspectEntity.id)]);
    } catch (err) {
      console.error(err);
      notifyError(err instanceof Error ? err.message : "Falha ao criar relacao");
    } finally {
      setRelationshipSubmitting(false);
    }
  }

  function startEditingRelationship(
    relation:
      | EntityDetail["outgoingRelations"][number]
      | EntityDetail["incomingRelations"][number]
  ) {
    setEditingRelationshipId(relation.id);
    setRelationshipEditDraft({
      fromEntityId: relation.fromEntityId || inspectEntity?.id || "",
      toEntityId: relation.toEntityId || inspectEntity?.id || "",
      type: relation.type || "",
      weight: relation.weight ? String(relation.weight) : "1",
      directionality: relation.directionality || "DIRECTED",
      visibility: relation.visibility || "MASTER",
      notes: relation.notes || "",
    });
  }

  async function handleSaveRelationshipEdit(relationshipId: string) {
    if (!relationshipEditDraft.fromEntityId || !relationshipEditDraft.toEntityId || !relationshipEditDraft.type.trim()) {
      return;
    }
    setRelationshipSubmitting(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships/${relationshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEntityId: relationshipEditDraft.fromEntityId,
          toEntityId: relationshipEditDraft.toEntityId,
          type: relationshipEditDraft.type,
          weight: relationshipEditDraft.weight ? Number(relationshipEditDraft.weight) : undefined,
          directionality: relationshipEditDraft.directionality,
          visibility: relationshipEditDraft.visibility,
          notes: relationshipEditDraft.notes || undefined,
        }),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Falha ao atualizar relacao");
      setEditingRelationshipId(null);
      notifySuccess("Relacao atualizada.");
      if (inspectEntity?.id) {
        await Promise.all([loadGraph(), loadInspectEntity(inspectEntity.id)]);
      }
    } catch (err) {
      console.error(err);
      notifyError(err instanceof Error ? err.message : "Falha ao atualizar relacao");
    } finally {
      setRelationshipSubmitting(false);
    }
  }

  async function handleDeleteRelationship(relationshipId: string) {
    const confirmed = await confirmDestructive({
      title: "Remover relacao do grafo?",
      description: "Esta acao remove o vinculo entre entidades no mundo atual.",
      confirmText: "Remover",
      cancelText: "Cancelar",
      variant: "destructive",
    });
    if (!confirmed) return;

    setRelationshipDeletingId(relationshipId);
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships/${relationshipId}`, {
        method: "DELETE",
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Falha ao remover relacao");
      if (editingRelationshipId === relationshipId) setEditingRelationshipId(null);
      notifySuccess("Relacao removida.");
      if (inspectEntity?.id) {
        await Promise.all([loadGraph(), loadInspectEntity(inspectEntity.id)]);
      }
    } catch (err) {
      console.error(err);
      notifyError(err instanceof Error ? err.message : "Falha ao remover relacao");
    } finally {
      setRelationshipDeletingId(null);
    }
  }

  function inspectConnectedEntity(entityId?: string | null) {
    if (!entityId) return;
    setEditingRelationshipId(null);
    setInspectId(entityId);
    setFocusNodeId(entityId);
  }

  function applyGraphPreset(preset: "general" | "genealogy" | "alive" | "houses") {
    setFocusNodeId(null);
    setInspectId(null);
    setEditingRelationshipId(null);

    switch (preset) {
      case "genealogy":
        setGraphMode("genealogy");
        setTerm("");
        setTypeFilter("");
        setStatusFilter("");
        setTagFilter("");
        setCampaignFilter("");
        setRelationTypeFilter("");
        return;
      case "alive":
        setGraphMode("narrative");
        setTerm("");
        setTypeFilter("");
        setStatusFilter("alive");
        setTagFilter("");
        setCampaignFilter("");
        setRelationTypeFilter("");
        return;
      case "houses":
        setGraphMode("narrative");
        setTerm("");
        setTypeFilter("house");
        setStatusFilter("");
        setTagFilter("");
        setCampaignFilter("");
        setRelationTypeFilter("");
        return;
      default:
        setGraphMode("narrative");
        setTerm("");
        setTypeFilter("");
        setStatusFilter("");
        setTagFilter("");
        setCampaignFilter("");
        setRelationTypeFilter("");
    }
  }

  const campaigns = payload?.world.campaigns ?? [];

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Grafo narrativo</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {payload?.stats.nodes ?? 0} nos
              </Badge>
              <Badge className="border-white/10 bg-black/24 text-white/72">
                {payload?.stats.edges ?? 0} arestas
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Tecido vivo do mundo</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                Relacoes, linhagens e conflitos viram superficie navegavel.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {graphMode === "genealogy"
                  ? "Modo genealogico ativo: casas, linhagens e vinculos familiares ganham uma leitura propria sem sair do cockpit."
                  : "Este e o primeiro slice do grafo: leitura world-scoped, foco em entidade e salto direto para o Codex."}
              </p>
            </div>
            <ModeSwitcher worldId={worldId} />
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => void loadGraph()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar grafo
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${worldId}/codex`}>
                  Voltar ao Codex
                </Link>
              </Button>
              <div className="flex rounded-2xl border border-white/10 bg-black/20 p-1">
                <button
                  type="button"
                  className={`rounded-xl px-3 py-2 text-sm transition ${graphMode === "narrative" ? "bg-white text-black" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setGraphMode("narrative")}
                >
                  Narrativo
                </button>
                <button
                  type="button"
                  className={`rounded-xl px-3 py-2 text-sm transition ${graphMode === "genealogy" ? "bg-white text-black" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setGraphMode("genealogy")}
                >
                  Genealogico
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura do grafo</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Entidades visiveis</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{visibleGraph.nodes.length}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Relacoes visiveis</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{visibleGraph.edges.length}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Modo</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {graphMode === "genealogy" ? "Genealogico" : focusNode?.name || "Narrativo geral"}
                  </p>
                </div>
              </div>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Busca e filtros</p>
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <ScanSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder="Nome, resumo ou subtipo"
                    className="h-12 rounded-2xl border-white/10 bg-black/25 pl-11"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <SelectField className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm" value={typeFilter} onValueChange={setTypeFilter} placeholder="Todos os tipos" options={entityTypeOptions} />
                  <SelectField className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm" value={campaignFilter} onValueChange={setCampaignFilter} placeholder="Todas as campanhas" options={campaigns.map((campaign) => ({ value: campaign.id, label: campaign.name }))} />
                  <SelectField className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm" value={relationTypeFilter} onValueChange={setRelationTypeFilter} placeholder="Todas as relacoes" options={(payload?.relationTypes ?? []).map((item) => ({ value: item, label: item }))} />
                  <SelectField className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm" value={statusFilter} onValueChange={setStatusFilter} placeholder="Todos os status" options={statusFilterOptions} />
                  <SelectField className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm" value={tagFilter} onValueChange={setTagFilter} placeholder="Todas as tags" options={availableTags.map((tag) => ({ value: tag, label: tag }))} />
                </div>
                {statusFilter || tagFilter ? (
                  <div className="flex flex-wrap gap-2">
                    {statusFilter ? (
                      <Badge className="border-white/10 bg-white/5 text-foreground">
                        status: {statusFilter}
                      </Badge>
                    ) : null}
                    {tagFilter ? (
                      <Badge className="border-white/10 bg-white/5 text-foreground">
                        tag: {tagFilter}
                      </Badge>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/10 bg-white/5"
                    onClick={() => applyGraphPreset("general")}
                  >
                    Geral
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/10 bg-white/5"
                    onClick={() => applyGraphPreset("genealogy")}
                  >
                    Genealogia
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/10 bg-white/5"
                    onClick={() => applyGraphPreset("alive")}
                  >
                    Vivos
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/10 bg-white/5"
                    onClick={() => applyGraphPreset("houses")}
                  >
                    Casas
                  </Button>
                </div>
                <Button variant="outline" className="w-full border-white/10 bg-white/5" onClick={() => void loadGraph()}>
                  <Filter className="mr-2 h-4 w-4" />
                  Aplicar leitura
                </Button>
                {focusNodeId ? (
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={() => setFocusNodeId(null)}
                  >
                    Limpar foco local
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="h-[560px] animate-pulse rounded-[32px] border border-white/10 bg-white/4" />
      ) : error ? (
        <EmptyState
          title="Falha ao carregar o grafo"
          description={error}
          icon={<Network className="h-6 w-6" />}
          action={<Button onClick={() => void loadGraph()}>Tentar novamente</Button>}
        />
      ) : !visibleGraph.nodes.length ? (
        <EmptyState
          title="Nada para mostrar no grafo"
          description="Com os filtros atuais, nenhuma entidade ou relacao ficou visivel."
          icon={<Network className="h-6 w-6" />}
          action={<Button onClick={() => setFocusNodeId(null)}>Limpar foco</Button>}
        />
      ) : (
        <NarrativeGraphBoard
          nodes={visibleGraph.nodes}
          edges={visibleGraph.edges}
          selectedNodeId={inspectId}
          focusNodeId={focusNodeId}
          mode={graphMode}
          onSelectNode={(nodeId) => {
            setInspectId(nodeId);
          }}
        />
      )}

      <CockpitDetailSheet
        open={inspectId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setInspectId(null);
            setInspectEntity(null);
          }
        }}
        badge="Quick inspect"
        title={inspectEntity?.name || "Carregando entidade"}
        description={
          inspectEntity
            ? `${inspectEntity.type}${inspectEntity.subtype ? ` • ${inspectEntity.subtype}` : ""} • ${inspectEntity.status}`
            : "Lendo detalhes do grafo"
        }
        footer={
          inspectEntity ? (
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-between border-white/10 bg-white/5" onClick={() => setFocusNodeId(inspectEntity.id)}>
                Focar conexoes desta entidade
                <ScanSearch className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${worldId}/codex/${inspectEntity.id}`}>
                  Abrir workspace da entidade
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : undefined
        }
      >
        {inspectLoading || !inspectEntity ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-[24px] border border-white/8 bg-white/4" />
            <div className="h-24 animate-pulse rounded-[24px] border border-white/8 bg-white/4" />
            <div className="h-24 animate-pulse rounded-[24px] border border-white/8 bg-white/4" />
          </div>
        ) : (
          <div className="space-y-4">
            {inspectEntity.portraitImageUrl || inspectEntity.coverImageUrl ? (
              <div
                className="min-h-[180px] rounded-[24px] border border-white/8 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.16), rgba(8,8,13,0.82)), url(${inspectEntity.portraitImageUrl || inspectEntity.coverImageUrl})`,
                }}
              />
            ) : null}

            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Resumo</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {inspectEntity.summary || inspectEntity.description || "Sem resumo registrado."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Visibilidade</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{inspectEntity.visibility}</p>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Campanha</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{inspectEntity.campaign?.name || "Mundo base"}</p>
              </div>
            </div>

            {Array.isArray(inspectEntity.tags) && inspectEntity.tags.length ? (
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {inspectEntity.tags.map((tag) => (
                    <Badge key={tag} className="border-white/10 bg-black/24 text-foreground">{tag}</Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Relacoes</p>
              <div className="mt-3 space-y-2">
                {inspectEntity.outgoingRelations.slice(0, 4).map((relation) => (
                  <div key={relation.id} className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-foreground">
                    {editingRelationshipId === relation.id ? (
                      <div className="space-y-3">
                        <Input
                          value={relationshipEditDraft.type}
                          onChange={(event) =>
                            setRelationshipEditDraft((current) => ({ ...current, type: event.target.value }))
                          }
                          className="h-10 rounded-xl border-white/10 bg-black/20"
                        />
                        <div className="grid gap-2 sm:grid-cols-3">
                          <Input
                            value={relationshipEditDraft.weight}
                            onChange={(event) =>
                              setRelationshipEditDraft((current) => ({ ...current, weight: event.target.value }))
                            }
                            placeholder="Peso"
                            className="h-10 rounded-xl border-white/10 bg-black/20"
                          />
                          <SelectField className="h-10 rounded-xl border-white/10 bg-black/20 px-3 text-sm" value={relationshipEditDraft.directionality} onValueChange={(value) => setRelationshipEditDraft((current) => ({ ...current, directionality: value }))} options={directionalityOptions} />
                          <SelectField className="h-10 rounded-xl border-white/10 bg-black/20 px-3 text-sm" value={relationshipEditDraft.visibility} onValueChange={(value) => setRelationshipEditDraft((current) => ({ ...current, visibility: value }))} options={visibilityOptions} />
                        </div>
                        <Input
                          value={relationshipEditDraft.notes}
                          onChange={(event) =>
                            setRelationshipEditDraft((current) => ({ ...current, notes: event.target.value }))
                          }
                          placeholder="Notas curtas"
                          className="h-10 rounded-xl border-white/10 bg-black/20"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 bg-white/5"
                            onClick={() => void handleSaveRelationshipEdit(relation.id)}
                            disabled={relationshipSubmitting}
                          >
                            <Save className="mr-2 h-3.5 w-3.5" />
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => setEditingRelationshipId(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>{relation.type} → {relation.toEntity?.name || "Destino"}</div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          Peso {relation.weight ?? 1} â€¢ {relation.visibility || "MASTER"}
                        </p>
                        {relation.notes ? (
                          <p className="text-xs text-muted-foreground">{relation.notes}</p>
                        ) : null}
                        {relation.toEntity?.id ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 justify-between border-white/10 bg-white/5 text-xs"
                            onClick={() => inspectConnectedEntity(relation.toEntity?.id)}
                          >
                            Seguir para {relation.toEntity?.name || "destino"}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            onClick={() => startEditingRelationship(relation)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-muted-foreground hover:text-destructive"
                            onClick={() => void handleDeleteRelationship(relation.id)}
                            disabled={relationshipDeletingId === relation.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {inspectEntity.incomingRelations.slice(0, 4).map((relation) => (
                  <div key={relation.id} className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-foreground">
                    {editingRelationshipId === relation.id ? (
                      <div className="space-y-3">
                        <Input
                          value={relationshipEditDraft.type}
                          onChange={(event) =>
                            setRelationshipEditDraft((current) => ({ ...current, type: event.target.value }))
                          }
                          className="h-10 rounded-xl border-white/10 bg-black/20"
                        />
                        <div className="grid gap-2 sm:grid-cols-3">
                          <Input
                            value={relationshipEditDraft.weight}
                            onChange={(event) =>
                              setRelationshipEditDraft((current) => ({ ...current, weight: event.target.value }))
                            }
                            placeholder="Peso"
                            className="h-10 rounded-xl border-white/10 bg-black/20"
                          />
                          <SelectField className="h-10 rounded-xl border-white/10 bg-black/20 px-3 text-sm" value={relationshipEditDraft.directionality} onValueChange={(value) => setRelationshipEditDraft((current) => ({ ...current, directionality: value }))} options={directionalityOptions} />
                          <SelectField className="h-10 rounded-xl border-white/10 bg-black/20 px-3 text-sm" value={relationshipEditDraft.visibility} onValueChange={(value) => setRelationshipEditDraft((current) => ({ ...current, visibility: value }))} options={visibilityOptions} />
                        </div>
                        <Input
                          value={relationshipEditDraft.notes}
                          onChange={(event) =>
                            setRelationshipEditDraft((current) => ({ ...current, notes: event.target.value }))
                          }
                          placeholder="Notas curtas"
                          className="h-10 rounded-xl border-white/10 bg-black/20"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 bg-white/5"
                            onClick={() => void handleSaveRelationshipEdit(relation.id)}
                            disabled={relationshipSubmitting}
                          >
                            <Save className="mr-2 h-3.5 w-3.5" />
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => setEditingRelationshipId(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>{relation.fromEntity?.name || "Origem"} → {relation.type}</div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          Peso {relation.weight ?? 1} â€¢ {relation.visibility || "MASTER"}
                        </p>
                        {relation.notes ? (
                          <p className="text-xs text-muted-foreground">{relation.notes}</p>
                        ) : null}
                        {relation.fromEntity?.id ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 justify-between border-white/10 bg-white/5 text-xs"
                            onClick={() => inspectConnectedEntity(relation.fromEntity?.id)}
                          >
                            Seguir para {relation.fromEntity?.name || "origem"}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            onClick={() => startEditingRelationship(relation)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-muted-foreground hover:text-destructive"
                            onClick={() => void handleDeleteRelationship(relation.id)}
                            disabled={relationshipDeletingId === relation.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {!inspectEntity.outgoingRelations.length && !inspectEntity.incomingRelations.length ? (
                  <p className="text-sm text-muted-foreground">Nenhuma relacao registrada ainda.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Criar relacao no grafo</p>
              <div className="mt-3 space-y-3">
                <SelectField className="h-11 w-full rounded-2xl border-white/10 bg-black/20 px-4 text-sm" value={relationshipDraft.toEntityId} onValueChange={(value) => setRelationshipDraft((current) => ({ ...current, toEntityId: value }))} placeholder="Selecione um destino" options={relationTargets.map((node) => ({ value: node.id, label: `${node.name} · ${node.type}` }))} />
                <Input
                  value={relationshipDraft.type}
                  onChange={(event) =>
                    setRelationshipDraft((current) => ({ ...current, type: event.target.value }))
                  }
                  placeholder="Ex.: aliado, odeia, herdeiro, matou"
                  className="h-11 rounded-2xl border-white/10 bg-black/20"
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    value={relationshipDraft.weight}
                    onChange={(event) =>
                      setRelationshipDraft((current) => ({ ...current, weight: event.target.value }))
                    }
                    placeholder="Peso (1-10)"
                    className="h-11 rounded-2xl border-white/10 bg-black/20"
                  />
                  <SelectField className="h-11 rounded-2xl border-white/10 bg-black/20 px-4 text-sm" value={relationshipDraft.directionality} onValueChange={(value) => setRelationshipDraft((current) => ({ ...current, directionality: value }))} options={directionalityOptions} />
                  <SelectField className="h-11 rounded-2xl border-white/10 bg-black/20 px-4 text-sm" value={relationshipDraft.visibility} onValueChange={(value) => setRelationshipDraft((current) => ({ ...current, visibility: value }))} options={visibilityOptions} />
                </div>
                <Input
                  value={relationshipDraft.notes}
                  onChange={(event) =>
                    setRelationshipDraft((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder="Notas curtas da relacao"
                  className="h-11 rounded-2xl border-white/10 bg-black/20"
                />
                <Button
                  variant="outline"
                  className="w-full justify-between border-white/10 bg-white/5"
                  onClick={() => void handleCreateRelationshipFromGraph()}
                  disabled={
                    relationshipSubmitting ||
                    !relationshipDraft.toEntityId ||
                    !relationshipDraft.type.trim()
                  }
                >
                  {relationshipSubmitting ? "Criando relacao..." : "Criar relacao"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Memoria recente</p>
              <div className="mt-3 space-y-2">
                {inspectEntity.recentEvents.length ? (
                  inspectEntity.recentEvents.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                      <p className="text-sm font-semibold text-foreground">{event.text || event.type}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {formatDate(event.ts)} • {event.visibility}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum evento recente ligado a esta entidade.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CockpitDetailSheet>
    </div>
  );
}
