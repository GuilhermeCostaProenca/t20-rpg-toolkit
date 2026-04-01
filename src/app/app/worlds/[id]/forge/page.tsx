"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  BookMarked,
  CalendarClock,
  Castle,
  Crown,
  Flag,
  Images,
  MapPin,
  RefreshCw,
  Sparkles,
  Swords,
  Trash2,
  UserCircle2,
  Users2,
  Waypoints,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ModeSwitcher } from "@/components/world/mode-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  buildWorldForgeMetadata,
  getEmptyWorldForgeState,
  getWorldForgeProgress,
  normalizeWorldForgeState,
  WORLD_FORGE_SCALE_OPTIONS,
  WORLD_FORGE_STAGE_OPTIONS,
  WORLD_FORGE_SUGGESTED_PILLARS,
} from "@/lib/world-forge";

type World = {
  id: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  metadata?: Record<string, unknown> | null;
  campaigns: Array<{ id: string }>;
  stats: {
    locations: number;
    rules: number;
    npcs: number;
    sessions: number;
  };
};

type ForgeEntity = {
  id: string;
  name: string;
  type: string;
  subtype?: string | null;
  summary?: string | null;
  status: string;
  tags?: unknown;
  metadata?: Record<string, unknown> | null;
  coverImageUrl?: string | null;
  portraitImageUrl?: string | null;
  outgoingRelations?: ForgeRelation[];
  incomingRelations?: ForgeRelation[];
};

type ForgeRelation = {
  id: string;
  type: string;
  notes?: string | null;
  toEntity?: { id: string; name: string; type: string } | null;
  fromEntity?: { id: string; name: string; type: string } | null;
};

type ForgeForm = {
  title: string;
  description: string;
  coverImage: string;
  forge: ReturnType<typeof getEmptyWorldForgeState>;
};

type SeedForm = {
  type: string;
  name: string;
  subtype: string;
  summary: string;
  tags: string;
  identity: string;
  motto: string;
  roleInWorld: string;
  currentStatus: string;
  bannerUrl: string;
  portraitUrl: string;
  leaderEntityId: string;
};

const initialForm: ForgeForm = {
  title: "",
  description: "",
  coverImage: "",
  forge: getEmptyWorldForgeState(),
};

const initialSeedForm: SeedForm = {
  type: "house",
  name: "",
  subtype: "",
  summary: "",
  tags: "",
  identity: "",
  motto: "",
  roleInWorld: "",
  currentStatus: "",
  bannerUrl: "",
  portraitUrl: "",
  leaderEntityId: "",
};

const forgeSeedOptions = [
  {
    value: "house",
    label: "Casa",
    eyebrow: "Dinastia",
    icon: Castle,
    hint: "Casas, familias reinantes e linhagens centrais.",
  },
  {
    value: "faction",
    label: "Faccao",
    eyebrow: "Bloco de poder",
    icon: Flag,
    hint: "Ordens, conselhos, igrejas e grupos de influencia.",
  },
  {
    value: "place",
    label: "Lugar",
    eyebrow: "Territorio",
    icon: MapPin,
    hint: "Cidades, castelos, tavernas, cavernas e regioes.",
  },
  {
    value: "npc",
    label: "NPC",
    eyebrow: "Figura-chave",
    icon: Users2,
    hint: "Conselheiros, rivais, generais, herdeiros e antagonistas.",
  },
  {
    value: "character",
    label: "Personagem",
    eyebrow: "Protagonista",
    icon: UserCircle2,
    hint: "Personagens-base ou figuras centrais do mundo.",
  },
];

const powerStatusOptions = ["Ascendente", "Estavel", "Em crise", "Quebrada"];

function parseEntityTags(tags: unknown) {
  return Array.isArray(tags) ? tags.filter((value): value is string => typeof value === "string") : [];
}

function parsePowerProfile(metadata: unknown) {
  const meta = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : undefined;
  const powerProfile =
    meta?.powerProfile && typeof meta.powerProfile === "object"
      ? (meta.powerProfile as Record<string, unknown>)
      : undefined;

  return {
    identity: typeof powerProfile?.identity === "string" ? powerProfile.identity : "",
    motto: typeof powerProfile?.motto === "string" ? powerProfile.motto : "",
    roleInWorld: typeof powerProfile?.roleInWorld === "string" ? powerProfile.roleInWorld : "",
    currentStatus: typeof powerProfile?.currentStatus === "string" ? powerProfile.currentStatus : "",
    leaderEntityId:
      typeof powerProfile?.leaderEntityId === "string" ? powerProfile.leaderEntityId : "",
  };
}

