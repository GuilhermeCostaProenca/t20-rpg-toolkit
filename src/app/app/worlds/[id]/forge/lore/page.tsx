"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { BookOpenText, Eye, FileText, PencilLine, RefreshCw, Search, Sparkles, Trash2, Waypoints } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { buildLoreTextIndex, inferLoreCampaignIds, inferLorePrepContexts, parseLoreTextIndex, type LorePrepContext, type LorePrepFocus, type LoreVisibility } from "@/lib/lore";

type LoreDoc = { id: string; title: string; filePath: string; textIndex?: string | null; createdAt: string };
type LoreEntity = { id: string; name: string; type: string; campaign?: { id: string; name: string } | null };
type WorldPayload = {
  id: string;
  title: string;
  campaigns?: Array<{ id: string; name: string }>;
  nextSession?: { id: string; title: string; scheduledAt: string; campaign: { id: string; name: string } } | null;
};
type LoreDraft = {
  title: string;
  summary: string;
  section: string;
  visibility: LoreVisibility;
  tags: string;
  linkedEntityIds: string[];
  prepFocuses: LorePrepFocus[];
  content: string;
};

const initialDraft: LoreDraft = {
  title: "",
  summary: "",
  section: "",
  visibility: "MASTER",
  tags: "",
  linkedEntityIds: [],
  prepFocuses: [],
  content: "",
};

const prepFocusOptions: LorePrepFocus[] = ["arco", "gancho", "foco_de_mesa", "segredo", "referencia"];

