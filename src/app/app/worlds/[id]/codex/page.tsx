"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookMarked,
  ChevronRight,
  Crown,
  Feather,
  Filter,
  Map as MapIcon,
  Plus,
  RefreshCw,
  Scroll,
  Search,
  Shield,
  Skull,
  Swords,
  Timer,
  X,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

const typeOptions = ["character", "npc", "faction", "house", "place", "artifact", "event"];

const typeMeta = {
  character: {
    label: "Personagem",
    plural: "Personagens",
    color: "#4f7cff",
    dim: "rgba(79,124,255,.12)",
    border: "rgba(79,124,255,.3)",
    icon: Shield,
  },
  npc: {
    label: "NPC",
    plural: "NPCs",
    color: "#9b5de5",
    dim: "rgba(155,93,229,.12)",
    border: "rgba(155,93,229,.3)",
    icon: Feather,
  },
  faction: {
    label: "Faccao",
    plural: "Faccoes",
    color: "#bc4a3f",
    dim: "rgba(188,74,63,.12)",
    border: "rgba(188,74,63,.3)",
    icon: Swords,
  },
  house: {
    label: "Casa",
    plural: "Casas",
    color: "#d5a240",
    dim: "rgba(213,162,64,.12)",
    border: "rgba(213,162,64,.3)",
    icon: Crown,
  },
  place: {
    label: "Local",
    plural: "Locais",
    color: "#4b9f91",
    dim: "rgba(75,159,145,.12)",
    border: "rgba(75,159,145,.3)",
    icon: MapIcon,
  },
  artifact: {
    label: "Item",
    plural: "Itens",
    color: "#d5a240",
    dim: "rgba(213,162,64,.12)",
    border: "rgba(213,162,64,.3)",
    icon: Scroll,
  },
  event: {
    label: "Evento",
    plural: "Eventos",
    color: "#e879f9",
    dim: "rgba(232,121,249,.12)",
    border: "rgba(232,121,249,.3)",
    icon: Timer,
  },
} as const;

const statusMeta: Record<string, { label: string; color: string; bg: string; border: string }> = {
  active: { label: "Ativo", color: "#4b9f91", bg: "rgba(75,159,145,.12)", border: "rgba(75,159,145,.3)" },
  alive: { label: "Vivo", color: "#4b9f91", bg: "rgba(75,159,145,.12)", border: "rgba(75,159,145,.3)" },
  dead: { label: "Morto", color: "#bc4a3f", bg: "rgba(188,74,63,.12)", border: "rgba(188,74,63,.3)" },
  missing: { label: "Desaparecido", color: "#d5a240", bg: "rgba(213,162,64,.1)", border: "rgba(213,162,64,.3)" },
  inactive: { label: "Inativo", color: "#b5aea4", bg: "rgba(181,174,164,.08)", border: "rgba(181,174,164,.2)" },
  secret: { label: "Secreto", color: "#9b5de5", bg: "rgba(155,93,229,.1)", border: "rgba(155,93,229,.3)" },
};

function getTypeMeta(type: string) {
  return typeMeta[type as keyof typeof typeMeta] ?? {
    label: type || "Entidade",
    plural: type || "Entidades",
    color: "#b5aea4",
    dim: "rgba(181,174,164,.1)",
    border: "rgba(181,174,164,.22)",
    icon: BookMarked,
  };
}

