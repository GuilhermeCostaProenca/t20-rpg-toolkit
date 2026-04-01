"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Link2, Pencil, Plus, RefreshCw, Save, Trash2, Upload } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { useAppFeedback } from "@/components/app-feedback-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { VISUAL_KIND_OPTIONS, getVisualKindLabel } from "@/lib/visual-library";
import {
  formatMemoryEventText,
  formatMemoryEventType,
  getMemoryEventTone,
  isMemoryWorldEvent,
} from "@/lib/world-memory";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  recentEvents: Array<{
    id: string;
    campaignId?: string | null;
    type: string;
    text?: string | null;
    ts: string;
    visibility: string;
    meta?: Record<string, unknown> | null;
  }>;
};
type CodexPayload = {
  world: { id: string; title: string; description?: string | null; campaigns: Campaign[] };
  entities: Array<{ id: string; name: string; type: string; status: string }>;
};

const typeOptions = ["character", "npc", "faction", "house", "place", "artifact", "event"];
const visibilityOptions = [
  { value: "MASTER", label: "MASTER" },
  { value: "PLAYERS", label: "PLAYERS" },
];
const directionalityOptions = [
  { value: "DIRECTED", label: "DIRECTED" },
  { value: "BIDIRECTIONAL", label: "BIDIRECTIONAL" },
];
const memoryTimeOptions: Array<{ value: "ALL" | "7D" | "30D" | "90D"; label: string }> = [
  { value: "ALL", label: "Todo o periodo" },
  { value: "7D", label: "Ultimos 7 dias" },
  { value: "30D", label: "Ultimos 30 dias" },
  { value: "90D", label: "Ultimos 90 dias" },
];
const entityFormSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa de pelo menos 2 caracteres"),
  type: z.string().trim().min(1, "Tipo obrigatorio"),
  campaignId: z.string().optional(),
  subtype: z.string().optional(),
  slug: z.string().optional(),
  status: z.string().trim().min(1, "Status obrigatorio"),
  visibility: z.enum(["MASTER", "PLAYERS"]),
  summary: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  coverImageUrl: z.string().optional(),
  portraitImageUrl: z.string().optional(),
});
const initialEntityForm = {
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
};
const relationFormSchema = z.object({
  toEntityId: z.string().trim().min(1, "Selecione uma entidade"),
  type: z.string().trim().min(2, "Tipo de relacao precisa de pelo menos 2 caracteres"),
  directionality: z.enum(["DIRECTED", "BIDIRECTIONAL"]),
  weight: z.string().optional(),
  notes: z.string().optional(),
  visibility: z.enum(["MASTER", "PLAYERS"]),
});
const initialRelationForm = {
  toEntityId: "",
  type: "",
  directionality: "DIRECTED" as "DIRECTED" | "BIDIRECTIONAL",
  weight: "",
  notes: "",
  visibility: "MASTER" as "MASTER" | "PLAYERS",
};
const imageFormSchema = z.object({
  url: z.string().trim().url("Informe uma URL valida para imagem"),
  kind: z.string().trim().min(1, "Selecione o papel visual"),
  caption: z.string().optional(),
  sortOrder: z.string().optional(),
});
const initialImageForm = {
  url: "",
  kind: "reference",
  caption: "",
  sortOrder: "0",
};

function getMemoryChangeTypeLabel(event: { meta?: Record<string, unknown> | null }) {
  const meta = event.meta && typeof event.meta === "object" ? event.meta : null;
  const changeType = typeof meta?.changeType === "string" ? meta.changeType : null;
  switch (changeType) {
    case "status":
      return "Mudanca de status";
    case "alliance":
      return "Alianca";
    case "rupture":
      return "Ruptura";
    case "discovery":
      return "Descoberta";
    case "secret":
      return "Segredo";
    case "world_change":
      return "Mudanca do mundo";
    default:
      return null;
  }
}

