"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Crown,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

import { CockpitDetailSheet } from "@/components/cockpit/cockpit-detail-sheet";
import { EmptyState } from "@/components/empty-state";
import { ModeSwitcher } from "@/components/world/mode-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Campaign = {
  id: string;
  name: string;
};

type EntityImage = {
  id: string;
  url: string;
  kind: string;
  caption?: string | null;
};

type RelationEdge = {
  id: string;
  type: string;
  notes?: string | null;
  toEntity?: { id: string; name: string; type: string; status: string; portraitImageUrl?: string | null };
  fromEntity?: { id: string; name: string; type: string; status: string; portraitImageUrl?: string | null };
};

type Entity = {
  id: string;
  worldId: string;
  campaignId?: string | null;
  name: string;
  type: string;
  subtype?: string | null;
  summary?: string | null;
  description?: string | null;
  status: string;
  visibility: string;
  tags?: string[] | null;
  coverImageUrl?: string | null;
  portraitImageUrl?: string | null;
  images: EntityImage[];
  campaign?: Campaign | null;
  outgoingRelations: RelationEdge[];
  incomingRelations: RelationEdge[];
};

type EntityDetail = Entity & {
  recentEvents: Array<{
    id: string;
    type: string;
    text?: string | null;
    ts: string;
    visibility: string;
  }>;
};

type CodexPayload = {
  world: {
    id: string;
    title: string;
    description?: string | null;
    campaigns: Campaign[];
  };
  stats: Record<string, number>;
  entities: Entity[];
};

const initialForm = {
  name: "",
  type: "npc",
  campaignId: "",
  subtype: "",
  summary: "",
  description: "",
  status: "active",
  visibility: "MASTER",
  tags: "",
  coverImageUrl: "",
  portraitImageUrl: "",
};
const createEntityFormSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa de pelo menos 2 caracteres"),
  type: z.string().trim().min(1, "Tipo obrigatorio"),
  campaignId: z.string().optional(),
  subtype: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  status: z.string().trim().min(1, "Status obrigatorio"),
  visibility: z.enum(["MASTER", "PLAYERS"]),
  tags: z.string().optional(),
  coverImageUrl: z.string().optional(),
  portraitImageUrl: z.string().optional(),
});

const typeOptions = [
  "character",
  "npc",
  "faction",
  "house",
  "place",
  "artifact",
  "event",
];

const typeMeta = {
  character: {
    label: "Personagens",
    singular: "personagem",
    accent: "from-sky-500/20 via-sky-400/10 to-transparent",
  },
  npc: {
    label: "NPCs",
    singular: "npc",
    accent: "from-amber-500/20 via-orange-400/10 to-transparent",
  },
  faction: {
    label: "Faccoes",
    singular: "faccao",
    accent: "from-rose-500/20 via-rose-400/10 to-transparent",
  },
  house: {
    label: "Casas",
    singular: "casa",
    accent: "from-violet-500/20 via-fuchsia-400/10 to-transparent",
  },
  place: {
    label: "Lugares",
    singular: "lugar",
    accent: "from-emerald-500/20 via-teal-400/10 to-transparent",
  },
  artifact: {
    label: "Artefatos",
    singular: "artefato",
    accent: "from-yellow-500/20 via-yellow-300/10 to-transparent",
  },
  event: {
    label: "Marcos",
    singular: "marco",
    accent: "from-red-500/20 via-red-400/10 to-transparent",
  },
} as const;

function getTypeMeta(type: string) {
  return typeMeta[type as keyof typeof typeMeta] ?? {
    label: type,
    singular: type,
    accent: "from-white/10 to-transparent",
  };
}