function getStatusMeta(status: string) {
  return statusMeta[status] ?? {
    label: status || "Ativo",
    color: "#b5aea4",
    bg: "rgba(181,174,164,.08)",
    border: "rgba(181,174,164,.2)",
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TypeBadge({ type, small = false }: { type: string; small?: boolean }) {
  const meta = getTypeMeta(type);
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-[0.08em]",
        small ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"
      )}
      style={{ borderColor: meta.border, background: meta.dim, color: meta.color }}
    >
      <Icon className={small ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]"
      style={{ borderColor: meta.border, background: meta.bg, color: meta.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

function EntityIcon({ type, size = 44 }: { type: string; size?: number }) {
  const meta = getTypeMeta(type);
  const Icon = meta.icon;

  return (
    <div
      className="shrink-0 rounded-[14px] border shadow-[0_0_20px_rgba(255,255,255,0.04)]"
      style={{
        width: size,
        height: size,
        borderColor: meta.border,
        background: meta.dim,
        color: meta.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon style={{ width: Math.round(size * 0.44), height: Math.round(size * 0.44) }} />
    </div>
  );
}

function EntityCard({
  entity,
  selected,
  onSelect,
}: {
  entity: Entity;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = getTypeMeta(entity.type);
  const relationCount = entity.outgoingRelations.length + entity.incomingRelations.length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-0 text-left transition duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(0,0,0,0.5)]"
      )}
      style={{
        borderColor: selected ? meta.border : "rgba(255,255,255,.07)",
        background: selected
          ? `linear-gradient(145deg, ${meta.dim}, rgba(8,7,12,.97))`
          : "linear-gradient(160deg,rgba(14,13,19,.97),rgba(8,7,12,.95))",
        boxShadow: selected
          ? `0 0 0 1px ${meta.border}, 0 16px 50px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05)`
          : "inset 0 1px 0 rgba(255,255,255,.03), 0 8px 30px rgba(0,0,0,.4)",
      }}
    >
      <div className="h-[3px] opacity-60 transition group-hover:opacity-100" style={{ background: `linear-gradient(90deg, ${meta.color}, transparent)` }} />
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <EntityIcon type={entity.type} />
          <StatusBadge status={entity.status} />
        </div>

        <h2 className="font-display text-sm font-bold uppercase leading-tight tracking-[0.02em] text-foreground">
          {entity.name}
        </h2>
        <p className="mt-1 text-[11px] font-medium" style={{ color: meta.color }}>
          {entity.subtype || entity.campaign?.name || "Mundo base"}
        </p>
        <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-white/45">
          {entity.summary || entity.description || "Sem resumo registrado para esta entidade."}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <TypeBadge type={entity.type} small />
          <span className="inline-flex items-center gap-1 text-[10px] text-white/28 transition group-hover:text-white/55">
            {relationCount} rel.
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </button>
  );
}

function RelationPill({ relation, worldId }: { relation: RelationEdge; worldId: string }) {
  const target = relation.toEntity ?? relation.fromEntity;
  if (!target) return null;
  const meta = getTypeMeta(target.type);

  return (
    <Link
      href={`/app/worlds/${worldId}/codex/${target.id}`}
      className="flex items-center gap-3 rounded-xl border p-3 transition hover:brightness-125"
      style={{ borderColor: meta.border, background: meta.dim }}
    >
      <EntityIcon type={target.type} size={28} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-foreground">{target.name}</p>
        <p className="mt-0.5 truncate text-[10px] text-white/45">{relation.type}</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-white/25" />
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-amber-100/70">
      <span className="h-px flex-1 bg-gradient-to-r from-amber-100/20 to-transparent" />
      {children}
      <span className="h-px flex-1 bg-gradient-to-l from-amber-100/20 to-transparent" />
    </div>
  );
}

function DetailPanel({
  entity,
  loading,
  onClose,
  worldId,
}: {
  entity: EntityDetail | null;
  loading: boolean;
  onClose: () => void;
  worldId: string;
}) {
  const meta = entity ? getTypeMeta(entity.type) : getTypeMeta("npc");
  const allRelations = entity ? [...entity.outgoingRelations, ...entity.incomingRelations] : [];

  return (
    <>
      <button
        type="button"
        aria-label="Fechar inspecao"
        className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        className="absolute bottom-0 right-0 top-0 z-30 flex w-full max-w-[420px] flex-col border-l bg-[linear-gradient(160deg,rgba(14,13,20,.99),rgba(9,8,14,.99))] shadow-[-20px_0_60px_rgba(0,0,0,.7)]"
        style={{ borderColor: meta.border }}
      >
        <div className="h-[3px] shrink-0" style={{ background: `linear-gradient(90deg, ${meta.color}, transparent)` }} />
        {loading || !entity ? (
          <div className="space-y-4 p-5">
            <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
          </div>
        ) : (
          <>
            <header className="shrink-0 border-b border-white/8 p-5" style={{ background: `linear-gradient(135deg, ${meta.dim}, transparent 60%)` }}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <EntityIcon type={entity.type} />
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-bold uppercase leading-tight tracking-[0.02em] text-foreground">
                      {entity.name}
                    </h2>
                    <p className="mt-1 truncate text-xs" style={{ color: meta.color }}>
                      {entity.subtype || entity.campaign?.name || "Mundo base"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/6 text-white/55 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <TypeBadge type={entity.type} />
                <StatusBadge status={entity.status} />
                <Badge className="border-white/10 bg-black/25 text-white/70">{entity.visibility}</Badge>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {(entity.portraitImageUrl || entity.coverImageUrl) ? (
                <div
                  className="mb-5 h-44 rounded-2xl border border-white/8 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.06), rgba(8,8,13,0.72)), url(${entity.portraitImageUrl || entity.coverImageUrl})`,
                  }}
                />
              ) : null}

              <section className="mb-6">
                <SectionLabel>Descricao</SectionLabel>
                <p className="text-sm leading-7 text-white/65">
                  {entity.summary || entity.description || "Sem resumo registrado."}
                </p>
              </section>

              {entity.tags?.length ? (
                <section className="mb-6">
                  <SectionLabel>Tags</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {entity.tags.map((tag) => (
                      <Badge key={tag} className="border-white/10 bg-white/5 text-white/75">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="mb-6">
                <SectionLabel>Atributos</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Relacoes</p>
                    <p className="mt-1 font-mono text-sm font-bold" style={{ color: meta.color }}>
                      {allRelations.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Memoria</p>
                    <p className="mt-1 font-mono text-sm font-bold" style={{ color: meta.color }}>
                      {entity.recentEvents.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/4 p-3">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Imagens</p>
                    <p className="mt-1 font-mono text-sm font-bold" style={{ color: meta.color }}>
                      {entity.images.length}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-6">
                <SectionLabel>Relacoes</SectionLabel>
                <div className="space-y-2">
                  {allRelations.length ? (
                    allRelations.slice(0, 6).map((relation) => (
                      <RelationPill key={relation.id} relation={relation} worldId={worldId} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma relacao registrada ainda.</p>
                  )}
                </div>
              </section>

              <section className="mb-6">
                <SectionLabel>Memoria recente</SectionLabel>
                <div className="space-y-2">
                  {entity.recentEvents.length ? (
                    entity.recentEvents.slice(0, 4).map((event) => (
                      <div key={event.id} className="rounded-xl border border-white/8 bg-white/4 p-3">
                        <p className="text-sm font-semibold text-foreground">{event.text || event.type}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {formatDate(event.ts)} - {event.visibility}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum evento recente ligado a esta entidade.</p>
                  )}
                </div>
              </section>
            </div>

            <footer className="shrink-0 border-t border-white/8 p-4">
              <Button asChild variant="outline" className="w-full justify-between border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/codex/${entity.id}`}>
                  Abrir workspace da entidade
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

export default function WorldCodexPage() {
  const params = useParams();
  const worldId = params?.id as string;

  const [payload, setPayload] = useState<CodexPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [inspectEntity, setInspectEntity] = useState<EntityDetail | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const createEntityForm = useForm<typeof initialForm>({
    resolver: zodResolver(createEntityFormSchema),
    defaultValues: initialForm,
  });

  const loadCodex = useCallback(async () => {
    if (!worldId) return;
    setLoading(true);
    setError(null);
    try {
      const search = new URLSearchParams();
      if (term.trim()) search.set("term", term.trim());
      if (typeFilter && typeFilter !== "Todos") search.set("type", typeFilter);
      if (statusFilter) search.set("status", statusFilter);
      if (campaignFilter) search.set("campaignId", campaignFilter);

      const response = await fetch(`/api/worlds/${worldId}/codex?${search.toString()}`, { cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Falha ao carregar Codex");
      setPayload(body.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar Codex");
    } finally {
      setLoading(false);
    }
  }, [campaignFilter, statusFilter, term, typeFilter, worldId]);

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
        const response = await fetch(`/api/worlds/${worldId}/entities/${inspectId}`, { cache: "no-store" });
        const body = await response.json().catch(() => ({}));
        if (!cancelled && response.ok) {
          setInspectEntity(body.data ?? null);
        }
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
      const response = await fetch(`/api/worlds/${worldId}/entities`, {
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
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Falha ao criar entidade");

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
  const activeFilterCount = [term, typeFilter !== "Todos" ? typeFilter : "", statusFilter, campaignFilter].filter(Boolean).length;
  const selectedEntity = useMemo(() => entities.find((entity) => entity.id === inspectId) ?? null, [entities, inspectId]);

  const statsByType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entity of entities) {
      counts.set(entity.type, (counts.get(entity.type) ?? 0) + 1);
    }
    return counts;
  }, [entities]);

  return (
    <div className="relative h-[calc(100vh-138px)] min-h-[620px] max-w-full overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(160deg,rgba(8,7,12,.94),rgba(10,9,15,.9))] shadow-[0_24px_90px_rgba(0,0,0,.38)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_15%_50%,rgba(213,162,64,.05),transparent_55%),radial-gradient(ellipse_40%_40%_at_85%_50%,rgba(75,159,145,.04),transparent_55%)]" />

      <div className="relative z-10 flex h-full flex-col overflow-hidden">
        <header className="flex h-[58px] shrink-0 items-center justify-between gap-4 border-b border-white/8 bg-[linear-gradient(90deg,rgba(8,7,12,.98),rgba(12,10,16,.96))] px-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-300/12">
                <Crown className="h-4 w-4 text-amber-300" />
              </div>
              <div className="min-w-0">
                <p className="section-eyebrow truncate">Mundo ativo - {payload?.world.title ?? "Carregando"}</p>
                <h1 className="truncate font-display text-base font-bold uppercase tracking-[0.06em] text-foreground">
                  Codex do Mundo
                </h1>
              </div>
            </div>
            <div className="hidden h-6 w-px bg-white/10 lg:block" />
            <p className="hidden text-xs text-white/40 2xl:block">Entidades conectadas, relacoes e memoria operacional.</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white xl:inline-flex">
              <Link href={`/app/worlds/${worldId}`}>
                Cockpit
              </Link>
            </Button>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) createEntityForm.clearErrors("root");
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary/15 text-primary hover:bg-primary/25">
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  <span className="hidden 2xl:inline">Nova entidade</span>
                  <span className="2xl:hidden">Nova</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="chrome-panel max-h-[88vh] overflow-y-auto border-white/10 bg-card/88 sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova entidade</DialogTitle>
                  <DialogDescription>
                    Crie uma entidade world-scoped para o Codex real do produto.
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
                                options={typeOptions.map((option) => ({ value: option, label: getTypeMeta(option).label }))}
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
                            <Textarea rows={3} value={field.value ?? ""} onChange={field.onChange} />
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
                            <Textarea rows={4} value={field.value ?? ""} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={createEntityForm.control}
                        name="coverImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capa URL</FormLabel>
                            <FormControl>
                              <Input value={field.value ?? ""} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createEntityForm.control}
                        name="portraitImageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retrato URL</FormLabel>
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
          </div>
        </header>

        <div className="flex shrink-0 flex-col gap-3 border-b border-white/8 px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1 lg:max-w-[520px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <Input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Buscar entidades, locais, faccoes..."
                className="h-11 rounded-[14px] border-white/10 bg-white/5 pl-10 text-sm"
              />
              {term ? (
                <button
                  type="button"
                  onClick={() => setTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
            <SelectField
              className="h-11 w-[190px] rounded-[14px] border-white/10 bg-white/5 px-3 text-sm"
              value={campaignFilter}
              onValueChange={setCampaignFilter}
              placeholder="Todas campanhas"
              options={campaigns.map((campaign) => ({ value: campaign.id, label: campaign.name }))}
            />
            <SelectField
              className="h-11 w-[160px] rounded-[14px] border-white/10 bg-white/5 px-3 text-sm"
              value={statusFilter}
              onValueChange={setStatusFilter}
              placeholder="Todos status"
              options={[
                { value: "active", label: "Ativo" },
                { value: "alive", label: "Vivo" },
                { value: "dead", label: "Morto" },
                { value: "missing", label: "Desaparecido" },
              ]}
            />
            <div className="ml-auto flex items-center gap-2 text-[10px] font-mono text-white/30">
              {entities.length} / {payload?.stats.total ?? entities.length}
              <Button variant="outline" size="sm" className="border-white/10 bg-white/5" onClick={() => void loadCodex()}>
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                <span className="hidden 2xl:inline">Atualizar</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {["Todos", ...typeOptions].map((type) => {
              const active = typeFilter === type;
              const meta = type === "Todos" ? null : getTypeMeta(type);
              const Icon = meta?.icon ?? Filter;
              const count = type === "Todos" ? payload?.stats.total ?? entities.length : statsByType.get(type) ?? 0;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className="inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-[11px] transition"
                  style={{
                    borderColor: active ? meta?.border ?? "rgba(255,255,255,.25)" : "rgba(255,255,255,.08)",
                    background: active ? meta?.dim ?? "rgba(255,255,255,.08)" : "rgba(255,255,255,.03)",
                    color: active ? meta?.color ?? "#f4efe7" : "rgba(255,255,255,.45)",
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  <Icon className="h-3 w-3" />
                  {meta?.plural ?? "Todos"}
                  <span className="text-white/28">{count}</span>
                </button>
              );
            })}
            {activeFilterCount ? (
              <button
                type="button"
                className="rounded-[10px] border border-white/8 bg-white/3 px-3 py-1.5 text-[11px] text-white/45 transition hover:text-white"
                onClick={() => {
                  setTerm("");
                  setTypeFilter("Todos");
                  setStatusFilter("");
                  setCampaignFilter("");
                }}
              >
                Limpar filtros ({activeFilterCount})
              </button>
            ) : null}
          </div>
        </div>

        <main className="relative min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-5">
            {loading ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="h-[190px] animate-pulse rounded-2xl border border-white/8 bg-white/4" />
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
                title="Nenhuma entidade encontrada"
                description="Crie a primeira entidade ou limpe os filtros atuais para retomar a leitura do mundo."
                icon={<Skull className="h-6 w-6" />}
                action={<Button onClick={() => setDialogOpen(true)}>Criar entidade</Button>}
              />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
                {entities.map((entity) => (
                  <EntityCard
                    key={entity.id}
                    entity={entity}
                    selected={selectedEntity?.id === entity.id}
                    onSelect={() => setInspectId((current) => (current === entity.id ? null : entity.id))}
                  />
                ))}
              </div>
            )}
          </div>

          {inspectId ? (
            <DetailPanel
              entity={inspectEntity}
              loading={inspectLoading}
              onClose={() => {
                setInspectId(null);
                setInspectEntity(null);
              }}
              worldId={worldId}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