function normalizeTags(raw: string) {
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

function formatDocDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function WorldForgeLorePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const worldId = params?.id as string;

  const [world, setWorld] = useState<WorldPayload | null>(null);
  const [docs, setDocs] = useState<LoreDoc[]>([]);
  const [entities, setEntities] = useState<LoreEntity[]>([]);
  const [draft, setDraft] = useState<LoreDraft>(initialDraft);
  const [editDraft, setEditDraft] = useState<LoreDraft>(initialDraft);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<LoreVisibility | "ALL">("ALL");
  const [contextFilter, setContextFilter] = useState<LorePrepContext | "ALL">("ALL");
  const [campaignFilter, setCampaignFilter] = useState<string>("ALL");
  const [prepFocusFilter, setPrepFocusFilter] = useState<LorePrepFocus | "ALL">("ALL");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState("");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [worldRes, docsRes, codexRes] = await Promise.all([
        fetch(`/api/worlds/${worldId}`, { cache: "no-store" }),
        fetch(`/api/ruleset-docs?worldId=${worldId}&type=LORE`, { cache: "no-store" }),
        fetch(`/api/worlds/${worldId}/codex?limit=200`, { cache: "no-store" }),
      ]);
      const worldPayload = await worldRes.json().catch(() => ({}));
      const docsPayload = await docsRes.json().catch(() => ({}));
      const codexPayload = await codexRes.json().catch(() => ({}));

      if (!worldRes.ok || !worldPayload.data) {
        throw new Error(worldPayload.error ?? "Nao foi possivel abrir a oficina de lore");
      }

      const nextDocs = (docsPayload.data as LoreDoc[] | undefined) ?? [];
      setWorld(worldPayload.data as WorldPayload);
      setDocs(nextDocs);
      setEntities(
        ((codexPayload.data?.entities as LoreEntity[] | undefined) ?? []).filter((entity) =>
          ["house", "faction", "institution", "office", "place", "npc", "character"].includes(entity.type)
        )
      );
      setSelectedDocId((current) => current ?? nextDocs[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erro inesperado ao carregar lore");
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    if (worldId) void loadLore();
  }, [loadLore, worldId]);

  useEffect(() => {
    const docId = searchParams.get("docId");
    if (docId) {
      setSelectedDocId(docId);
      setEditingDocId(null);
    }
  }, [searchParams]);

  useEffect(() => {
    const selected = docs.find((doc) => doc.id === selectedDocId) ?? docs[0];
    if (!selected) {
      setSelectedContent("");
      return;
    }
    if (selected.id !== selectedDocId) setSelectedDocId(selected.id);
    let cancelled = false;
    fetch(selected.filePath, { cache: "no-store" })
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setSelectedContent(text);
      })
      .catch(() => {
        if (!cancelled) setSelectedContent("Nao foi possivel carregar o conteudo deste bloco de lore.");
      });
    return () => {
      cancelled = true;
    };
  }, [docs, selectedDocId]);

  const sectionStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const doc of docs) {
      const section = parseLoreTextIndex(doc.textIndex).section || "Sem secao";
      counts.set(section, (counts.get(section) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([section, total]) => ({ section, total }));
  }, [docs]);

  const contextStats = useMemo(() => {
    const counts = new Map<LorePrepContext, number>();
    for (const doc of docs) {
      const meta = parseLoreTextIndex(doc.textIndex);
      const linked = meta.linkedEntityIds
        .map((id) => entities.find((entity) => entity.id === id))
        .filter((entity): entity is LoreEntity => Boolean(entity));
      for (const context of inferLorePrepContexts(linked)) {
        counts.set(context, (counts.get(context) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([context, total]) => ({ context, total }));
  }, [docs, entities]);

  const prepFocusStats = useMemo(() => {
    const counts = new Map<LorePrepFocus, number>();
    for (const doc of docs) {
      const meta = parseLoreTextIndex(doc.textIndex);
      for (const focus of meta.prepFocuses) {
        counts.set(focus, (counts.get(focus) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([focus, total]) => ({ focus, total }));
  }, [docs]);

  const filteredDocs = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return docs.filter((doc) => {
      const meta = parseLoreTextIndex(doc.textIndex);
      const linked = meta.linkedEntityIds
        .map((id) => entities.find((entity) => entity.id === id))
        .filter((entity): entity is LoreEntity => Boolean(entity));
      const contexts = inferLorePrepContexts(linked);
      const campaignIds = inferLoreCampaignIds(linked);
      const sectionMatches = sectionFilter === "ALL" || (meta.section || "Sem secao") === sectionFilter;
      const visibilityMatches = visibilityFilter === "ALL" || meta.visibility === visibilityFilter;
      const contextMatches = contextFilter === "ALL" || contexts.includes(contextFilter);
      const prepFocusMatches = prepFocusFilter === "ALL" || meta.prepFocuses.includes(prepFocusFilter);
      const nextCampaignId = world?.nextSession?.campaign?.id;
      const campaignMatches =
        campaignFilter === "ALL"
          ? true
          : campaignFilter === "GENERAL"
            ? campaignIds.length === 0
            : campaignFilter === "NEXT"
              ? nextCampaignId ? campaignIds.includes(nextCampaignId) : false
              : campaignIds.includes(campaignFilter);
      const textMatches =
        !normalized ||
        [doc.title, meta.summary, meta.section, meta.visibility, meta.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return sectionMatches && visibilityMatches && contextMatches && prepFocusMatches && campaignMatches && textMatches;
    });
  }, [campaignFilter, contextFilter, docs, entities, prepFocusFilter, search, sectionFilter, visibilityFilter, world]);

  const selectedDoc = useMemo(
    () => filteredDocs.find((doc) => doc.id === selectedDocId) ?? filteredDocs[0] ?? null,
    [filteredDocs, selectedDocId]
  );

  const selectedMeta = useMemo(
    () => (selectedDoc ? parseLoreTextIndex(selectedDoc.textIndex) : null),
    [selectedDoc]
  );

  useEffect(() => {
    if (!selectedDoc || !selectedMeta) return;
    setEditDraft({
      title: selectedDoc.title,
      summary: selectedMeta.summary,
      section: selectedMeta.section,
      visibility: selectedMeta.visibility,
      tags: selectedMeta.tags.join(", "),
      linkedEntityIds: selectedMeta.linkedEntityIds,
      content: selectedContent,
      prepFocuses: selectedMeta.prepFocuses,
    });
  }, [selectedContent, selectedDoc, selectedMeta]);

  async function handleCreateLore(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) {
      setError("Titulo e conteudo sao obrigatorios para criar bloco de lore.");
      return;
    }
    setCreating(true);
    setError(null);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("worldId", worldId);
      formData.append("title", draft.title);
      formData.append("type", "LORE");
      formData.append("content", draft.content);
      formData.append("textIndex", buildLoreTextIndex({
        summary: draft.summary,
        section: draft.section,
        visibility: draft.visibility,
        tags: normalizeTags(draft.tags),
        linkedEntityIds: draft.linkedEntityIds,
        prepFocuses: draft.prepFocuses,
      }));
      const res = await fetch("/api/ruleset-docs", { method: "POST", body: formData });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Nao foi possivel criar bloco de lore");
      setDraft((current) => ({ ...initialDraft, linkedEntityIds: current.linkedEntityIds }));
      setMessage("Bloco de lore salvo no corpus do mundo.");
      await loadLore();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Erro inesperado ao criar lore");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateLore() {
    if (!selectedDoc || !editDraft.title.trim() || !editDraft.content.trim()) {
      setError("Titulo e conteudo sao obrigatorios para salvar o bloco de lore.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/ruleset-docs/${selectedDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editDraft.title,
          content: editDraft.content,
          textIndex: buildLoreTextIndex({
            summary: editDraft.summary,
            section: editDraft.section,
            visibility: editDraft.visibility,
            tags: normalizeTags(editDraft.tags),
            linkedEntityIds: editDraft.linkedEntityIds,
            prepFocuses: editDraft.prepFocuses,
          }),
        }),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Nao foi possivel atualizar o bloco de lore");
      setEditingDocId(null);
      setMessage("Bloco de lore atualizado no corpus do mundo.");
      await loadLore();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Erro inesperado ao atualizar lore");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLore() {
    if (!selectedDoc || deleting) return;
    if (!confirm(`Remover o bloco de lore \"${selectedDoc.title}\"?`)) return;
    setDeleting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/ruleset-docs/${selectedDoc.id}`, { method: "DELETE" });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Nao foi possivel remover o bloco de lore");
      setSelectedDocId(null);
      setEditingDocId(null);
      setSelectedContent("");
      setMessage("Bloco de lore removido do corpus.");
      await loadLore();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Erro inesperado ao remover lore");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[280px] w-full rounded-[32px]" />
        <Skeleton className="h-[960px] w-full rounded-[32px]" />
      </div>
    );
  }

  if (!world) {
    return (
      <EmptyState
        title="Lore indisponivel"
        description={error ?? "Nao foi possivel abrir a oficina de lore deste mundo."}
        icon={<BookOpenText className="h-6 w-6" />}
        action={<Button onClick={() => void loadLore()}>Tentar novamente</Button>}
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Lore-base</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">{docs.length} blocos de lore</Badge>
              <Badge className="border-white/10 bg-white/5 text-white/80">{sectionStats.length} secoes</Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Forja do mundo</p>
              <h1 className="max-w-4xl text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl xl:text-6xl">
                Corpus de mundo para guardar historia, segredos e estrutura textual.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Organize lore-base dentro do app, com resumo, visibilidade, tags e ligacoes ao Codex.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => void loadLore()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/forge`}><Sparkles className="mr-2 h-4 w-4" />Voltar para forja</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/compendium`}><Waypoints className="mr-2 h-4 w-4" />Abrir compendio</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Busca do corpus</p>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Titulo, secao, tag, visibilidade..." className="h-12 rounded-2xl border-white/10 bg-black/25 pl-11" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className={sectionFilter === "ALL" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setSectionFilter("ALL")}>Todas as secoes</Button>
                {sectionStats.slice(0, 6).map((item) => (
                  <Button key={item.section} type="button" variant="outline" className={sectionFilter === item.section ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setSectionFilter(item.section)}>
                    {item.section} · {item.total}
                  </Button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className={visibilityFilter === "ALL" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setVisibilityFilter("ALL")}>Tudo</Button>
                <Button type="button" variant="outline" className={visibilityFilter === "MASTER" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setVisibilityFilter("MASTER")}>Somente mestre</Button>
                <Button type="button" variant="outline" className={visibilityFilter === "PLAYERS" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setVisibilityFilter("PLAYERS")}>Revelavel</Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className={contextFilter === "ALL" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setContextFilter("ALL")}>Todos os contextos</Button>
                {contextStats.map((item) => (
                  <Button key={item.context} type="button" variant="outline" className={contextFilter === item.context ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setContextFilter(item.context)}>
                    {item.context} · {item.total}
                  </Button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className={campaignFilter === "ALL" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setCampaignFilter("ALL")}>Todas as campanhas</Button>
                <Button type="button" variant="outline" className={campaignFilter === "GENERAL" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setCampaignFilter("GENERAL")}>Base do mundo</Button>
                {world?.nextSession?.campaign?.id ? (
                  <Button type="button" variant="outline" className={campaignFilter === "NEXT" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setCampaignFilter("NEXT")}>
                    Proxima mesa · {world.nextSession.campaign.name}
                  </Button>
                ) : null}
                {(world?.campaigns ?? []).slice(0, 5).map((campaign) => (
                  <Button key={campaign.id} type="button" variant="outline" className={campaignFilter === campaign.id ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setCampaignFilter(campaign.id)}>
                    {campaign.name}
                  </Button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className={prepFocusFilter === "ALL" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setPrepFocusFilter("ALL")}>Todos os recortes</Button>
                {prepFocusStats.map((item) => (
                  <Button key={item.focus} type="button" variant="outline" className={prepFocusFilter === item.focus ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setPrepFocusFilter(item.focus)}>
                    {item.focus} · {item.total}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)]">
        <section className="chrome-panel rounded-[30px] p-6">
          <div className="mb-5 space-y-2">
            <p className="section-eyebrow">Passo 1</p>
            <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">Criar bloco de lore</h2>
          </div>
          <form onSubmit={handleCreateLore} className="grid gap-4">
            <Input value={draft.title} onChange={(e) => setDraft((c) => ({ ...c, title: e.target.value }))} placeholder="Titulo do bloco de lore" />
            <Input value={draft.section} onChange={(e) => setDraft((c) => ({ ...c, section: e.target.value }))} placeholder="Secao: historia, religiao, politica..." />
            <Input value={draft.summary} onChange={(e) => setDraft((c) => ({ ...c, summary: e.target.value }))} placeholder="Resumo curto" />
            <Input value={draft.tags} onChange={(e) => setDraft((c) => ({ ...c, tags: e.target.value }))} placeholder="Tags separadas por virgula" />
            <div className="flex flex-wrap gap-2">
              {(["MASTER", "PLAYERS"] as LoreVisibility[]).map((visibility) => (
                <Button key={visibility} type="button" variant="outline" className={draft.visibility === visibility ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setDraft((current) => ({ ...current, visibility }))}>
                  <Eye className="mr-2 h-4 w-4" />{visibility === "MASTER" ? "Somente mestre" : "Revelavel"}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {prepFocusOptions.map((focus) => (
                <Button key={focus} type="button" variant="outline" className={draft.prepFocuses.includes(focus) ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setDraft((current) => ({ ...current, prepFocuses: current.prepFocuses.includes(focus) ? current.prepFocuses.filter((item) => item !== focus) : [...current.prepFocuses, focus] }))}>
                  {focus}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {entities.slice(0, 20).map((entity) => (
                <Button key={entity.id} type="button" variant="outline" className={draft.linkedEntityIds.includes(entity.id) ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setDraft((current) => ({ ...current, linkedEntityIds: current.linkedEntityIds.includes(entity.id) ? current.linkedEntityIds.filter((id) => id !== entity.id) : [...current.linkedEntityIds, entity.id].slice(0, 8) }))}>
                  {entity.name}
                </Button>
              ))}
            </div>
            <Textarea className="min-h-[280px]" value={draft.content} onChange={(e) => setDraft((c) => ({ ...c, content: e.target.value }))} placeholder="Escreva aqui a base textual do mundo..." />
            <Button type="submit" disabled={creating}><Sparkles className="mr-2 h-4 w-4" />{creating ? "Salvando..." : "Salvar bloco de lore"}</Button>
            {message ? <p className="text-sm text-emerald-200">{message}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </form>
        </section>

        <section className="chrome-panel rounded-[30px] p-6">
          <div className="mb-5 space-y-2">
            <p className="section-eyebrow">Passo 2</p>
            <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">Consultar e editar corpus</h2>
          </div>
          {filteredDocs.length === 0 ? (
            <EmptyState title={docs.length === 0 ? "Nenhum bloco de lore" : "Nada encontrado"} description={docs.length === 0 ? "Crie o primeiro bloco de lore-base deste mundo." : "Ajuste filtros e busca para localizar outro bloco do corpus."} icon={<FileText className="h-6 w-6" />} />
          ) : (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
              <div className="space-y-3">
                {filteredDocs.map((doc) => {
                  const meta = parseLoreTextIndex(doc.textIndex);
                  const linked = meta.linkedEntityIds
                    .map((id) => entities.find((entity) => entity.id === id))
                    .filter((entity): entity is LoreEntity => Boolean(entity));
                  const contexts = inferLorePrepContexts(linked);
                  const campaignIds = inferLoreCampaignIds(linked);
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <button key={doc.id} type="button" onClick={() => setSelectedDocId(doc.id)} className={`rounded-[24px] border p-4 text-left transition ${isSelected ? "border-primary/30 bg-primary/10" : "border-white/10 bg-white/4 hover:border-white/20"}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-white/10 bg-white/5 text-white/80">{meta.section || "Lore"}</Badge>
                        <Badge className={meta.visibility === "MASTER" ? "border-red-300/20 bg-red-300/10 text-red-100" : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"}>{meta.visibility === "MASTER" ? "Somente mestre" : "Revelavel"}</Badge>
                        <Badge className="border-white/10 bg-black/25 text-white/70">{formatDocDate(doc.createdAt)}</Badge>
                        {contexts.map((context) => <Badge key={context} className="border-white/10 bg-black/25 text-white/70">{context}</Badge>)}
                        {meta.prepFocuses.map((focus) => <Badge key={focus} className="border-violet-300/20 bg-violet-300/10 text-violet-100">{focus}</Badge>)}
                        {campaignIds.slice(0, 2).map((campaignId) => {
                          const campaignName = world?.campaigns?.find((campaign) => campaign.id === campaignId)?.name;
                          return campaignName ? <Badge key={campaignId} className="border-amber-300/20 bg-amber-300/10 text-amber-100">{campaignName}</Badge> : null;
                        })}
                      </div>
                      <h3 className="mt-3 text-lg font-black uppercase tracking-[0.04em] text-foreground">{doc.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{meta.summary || "Sem resumo ainda."}</p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
                {selectedDoc && selectedMeta ? (
                  editingDocId === selectedDoc.id ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="section-eyebrow">Edicao ativa</p>
                          <h3 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">{selectedDoc.title}</h3>
                        </div>
                        <Button type="button" variant="outline" className="border-white/10 bg-white/5" onClick={() => setEditingDocId(null)}>Cancelar</Button>
                      </div>
                      <Input value={editDraft.title} onChange={(e) => setEditDraft((c) => ({ ...c, title: e.target.value }))} placeholder="Titulo" />
                      <Input value={editDraft.section} onChange={(e) => setEditDraft((c) => ({ ...c, section: e.target.value }))} placeholder="Secao" />
                      <Input value={editDraft.summary} onChange={(e) => setEditDraft((c) => ({ ...c, summary: e.target.value }))} placeholder="Resumo" />
                      <Input value={editDraft.tags} onChange={(e) => setEditDraft((c) => ({ ...c, tags: e.target.value }))} placeholder="Tags separadas por virgula" />
                      <div className="flex flex-wrap gap-2">
                        {prepFocusOptions.map((focus) => (
                          <Button key={focus} type="button" variant="outline" className={editDraft.prepFocuses.includes(focus) ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setEditDraft((current) => ({ ...current, prepFocuses: current.prepFocuses.includes(focus) ? current.prepFocuses.filter((item) => item !== focus) : [...current.prepFocuses, focus] }))}>
                            {focus}
                          </Button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(["MASTER", "PLAYERS"] as LoreVisibility[]).map((visibility) => (
                          <Button key={visibility} type="button" variant="outline" className={editDraft.visibility === visibility ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setEditDraft((current) => ({ ...current, visibility }))}>
                            <Eye className="mr-2 h-4 w-4" />{visibility === "MASTER" ? "Somente mestre" : "Revelavel"}
                          </Button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {entities.slice(0, 20).map((entity) => (
                          <Button key={entity.id} type="button" variant="outline" className={editDraft.linkedEntityIds.includes(entity.id) ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setEditDraft((current) => ({ ...current, linkedEntityIds: current.linkedEntityIds.includes(entity.id) ? current.linkedEntityIds.filter((id) => id !== entity.id) : [...current.linkedEntityIds, entity.id].slice(0, 8) }))}>
                            {entity.name}
                          </Button>
                        ))}
                      </div>
                      <Textarea className="min-h-[260px]" value={editDraft.content} onChange={(e) => setEditDraft((c) => ({ ...c, content: e.target.value }))} placeholder="Conteudo do bloco de lore" />
                      <div className="flex flex-wrap gap-3">
                        <Button type="button" onClick={() => void handleUpdateLore()} disabled={saving}><Sparkles className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar alteracoes"}</Button>
                        <Button type="button" variant="destructive" onClick={() => void handleDeleteLore()} disabled={deleting}><Trash2 className="mr-2 h-4 w-4" />{deleting ? "Removendo..." : "Remover bloco"}</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-primary/20 bg-primary/10 text-primary">{selectedMeta.section || "Lore"}</Badge>
                        <Badge className={selectedMeta.visibility === "MASTER" ? "border-red-300/20 bg-red-300/10 text-red-100" : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"}>{selectedMeta.visibility === "MASTER" ? "Somente mestre" : "Revelavel"}</Badge>
                        <Badge className="border-white/10 bg-black/25 text-white/70">{formatDocDate(selectedDoc.createdAt)}</Badge>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">{selectedDoc.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedMeta.summary || "Sem resumo registrado."}</p>
                        </div>
                        <Button type="button" variant="outline" className="border-white/10 bg-white/5" onClick={() => setEditingDocId(selectedDoc.id)}>
                          <PencilLine className="mr-2 h-4 w-4" />Editar
                        </Button>
                      </div>
                      {selectedMeta.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedMeta.tags.map((tag) => <Badge key={tag} className="border-white/10 bg-white/5 text-white/80">{tag}</Badge>)}
                        </div>
                      ) : null}
                      {selectedMeta.prepFocuses.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedMeta.prepFocuses.map((focus) => <Badge key={focus} className="border-violet-300/20 bg-violet-300/10 text-violet-100">{focus}</Badge>)}
                        </div>
                      ) : null}
                      {selectedMeta.linkedEntityIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedMeta.linkedEntityIds.map((id) => entities.find((entity) => entity.id === id)).filter((entity): entity is LoreEntity => Boolean(entity)).map((entity) => (
                            <Link key={entity.id} href={`/app/worlds/${worldId}/codex/${entity.id}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.14em] text-white/80 hover:border-primary/20 hover:text-primary">
                              {entity.name}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                        <pre className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{selectedContent || "Carregando conteudo..."}</pre>
                      </div>
                    </div>
                  )
                ) : null}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
