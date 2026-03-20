"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Link2, Pencil, Plus, RefreshCw, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VISUAL_KIND_OPTIONS, getVisualKindLabel } from "@/lib/visual-library";

type Campaign = { id: string; name: string };
type EntityImage = { id: string; url: string; kind: string; caption?: string | null; sortOrder?: number | null };
type RelatedEntity = { id: string; name: string; type: string; status: string; portraitImageUrl?: string | null };
type RelationEdge = {
  id: string;
  type: string;
  directionality?: string | null;
  weight?: number | null;
  notes?: string | null;
  visibility?: string | null;
  toEntity?: RelatedEntity;
  fromEntity?: RelatedEntity;
};
type EntityDetail = {
  id: string;
  worldId: string;
  campaignId?: string | null;
  name: string;
  slug?: string | null;
  type: string;
  subtype?: string | null;
  summary?: string | null;
  description?: string | null;
  status: string;
  visibility: string;
  tags?: string[] | null;
  coverImageUrl?: string | null;
  portraitImageUrl?: string | null;
  campaign?: Campaign | null;
  images: EntityImage[];
  outgoingRelations: RelationEdge[];
  incomingRelations: RelationEdge[];
  recentEvents: Array<{ id: string; type: string; text?: string | null; ts: string; visibility: string }>;
};
type CodexPayload = {
  world: { id: string; title: string; description?: string | null; campaigns: Campaign[] };
  entities: Array<{ id: string; name: string; type: string; status: string }>;
};