export default function WorldForgePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const worldId = params?.id as string;
  const isNewWorld = searchParams.get("mode") === "new";

  const [world, setWorld] = useState<World | null>(null);
  const [form, setForm] = useState<ForgeForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [entities, setEntities] = useState<ForgeEntity[]>([]);
  const [seedForm, setSeedForm] = useState<SeedForm>(initialSeedForm);
  const [seedSaving, setSeedSaving] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [linkingEntityId, setLinkingEntityId] = useState<string>("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const loadWorld = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [worldRes, codexRes] = await Promise.all([
        fetch(`/api/worlds/${worldId}`, { cache: "no-store" }),
        fetch(`/api/worlds/${worldId}/codex`, { cache: "no-store" }),
      ]);
      const payload = await worldRes.json().catch(() => ({}));
      const codexPayload = await codexRes.json().catch(() => ({}));
      if (!worldRes.ok || !payload.data) {
        throw new Error(payload.error ?? "Nao foi possivel carregar a forja do mundo");
      }

      const nextWorld = payload.data as World;
      setWorld(nextWorld);
      setEntities((codexPayload.data?.entities as ForgeEntity[] | undefined) ?? []);
      setForm({
        title: nextWorld.title ?? "",
        description: nextWorld.description ?? "",
        coverImage: nextWorld.coverImage ?? "",
        forge: normalizeWorldForgeState(nextWorld.metadata),
      });
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Erro inesperado ao abrir a forja";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    if (worldId) void loadWorld();
  }, [loadWorld, worldId]);

  const progress = useMemo(() => getWorldForgeProgress(form.forge), [form.forge]);
  const structuredBlocks = useMemo(
    () => entities.filter((entity) => entity.type === "house" || entity.type === "faction"),
    [entities]
  );
  const leadershipCandidates = useMemo(
    () => entities.filter((entity) => entity.type === "npc" || entity.type === "character"),
    [entities]
  );
  const selectedBlock = useMemo(
    () => structuredBlocks.find((entity) => entity.id === selectedBlockId) ?? structuredBlocks[0] ?? null,
    [selectedBlockId, structuredBlocks]
  );
  const selectedSeedOption = useMemo(
    () => forgeSeedOptions.find((option) => option.value === seedForm.type) ?? forgeSeedOptions[0],
    [seedForm.type]
  );
  const seedSupportsPowerProfile = seedForm.type === "house" || seedForm.type === "faction";
  const powerBlocks = useMemo(
    () =>
      forgeSeedOptions.map((option) => ({
        ...option,
        items: entities.filter((entity) => entity.type === option.value).slice(0, 4),
        total: entities.filter((entity) => entity.type === option.value).length,
      })),
    [entities]
  );

  const selectedBlockConnections = useMemo(() => {
    if (!selectedBlock) return [];

    const outgoing = (selectedBlock.outgoingRelations ?? []).map((relation) => ({
      id: relation.id,
      label: relation.type,
      direction: "outgoing" as const,
      target: relation.toEntity,
      notes: relation.notes,
    }));
    const incoming = (selectedBlock.incomingRelations ?? []).map((relation) => ({
      id: relation.id,
      label: relation.type,
      direction: "incoming" as const,
      target: relation.fromEntity,
      notes: relation.notes,
    }));

    return [...outgoing, ...incoming];
  }, [selectedBlock]);

  const blockAssociationCandidates = useMemo(() => {
    if (!selectedBlock) return [];
    const connectedIds = new Set(selectedBlockConnections.map((item) => item.target?.id).filter(Boolean));
    return entities.filter(
      (entity) =>
        entity.id !== selectedBlock.id &&
        !connectedIds.has(entity.id) &&
        ["npc", "character", "place", "house", "faction"].includes(entity.type)
    );
  }, [entities, selectedBlock, selectedBlockConnections]);

  useEffect(() => {
    if (!selectedBlockId && structuredBlocks[0]) {
      setSelectedBlockId(structuredBlocks[0].id);
    }
  }, [selectedBlockId, structuredBlocks]);

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          coverImage: form.coverImage,
          metadata: buildWorldForgeMetadata(form.forge, world?.metadata),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error ?? "Nao foi possivel salvar a forja");
      }

      setWorld((prev) => (prev ? { ...prev, ...(payload.data as Partial<World>) } : (payload.data as World)));
      setSaveMessage("Progresso salvo. Voce pode continuar daqui quando quiser.");
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Erro inesperado ao salvar a forja";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function togglePillar(pillar: string) {
    setForm((prev) => {
      const active = prev.forge.pillars.includes(pillar);
      return {
        ...prev,
        forge: {
          ...prev.forge,
          pillars: active
            ? prev.forge.pillars.filter((value) => value !== pillar)
            : [...prev.forge.pillars, pillar].slice(0, 8),
        },
      };
    });
  }

  async function handleSeedEntity() {
    if (!seedForm.name.trim()) {
      setSeedError("Nome obrigatorio para semear o bloco.");
      return;
    }

    setSeedSaving(true);
    setSeedError(null);
    setSeedMessage(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}/entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: seedForm.name,
          type: seedForm.type,
          subtype: seedForm.subtype || undefined,
          summary: seedForm.summary || undefined,
          tags: seedForm.tags
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          metadata: {
            seededFrom: "world-forge",
            powerProfile: seedSupportsPowerProfile
              ? {
                  identity: seedForm.identity || undefined,
                  motto: seedForm.motto || undefined,
                  roleInWorld: seedForm.roleInWorld || undefined,
                  currentStatus: seedForm.currentStatus || undefined,
                  leaderEntityId: seedForm.leaderEntityId || undefined,
                }
              : undefined,
          },
          coverImageUrl: seedForm.bannerUrl || undefined,
          portraitImageUrl: seedForm.portraitUrl || undefined,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error ?? "Nao foi possivel criar o bloco do mundo");
      }

      const createdEntityId = payload.data?.id as string | undefined;
      if (createdEntityId && seedForm.leaderEntityId && seedSupportsPowerProfile) {
        await fetch(`/api/worlds/${worldId}/relationships`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromEntityId: createdEntityId,
            toEntityId: seedForm.leaderEntityId,
            type: "led_by",
            directionality: "DIRECTED",
            visibility: "MASTER",
            notes: seedForm.roleInWorld || undefined,
          }),
        });
      }

      setSeedForm({ ...initialSeedForm, type: seedForm.type });
      setSeedMessage("Bloco semeado no Codex. A forja ja consegue continuar a partir dele.");
      await loadWorld();
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Erro inesperado ao semear o bloco";
      setSeedError(message);
    } finally {
      setSeedSaving(false);
    }
  }

  async function handleAssociateBlock() {
    if (!selectedBlock || !linkingEntityId) {
      setLinkError("Escolha um bloco de poder e uma entidade para associar.");
      return;
    }

    const target = entities.find((entity) => entity.id === linkingEntityId);
    if (!target) {
      setLinkError("Entidade alvo nao encontrada para associacao.");
      return;
    }

    const relationPayload =
      target.type === "npc" || target.type === "character"
        ? {
            fromEntityId: target.id,
            toEntityId: selectedBlock.id,
            type: "belongs_to",
            directionality: "DIRECTED",
          }
        : target.type === "place"
          ? {
              fromEntityId: selectedBlock.id,
              toEntityId: target.id,
              type: "controls",
              directionality: "DIRECTED",
            }
          : {
              fromEntityId: selectedBlock.id,
              toEntityId: target.id,
              type: "aligned_with",
              directionality: "BIDIRECTIONAL",
            };

    setLinking(true);
    setLinkError(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...relationPayload,
          visibility: "MASTER",
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error ?? "Nao foi possivel associar a entidade ao bloco");
      }
      setLinkingEntityId("");
      await loadWorld();
    } catch (associateError) {
      const message =
        associateError instanceof Error
          ? associateError.message
          : "Erro inesperado ao associar entidade";
      setLinkError(message);
    } finally {
      setLinking(false);
    }
  }

  async function handleRemoveAssociation(relationshipId: string) {
    setLinking(true);
    setLinkError(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships/${relationshipId}`, {
        method: "DELETE",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error ?? "Nao foi possivel remover a associacao");
      }
      await loadWorld();
    } catch (removeError) {
      const message =
        removeError instanceof Error
          ? removeError.message
          : "Erro inesperado ao remover associacao";
      setLinkError(message);
    } finally {
      setLinking(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[320px] w-full rounded-[32px]" />
        <Skeleton className="h-[720px] w-full rounded-[32px]" />
      </div>
    );
  }

  if (!world) {
    return (
      <EmptyState
        title="Forja indisponivel"
        description={error ?? "O mundo nao foi encontrado para iniciar a forja."}
        icon={<Sparkles className="h-6 w-6" />}
        action={
          <Button onClick={() => router.push("/app/worlds")}>Voltar para mundos</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section
        className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10"
        style={{
          backgroundImage: form.coverImage
            ? `linear-gradient(120deg, rgba(8,8,13,0.92), rgba(12,10,13,0.84)), url(${form.coverImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Forja do mundo</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {progress.percent}% pronto
              </Badge>
              {isNewWorld ? (
                <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                  Mundo recem-criado
                </Badge>
              ) : null}
            </div>

            <div className="space-y-3">
              <p className="section-eyebrow">Bootstrap world-first</p>
              <h1 className="max-w-4xl text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl xl:text-6xl">
                A oficina onde o mundo ganha forma antes da mesa.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Aqui o mundo deixa de ser nome + card. Defina conceito, tom, pilares e foco
                criativo antes de abrir casas, genealogias, politica, Codex e referencias.
              </p>
            </div>

            <ModeSwitcher worldId={worldId} />

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Pilares</p>
                <div className="mt-3 text-3xl font-black text-foreground">{form.forge.pillars.length}</div>
              </div>
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Campanhas</p>
                <div className="mt-3 text-3xl font-black text-foreground">{world.campaigns.length}</div>
              </div>
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">NPCs base</p>
                <div className="mt-3 text-3xl font-black text-foreground">{world.stats.npcs}</div>
              </div>
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Locais</p>
                <div className="mt-3 text-3xl font-black text-foreground">{world.stats.locations}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={handleSave} disabled={saving}>
                <Sparkles className="mr-2 h-4 w-4" />
                {saving ? "Salvando..." : "Salvar progresso"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/10 bg-white/5"
                onClick={() => void loadWorld()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recarregar
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/10 bg-white/5"
                onClick={() => router.push(`/app/worlds/${worldId}`)}
              >
                Voltar ao cockpit
              </Button>
            </div>

            {saveMessage ? <p className="text-sm text-emerald-200">{saveMessage}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Estado da forja</p>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Progresso do bootstrap</span>
                    <span>{progress.completed}/{progress.total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-amber-300"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-muted-foreground">
                  {progress.percent < 40
                    ? "O mundo ainda esta na semente. Feche conceito, tom e escala antes de abrir muitas frentes."
                    : progress.percent < 80
                      ? "A base ja existe. Agora vale abrir entidades, casas e referencias visuais com menos retrabalho."
                      : "A fundacao do mundo esta forte o bastante para seguir para Codex, Grafo e preparacao de sessao."}
                </div>
              </div>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Proximas oficinas</p>
              <div className="mt-4 grid gap-3">
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/codex`)}
                >
                  Abrir Codex
                  <Crown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/graph?mode=genealogy`)}
                >
                  Abrir grafo
                  <Waypoints className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/forge/politics`)}
                >
                  Abrir politica
                  <Flag className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/forge/timeline`)}
                >
                  Abrir cronologia
                  <CalendarClock className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/forge/lore`)}
                >
                  Abrir lore-base
                  <BookMarked className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between border-white/10 bg-white/5"
                  onClick={() => router.push(`/app/worlds/${worldId}/visual`)}
                >
                  Abrir biblioteca visual
                  <Images className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        <section className="chrome-panel rounded-[30px] p-6">
          <div className="mb-5 space-y-2">
            <p className="section-eyebrow">Passo 1</p>
            <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
              Conceito, tom e escopo
            </h2>
            <p className="text-sm text-muted-foreground">
              Esta camada precisa responder que mundo e esse, como ele soa e de onde a mesa
              vai partir.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome do mundo</label>
              <Input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Ex.: A Era dos Elfos"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Conceito central</label>
              <Input
                value={form.forge.concept}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    forge: { ...prev.forge, concept: event.target.value },
                  }))
                }
                placeholder="Ex.: elfos em decadencia, coroas rachadas e fe antiga"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tom da mesa</label>
              <Input
                value={form.forge.tone}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    forge: { ...prev.forge, tone: event.target.value },
                  }))
                }
                placeholder="Ex.: tragico, politico, melancolico"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Escopo narrativo</label>
              <Input
                value={form.forge.scope}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    forge: { ...prev.forge, scope: event.target.value },
                  }))
                }
                placeholder="Ex.: tres cortes, duas religioes e uma guerra civil"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Descricao base</label>
              <Textarea
                rows={6}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Resumo curto do mundo, sua tensao principal e o que o diferencia."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Imagem de capa</label>
              <Input
                value={form.coverImage}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, coverImage: event.target.value }))
                }
                placeholder="https://..."
              />
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-muted-foreground">
                A capa ajuda a dar o tom do cockpit e da biblioteca visual desde o nascimento do mundo.
              </div>
            </div>
          </div>
        </section>

        <section className="chrome-panel rounded-[30px] p-6">
          <div className="mb-5 space-y-2">
            <p className="section-eyebrow">Passo 2</p>
            <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
              Escala e foco
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Escala inicial</label>
              <div className="flex flex-wrap gap-2">
                {WORLD_FORGE_SCALE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    className={
                      form.forge.scale === option.value
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5"
                    }
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        forge: { ...prev.forge, scale: option.value },
                      }))
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Etapa do mundo</label>
              <div className="flex flex-wrap gap-2">
                {WORLD_FORGE_STAGE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    className={
                      form.forge.stage === option.value
                        ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                        : "border-white/10 bg-white/5"
                    }
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        forge: { ...prev.forge, stage: option.value },
                      }))
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Foco criativo atual</label>
              <Input
                value={form.forge.currentFocus}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    forge: { ...prev.forge, currentFocus: event.target.value },
                  }))
                }
                placeholder="Ex.: fechar familias reinantes e o conselho central"
              />
            </div>
          </div>
        </section>
      </div>

      <section className="chrome-panel rounded-[30px] p-6">
        <div className="mb-5 space-y-2">
          <p className="section-eyebrow">Passo 3</p>
          <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
            Pilares do mundo
          </h2>
          <p className="text-sm text-muted-foreground">
            Escolha os blocos que vao governar a construcao profunda daqui para frente.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {WORLD_FORGE_SUGGESTED_PILLARS.map((pillar) => {
            const active = form.forge.pillars.includes(pillar);
            return (
              <Button
                key={pillar}
                type="button"
                variant="outline"
                className={
                  active
                    ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                    : "border-white/10 bg-white/5"
                }
                onClick={() => togglePillar(pillar)}
              >
                {pillar}
              </Button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="overflow-hidden rounded-[28px] border-white/10 bg-black/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-foreground">
                <Castle className="h-5 w-5 text-amber-300/80" />
                <h3 className="text-lg font-black uppercase tracking-[0.04em]">Casas e blocos</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Quando a base estiver salva, o proximo corte deve abrir familias, casas, faccoes e polos de poder.
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-[28px] border-white/10 bg-black/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-foreground">
                <Waypoints className="h-5 w-5 text-primary/80" />
                <h3 className="text-lg font-black uppercase tracking-[0.04em]">Genealogia</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                O grafo genealógico vai usar estes pilares para montar linhagens, ramos e herancas.
              </p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-[28px] border-white/10 bg-black/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-foreground">
                <Images className="h-5 w-5 text-sky-200/80" />
                <h3 className="text-lg font-black uppercase tracking-[0.04em]">Visual e mesa</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Depois do bootstrap, a biblioteca visual vira a pasta viva de rostos, castelos, tavernas e reveals.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="chrome-panel rounded-[30px] p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="section-eyebrow">Passo 4</p>
            <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
              Casas, faccoes e blocos de poder
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              A forja agora ja consegue semear a base politica do mundo direto no Codex. Use
              isso para colocar as primeiras casas, ordens, cidades e figuras centrais de pe.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-white/10 bg-white/5"
            onClick={() => router.push(`/app/worlds/${worldId}/codex`)}
          >
            <Crown className="mr-2 h-4 w-4" />
            Abrir Codex completo
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {powerBlocks.map((block) => {
              const Icon = block.icon;
              return (
                <Card key={block.value} className="overflow-hidden rounded-[28px] border-white/10 bg-black/20">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="section-eyebrow">{block.eyebrow}</p>
                        <h3 className="mt-2 text-lg font-black uppercase tracking-[0.04em] text-foreground">
                          {block.label}
                        </h3>
                      </div>
                      <Icon className="h-5 w-5 text-amber-300/80" />
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{block.hint}</p>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-foreground">{block.total}</span>
                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          no mundo
                        </span>
                      </div>
                    </div>
                    {block.items.length > 0 ? (
                      <div className="space-y-2">
                        {block.items.map((entity) => (
                          <button
                            key={entity.id}
                            type="button"
                            className="flex w-full items-start justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-left transition hover:border-primary/20 hover:bg-white/6"
                            onClick={() => router.push(`/app/worlds/${worldId}/codex/${entity.id}`)}
                          >
                            <div>
                              <p className="text-sm font-semibold text-foreground">{entity.name}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {entity.subtype || entity.summary || "Sem resumo ainda"}
                              </p>
                              {(() => {
                                const profile = parsePowerProfile(entity.metadata);
                                const tags = parseEntityTags(entity.tags);
                                if (!profile.motto && !profile.currentStatus && tags.length === 0) return null;
                                return (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {profile.currentStatus ? (
                                      <Badge className="border-amber-300/20 bg-amber-300/10 text-amber-100">
                                        {profile.currentStatus}
                                      </Badge>
                                    ) : null}
                                    {profile.motto ? (
                                      <Badge className="border-primary/20 bg-primary/10 text-primary">
                                        {profile.motto}
                                      </Badge>
                                    ) : null}
                                    {tags.slice(0, 2).map((tag) => (
                                      <Badge
                                        key={`${entity.id}-${tag}`}
                                        className="border-white/10 bg-white/8 text-white/80"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                            <Crown className="mt-0.5 h-4 w-4 text-primary/70" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
                        Nenhum bloco semeado ainda nesta categoria.
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="cinematic-frame rounded-[28px] p-5">
            <p className="section-eyebrow">Seed rapido</p>
            <h3 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
              Coloque o primeiro bloco de pe
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Isso nao substitui o workspace completo. E a porta de entrada para jogar a base do
              mundo no Codex sem sair da Forja.
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                {forgeSeedOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    className={
                      seedForm.type === option.value
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5"
                    }
                    onClick={() => setSeedForm((prev) => ({ ...prev, type: option.value }))}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{selectedSeedOption.label}</p>
                <p className="mt-2 leading-6">{selectedSeedOption.hint}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome</label>
                <Input
                  value={seedForm.name}
                  onChange={(event) =>
                    setSeedForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Ex.: Casa Valdoren"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Subtipo</label>
                <Input
                  value={seedForm.subtype}
                  onChange={(event) =>
                    setSeedForm((prev) => ({ ...prev, subtype: event.target.value }))
                  }
                  placeholder="Ex.: casa real, ordem arcana, porto, conselheiro"
                />
              </div>
              {seedSupportsPowerProfile ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Identidade politica</label>
                    <Input
                      value={seedForm.identity}
                      onChange={(event) =>
                        setSeedForm((prev) => ({ ...prev, identity: event.target.value }))
                      }
                      placeholder="Ex.: guardioes do norte, bloco do trono, clero oficial"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Lema ou marca</label>
                    <Input
                      value={seedForm.motto}
                      onChange={(event) =>
                        setSeedForm((prev) => ({ ...prev, motto: event.target.value }))
                      }
                      placeholder="Ex.: Sangue, neve e memoria"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Papel no mundo</label>
                    <Input
                      value={seedForm.roleInWorld}
                      onChange={(event) =>
                        setSeedForm((prev) => ({ ...prev, roleInWorld: event.target.value }))
                      }
                      placeholder="Ex.: segura a fronteira oeste e disputa o conselho central"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Status atual</label>
                    <div className="flex flex-wrap gap-2">
                      {powerStatusOptions.map((option) => (
                        <Button
                          key={option}
                          type="button"
                          variant="outline"
                          className={
                            seedForm.currentStatus === option
                              ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
                              : "border-white/10 bg-white/5"
                          }
                          onClick={() =>
                            setSeedForm((prev) => ({ ...prev, currentStatus: option }))
                          }
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Resumo</label>
                <Textarea
                  rows={4}
                  value={seedForm.summary}
                  onChange={(event) =>
                    setSeedForm((prev) => ({ ...prev, summary: event.target.value }))
                  }
                  placeholder="O papel politico ou narrativo desse bloco dentro do mundo."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tags</label>
                <Input
                  value={seedForm.tags}
                  onChange={(event) =>
                    setSeedForm((prev) => ({ ...prev, tags: event.target.value }))
                  }
                  placeholder="reino central, linhagem antiga, conselho, fronteira"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {seedSupportsPowerProfile ? "Banner ou imagem de capa" : "Imagem inicial"}
                </label>
                <Input
                  value={seedForm.bannerUrl}
                  onChange={(event) =>
                    setSeedForm((prev) => ({ ...prev, bannerUrl: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Retrato principal</label>
                <Input
                  value={seedForm.portraitUrl}
                  onChange={(event) =>
                    setSeedForm((prev) => ({ ...prev, portraitUrl: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              {seedSupportsPowerProfile ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Lideranca inicial</label>
                  <div className="flex flex-wrap gap-2">
                    {leadershipCandidates.slice(0, 8).map((candidate) => (
                      <Button
                        key={candidate.id}
                        type="button"
                        variant="outline"
                        className={
                          seedForm.leaderEntityId === candidate.id
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-white/10 bg-white/5"
                        }
                        onClick={() =>
                          setSeedForm((prev) => ({
                            ...prev,
                            leaderEntityId: prev.leaderEntityId === candidate.id ? "" : candidate.id,
                          }))
                        }
                      >
                        {candidate.name}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Se a figura ainda nao existir, semeie primeiro como NPC ou personagem e depois volte aqui.
                  </p>
                </div>
              ) : null}

              {seedError ? <p className="text-sm text-destructive">{seedError}</p> : null}
              {seedMessage ? <p className="text-sm text-emerald-200">{seedMessage}</p> : null}

              <Button className="w-full" onClick={handleSeedEntity} disabled={seedSaving}>
                <Sparkles className="mr-2 h-4 w-4" />
                {seedSaving ? "Semeando..." : "Semear bloco no Codex"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <Link href={`/app/worlds/${worldId}/codex`} className="group">
          <div className="cinematic-frame rounded-[28px] p-5 transition group-hover:border-primary/25">
            <div className="flex items-center gap-2 text-foreground">
              <Crown className="h-4 w-4 text-primary/80" />
              <span className="font-semibold">Semear entidades</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Abra o Codex para criar casas, personagens-base, faccoes e lugares nucleares.
            </p>
          </div>
        </Link>
        <Link href={`/app/worlds/${worldId}/graph?mode=genealogy`} className="group">
          <div className="cinematic-frame rounded-[28px] p-5 transition group-hover:border-primary/25">
            <div className="flex items-center gap-2 text-foreground">
              <Waypoints className="h-4 w-4 text-amber-300/80" />
              <span className="font-semibold">Montar linhagens</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Siga para o Grafo para visualizar casas, ramos e conexoes familiares.
            </p>
          </div>
        </Link>
        <Link href={`/app/worlds/${worldId}/forge/genealogy`} className="group">
          <div className="cinematic-frame rounded-[28px] p-5 transition group-hover:border-primary/25">
            <div className="flex items-center gap-2 text-foreground">
              <Waypoints className="h-4 w-4 text-primary/80" />
              <span className="font-semibold">Oficina genealogica</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Abra a superficie dedicada para heranca, casamento, bastardos e ramos de casa.
            </p>
          </div>
        </Link>
        <Link href={`/app/worlds/${worldId}/forge/politics`} className="group">
          <div className="cinematic-frame rounded-[28px] p-5 transition group-hover:border-primary/25">
            <div className="flex items-center gap-2 text-foreground">
              <Flag className="h-4 w-4 text-rose-200/80" />
              <span className="font-semibold">Oficina politica</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Estruture conselhos, assentos, polos de poder e tensoes formais do mundo.
            </p>
          </div>
        </Link>
        <Link href={`/app/worlds/${worldId}/forge/timeline`} className="group">
          <div className="cinematic-frame rounded-[28px] p-5 transition group-hover:border-primary/25">
            <div className="flex items-center gap-2 text-foreground">
              <CalendarClock className="h-4 w-4 text-amber-200/80" />
              <span className="font-semibold">Cronologia do mundo</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Estruture eras, datas e eventos fundadores dentro do proprio produto.
            </p>
          </div>
        </Link>
        <Link href={`/app/worlds/${worldId}/forge/lore`} className="group">
          <div className="cinematic-frame rounded-[28px] p-5 transition group-hover:border-primary/25">
            <div className="flex items-center gap-2 text-foreground">
              <BookMarked className="h-4 w-4 text-violet-200/80" />
              <span className="font-semibold">Lore-base do mundo</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Guarde corpus textual, segredos, secoes revelaveis e conexoes com o Codex.
            </p>
          </div>
        </Link>
        <Link href={`/app/worlds/${worldId}/visual`} className="group">
          <div className="cinematic-frame rounded-[28px] p-5 transition group-hover:border-primary/25">
            <div className="flex items-center gap-2 text-foreground">
              <Images className="h-4 w-4 text-sky-200/80" />
              <span className="font-semibold">Curar imagens</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Monte o mood visual do mundo com retratos, paisagens e assets de reveal.
            </p>
          </div>
        </Link>
        <Link href={`/app/worlds/${worldId}/campaigns`} className="group">
          <div className="cinematic-frame rounded-[28px] p-5 transition group-hover:border-primary/25">
            <div className="flex items-center gap-2 text-foreground">
              <Swords className="h-4 w-4 text-emerald-300/80" />
              <span className="font-semibold">Levar para mesa</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Quando o bootstrap estiver firme, abra a primeira campanha sem cair em dashboard vazio.
            </p>
          </div>
        </Link>
      </section>

      <section className="chrome-panel rounded-[30px] p-6">
        <div className="mb-5 space-y-2">
          <p className="section-eyebrow">Passo 5</p>
          <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
            Estruturar blocos de poder
          </h2>
          <p className="text-sm text-muted-foreground">
            Escolha uma casa ou faccao e associe membros, lugares e aliancas sem sair da Forja.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {structuredBlocks.length > 0 ? (
              structuredBlocks.map((block) => {
                const profile = parsePowerProfile(block.metadata);
                return (
                  <button
                    key={block.id}
                    type="button"
                    className={`w-full rounded-[24px] border p-4 text-left transition ${
                      selectedBlock?.id === block.id
                        ? "border-primary/30 bg-primary/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                    onClick={() => setSelectedBlockId(block.id)}
                  >
                    <p className="section-eyebrow">{block.type === "house" ? "Casa" : "Faccao"}</p>
                    <h3 className="mt-2 text-lg font-black uppercase tracking-[0.04em] text-foreground">
                      {block.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {profile.roleInWorld || block.summary || "Sem papel politico definido ainda."}
                    </p>
                    {profile.currentStatus ? (
                      <Badge className="mt-3 border-amber-300/20 bg-amber-300/10 text-amber-100">
                        {profile.currentStatus}
                      </Badge>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/4 p-5 text-sm text-muted-foreground">
                Semeie uma casa ou faccao primeiro para abrir a estrutura politica aqui.
              </div>
            )}
          </div>

          <div className="space-y-4">
            {selectedBlock ? (
              <>
                <div className="cinematic-frame rounded-[28px] p-5">
                  <p className="section-eyebrow">Conexoes atuais</p>
                  <h3 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                    {selectedBlock.name}
                  </h3>
                  <div className="mt-4 space-y-3">
                    {selectedBlockConnections.length > 0 ? (
                      selectedBlockConnections.map((connection) => (
                        <div
                          key={connection.id}
                          className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 p-4"
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {connection.target?.name || "Sem alvo"}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {connection.direction === "incoming" ? "entra" : "sai"} · {connection.label}
                            </p>
                            {connection.notes ? (
                              <p className="mt-2 text-sm text-muted-foreground">{connection.notes}</p>
                            ) : null}
                          </div>
                          <Button
                            variant="outline"
                            className="border-white/10 bg-white/5"
                            onClick={() => void handleRemoveAssociation(connection.id)}
                            disabled={linking}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
                        Este bloco ainda nao tem membros, lugares ou aliancas ligados pela Forja.
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-white/4 p-6 text-sm text-muted-foreground">
                Nenhum bloco selecionado.
              </div>
            )}
          </div>

          <div className="cinematic-frame rounded-[28px] p-5">
            <p className="section-eyebrow">Associar entidade</p>
            <h3 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
              Trazer para dentro do bloco
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Personagens e NPCs entram como membros. Lugares entram como territorio controlado.
              Outros blocos entram como alinhamento.
            </p>

            <div className="mt-5 space-y-3">
              {blockAssociationCandidates.slice(0, 10).map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    linkingEntityId === candidate.id
                      ? "border-primary/30 bg-primary/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                  onClick={() =>
                    setLinkingEntityId((current) => (current === candidate.id ? "" : candidate.id))
                  }
                >
                  <p className="text-sm font-semibold text-foreground">{candidate.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {candidate.type} · {candidate.subtype || candidate.summary || "sem contexto curto"}
                  </p>
                </button>
              ))}
            </div>

            {linkError ? <p className="mt-4 text-sm text-destructive">{linkError}</p> : null}

            <Button className="mt-5 w-full" onClick={handleAssociateBlock} disabled={linking || !selectedBlock}>
              <Sparkles className="mr-2 h-4 w-4" />
              {linking ? "Associando..." : "Associar ao bloco"}
            </Button>
          </div>
        </div>
      </section>

      <section className="cinematic-frame rounded-[30px] p-6">
        <div className="flex items-center gap-3 text-foreground">
          <BookMarked className="h-5 w-5 text-amber-300/80" />
          <h2 className="text-xl font-black uppercase tracking-[0.04em]">Continuar depois sem perder contexto</h2>
        </div>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">
          A forja salva progresso parcial. Voce pode parar no conceito hoje, voltar depois para
          casas e genealogia e continuar sem reexplicar o mundo do zero.
        </p>
      </section>
    </div>
  );
}