function getMemoryChangeHighlight(event: { meta?: Record<string, unknown> | null }) {
  const meta = event.meta && typeof event.meta === "object" ? event.meta : null;
  const changeType = typeof meta?.changeType === "string" ? meta.changeType : null;
  if (changeType === "status") {
    return {
      tone: "status",
      label: "Status impactado",
    } as const;
  }
  if (changeType === "alliance" || changeType === "rupture") {
    return {
      tone: "relation",
      label: "Relacao impactada",
    } as const;
  }
  return null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isInsideTimeWindow(value: string, window: "ALL" | "7D" | "30D" | "90D") {
  if (window === "ALL") return true;
  const eventTime = new Date(value).getTime();
  if (Number.isNaN(eventTime)) return true;
  const now = Date.now();
  const days = window === "7D" ? 7 : window === "30D" ? 30 : 90;
  return eventTime >= now - days * 24 * 60 * 60 * 1000;
}

export default function CodexEntityWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { confirmDestructive, notifyError, notifySuccess } = useAppFeedback();
  const worldId = params?.id as string;
  const entityId = params?.entityId as string;

  const [entity, setEntity] = useState<EntityDetail | null>(null);
  const [codex, setCodex] = useState<CodexPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingRelationId, setEditingRelationId] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
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
  const [memoryCampaignFilter, setMemoryCampaignFilter] = useState("ALL");
  const [memoryTimeFilter, setMemoryTimeFilter] = useState<"ALL" | "7D" | "30D" | "90D">("ALL");
  const entityForm = useForm<typeof initialEntityForm>({
    resolver: zodResolver(entityFormSchema),
    defaultValues: initialEntityForm,
  });
  const relationForm = useForm<typeof initialRelationForm>({
    resolver: zodResolver(relationFormSchema),
    defaultValues: initialRelationForm,
  });
  const imageForm = useForm<typeof initialImageForm>({
    resolver: zodResolver(imageFormSchema),
    defaultValues: initialImageForm,
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
      entityForm.reset({
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
  }, [entityForm, entityId, worldId]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  async function handleSaveEntity(values: typeof initialEntityForm) {
    entityForm.clearErrors("root");
    try {
      const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          campaignId: values.campaignId || undefined,
          slug: values.slug || undefined,
          subtype: values.subtype || undefined,
          summary: values.summary || undefined,
          description: values.description || undefined,
          coverImageUrl: values.coverImageUrl || undefined,
          portraitImageUrl: values.portraitImageUrl || undefined,
          tags: values.tags ? values.tags.split(",").map((item) => item.trim()).filter(Boolean) : [],
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao salvar entidade");
      notifySuccess("Entidade atualizada.");
      await loadWorkspace();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao salvar entidade";
      entityForm.setError("root", { type: "server", message });
      notifyError(message);
    }
  }

  async function handleCreateRelationship(values: typeof initialRelationForm) {
    relationForm.clearErrors("root");
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEntityId: entityId,
          toEntityId: values.toEntityId,
          type: values.type,
          directionality: values.directionality,
          weight: values.weight ? Number(values.weight) : undefined,
          notes: values.notes || undefined,
          visibility: values.visibility,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao criar relacao");
      notifySuccess("Relacao adicionada.");
      relationForm.reset(initialRelationForm);
      await loadWorkspace();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao criar relacao";
      relationForm.setError("root", { type: "server", message });
      notifyError(message);
    }
  }

  async function handleDeleteRelationship(relationshipId: string) {
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships/${relationshipId}`, { method: "DELETE" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao remover relacao");
      notifySuccess("Relacao removida.");
      await loadWorkspace();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Falha ao remover relacao");
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
      notifySuccess("Relacao atualizada.");
      setEditingRelationId(null);
      await loadWorkspace();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Falha ao atualizar relacao");
    }
  }

  async function handleAddImage(values: typeof initialImageForm) {
    imageForm.clearErrors("root");
    try {
      const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: values.url,
          kind: values.kind,
          caption: values.caption || undefined,
          sortOrder: Number(values.sortOrder || "0"),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao adicionar imagem");
      notifySuccess("Imagem adicionada.");
      imageForm.reset(initialImageForm);
      await loadWorkspace();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao adicionar imagem";
      imageForm.setError("root", { type: "server", message });
      notifyError(message);
    }
  }

  async function handleDeleteImage(imageId: string) {
    try {
      const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}/images/${imageId}`, { method: "DELETE" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao remover imagem");
      notifySuccess("Imagem removida.");
      await loadWorkspace();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Falha ao remover imagem");
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
      notifySuccess("Imagem atualizada.");
      setEditingImageId(null);
      await loadWorkspace();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Falha ao atualizar imagem");
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
      imageForm.setValue("url", payload.url || "");
      notifySuccess("Upload concluido.");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Falha ao enviar imagem");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleDeleteEntity() {
    const confirmed = await confirmDestructive({
      title: "Remover entidade do mundo?",
      description: "Esta acao remove a entidade do codex atual.",
      confirmText: "Remover",
      cancelText: "Cancelar",
      variant: "destructive",
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/worlds/${worldId}/entities/${entityId}`, { method: "DELETE" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao remover entidade");
      notifySuccess("Entidade removida.");
      router.push(`/app/worlds/${worldId}/codex`);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Falha ao remover entidade");
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
  const memoryTimeline = useMemo(
    () => (entity?.recentEvents ?? []).filter((event) => isMemoryWorldEvent(event)),
    [entity]
  );
  const filteredMemoryTimeline = useMemo(
    () =>
      memoryTimeline.filter((event) => {
        if (memoryCampaignFilter !== "ALL" && event.campaignId !== memoryCampaignFilter) return false;
        if (!isInsideTimeWindow(event.ts, memoryTimeFilter)) return false;
        return true;
      }),
    [memoryCampaignFilter, memoryTimeFilter, memoryTimeline]
  );

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
              <Form {...entityForm}>
                <form className="space-y-4" onSubmit={entityForm.handleSubmit(handleSaveEntity)}>
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                    <FormField
                      control={entityForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={entityForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <FormControl>
                            <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={field.value} onValueChange={field.onChange} options={typeOptions.map((option) => ({ value: option, label: option }))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={entityForm.control}
                      name="campaignId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campanha</FormLabel>
                          <FormControl>
                            <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={field.value ?? ""} onValueChange={field.onChange} placeholder="Sem campanha" options={(codex?.world.campaigns ?? []).map((campaign) => ({ value: campaign.id, label: campaign.name }))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={entityForm.control}
                      name="subtype"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtipo</FormLabel>
                          <FormControl>
                            <Input value={field.value ?? ""} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={entityForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input value={field.value ?? ""} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={entityForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Input value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={entityForm.control}
                      name="visibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visibilidade</FormLabel>
                          <FormControl>
                            <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={field.value} onValueChange={field.onChange} options={visibilityOptions} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={entityForm.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resumo</FormLabel>
                        <FormControl>
                          <Input value={field.value ?? ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={entityForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descricao</FormLabel>
                        <FormControl>
                          <Textarea rows={6} value={field.value ?? ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={entityForm.control}
                      name="portraitImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Retrato</FormLabel>
                          <FormControl>
                            <Input value={field.value ?? ""} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={entityForm.control}
                      name="coverImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capa</FormLabel>
                          <FormControl>
                            <Input value={field.value ?? ""} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={entityForm.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input value={field.value ?? ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {entityForm.formState.errors.root?.message ? (
                    <p className="text-sm text-destructive">{entityForm.formState.errors.root.message}</p>
                  ) : null}
                  <Button type="submit" disabled={entityForm.formState.isSubmitting}><Save className="mr-2 h-4 w-4" />{entityForm.formState.isSubmitting ? "Salvando..." : "Salvar entidade"}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-white/10 bg-card/70">
            <CardHeader><CardTitle className="text-xl font-black uppercase tracking-[0.04em]">Galeria visual</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <Form {...imageForm}>
                <form className="grid gap-4 rounded-[24px] border border-white/8 bg-white/4 p-4" onSubmit={imageForm.handleSubmit(handleAddImage)}>
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                    <FormField
                      control={imageForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da imagem</FormLabel>
                          <FormControl>
                            <Input value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={imageForm.control}
                      name="kind"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Papel visual</FormLabel>
                          <FormControl>
                            <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={field.value} onValueChange={field.onChange} options={VISUAL_KIND_OPTIONS.map((option) => ({ value: option.value, label: option.label }))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
                    <FormField
                      control={imageForm.control}
                      name="caption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legenda</FormLabel>
                          <FormControl>
                            <Input value={field.value ?? ""} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={imageForm.control}
                      name="sortOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ordem</FormLabel>
                          <FormControl>
                            <Input value={field.value ?? ""} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {imageForm.formState.errors.root?.message ? (
                    <p className="text-sm text-destructive">{imageForm.formState.errors.root.message}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    <label className="inline-flex cursor-pointer items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground transition hover:bg-white/10">
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingImage ? "Enviando..." : "Subir arquivo"}
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={handleUploadImageFile} />
                    </label>
                    <Button type="submit" disabled={imageForm.formState.isSubmitting}><Plus className="mr-2 h-4 w-4" />{imageForm.formState.isSubmitting ? "Adicionando..." : "Adicionar imagem"}</Button>
                  </div>
                </form>
              </Form>
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
                              <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={imageEditDraft.kind} onValueChange={(value) => setImageEditDraft((prev) => ({ ...prev, kind: value }))} options={VISUAL_KIND_OPTIONS.map((option) => ({ value: option.value, label: option.label }))} />
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
              <Form {...relationForm}>
                <form className="space-y-4 rounded-[24px] border border-white/8 bg-white/4 p-4" onSubmit={relationForm.handleSubmit(handleCreateRelationship)}>
                  <FormField
                    control={relationForm.control}
                    name="toEntityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conectar com</FormLabel>
                        <FormControl>
                          <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={field.value} onValueChange={field.onChange} placeholder="Selecionar entidade" options={relatedOptions.map((option) => ({ value: option.id, label: `${option.name} (${option.type})` }))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={relationForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de relacao</FormLabel>
                          <FormControl>
                            <Input value={field.value} onChange={field.onChange} placeholder="aliado, odeia, irmao..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={relationForm.control}
                      name="directionality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Direcionalidade</FormLabel>
                          <FormControl>
                            <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={field.value} onValueChange={field.onChange} options={directionalityOptions} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
                    <FormField
                      control={relationForm.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso</FormLabel>
                          <FormControl>
                            <Input value={field.value ?? ""} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={relationForm.control}
                      name="visibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visibilidade</FormLabel>
                          <FormControl>
                            <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={field.value} onValueChange={field.onChange} options={visibilityOptions} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={relationForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Textarea rows={3} value={field.value ?? ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {relationForm.formState.errors.root?.message ? (
                    <p className="text-sm text-destructive">{relationForm.formState.errors.root.message}</p>
                  ) : null}
                  <Button type="submit" disabled={relationForm.formState.isSubmitting}><Link2 className="mr-2 h-4 w-4" />{relationForm.formState.isSubmitting ? "Conectando..." : "Criar relacao"}</Button>
                </form>
              </Form>
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
                          <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={relationEditDraft.fromEntityId} onValueChange={(value) => setRelationEditDraft((prev) => ({ ...prev, fromEntityId: value }))} options={(codex?.entities ?? []).map((option) => ({ value: option.id, label: `${option.name} (${option.type})` }))} />
                          <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={relationEditDraft.toEntityId} onValueChange={(value) => setRelationEditDraft((prev) => ({ ...prev, toEntityId: value }))} options={(codex?.entities ?? []).map((option) => ({ value: option.id, label: `${option.name} (${option.type})` }))} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input value={relationEditDraft.type} onChange={(event) => setRelationEditDraft((prev) => ({ ...prev, type: event.target.value }))} />
                          <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={relationEditDraft.directionality} onValueChange={(value) => setRelationEditDraft((prev) => ({ ...prev, directionality: value }))} options={directionalityOptions} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
                          <Input value={relationEditDraft.weight} onChange={(event) => setRelationEditDraft((prev) => ({ ...prev, weight: event.target.value }))} placeholder="peso" />
                          <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={relationEditDraft.visibility} onValueChange={(value) => setRelationEditDraft((prev) => ({ ...prev, visibility: value }))} options={visibilityOptions} />
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
            <CardHeader><CardTitle className="text-xl font-black uppercase tracking-[0.04em]">Timeline da entidade</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {memoryTimeline.length ? (
                <div className="rounded-2xl border border-white/10 bg-white/4 p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={memoryCampaignFilter} onValueChange={setMemoryCampaignFilter} options={(codex?.world.campaigns ?? []).map((campaign) => ({ value: campaign.id, label: campaign.name }))} placeholder="Todas as campanhas" />
                    <SelectField className="h-10 w-full rounded-md border-white/10 bg-black/20" value={memoryTimeFilter} onValueChange={(value) => setMemoryTimeFilter(value as "ALL" | "7D" | "30D" | "90D")} options={memoryTimeOptions} />
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {filteredMemoryTimeline.length} eventos no recorte atual
                  </p>
                </div>
              ) : null}
              {filteredMemoryTimeline.length ? filteredMemoryTimeline.map((event) => (
                <div key={event.id} className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={
                        getMemoryEventTone(event) === "death"
                          ? "border-red-300/20 bg-red-300/10 text-red-100"
                          : getMemoryEventTone(event) === "change"
                            ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                            : "border-primary/20 bg-primary/10 text-primary"
                      }
                    >
                      {formatMemoryEventType(event.type)}
                    </Badge>
                    <Badge className="border-white/10 bg-black/25 text-white/75">{event.visibility}</Badge>
                    {getMemoryChangeTypeLabel(event) ? (
                      <Badge className="border-white/10 bg-black/25 text-white/75">
                        {getMemoryChangeTypeLabel(event)}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{formatMemoryEventText(event)}</p>
                  {getMemoryChangeHighlight(event) ? (
                    <p
                      className={
                        getMemoryChangeHighlight(event)?.tone === "status"
                          ? "mt-2 text-xs uppercase tracking-[0.16em] text-amber-100/80"
                          : "mt-2 text-xs uppercase tracking-[0.16em] text-sky-100/80"
                      }
                    >
                      {getMemoryChangeHighlight(event)?.label}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">{formatDate(event.ts)}</p>
                </div>
              )) : memoryTimeline.length ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
                  Nenhum evento de memoria corresponde aos filtros atuais.
                </div>
              ) : entity.recentEvents.length ? entity.recentEvents.map((event) => (
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
