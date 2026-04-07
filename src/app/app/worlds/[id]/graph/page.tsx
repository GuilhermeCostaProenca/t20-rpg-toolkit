"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { useWorldInspect } from "@/components/world-os/world-inspect-context";

type GraphNode = {
  id: string;
  name: string;
  type: string;
  status: string;
  relationCount: number;
};

type GraphEdge = {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: string;
  notes?: string | null;
  metadata?: { source?: string } | null;
};

type GraphPayload = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  relationTypes: string[];
};

export default function WorldGraphPage() {
  const params = useParams<{ id: string }>();
  const worldId = params.id;
  const search = useSearchParams();
  const { setPayload } = useWorldInspect();

  const [graph, setGraph] = useState<GraphPayload>({ nodes: [], edges: [], relationTypes: [] });
  const [relationType, setRelationType] = useState("");
  const [edgeSource, setEdgeSource] = useState<"all" | "explicit" | "semantic">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGraph = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const paramsSearch = new URLSearchParams();
      if (relationType) paramsSearch.set("relationType", relationType);
      const res = await fetch(`/api/worlds/${worldId}/graph?${paramsSearch.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Falha ao carregar grafo");
      setGraph(json.data as GraphPayload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar grafo");
    } finally {
      setLoading(false);
    }
  }, [relationType, worldId]);

  useEffect(() => {
    void loadGraph();
  }, [loadGraph]);

  useEffect(() => {
    const focusEntity = search.get("entity");
    if (!focusEntity) return;
    const node = graph.nodes.find((item) => item.id === focusEntity);
    if (!node) return;

    setPayload({
      title: node.name,
      subtitle: "Foco de grafo",
      body: `Tipo ${node.type}`,
      meta: [
        { label: "Status", value: node.status },
        { label: "Conexoes", value: String(node.relationCount) },
      ],
    });
  }, [graph.nodes, search, setPayload]);

  const nodeById = useMemo(() => new Map(graph.nodes.map((node) => [node.id, node])), [graph.nodes]);

  const visibleEdges = useMemo(() => {
    if (edgeSource === "all") return graph.edges;
    return graph.edges.filter((edge) => {
      const source = edge.metadata?.source === "semantic" || edge.type.startsWith("semantic:") ? "semantic" : "explicit";
      return source === edgeSource;
    });
  }, [graph.edges, edgeSource]);

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Modo</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Grafo</h1>
        <p className="mt-2 text-sm text-white/70">Arestas explicitas (`EntityRelationship`) e semanticas (`NoteLink` resolvido).</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <select
            value={relationType}
            onChange={(event) => setRelationType(event.target.value)}
            className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="">Todos os tipos</option>
            {graph.relationTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={edgeSource}
            onChange={(event) => setEdgeSource(event.target.value as "all" | "explicit" | "semantic")}
            className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="all">Origem: todas</option>
            <option value="explicit">Origem: explicita</option>
            <option value="semantic">Origem: semantica</option>
          </select>
          <button
            type="button"
            onClick={() => void loadGraph()}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
          >
            Atualizar grafo
          </button>
        </div>
      </header>

      {loading ? <p className="text-sm text-white/60">Carregando grafo...</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <h2 className="text-sm font-semibold text-white">Nos</h2>
          <ul className="mt-3 space-y-2">
            {graph.nodes.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  onMouseEnter={() =>
                    setPayload({
                      title: node.name,
                      subtitle: "No do grafo",
                      body: `Tipo ${node.type}`,
                      meta: [
                        { label: "Status", value: node.status },
                        { label: "Conexoes", value: String(node.relationCount) },
                      ],
                    })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/85"
                >
                  <p className="font-semibold">{node.name}</p>
                  <p className="text-xs text-white/50">{node.type}</p>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold text-white">Arestas visiveis</h2>
          <ul className="mt-3 space-y-2 text-xs">
            {visibleEdges.map((edge) => {
              const fromNode = nodeById.get(edge.fromEntityId);
              const toNode = nodeById.get(edge.toEntityId);
              return (
                <li key={edge.id} className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-white/80">
                  <p className="font-semibold text-white">{fromNode?.name ?? edge.fromEntityId} ? {toNode?.name ?? edge.toEntityId}</p>
                  <p className="mt-1 text-white/60">Tipo: {edge.type}</p>
                  {edge.notes ? <p className="mt-1 text-white/55">Ref: {edge.notes}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href={`/app/worlds/${worldId}/codex?entity=${fromNode?.id ?? ""}`} className="rounded-md border border-white/15 px-2 py-1 text-white/75">Abrir Codex</Link>
                    <Link href={`/app/worlds/${worldId}/notebook`} className="rounded-md border border-white/15 px-2 py-1 text-white/75">Abrir Caderno</Link>
                    <Link href={`/app/worlds/${worldId}/board`} className="rounded-md border border-white/15 px-2 py-1 text-white/75">Abrir Lousa</Link>
                  </div>
                </li>
              );
            })}
            {!visibleEdges.length ? <li className="text-white/60">Nenhuma aresta para os filtros atuais.</li> : null}
          </ul>
        </section>
      </div>
    </section>
  );
}
