"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { useWorldInspect } from "@/components/world-os/world-inspect-context";

type EntityOption = { id: string; name: string };
type NoteOption = { id: string; title: string };

type BoardNode = {
  id: string;
  nodeType: "entity" | "note";
  refId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
};

type BoardEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string | null;
};

type BoardPayload = {
  id: string;
  name: string;
  nodes: BoardNode[];
  edges: BoardEdge[];
  viewportJson?: Record<string, unknown> | null;
};

export default function WorldBoardPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const worldId = params.id;
  const { setPayload } = useWorldInspect();

  const [board, setBoard] = useState<BoardPayload | null>(null);
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [notes, setNotes] = useState<NoteOption[]>([]);
  const [nodeType, setNodeType] = useState<"entity" | "note">("entity");
  const [nodeRefId, setNodeRefId] = useState("");
  const [edgeSourceId, setEdgeSourceId] = useState("");
  const [edgeTargetId, setEdgeTargetId] = useState("");
  const [edgeLabel, setEdgeLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNodeParam = searchParams.get("create") === "node";
  const entityFocusParam = searchParams.get("entity") || "";

  const ensureBoard = useCallback(async (): Promise<BoardPayload> => {
    const listRes = await fetch(`/api/worlds/${worldId}/boards`, { cache: "no-store" });
    const listJson = await listRes.json();
    if (!listRes.ok) throw new Error(listJson?.message || "Falha ao carregar lousas");

    const firstBoard = (listJson.data || [])[0] as BoardPayload | undefined;
    if (firstBoard) {
      const res = await fetch(`/api/worlds/${worldId}/boards/${firstBoard.id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Falha ao carregar lousa");
      return json.data as BoardPayload;
    }

    const createRes = await fetch(`/api/worlds/${worldId}/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Lousa principal" }),
    });
    const createJson = await createRes.json();
    if (!createRes.ok) throw new Error(createJson?.message || "Falha ao criar lousa");
    return createJson.data as BoardPayload;
  }, [worldId]);

  const loadSupportData = useCallback(async () => {
    const [entitiesRes, notesRes] = await Promise.all([
      fetch(`/api/worlds/${worldId}/entities`, { cache: "no-store" }),
      fetch(`/api/worlds/${worldId}/notes`, { cache: "no-store" }),
    ]);
    const entitiesJson = await entitiesRes.json();
    const notesJson = await notesRes.json();
    if (!entitiesRes.ok) throw new Error(entitiesJson?.message || "Falha ao carregar entidades");
    if (!notesRes.ok) throw new Error(notesJson?.message || "Falha ao carregar notas");

    setEntities((entitiesJson.data || []).map((item: { id: string; name: string }) => ({ id: item.id, name: item.name })));
    setNotes((notesJson.data || []).map((item: { id: string; title: string }) => ({ id: item.id, title: item.title })));
  }, [worldId]);

  const loadBoard = useCallback(async () => {
    try {
      setError(null);
      const [boardData] = await Promise.all([ensureBoard(), loadSupportData()]);
      setBoard(boardData);

      if (createNodeParam && !nodeRefId) {
        if (entityFocusParam) {
          setNodeType("entity");
          setNodeRefId(entityFocusParam);
        }
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar lousa");
    }
  }, [createNodeParam, ensureBoard, entityFocusParam, loadSupportData, nodeRefId]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  const refOptions = useMemo(() => (nodeType === "entity" ? entities : notes.map((item) => ({ id: item.id, name: item.title }))), [entities, notes, nodeType]);

  async function persistBoard(next: BoardPayload) {
    try {
      setSaving(true);
      const res = await fetch(`/api/worlds/${worldId}/boards/${next.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: next.name,
          nodes: next.nodes,
          edges: next.edges,
          viewportJson: next.viewportJson,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Falha ao salvar lousa");
      setBoard(json.data as BoardPayload);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Falha ao salvar lousa");
    } finally {
      setSaving(false);
    }
  }

  async function addNode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!board || !nodeRefId) return;

    const next: BoardPayload = {
      ...board,
      nodes: [
        ...board.nodes,
        {
          id: `tmp-${Date.now().toString(36)}`,
          nodeType,
          refId: nodeRefId,
          x: 24 + board.nodes.length * 20,
          y: 24 + board.nodes.length * 20,
          w: 220,
          h: 120,
          z: board.nodes.length,
        },
      ],
    };

    await persistBoard(next);
    setNodeRefId("");
  }

  async function addEdge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!board || !edgeSourceId || !edgeTargetId || edgeSourceId === edgeTargetId) return;

    const next: BoardPayload = {
      ...board,
      edges: [
        ...board.edges,
        {
          id: `tmp-e-${Date.now().toString(36)}`,
          sourceNodeId: edgeSourceId,
          targetNodeId: edgeTargetId,
          label: edgeLabel || undefined,
        },
      ],
    };

    await persistBoard(next);
    setEdgeSourceId("");
    setEdgeTargetId("");
    setEdgeLabel("");
  }

  async function updateNodePosition(nodeId: string, key: "x" | "y", value: number) {
    if (!board) return;
    const next: BoardPayload = {
      ...board,
      nodes: board.nodes.map((node) => (node.id === nodeId ? { ...node, [key]: value } : node)),
    };
    setBoard(next);
  }

  const nodeLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    entities.forEach((entity) => map.set(entity.id, entity.name));
    notes.forEach((note) => map.set(note.id, note.title));
    return map;
  }, [entities, notes]);

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Modo</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Lousa</h1>
        <p className="mt-2 text-sm text-white/70">Cards de entidade/nota com conexoes persistidas por mundo.</p>
      </header>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {saving ? <p className="text-sm text-white/60">Salvando lousa...</p> : null}

      {board ? (
        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <form onSubmit={addNode} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <h2 className="text-sm font-semibold text-white">Inserir card</h2>
              <div className="mt-3 space-y-2">
                <select
                  value={nodeType}
                  onChange={(event) => {
                    setNodeType(event.target.value as "entity" | "note");
                    setNodeRefId("");
                  }}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                >
                  <option value="entity">Entidade</option>
                  <option value="note">Nota</option>
                </select>
                <select
                  value={nodeRefId}
                  onChange={(event) => setNodeRefId(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                >
                  <option value="">Selecionar referencia</option>
                  {refOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
                <button type="submit" className="rounded-lg border border-emerald-300/40 bg-emerald-400/20 px-3 py-2 text-xs font-semibold text-emerald-100">
                  Inserir card
                </button>
              </div>
            </form>

            <form onSubmit={addEdge} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <h2 className="text-sm font-semibold text-white">Conectar cards</h2>
              <div className="mt-3 space-y-2">
                <select value={edgeSourceId} onChange={(event) => setEdgeSourceId(event.target.value)} className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white">
                  <option value="">Card origem</option>
                  {board.nodes.map((node) => (
                    <option key={node.id} value={node.id}>{nodeLabelMap.get(node.refId) ?? node.refId}</option>
                  ))}
                </select>
                <select value={edgeTargetId} onChange={(event) => setEdgeTargetId(event.target.value)} className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white">
                  <option value="">Card destino</option>
                  {board.nodes.map((node) => (
                    <option key={node.id} value={node.id}>{nodeLabelMap.get(node.refId) ?? node.refId}</option>
                  ))}
                </select>
                <input
                  value={edgeLabel}
                  onChange={(event) => setEdgeLabel(event.target.value)}
                  placeholder="Label opcional"
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                />
                <button type="submit" className="rounded-lg border border-sky-300/40 bg-sky-400/20 px-3 py-2 text-xs font-semibold text-sky-100">
                  Conectar
                </button>
              </div>
            </form>
          </aside>

          <section className="rounded-2xl border border-white/10 bg-[#070a12] p-4">
            <div className="relative h-[640px] overflow-auto rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(73,119,255,0.18),_transparent_55%)]">
              {board.nodes.map((node) => (
                <article
                  key={node.id}
                  style={{ left: node.x, top: node.y, width: node.w, height: node.h, zIndex: node.z }}
                  onMouseEnter={() =>
                    setPayload({
                      title: nodeLabelMap.get(node.refId) ?? node.refId,
                      subtitle: node.nodeType === "entity" ? "Card de entidade" : "Card de nota",
                      body: `Posicao x:${Math.round(node.x)} y:${Math.round(node.y)}`,
                    })
                  }
                  className="absolute rounded-xl border border-white/15 bg-black/55 p-3 text-xs text-white shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
                >
                  <p className="text-[10px] uppercase tracking-wider text-white/50">{node.nodeType}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{nodeLabelMap.get(node.refId) ?? node.refId}</p>
                  <div className="mt-3 grid grid-cols-2 gap-1 text-[10px]">
                    <label className="text-white/60">X
                      <input
                        type="number"
                        value={Math.round(node.x)}
                        onChange={(event) => void updateNodePosition(node.id, "x", Number(event.target.value) || 0)}
                        className="mt-1 w-full rounded border border-white/20 bg-black/40 px-1 py-0.5 text-white"
                      />
                    </label>
                    <label className="text-white/60">Y
                      <input
                        type="number"
                        value={Math.round(node.y)}
                        onChange={(event) => void updateNodePosition(node.id, "y", Number(event.target.value) || 0)}
                        className="mt-1 w-full rounded border border-white/20 bg-black/40 px-1 py-0.5 text-white"
                      />
                    </label>
                  </div>
                </article>
              ))}
              {!board.nodes.length ? <p className="p-4 text-sm text-white/60">Nenhum card ainda. Insira o primeiro card na barra lateral.</p> : null}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => void persistBoard(board)}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white"
              >
                Salvar layout
              </button>
            </div>
          </section>
        </div>
      ) : (
        <p className="text-sm text-white/60">Carregando lousa...</p>
      )}
    </section>
  );
}