function getStatusLabel(status: string) {
  switch (status) {
    case "alive":
      return "vivo";
    case "dead":
      return "morto";
    case "missing":
      return "desaparecido";
    case "active":
      return "ativo";
    default:
      return status;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WorldCodexPage() {
  const params = useParams();
  const worldId = params?.id as string;

  const [payload, setPayload] = useState<CodexPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const createEntityForm = useForm<typeof initialForm>({
    resolver: zodResolver(createEntityFormSchema),
    defaultValues: initialForm,
  });
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [inspectEntity, setInspectEntity] = useState<EntityDetail | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const loadCodex = useCallback(async () => {
    if (!worldId) return;
    setLoading(true);
    setError(null);
    try {
      const search = new URLSearchParams();
      if (term.trim()) search.set("term", term.trim());
      if (typeFilter) search.set("type", typeFilter);
      if (statusFilter) search.set("status", statusFilter);
      if (campaignFilter) search.set("campaignId", campaignFilter);
      if (tagFilter) search.set("tag", tagFilter);

      const res = await fetch(`/api/worlds/${worldId}/codex?${search.toString()}`, {
        cache: "no-store",
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Falha ao carregar Codex");
      setPayload(response.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar Codex");
    } finally {
      setLoading(false);
    }
  }, [campaignFilter, statusFilter, tagFilter, term, typeFilter, worldId]);

  useEffect(() => {
    void loadCodex();
  }, [loadCodex]);

  useEffect(() => {
    let cancelled = false;

    async function loadInspect() {
      if (!inspectId || !worldId) {
        setInspectEntity(null);
        return;
      }
      setInspectLoading(true);
      try {
        const res = await fetch(`/api/worlds/${worldId}/entities/${inspectId}`, {
          cache: "no-store",
        });
        const response = await res.json().catch(() => ({}));
        if (!cancelled && res.ok) {
          setInspectEntity(response.data ?? null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setInspectLoading(false);
      }
    }

    void loadInspect();
    return () => {
      cancelled = true;
    };
  }, [inspectId, worldId]);

  async function handleCreateEntity(values: typeof initialForm) {
    createEntityForm.clearErrors("root");
    try {
      const res = await fetch(`/api/worlds/${worldId}/entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          campaignId: values.campaignId || undefined,
          tags: values.tags
            ? values.tags
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        }),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Falha ao criar entidade");

      setDialogOpen(false);
      createEntityForm.reset(initialForm);
      await loadCodex();
    } catch (err) {
      createEntityForm.setError("root", {
        type: "server",
        message: err instanceof Error ? err.message : "Falha ao criar entidade",
      });
    }
  }

  const entities = useMemo(() => payload?.entities ?? [], [payload]);
  const campaigns = payload?.world.campaigns ?? [];
  const activeFilterCount = [term, typeFilter, statusFilter, campaignFilter, tagFilter].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const groupedEntities = useMemo(
    () =>
      typeOptions
        .map((type) => ({
          type,
          meta: getTypeMeta(type),
          items: entities.filter((entity) => entity.type === type),
        }))
        .filter((group) => group.items.length > 0),
    [entities]
  );

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entity of entities) {
      for (const tag of entity.tags ?? []) {
        const normalized = String(tag).trim();
        if (!normalized) continue;
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8);
  }, [entities]);

  const spotlightEntity = entities[0] ?? null;

  function renderEntityCard(entity: Entity, index: number) {
    return (
      <Card key={entity.id} className="overflow-hidden rounded-[28px] border-white/10 bg-black/20">
        <CardContent className="p-0">
          <button
            type="button"
            onClick={() => setInspectId(entity.id)}
            className="block min-h-[300px] w-full text-left"
          >
            <div
              className="flex h-full min-h-[300px] flex-col justify-between p-5"
              style={{
                backgroundImage:
                  entity.portraitImageUrl || entity.coverImageUrl
                    ? `linear-gradient(180deg, rgba(8,8,13,0.18), rgba(8,8,13,0.94)), url(${entity.portraitImageUrl || entity.coverImageUrl})`
                    : index % 2 === 0
                      ? "linear-gradient(135deg, rgba(188,74,63,0.18), rgba(8,8,13,0.95))"
                      : "linear-gradient(135deg, rgba(213,162,64,0.14), rgba(8,8,13,0.95))",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <Badge className="border-white/10 bg-black/28 text-white">{getTypeMeta(entity.type).singular}</Badge>
                <Badge className="border-white/10 bg-black/28 text-white/70">{getStatusLabel(entity.status)}</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-white">
                    {entity.name}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/72">
                    {entity.summary || entity.description || "Sem resumo registrado para esta entidade."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">Campanha</p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {entity.campaign?.name || "Mundo base"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">Relacoes</p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {entity.outgoingRelations.length + entity.incomingRelations.length}
                    </p>
                  </div>
                </div>

                {Array.isArray(entity.tags) && entity.tags.length ? (
                  <div className="flex flex-wrap gap-2">
                    {entity.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} className="border-white/10 bg-black/30 text-white/80">{tag}</Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">
                Codex do mundo
              </Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {payload?.stats.total ?? 0} entidades
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Nucleo de worldbuilding</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                O mundo deixa de ser uma colecao de notas e vira estrutura viva.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Crie, filtre e inspecione personagens, faccoes, lugares, casas e artefatos dentro de uma superficie central do mestre.
              </p>
            </div>
            <ModeSwitcher worldId={worldId} />
            <div className="flex flex-wrap gap-3">
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) createEntityForm.clearErrors("root");
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova entidade
                  </Button>
                </DialogTrigger>
                <DialogContent className="chrome-panel max-h-[88vh] overflow-y-auto border-white/10 bg-card/88 sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nova entidade</DialogTitle>
                    <DialogDescription>
                      Primeiro corte do Codex: uma entidade ja entra no mundo com tipo, resumo, imagens e campanha opcional.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createEntityForm}>
                    <form className="space-y-4" onSubmit={createEntityForm.handleSubmit(handleCreateEntity)}>
                      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                        <FormField
                          control={createEntityForm.control}
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
                          control={createEntityForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <FormControl>
                                <SelectField
                                  className="h-10 border-white/10 bg-black/20 px-3 text-sm text-foreground"
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  options={typeOptions.map((option) => ({ value: option, label: option }))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={createEntityForm.control}
                          name="campaignId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campanha</FormLabel>
                              <FormControl>
                                <SelectField
                                  className="h-10 border-white/10 bg-black/20 px-3 text-sm text-foreground"
                                  value={field.value ?? ""}
                                  onValueChange={field.onChange}
                                  placeholder="Sem campanha"
                                  options={campaigns.map((campaign) => ({ value: campaign.id, label: campaign.name }))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createEntityForm.control}
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
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={createEntityForm.control}
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
                          control={createEntityForm.control}
                          name="visibility"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Visibilidade</FormLabel>
                              <FormControl>
                                <SelectField
                                  className="h-10 border-white/10 bg-black/20 px-3 text-sm text-foreground"
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  options={[
                                    { value: "MASTER", label: "MASTER" },
                                    { value: "PLAYERS", label: "PLAYERS" },
                                  ]}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={createEntityForm.control}
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
                        control={createEntityForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descricao</FormLabel>
                            <FormControl>
                              <Textarea rows={5} value={field.value ?? ""} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={createEntityForm.control}
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
                          control={createEntityForm.control}
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
                        control={createEntityForm.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                              <Input value={field.value ?? ""} placeholder="ex.: nobre, draconico, aliado" onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {createEntityForm.formState.errors.root?.message ? (
                        <p className="text-sm text-destructive">{createEntityForm.formState.errors.root.message}</p>
                      ) : null}
                      <Button type="submit" className="w-full" disabled={createEntityForm.formState.isSubmitting}>
                        {createEntityForm.formState.isSubmitting ? "Criando..." : "Criar entidade"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => void loadCodex()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${worldId}`}>
                  Voltar ao cockpit
                </Link>
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${worldId}/graph`}>
                  Abrir grafo
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura do Codex</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Entidades</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{payload?.stats.total ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Relacoes</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{payload?.stats.relationships ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Campanhas</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{campaigns.length}</p>
                </div>
              </div>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Busca e filtros</p>
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Nome, resumo ou descricao" className="h-12 rounded-2xl border-white/10 bg-black/25 pl-11" />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <SelectField
                    className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm"
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                    placeholder="Todos os tipos"
                    options={typeOptions.map((option) => ({ value: option, label: option }))}
                  />
                  <SelectField
                    className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm"
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    placeholder="Todos os status"
                    options={[
                      { value: "active", label: "active" },
                      { value: "alive", label: "alive" },
                      { value: "dead", label: "dead" },
                      { value: "missing", label: "missing" },
                    ]}
                  />
                  <SelectField
                    className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm"
                    value={campaignFilter}
                    onValueChange={setCampaignFilter}
                    placeholder="Todas as campanhas"
                    options={campaigns.map((campaign) => ({ value: campaign.id, label: campaign.name }))}
                  />
                </div>
                {topTags.length ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tags fortes do mundo</p>
                    <div className="flex flex-wrap gap-2">
                      {topTags.map(([tag, count]) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setTagFilter((current) => (current === tag ? "" : tag))}
                          className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] transition ${
                            tagFilter === tag
                              ? "border-primary/40 bg-primary/12 text-primary"
                              : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
                          }`}
                        >
                          {tag} · {count}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <Button variant="outline" className="w-full border-white/10 bg-white/5" onClick={() => void loadCodex()}>
                  <Filter className="mr-2 h-4 w-4" />
                  Aplicar leitura
                </Button>
                {hasActiveFilters ? (
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setTerm("");
                      setTypeFilter("");
                      setStatusFilter("");
                      setCampaignFilter("");
                      setTagFilter("");
                    }}
                  >
                    Limpar filtros ({activeFilterCount})
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[260px] animate-pulse rounded-[28px] border border-white/10 bg-white/4" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Falha ao carregar o Codex"
          description={error}
          icon={<Crown className="h-6 w-6" />}
          action={<Button onClick={() => void loadCodex()}>Tentar novamente</Button>}
        />
      ) : entities.length === 0 ? (
        <EmptyState
          title="Nenhuma entidade ainda"
          description="Este mundo ainda nao tem um Codex vivo. Crie a primeira entidade para inaugurar a camada estrutural do mundo."
          icon={<Crown className="h-6 w-6" />}
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Criar primeira entidade
            </Button>
          }
        />
      ) : hasActiveFilters ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-eyebrow">Leitura filtrada</p>
              <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                {entities.length} resultados no Codex
              </h2>
            </div>
            {tagFilter ? (
              <Badge className="border-primary/20 bg-primary/10 text-primary">tag: {tagFilter}</Badge>
            ) : null}
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {entities.map((entity, index) => renderEntityCard(entity, index))}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {spotlightEntity ? (
            <section className="cinematic-frame overflow-hidden rounded-[32px] border border-white/10">
              <div
                className="grid min-h-[320px] gap-0 xl:grid-cols-[minmax(0,1.4fr)_360px]"
                style={{
                  backgroundImage: spotlightEntity.coverImageUrl || spotlightEntity.portraitImageUrl
                    ? `linear-gradient(90deg, rgba(8,8,13,0.9), rgba(8,8,13,0.62)), url(${spotlightEntity.coverImageUrl || spotlightEntity.portraitImageUrl})`
                    : "linear-gradient(135deg, rgba(188,74,63,0.18), rgba(8,8,13,0.96))",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="space-y-5 p-7 sm:p-8 xl:p-10">
                  <Badge className="w-fit border-white/10 bg-black/28 text-white">
                    Destaque do mundo · {getTypeMeta(spotlightEntity.type).label}
                  </Badge>
                  <div className="space-y-3">
                    <h2 className="max-w-3xl text-4xl font-black uppercase tracking-[0.04em] text-white sm:text-5xl">
                      {spotlightEntity.name}
                    </h2>
                    <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                      {spotlightEntity.summary || spotlightEntity.description || "Entidade em destaque no Codex."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => setInspectId(spotlightEntity.id)}>
                      Inspecionar agora
                    </Button>
                    <Button asChild variant="outline" className="border-white/10 bg-black/20 text-white hover:bg-black/30">
                      <Link href={`/app/worlds/${worldId}/codex/${spotlightEntity.id}`}>
                        Abrir workspace
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 border-t border-white/10 bg-black/24 p-6 xl:border-l xl:border-t-0">
                  <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/55">Campanha</p>
                    <p className="mt-2 text-sm font-semibold text-white">{spotlightEntity.campaign?.name || "Mundo base"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/55">Status</p>
                    <p className="mt-2 text-sm font-semibold text-white">{getStatusLabel(spotlightEntity.status)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/24 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/55">Relacoes</p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {spotlightEntity.outgoingRelations.length + spotlightEntity.incomingRelations.length}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {groupedEntities.map((group) => (
            <section key={group.type} className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-2">
                  <Badge className="border-white/10 bg-white/5 text-foreground">{group.meta.label}</Badge>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                      {group.items.length} {group.meta.label.toLowerCase()}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Leitura agrupada do mundo para reduzir a sensacao de cadastro solto.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5"
                  onClick={() => setTypeFilter(group.type)}
                >
                  Filtrar {group.meta.label.toLowerCase()}
                </Button>
              </div>
              <div className={`grid gap-6 md:grid-cols-2 xl:grid-cols-3 rounded-[32px] border border-white/8 bg-gradient-to-br ${group.meta.accent} p-4`}>
                {group.items.slice(0, 6).map((entity, index) => renderEntityCard(entity, index))}
              </div>
            </section>
          ))}
        </div>
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
            : "Lendo detalhes do Codex"
        }
        footer={
          inspectEntity ? (
            <Button variant="outline" className="w-full justify-between border-white/10 bg-white/5" asChild>
              <Link href={`/app/worlds/${worldId}/codex/${inspectEntity.id}`}>
                Abrir workspace da entidade
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
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

            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Relacoes</p>
              <div className="mt-3 space-y-2">
                {inspectEntity.outgoingRelations.slice(0, 4).map((relation) => (
                  <div key={relation.id} className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-foreground">
                    {relation.type} → {relation.toEntity?.name || "Destino"}
                  </div>
                ))}
                {inspectEntity.incomingRelations.slice(0, 4).map((relation) => (
                  <div key={relation.id} className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-foreground">
                    {relation.fromEntity?.name || "Origem"} → {relation.type}
                  </div>
                ))}
                {!inspectEntity.outgoingRelations.length && !inspectEntity.incomingRelations.length ? (
                  <p className="text-sm text-muted-foreground">Nenhuma relacao registrada ainda.</p>
                ) : null}
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
