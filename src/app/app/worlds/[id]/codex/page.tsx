"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { useWorldInspect } from "@/components/world-os/world-inspect-context";

type EntityItem = {
  id: string;
  name: string;
  type: string;
  status: string;
  summary: string | null;
  slug: string | null;
};

export default function WorldCodexPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const worldId = params.id;
  const { setPayload } = useWorldInspect();

  const [entities, setEntities] = useState<EntityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("npc");
  const [summary, setSummary] = useState("");
  const [creating, setCreating] = useState(false);

  const [relFrom, setRelFrom] = useState("");
  const [relTo, setRelTo] = useState("");
  const [relType, setRelType] = useState("conecta");
  const [relLoading, setRelLoading] = useState(false);

  const shouldOpenCreate = searchParams.get("create") === "entity";

  const loadEntities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/worlds/${worldId}/entities`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Falha ao carregar entidades");
      setEntities(json.data || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar entidades");
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    void loadEntities();
  }, [loadEntities]);

  useEffect(() => {
    if (shouldOpenCreate) {
      const input = document.getElementById("codex-create-name");
      input?.focus();
    }
  }, [shouldOpenCreate]);

  const entityOptions = useMemo(() => entities.map((entity) => ({ id: entity.id, name: entity.name })), [entities]);

  async function createEntity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      setCreating(true);
      const res = await fetch(`/api/worlds/${worldId}/entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type, summary: summary.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Nao foi possivel criar entidade");
      setName("");
      setSummary("");
      await loadEntities();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Falha ao criar entidade");
    } finally {
      setCreating(false);
    }
  }

  async function createRelationship(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!relFrom || !relTo || relFrom === relTo) return;

    try {
      setRelLoading(true);
      const res = await fetch(`/api/worlds/${worldId}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromEntityId: relFrom, toEntityId: relTo, type: relType }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Nao foi possivel relacionar entidades");
      setRelFrom("");
      setRelTo("");
      setRelType("conecta");
    } catch (relError) {
      setError(relError instanceof Error ? relError.message : "Falha ao criar relacao");
    } finally {
      setRelLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Modo</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Codex</h1>
        <p className="mt-2 text-sm text-white/70">
          Nucleo estrutural do mundo com CTAs operacionais: criar entidade, relacionar e abrir contexto no caderno/lousa.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Link href={`/app/worlds/${worldId}/codex?create=entity`} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-white/90">
            Criar entidade
          </Link>
          <Link href={`/app/worlds/${worldId}/notebook?create=note`} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-white/90">
            Abrir no caderno
          </Link>
          <Link href={`/app/worlds/${worldId}/board?create=node`} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-white/90">
            Abrir na lousa
          </Link>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={createEntity} className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <h2 className="text-sm font-semibold text-white">Criar entidade</h2>
          <div className="mt-3 space-y-2">
            <input
              id="codex-create-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nome da entidade"
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/35"
            />
            <input
              value={type}
              onChange={(event) => setType(event.target.value)}
              placeholder="Tipo (npc, faction, place...)"
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/35"
            />
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Resumo curto"
              rows={3}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/35"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg border border-emerald-300/40 bg-emerald-400/20 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:opacity-60"
            >
              {creating ? "Salvando..." : "Criar entidade"}
            </button>
          </div>
        </form>

        <form onSubmit={createRelationship} className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <h2 className="text-sm font-semibold text-white">Relacionar</h2>
          <div className="mt-3 space-y-2">
            <select
              value={relFrom}
              onChange={(event) => setRelFrom(event.target.value)}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Origem</option>
              {entityOptions.map((entity) => (
                <option key={entity.id} value={entity.id}>{entity.name}</option>
              ))}
            </select>
            <select
              value={relTo}
              onChange={(event) => setRelTo(event.target.value)}
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Destino</option>
              {entityOptions.map((entity) => (
                <option key={entity.id} value={entity.id}>{entity.name}</option>
              ))}
            </select>
            <input
              value={relType}
              onChange={(event) => setRelType(event.target.value)}
              placeholder="Tipo da relacao"
              className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/35"
            />
            <button
              type="submit"
              disabled={relLoading}
              className="rounded-lg border border-sky-300/40 bg-sky-400/20 px-3 py-2 text-xs font-semibold text-sky-100 disabled:opacity-60"
            >
              {relLoading ? "Relacionando..." : "Relacionar"}
            </button>
          </div>
        </form>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-white">Entidades</h2>
        {loading ? <p className="mt-3 text-sm text-white/60">Carregando entidades...</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        {!loading && entities.length === 0 ? <p className="mt-3 text-sm text-white/60">Nenhuma entidade criada.</p> : null}
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {entities.map((entity) => (
            <article
              key={entity.id}
              className="rounded-xl border border-white/10 bg-black/25 p-3"
              onMouseEnter={() =>
                setPayload({
                  title: entity.name,
                  subtitle: "Entidade",
                  body: entity.summary || "Sem resumo.",
                  meta: [
                    { label: "Tipo", value: entity.type },
                    { label: "Status", value: entity.status },
                  ],
                })
              }
            >
              <p className="text-sm font-semibold text-white">{entity.name}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-white/45">{entity.type}</p>
              {entity.summary ? <p className="mt-2 text-xs text-white/70">{entity.summary}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <Link href={`/app/worlds/${worldId}/notebook?entity=${entity.id}`} className="rounded-md border border-white/15 px-2 py-1 text-white/75">Abrir no caderno</Link>
                <Link href={`/app/worlds/${worldId}/board?entity=${entity.id}`} className="rounded-md border border-white/15 px-2 py-1 text-white/75">Abrir na lousa</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