const typeOptions = ["character", "npc", "faction", "house", "place", "artifact", "event"];

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CodexEntityWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const worldId = params?.id as string;
  const entityId = params?.entityId as string;

  const [entity, setEntity] = useState<EntityDetail | null>(null);
  const [codex, setCodex] = useState<CodexPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [relationSubmitting, setRelationSubmitting] = useState(false);
  const [imageSubmitting, setImageSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingRelationId, setEditingRelationId] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [imageDraft, setImageDraft] = useState({ url: "", kind: "reference", caption: "", sortOrder: "0" });
  const [relationDraft, setRelationDraft] = useState({
    toEntityId: "",
    type: "",
    directionality: "DIRECTED",
    weight: "",
    notes: "",
    visibility: "MASTER",
  });
  const [relationEditDraft, setRelationEditDraft] = useState({
    fromEntityId: entityId,
    toEntityId: "",
    type: "",
    directionality: "DIRECTED",
    weight: "",
    notes: "",
    visibility: "MASTER",
  });
  const [imageEditDraft, setImageEditDraft] = useState({
    url: "",
    kind: "reference",
    caption: "",
    sortOrder: "0",
  });
  const [form, setForm] = useState({
    name: "",
    type: "npc",
    campaignId: "",
    subtype: "",
    slug: "",
    status: "active",
    visibility: "MASTER",
    summary: "",
    description: "",
    tags: "",
    coverImageUrl: "",
    portraitImageUrl: "",
  });

  const loadWorkspace = useCallback(async () => {
    if (!worldId || !entityId) return;
    setLoading(true);
    setError(null);
    try {
      const [entityRes, codexRes] = await Promise.all([
        fetch(`/api/worlds/${worldId}/entities/${entityId}`, { cache: "no-store" }),
        fetch(`/api/worlds/${worldId}/codex`, { cache: "no-store" }),
      ]);
      const entityPayload = await entityRes.json().catch(() => ({}));
      const codexPayload = await codexRes.json().catch(() => ({}));
      if (!entityRes.ok) throw new Error(entityPayload.error ?? "Falha ao carregar entidade");
      if (!codexRes.ok) throw new Error(codexPayload.error ?? "Falha ao carregar contexto do mundo");

      const nextEntity = entityPayload.data as EntityDetail;
      setEntity(nextEntity);
      setCodex(codexPayload.data as CodexPayload);
      setForm({
        name: nextEntity.name ?? "",
        type: nextEntity.type ?? "npc",
        campaignId: nextEntity.campaignId ?? "",
        subtype: nextEntity.subtype ?? "",
        slug: nextEntity.slug ?? "",
        status: nextEntity.status ?? "active",
        visibility: nextEntity.visibility ?? "MASTER",
        summary: nextEntity.summary ?? "",
        description: nextEntity.description ?? "",
        tags: Array.isArray(nextEntity.tags) ? nextEntity.tags.join(", ") : "",
        coverImageUrl: nextEntity.coverImageUrl ?? "",
        portraitImageUrl: nextEntity.portraitImageUrl ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar workspace");
    } finally {
      setLoading(false);
    }
  }, [entityId, worldId]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  async function handleSaveEntity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          campaignId: form.campaignId || undefined,
          slug: form.slug || undefined,
          subtype: form.subtype || undefined,
          summary: form.summary || undefined,
          description: form.description || undefined,
          coverImageUrl: form.coverImageUrl || undefined,
          portraitImageUrl: form.portraitImageUrl || undefined,
          tags: form.tags ? form.tags.split(",").map((item) => item.trim()).filter(Boolean) : [],
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao salvar entidade");
      toast.success("Entidade atualizada.");
      await loadWorkspace();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar entidade");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateRelationship(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRelationSubmitting(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEntityId: entityId,
          toEntityId: relationDraft.toEntityId,
          type: relationDraft.type,
          directionality: relationDraft.directionality,
          weight: relationDraft.weight ? Number(relationDraft.weight) : undefined,
          notes: relationDraft.notes || undefined,
          visibility: relationDraft.visibility,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao criar relacao");
      toast.success("Relacao adicionada.");
      setRelationDraft({ toEntityId: "", type: "", directionality: "DIRECTED", weight: "", notes: "", visibility: "MASTER" });
      await loadWorkspace();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao criar relacao");
    } finally {
      setRelationSubmitting(false);
    }
  }

  async function handleDeleteRelationship(relationshipId: string) {
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships/${relationshipId}`, { method: "DELETE" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao remover relacao");
      toast.success("Relacao removida.");
      await loadWorkspace();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover relacao");
    }
  }

  function startEditingRelationship(relation: RelationEdge) {
    setEditingRelationId(relation.id);
    setRelationEditDraft({
      fromEntityId: relation.fromEntity?.id || entityId,
      toEntityId: relation.toEntity?.id || entityId,
      type: relation.type || "",
      directionality: relation.directionality || "DIRECTED",
      weight: relation.weight ? String(relation.weight) : "",
      notes: relation.notes || "",
      visibility: relation.visibility || "MASTER",
    });
  }

  async function handleSaveRelationshipEdit(relationshipId: string) {
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships/${relationshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEntityId: relationEditDraft.fromEntityId,
          toEntityId: relationEditDraft.toEntityId,
          type: relationEditDraft.type,
          directionality: relationEditDraft.directionality,
          weight: relationEditDraft.weight ? Number(relationEditDraft.weight) : undefined,
          notes: relationEditDraft.notes || undefined,
          visibility: relationEditDraft.visibility,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao atualizar relacao");
      toast.success("Relacao atualizada.");
      setEditingRelationId(null);
      await loadWorkspace();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao atualizar relacao");
    }
  }

  async function handleAddImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setImageSubmitting(true);
    try {
      const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: imageDraft.url,
          kind: imageDraft.kind,
          caption: imageDraft.caption || undefined,
          sortOrder: Number(imageDraft.sortOrder || "0"),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao adicionar imagem");
      toast.success("Imagem adicionada.");
      setImageDraft({ url: "", kind: "reference", caption: "", sortOrder: "0" });
      await loadWorkspace();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao adicionar imagem");
    } finally {
      setImageSubmitting(false);
    }
  }

  async function handleDeleteImage(imageId: string) {
    try {
      const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}/images/${imageId}`, { method: "DELETE" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao remover imagem");
      toast.success("Imagem removida.");
      await loadWorkspace();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover imagem");
    }
  }

  function startEditingImage(image: EntityImage) {
    setEditingImageId(image.id);
    setImageEditDraft({
      url: image.url,
      kind: image.kind || "reference",
      caption: image.caption || "",
      sortOrder: String(image.sortOrder ?? 0),
    });
  }

  async function handleSaveImageEdit(imageId: string) {
    try {
      const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}/images/${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: imageEditDraft.url,
          kind: imageEditDraft.kind,
          caption: imageEditDraft.caption || undefined,
          sortOrder: Number(imageEditDraft.sortOrder || "0"),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao atualizar imagem");
      toast.success("Imagem atualizada.");
      setEditingImageId(null);
      await loadWorkspace();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao atualizar imagem");
    }
  }

  async function handleUploadImageFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao enviar imagem");
      setImageDraft((prev) => ({ ...prev, url: payload.url || "" }));
      toast.success("Upload concluido.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar imagem");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleDeleteEntity() {
    const confirmed = window.confirm("Tem certeza que deseja remover esta entidade do mundo?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}`, { method: "DELETE" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao remover entidade");
      toast.success("Entidade removida.");
      router.push(`/app/worlds/${worldId}/codex`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao remover entidade");
    }
  }

  const relatedOptions = useMemo(() => (codex?.entities ?? []).filter((candidate) => candidate.id !== entityId), [codex?.entities, entityId]);
  const allRelations = useMemo(() => {
    if (!entity) return [];
    return [
      ...entity.outgoingRelations.map((relation) => ({ ...relation, label: `${relation.type} -> ${relation.toEntity?.name || "Destino"}` })),
      ...entity.incomingRelations.map((relation) => ({ ...relation, label: `${relation.fromEntity?.name || "Origem"} -> ${relation.type}` })),
    ];
  }, [entity]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-[220px] animate-pulse rounded-[32px] border border-white/10 bg-white/4" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <div className="h-[480px] animate-pulse rounded-[28px] border border-white/10 bg-white/4" />
          <div className="h-[480px] animate-pulse rounded-[28px] border border-white/10 bg-white/4" />
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <EmptyState
        title="Falha ao abrir a entidade"
        description={error || "A entidade solicitada nao foi encontrada."}
        action={
          <div className="flex gap-3">
            <Button onClick={() => void loadWorkspace()}>Tentar novamente</Button>
            <Button variant="outline" asChild><Link href={`/app/worlds/${worldId}/codex`}>Voltar ao Codex</Link></Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10" style={{ backgroundImage: entity.coverImageUrl || entity.portraitImageUrl ? `linear-gradient(180deg, rgba(8,8,13,0.15), rgba(8,8,13,0.92)), url(${entity.coverImageUrl || entity.portraitImageUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Entity workspace</Badge>
              <Badge className="border-white/10 bg-black/28 text-white">{entity.type}</Badge>
              <Badge className="border-white/10 bg-black/28 text-white/75">{entity.status}</Badge>
              <Badge className="border-white/10 bg-black/28 text-white/75">{entity.visibility}</Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Workspace do Codex</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">{entity.name}</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{entity.summary || entity.description || "Sem resumo registrado para esta entidade."}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-white/10 bg-white/5" asChild><Link href={`/app/worlds/${worldId}/codex`}><ArrowLeft className="mr-2 h-4 w-4" />Voltar ao Codex</Link></Button>
              <Button variant="outline" className="border-white/10 bg-white/5" asChild><Link href={`/app/worlds/${worldId}/graph?focusEntityId=${entityId}`}>Abrir no Grafo<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => void loadWorkspace()}><RefreshCw className="mr-2 h-4 w-4" />Atualizar workspace</Button>
              <Button variant="destructive" onClick={handleDeleteEntity}><Trash2 className="mr-2 h-4 w-4" />Remover entidade</Button>
            </div>
          </div>
          <div className="cinematic-frame rounded-[28px] p-5">
            <p className="section-eyebrow">Leitura rapida</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Campanha</p><p className="mt-2 text-lg font-black text-foreground">{entity.campaign?.name || "Mundo base"}</p></div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Relacoes</p><p className="mt-2 text-lg font-black text-foreground">{allRelations.length}</p></div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Imagens</p><p className="mt-2 text-lg font-black text-foreground">{entity.images.length}</p></div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
        <div className="space-y-6">
          <Card className="rounded-[28px] border-white/10 bg-card/70">
            <CardHeader><CardTitle className="text-xl font-black uppercase tracking-[0.04em]">Overview e edicao</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSaveEntity}>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Nome</label><Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Tipo</label><select className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground" value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}>{typeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Campanha</label><select className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground" value={form.campaignId} onChange={(event) => setForm((prev) => ({ ...prev, campaignId: event.target.value }))}><option value="">Sem campanha</option>{(codex?.world.campaigns ?? []).map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Subtipo</label><Input value={form.subtype} onChange={(event) => setForm((prev) => ({ ...prev, subtype: event.target.value }))} /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Slug</label><Input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Status</label><Input value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Visibilidade</label><select className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground" value={form.visibility} onChange={(event) => setForm((prev) => ({ ...prev, visibility: event.target.value }))}><option value="MASTER">MASTER</option><option value="PLAYERS">PLAYERS</option></select></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium text-foreground">Resumo</label><Input value={form.summary} onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))} /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-foreground">Descricao</label><Textarea rows={6} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Retrato</label><Input value={form.portraitImageUrl} onChange={(event) => setForm((prev) => ({ ...prev, portraitImageUrl: event.target.value }))} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Capa</label><Input value={form.coverImageUrl} onChange={(event) => setForm((prev) => ({ ...prev, coverImageUrl: event.target.value }))} /></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium text-foreground">Tags</label><Input value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} /></div>
                <Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Salvando..." : "Salvar entidade"}</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-white/10 bg-card/70">
            <CardHeader><CardTitle className="text-xl font-black uppercase tracking-[0.04em]">Galeria visual</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <form className="grid gap-4 rounded-[24px] border border-white/8 bg-white/4 p-4" onSubmit={handleAddImage}>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">URL da imagem</label><Input value={imageDraft.url} onChange={(event) => setImageDraft((prev) => ({ ...prev, url: event.target.value }))} /></div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Papel visual</label>
                    <select className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground" value={imageDraft.kind} onChange={(event) => setImageDraft((prev) => ({ ...prev, kind: event.target.value }))}>
                      {VISUAL_KIND_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Legenda</label><Input value={imageDraft.caption} onChange={(event) => setImageDraft((prev) => ({ ...prev, caption: event.target.value }))} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Ordem</label><Input value={imageDraft.sortOrder} onChange={(event) => setImageDraft((prev) => ({ ...prev, sortOrder: event.target.value }))} /></div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground transition hover:bg-white/10">
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadingImage ? "Enviando..." : "Subir arquivo"}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={handleUploadImageFile} />
                  </label>
                  <Button type="submit" disabled={imageSubmitting}><Plus className="mr-2 h-4 w-4" />{imageSubmitting ? "Adicionando..." : "Adicionar imagem"}</Button>
                </div>
              </form>
              {entity.images.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {entity.images.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-[24px] border border-white/8 bg-white/4">
                      <div className="h-44 w-full bg-cover bg-center" style={{ backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.05), rgba(8,8,13,0.45)), url(${image.url})` }} />
                      <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <Badge className="border-white/10 bg-black/25 text-white/80">{getVisualKindLabel(image.kind)}</Badge>
                          <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={() => startEditingImage(image)}><Pencil className="h-4 w-4" /></Button>
                            <Button type="button" size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={() => void handleDeleteImage(image.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{image.caption || "Sem legenda registrada."}</p>
                        {editingImageId === image.id ? (
                          <div className="space-y-3 rounded-2xl border border-white/8 bg-black/20 p-3">
                            <Input value={imageEditDraft.url} onChange={(event) => setImageEditDraft((prev) => ({ ...prev, url: event.target.value }))} />
                            <div className="grid gap-3 sm:grid-cols-2">
                              <select className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground" value={imageEditDraft.kind} onChange={(event) => setImageEditDraft((prev) => ({ ...prev, kind: event.target.value }))}>
                                {VISUAL_KIND_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                              </select>
                              <Input value={imageEditDraft.sortOrder} onChange={(event) => setImageEditDraft((prev) => ({ ...prev, sortOrder: event.target.value }))} />
                            </div>
                            <Input value={imageEditDraft.caption} onChange={(event) => setImageEditDraft((prev) => ({ ...prev, caption: event.target.value }))} />
                            <div className="flex gap-2">
                              <Button type="button" size="sm" onClick={() => void handleSaveImageEdit(image.id)}>Salvar imagem</Button>
                              <Button type="button" size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={() => setEditingImageId(null)}>Cancelar</Button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Nenhuma imagem registrada para esta entidade.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-white/10 bg-card/70">
            <CardHeader><CardTitle className="text-xl font-black uppercase tracking-[0.04em]">Relacoes</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <form className="space-y-4 rounded-[24px] border border-white/8 bg-white/4 p-4" onSubmit={handleCreateRelationship}>
                <div className="space-y-2"><label className="text-sm font-medium text-foreground">Conectar com</label><select className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground" value={relationDraft.toEntityId} onChange={(event) => setRelationDraft((prev) => ({ ...prev, toEntityId: event.target.value }))}><option value="">Selecionar entidade</option>{relatedOptions.map((option) => <option key={option.id} value={option.id}>{option.name} ({option.type})</option>)}</select></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Tipo de relacao</label><Input value={relationDraft.type} onChange={(event) => setRelationDraft((prev) => ({ ...prev, type: event.target.value }))} placeholder="aliado, odeia, irmao..." /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Direcionalidade</label><select className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground" value={relationDraft.directionality} onChange={(event) => setRelationDraft((prev) => ({ ...prev, directionality: event.target.value }))}><option value="DIRECTED">DIRECTED</option><option value="BIDIRECTIONAL">BIDIRECTIONAL</option></select></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Peso</label><Input value={relationDraft.weight} onChange={(event) => setRelationDraft((prev) => ({ ...prev, weight: event.target.value }))} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-foreground">Visibilidade</label><select className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground" value={relationDraft.visibility} onChange={(event) => setRelationDraft((prev) => ({ ...prev, visibility: event.target.value }))}><option value="MASTER">MASTER</option><option value="PLAYERS">PLAYERS</option></select></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium text-foreground">Notas</label><Textarea rows={3} value={relationDraft.notes} onChange={(event) => setRelationDraft((prev) => ({ ...prev, notes: event.target.value }))} /></div>
                <Button type="submit" disabled={relationSubmitting}><Link2 className="mr-2 h-4 w-4" />{relationSubmitting ? "Conectando..." : "Criar relacao"}</Button>
              </form>
              <div className="space-y-3">
                {allRelations.length ? allRelations.map((relation) => (
                  <div key={relation.id} className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-foreground">{relation.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {relation.visibility ? <Badge className="border-white/10 bg-black/25 text-white/75">{relation.visibility}</Badge> : null}
                          {relation.directionality ? <Badge className="border-white/10 bg-black/25 text-white/75">{relation.directionality}</Badge> : null}
                          {relation.weight ? <Badge className="border-white/10 bg-black/25 text-white/75">peso {relation.weight}</Badge> : null}
                        </div>
                        {relation.notes ? <p className="text-sm leading-6 text-muted-foreground">{relation.notes}</p> : null}
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={() => startEditingRelationship(relation)}><Pencil className="h-4 w-4" /></Button>
                        <Button type="button" size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={() => void handleDeleteRelationship(relation.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    {editingRelationId === relation.id ? (
                      <div className="mt-4 space-y-3 rounded-2xl border border-white/8 bg-black/20 p-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <select className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground" value={relationEditDraft.fromEntityId} onChange={(event) => setRelationEditDraft((prev) => ({ ...prev, fromEntityId: event.target.value }))}>
                            {codex?.entities.map((option) => <option key={option.id} value={option.id}>{option.name} ({option.type})</option>)}
                          </select>
                          <select className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground" value={relationEditDraft.toEntityId} onChange={(event) => setRelationEditDraft((prev) => ({ ...prev, toEntityId: event.target.value }))}>
                            {codex?.entities.map((option) => <option key={option.id} value={option.id}>{option.name} ({option.type})</option>)}
                          </select>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input value={relationEditDraft.type} onChange={(event) => setRelationEditDraft((prev) => ({ ...prev, type: event.target.value }))} />
                          <select className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground" value={relationEditDraft.directionality} onChange={(event) => setRelationEditDraft((prev) => ({ ...prev, directionality: event.target.value }))}>
                            <option value="DIRECTED">DIRECTED</option>
                            <option value="BIDIRECTIONAL">BIDIRECTIONAL</option>
                          </select>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
                          <Input value={relationEditDraft.weight} onChange={(event) => setRelationEditDraft((prev) => ({ ...prev, weight: event.target.value }))} placeholder="peso" />
                          <select className="h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground" value={relationEditDraft.visibility} onChange={(event) => setRelationEditDraft((prev) => ({ ...prev, visibility: event.target.value }))}>
                            <option value="MASTER">MASTER</option>
                            <option value="PLAYERS">PLAYERS</option>
                          </select>
                        </div>
                        <Textarea rows={3} value={relationEditDraft.notes} onChange={(event) => setRelationEditDraft((prev) => ({ ...prev, notes: event.target.value }))} />
                        <div className="flex gap-2">
                          <Button type="button" size="sm" onClick={() => void handleSaveRelationshipEdit(relation.id)}>Salvar relacao</Button>
                          <Button type="button" size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={() => setEditingRelationId(null)}>Cancelar</Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )) : <p className="text-sm text-muted-foreground">Nenhuma relacao registrada ainda.</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-white/10 bg-card/70">
            <CardHeader><CardTitle className="text-xl font-black uppercase tracking-[0.04em]">Memoria recente</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {entity.recentEvents.length ? entity.recentEvents.map((event) => (
                <div key={event.id} className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                  <p className="text-sm font-semibold text-foreground">{event.text || event.type}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">{formatDate(event.ts)} • {event.visibility}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">Nenhum evento recente ligado a esta entidade.</p>}
              <Button variant="outline" className="w-full justify-between border-white/10 bg-white/5" asChild><Link href={`/app/worlds/${worldId}/codex`}>Voltar ao indice do Codex<ArrowRight className="h-4 w-4" /></Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
