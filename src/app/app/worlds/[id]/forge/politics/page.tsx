"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Crown,
  Flag,
  Landmark,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users2,
  Waypoints,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type PoliticalRelation = {
  id: string;
  type: string;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  toEntity?: { id: string; name: string; type: string } | null;
  fromEntity?: { id: string; name: string; type: string } | null;
};

type PoliticalEntity = {
  id: string;
  name: string;
  type: string;
  subtype?: string | null;
  summary?: string | null;
  status: string;
  metadata?: Record<string, unknown> | null;
  outgoingRelations?: PoliticalRelation[];
  incomingRelations?: PoliticalRelation[];
};

type CodexPayload = {
  world: { id: string; title: string; description?: string | null };
  entities: PoliticalEntity[];
};

type PoliticalSeedForm = {
  type: "institution" | "office";
  name: string;
  subtype: string;
  summary: string;
  tags: string;
  domain: string;
  seatPower: string;
  currentStatus: string;
  secrecy: string;
};

type PoliticalProfileDraft = {
  currentStatus: string;
  fragilities: string;
  pressureNotes: string;
};

type PoliticalTensionDraft = {
  intensity: string;
  publicState: string;
  notes: string;
};

type PoliticalSeatDraft = {
  name: string;
  subtype: string;
  seatPower: string;
  holderEntityId: string;
};

const initialSeedForm: PoliticalSeedForm = {
  type: "institution",
  name: "",
  subtype: "council",
  summary: "",
  tags: "",
  domain: "",
  seatPower: "",
  currentStatus: "",
  secrecy: "",
};

const initialProfileDraft: PoliticalProfileDraft = {
  currentStatus: "",
  fragilities: "",
  pressureNotes: "",
};

const initialTensionDraft: PoliticalTensionDraft = {
  intensity: "media",
  publicState: "velada",
  notes: "",
};

const initialSeatDraft: PoliticalSeatDraft = {
  name: "",
  subtype: "seat",
  seatPower: "",
  holderEntityId: "",
};

const seedOptions = [
  {
    value: "institution",
    label: "Instituicao",
    eyebrow: "Conselho / Coroa",
    hint: "Tronos, conselhos, cortes, igrejas e polos formais de poder.",
    icon: Landmark,
  },
  {
    value: "office",
    label: "Cargo",
    eyebrow: "Cadeira / Titulo",
    hint: "Mao do rei, lorde comandante, assento no conselho e postos chave.",
    icon: Crown,
  },
] as const;

function parsePoliticsProfile(metadata: unknown) {
  const meta = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : undefined;
  const politics =
    meta?.politics && typeof meta.politics === "object"
      ? (meta.politics as Record<string, unknown>)
      : undefined;

  return {
    domain: typeof politics?.domain === "string" ? politics.domain : "",
    seatPower: typeof politics?.seatPower === "string" ? politics.seatPower : "",
    currentStatus: typeof politics?.currentStatus === "string" ? politics.currentStatus : "",
    secrecy: typeof politics?.secrecy === "string" ? politics.secrecy : "",
    pressureNotes: typeof politics?.pressureNotes === "string" ? politics.pressureNotes : "",
    fragilities: Array.isArray(politics?.fragilities)
      ? politics.fragilities.filter((item): item is string => typeof item === "string")
      : [],
  };
}

function parsePoliticalRelationMetadata(metadata: unknown) {
  const meta = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : undefined;
  const politics =
    meta?.politics && typeof meta.politics === "object"
      ? (meta.politics as Record<string, unknown>)
      : undefined;

  return {
    intensity: typeof politics?.intensity === "string" ? politics.intensity : "",
    publicState: typeof politics?.publicState === "string" ? politics.publicState : "",
  };
}

function getPoliticalRelationTemplates(source: PoliticalEntity, target: PoliticalEntity) {
  const sourceType = source.type;
  const targetType = target.type;

  if (sourceType === "institution" && targetType === "office") {
    return [{ type: "contains_seat", directionality: "DIRECTED", label: "Contem cadeira" }];
  }
  if (sourceType === "institution" && targetType === "place") {
    return [{ type: "seated_in", directionality: "DIRECTED", label: "Tem sede em" }];
  }
  if (sourceType === "institution" && (targetType === "npc" || targetType === "character")) {
    return [{ type: "advised_by", directionality: "DIRECTED", label: "E aconselhada por" }];
  }
  if (sourceType === "institution" && (targetType === "house" || targetType === "faction")) {
    return [
      { type: "influenced_by", directionality: "DIRECTED", label: "Sofre influencia de" },
      { type: "rivals_with", directionality: "BIDIRECTIONAL", label: "Rivaliza com" },
    ];
  }
  if (sourceType === "office" && (targetType === "npc" || targetType === "character")) {
    return [{ type: "held_by", directionality: "DIRECTED", label: "E ocupado por" }];
  }
  if (sourceType === "office" && (targetType === "house" || targetType === "faction")) {
    return [{ type: "backed_by", directionality: "DIRECTED", label: "E sustentado por" }];
  }
  if (sourceType === "office" && targetType === "institution") {
    return [{ type: "part_of", directionality: "DIRECTED", label: "Faz parte de" }];
  }
  if ((sourceType === "house" || sourceType === "faction") && targetType === "institution") {
    return [
      { type: "seeks_influence_over", directionality: "DIRECTED", label: "Busca influencia sobre" },
      { type: "rivals_with", directionality: "BIDIRECTIONAL", label: "Rivaliza com" },
    ];
  }
  if ((sourceType === "house" || sourceType === "faction") && targetType === "office") {
    return [{ type: "claims", directionality: "DIRECTED", label: "Disputa / reivindica" }];
  }
  if ((sourceType === "house" || sourceType === "faction") && (targetType === "npc" || targetType === "character")) {
    return [{ type: "represented_by", directionality: "DIRECTED", label: "E representado por" }];
  }
  if ((sourceType === "house" || sourceType === "faction") && targetType === "place") {
    return [{ type: "rules", directionality: "DIRECTED", label: "Governa" }];
  }

  return [{ type: "aligned_with", directionality: "BIDIRECTIONAL", label: "Alinha com" }];
}

const politicalTensionTemplates = [
  { type: "rivals_with", directionality: "BIDIRECTIONAL", label: "Rivalidade aberta" },
  { type: "bound_by_pact", directionality: "BIDIRECTIONAL", label: "Pacto instavel" },
  { type: "owes_allegiance_to", directionality: "DIRECTED", label: "Jura lealdade a" },
  { type: "pressures", directionality: "DIRECTED", label: "Pressiona" },
  { type: "undermines", directionality: "DIRECTED", label: "Sabota" },
] as const;

export default function WorldForgePoliticsPage() {
  const params = useParams();
  const worldId = params?.id as string;

  const [payload, setPayload] = useState<CodexPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedForm, setSeedForm] = useState<PoliticalSeedForm>(initialSeedForm);
  const [seedSaving, setSeedSaving] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [targetEntityId, setTargetEntityId] = useState<string>("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [profileDraft, setProfileDraft] = useState<PoliticalProfileDraft>(initialProfileDraft);
  const [profileSaving, setProfileSaving] = useState(false);
  const [tensionDraft, setTensionDraft] = useState<PoliticalTensionDraft>(initialTensionDraft);
  const [seatDraft, setSeatDraft] = useState<PoliticalSeatDraft>(initialSeatDraft);

  const loadPolitics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}/codex?limit=240`, { cache: "no-store" });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Nao foi possivel abrir a oficina politica");
      setPayload(response.data ?? null);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Erro inesperado ao carregar politica";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    if (worldId) void loadPolitics();
  }, [loadPolitics, worldId]);

  const politicalBlocks = useMemo(
    () =>
      (payload?.entities ?? []).filter((entity) =>
        ["house", "faction", "institution", "office"].includes(entity.type)
      ),
    [payload]
  );

  const selectedBlock = useMemo(
    () => politicalBlocks.find((entity) => entity.id === selectedBlockId) ?? politicalBlocks[0] ?? null,
    [politicalBlocks, selectedBlockId]
  );

  const selectedTarget = useMemo(
    () => (payload?.entities ?? []).find((entity) => entity.id === targetEntityId) ?? null,
    [payload?.entities, targetEntityId]
  );

  const relationTemplates = useMemo(
    () => (selectedBlock && selectedTarget ? getPoliticalRelationTemplates(selectedBlock, selectedTarget) : []),
    [selectedBlock, selectedTarget]
  );

  const seatHolderCandidates = useMemo(
    () => (payload?.entities ?? []).filter((entity) => entity.type === "npc" || entity.type === "character"),
    [payload?.entities]
  );

  const institutionSeats = useMemo(() => {
    if (!selectedBlock || selectedBlock.type !== "institution") return [];

    const seatIds = new Set(
      (selectedBlock.outgoingRelations ?? [])
        .filter((relation) => relation.type === "contains_seat" && relation.toEntity?.id)
        .map((relation) => relation.toEntity!.id)
    );

    return (payload?.entities ?? [])
      .filter((entity) => seatIds.has(entity.id) || (entity.type === "office" &&
        (entity.incomingRelations ?? []).some(
          (relation) => relation.type === "contains_seat" && relation.fromEntity?.id === selectedBlock.id
        )))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [payload?.entities, selectedBlock]);

  const suggestedCandidates = useMemo(() => {
    if (!selectedBlock) return [];
    const connectedIds = new Set(
      [...(selectedBlock.outgoingRelations ?? []), ...(selectedBlock.incomingRelations ?? [])]
        .map((relation) => relation.toEntity?.id ?? relation.fromEntity?.id)
        .filter(Boolean)
    );

    return (payload?.entities ?? [])
      .filter(
        (entity) =>
          entity.id !== selectedBlock.id &&
          !connectedIds.has(entity.id) &&
          ["house", "faction", "institution", "office", "npc", "character", "place"].includes(entity.type)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [payload?.entities, selectedBlock]);

  useEffect(() => {
    if (!selectedBlockId && politicalBlocks[0]) setSelectedBlockId(politicalBlocks[0].id);
  }, [politicalBlocks, selectedBlockId]);

  useEffect(() => {
    if (!targetEntityId && suggestedCandidates[0]) setTargetEntityId(suggestedCandidates[0].id);
  }, [suggestedCandidates, targetEntityId]);

  useEffect(() => {
    if (!selectedBlock) {
      setProfileDraft(initialProfileDraft);
      setSeatDraft(initialSeatDraft);
      return;
    }
    const politics = parsePoliticsProfile(selectedBlock.metadata);
    setProfileDraft({
      currentStatus: politics.currentStatus,
      fragilities: politics.fragilities.join(", "),
      pressureNotes: politics.pressureNotes,
    });
    setSeatDraft((current) => ({
      ...current,
      holderEntityId:
        seatHolderCandidates.find((entity) => entity.id === current.holderEntityId)?.id ??
        seatHolderCandidates[0]?.id ??
        "",
    }));
  }, [seatHolderCandidates, selectedBlock]);

  async function handleSeedBlock() {
    if (!seedForm.name.trim()) {
      setError("Nome obrigatorio para criar um polo politico.");
      return;
    }

    setSeedSaving(true);
    setSeedMessage(null);
    setError(null);
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
            seededFrom: "world-forge-politics",
            politics: {
              domain: seedForm.domain || undefined,
              seatPower: seedForm.seatPower || undefined,
              currentStatus: seedForm.currentStatus || undefined,
              secrecy: seedForm.secrecy || undefined,
            },
          },
          status: "active",
        }),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Nao foi possivel criar o polo politico");
      setSeedForm(initialSeedForm);
      setSeedMessage("Polo politico criado. Agora ele ja pode receber assentos, aliados e tensoes.");
      await loadPolitics();
    } catch (seedErrorValue) {
      const message =
        seedErrorValue instanceof Error ? seedErrorValue.message : "Erro inesperado ao criar polo politico";
      setError(message);
    } finally {
      setSeedSaving(false);
    }
  }

  async function handleCreatePoliticalLink(template: { type: string; directionality: string; label: string }) {
    if (!selectedBlock || !selectedTarget) return;
    setLinking(true);
    setLinkError(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEntityId: selectedBlock.id,
          toEntityId: selectedTarget.id,
          type: template.type,
          directionality: template.directionality,
          visibility: "MASTER",
          notes: `${selectedBlock.name} ${template.label.toLowerCase()} ${selectedTarget.name}`.slice(0, 220),
        }),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Nao foi possivel criar a ligacao politica");
      await loadPolitics();
    } catch (linkErrorValue) {
      const message =
        linkErrorValue instanceof Error ? linkErrorValue.message : "Erro inesperado ao ligar polos politicos";
      setLinkError(message);
    } finally {
      setLinking(false);
    }
  }

  async function handleCreatePoliticalTension(
    template: (typeof politicalTensionTemplates)[number]
  ) {
    if (!selectedBlock || !selectedTarget) return;
    setLinking(true);
    setLinkError(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEntityId: selectedBlock.id,
          toEntityId: selectedTarget.id,
          type: template.type,
          directionality: template.directionality,
          visibility: "MASTER",
          notes: tensionDraft.notes || `${selectedBlock.name} ${template.label.toLowerCase()} ${selectedTarget.name}`,
          metadata: {
            politics: {
              intensity: tensionDraft.intensity,
              publicState: tensionDraft.publicState,
            },
          },
        }),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Nao foi possivel registrar a tensao politica");
      setTensionDraft(initialTensionDraft);
      await loadPolitics();
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Erro inesperado ao registrar tensao";
      setLinkError(message);
    } finally {
      setLinking(false);
    }
  }

  async function handleSavePoliticalProfile() {
    if (!selectedBlock) return;
    setProfileSaving(true);
    setLinkError(null);
    try {
      const current = parsePoliticsProfile(selectedBlock.metadata);
      const res = await fetch(`/api/worlds/${worldId}/entities/${selectedBlock.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...(selectedBlock.metadata ?? {}),
            politics: {
              ...(selectedBlock.metadata && typeof selectedBlock.metadata === "object"
                ? ((selectedBlock.metadata as Record<string, unknown>).politics as Record<string, unknown> | undefined)
                : undefined),
              domain: current.domain || undefined,
              seatPower: current.seatPower || undefined,
              secrecy: current.secrecy || undefined,
              currentStatus: profileDraft.currentStatus || undefined,
              pressureNotes: profileDraft.pressureNotes || undefined,
              fragilities: profileDraft.fragilities
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            },
          },
        }),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Nao foi possivel atualizar o estado politico");
      await loadPolitics();
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Erro inesperado ao salvar estado politico";
      setLinkError(message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleDeleteRelationship(relationshipId: string) {
    setLinking(true);
    setLinkError(null);
    try {
      const res = await fetch(`/api/worlds/${worldId}/relationships/${relationshipId}`, {
        method: "DELETE",
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error ?? "Nao foi possivel remover a ligacao politica");
      await loadPolitics();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Erro inesperado ao remover ligacao politica";
      setLinkError(message);
    } finally {
      setLinking(false);
    }
  }

  async function handleCreateSeat() {
    if (!selectedBlock || selectedBlock.type !== "institution") return;
    if (!seatDraft.name.trim()) {
      setLinkError("Nome obrigatorio para criar um assento.");
      return;
    }

    setLinking(true);
    setLinkError(null);
    try {
      const createSeatRes = await fetch(`/api/worlds/${worldId}/entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: seatDraft.name,
          type: "office",
          subtype: seatDraft.subtype || "seat",
          summary: `Assento de ${selectedBlock.name}`,
          metadata: {
            seededFrom: "world-forge-politics-seat",
            politics: {
              domain: parsePoliticsProfile(selectedBlock.metadata).domain || undefined,
              seatPower: seatDraft.seatPower || undefined,
              currentStatus: "ativo",
            },
          },
          status: "active",
        }),
      });
      const seatPayload = await createSeatRes.json().catch(() => ({}));
      if (!createSeatRes.ok) throw new Error(seatPayload.error ?? "Nao foi possivel criar o assento");
      const seatId = seatPayload.data?.id as string | undefined;
      if (!seatId) throw new Error("Assento criado sem id retornado");

      await fetch(`/api/worlds/${worldId}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEntityId: selectedBlock.id,
          toEntityId: seatId,
          type: "contains_seat",
          directionality: "DIRECTED",
          visibility: "MASTER",
          notes: `${selectedBlock.name} contem ${seatDraft.name}`.slice(0, 220),
        }),
      });

      if (seatDraft.holderEntityId) {
        await fetch(`/api/worlds/${worldId}/relationships`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromEntityId: seatId,
            toEntityId: seatDraft.holderEntityId,
            type: "held_by",
            directionality: "DIRECTED",
            visibility: "MASTER",
            notes: `${seatDraft.name} e ocupado por titular atual`.slice(0, 220),
          }),
        });
      }

      setSeatDraft((current) => ({
        ...initialSeatDraft,
        holderEntityId: current.holderEntityId,
      }));
      await loadPolitics();
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Erro inesperado ao criar assento";
      setLinkError(message);
    } finally {
      setLinking(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[280px] w-full rounded-[32px]" />
        <Skeleton className="h-[820px] w-full rounded-[32px]" />
      </div>
    );
  }

  if (!payload) {
    return (
      <EmptyState
        title="Politica indisponivel"
        description={error ?? "Nao foi possivel abrir a oficina politica deste mundo."}
        icon={<ShieldAlert className="h-6 w-6" />}
        action={<Button onClick={() => void loadPolitics()}>Tentar novamente</Button>}
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Politica</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {politicalBlocks.length} polos ativos
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Forja do mundo</p>
              <h1 className="max-w-4xl text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl xl:text-6xl">
                Conselhos, assentos e disputas de poder em uma superficie propria.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Registre tronos, conselhos, cadeiras, blocos de influencia e tensoes estruturais
                sem depender de notas soltas para lembrar quem governa, aconselha, disputa ou
                controla.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => void loadPolitics()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/forge`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Voltar para forja
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/graph`}>
                  <Waypoints className="mr-2 h-4 w-4" />
                  Ver no grafo
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura rapida</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Instituicoes</p>
                  <p className="mt-3 text-3xl font-black text-foreground">
                    {politicalBlocks.filter((entity) => entity.type === "institution").length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cargos</p>
                  <p className="mt-3 text-3xl font-black text-foreground">
                    {politicalBlocks.filter((entity) => entity.type === "office").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="cinematic-frame rounded-[28px] p-5 text-sm text-muted-foreground">
              Use esta oficina para estruturar o esqueleto politico do mundo antes de espalhar
              segredos e crises por campanha.
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="chrome-panel rounded-[30px] p-6">
          <div className="mb-5 space-y-2">
            <p className="section-eyebrow">Passo 1</p>
            <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
              Semeie instituicoes e assentos
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Traga para o mundo os polos formais de poder: conselhos, coroas, cortes, cadeiras e
              titulos disputados.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {seedOptions.map((option) => {
              const Icon = option.icon;
              const active = seedForm.type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setSeedForm((current) => ({
                      ...current,
                      type: option.value,
                      subtype: option.value === "institution" ? "council" : "seat",
                    }))
                  }
                  className={`rounded-[28px] border p-5 text-left transition ${
                    active
                      ? "border-primary/30 bg-primary/10 shadow-[0_0_18px_rgba(188,74,63,0.18)]"
                      : "border-white/10 bg-white/4 hover:border-white/20"
                  }`}
                >
                  <p className="section-eyebrow">{option.eyebrow}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Icon className="h-5 w-5 text-amber-200" />
                    <span className="text-lg font-black uppercase tracking-[0.04em] text-foreground">
                      {option.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{option.hint}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Input
              value={seedForm.name}
              onChange={(event) => setSeedForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nome do conselho, trono ou cargo"
            />
            <Input
              value={seedForm.subtype}
              onChange={(event) => setSeedForm((current) => ({ ...current, subtype: event.target.value }))}
              placeholder="Subtipo: council, throne, seat, office..."
            />
            <Input
              value={seedForm.domain}
              onChange={(event) => setSeedForm((current) => ({ ...current, domain: event.target.value }))}
              placeholder="Dominio: guerra, fe, comercio, sucessao..."
            />
            <Input
              value={seedForm.seatPower}
              onChange={(event) => setSeedForm((current) => ({ ...current, seatPower: event.target.value }))}
              placeholder="Peso politico: absoluto, alto, contestado..."
            />
            <Input
              value={seedForm.currentStatus}
              onChange={(event) => setSeedForm((current) => ({ ...current, currentStatus: event.target.value }))}
              placeholder="Status atual: estavel, vacante, pressionado..."
            />
            <Input
              value={seedForm.secrecy}
              onChange={(event) => setSeedForm((current) => ({ ...current, secrecy: event.target.value }))}
              placeholder="Sigilo: publico, velado, secreto..."
            />
          </div>
          <div className="mt-4 grid gap-4">
            <Input
              value={seedForm.summary}
              onChange={(event) => setSeedForm((current) => ({ ...current, summary: event.target.value }))}
              placeholder="Resumo curto do papel politico desse bloco"
            />
            <Input
              value={seedForm.tags}
              onChange={(event) => setSeedForm((current) => ({ ...current, tags: event.target.value }))}
              placeholder="Tags separadas por virgula"
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => void handleSeedBlock()} disabled={seedSaving}>
              <Sparkles className="mr-2 h-4 w-4" />
              {seedSaving ? "Criando..." : "Criar polo politico"}
            </Button>
            {seedMessage ? <p className="text-sm text-emerald-200">{seedMessage}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </section>

        <section className="chrome-panel rounded-[30px] p-6">
          <div className="mb-5 space-y-2">
            <p className="section-eyebrow">Passo 2</p>
            <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
              Estruture a politica viva
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Escolha um bloco e ligue casas, faccoes, cargos, lugares e personagens ao ecossistema de poder.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {politicalBlocks.map((block) => (
              <Button
                key={block.id}
                variant="outline"
                className={
                  selectedBlock?.id === block.id
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5"
                }
                onClick={() => setSelectedBlockId(block.id)}
              >
                {block.name}
              </Button>
            ))}
          </div>

          {selectedBlock ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
                <div className="flex items-center gap-2 text-foreground">
                  {selectedBlock.type === "institution" ? (
                    <Landmark className="h-4 w-4 text-amber-200" />
                  ) : selectedBlock.type === "office" ? (
                    <Crown className="h-4 w-4 text-amber-200" />
                  ) : selectedBlock.type === "house" ? (
                    <Flag className="h-4 w-4 text-amber-200" />
                  ) : (
                    <Users2 className="h-4 w-4 text-amber-200" />
                  )}
                  <span className="font-semibold">{selectedBlock.name}</span>
                  <Badge className="border-white/10 bg-white/5 text-white/70">{selectedBlock.type}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {selectedBlock.summary || "Sem resumo politico ainda."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(parsePoliticsProfile(selectedBlock.metadata)).map(([key, value]) =>
                    value && key !== "pressureNotes" && key !== "fragilities" ? (
                      <Badge key={key} className="border-white/10 bg-white/5 text-white/80">
                        {value}
                      </Badge>
                    ) : null
                  )}
                </div>
                {parsePoliticsProfile(selectedBlock.metadata).fragilities.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {parsePoliticsProfile(selectedBlock.metadata).fragilities.map((fragility) => (
                      <Badge
                        key={fragility}
                        className="border-red-300/20 bg-red-300/10 text-red-100"
                      >
                        Fragilidade: {fragility}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {parsePoliticsProfile(selectedBlock.metadata).pressureNotes ? (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {parsePoliticsProfile(selectedBlock.metadata).pressureNotes}
                  </p>
                ) : null}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
                <p className="section-eyebrow">Estado e fragilidades</p>
                <div className="mt-4 grid gap-3">
                  <Input
                    value={profileDraft.currentStatus}
                    onChange={(event) =>
                      setProfileDraft((current) => ({ ...current, currentStatus: event.target.value }))
                    }
                    placeholder="Status atual: pressionado, vacante, rachado..."
                  />
                  <Input
                    value={profileDraft.fragilities}
                    onChange={(event) =>
                      setProfileDraft((current) => ({ ...current, fragilities: event.target.value }))
                    }
                    placeholder="Fragilidades separadas por virgula"
                  />
                  <Input
                    value={profileDraft.pressureNotes}
                    onChange={(event) =>
                      setProfileDraft((current) => ({ ...current, pressureNotes: event.target.value }))
                    }
                    placeholder="Resumo curto da pressao atual sobre este bloco"
                  />
                  <Button onClick={() => void handleSavePoliticalProfile()} disabled={profileSaving}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {profileSaving ? "Salvando estado..." : "Salvar estado politico"}
                  </Button>
                </div>
              </div>

              {selectedBlock.type === "institution" ? (
                <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
                  <p className="section-eyebrow">Composicao do conselho</p>
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <Input
                      value={seatDraft.name}
                      onChange={(event) =>
                        setSeatDraft((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Nome do assento ou cadeira"
                    />
                    <Input
                      value={seatDraft.subtype}
                      onChange={(event) =>
                        setSeatDraft((current) => ({ ...current, subtype: event.target.value }))
                      }
                      placeholder="Subtipo: seat, hand, council-chair..."
                    />
                    <Input
                      value={seatDraft.seatPower}
                      onChange={(event) =>
                        setSeatDraft((current) => ({ ...current, seatPower: event.target.value }))
                      }
                      placeholder="Peso do assento: alto, vital, contestado..."
                    />
                    <Input
                      value={seatDraft.holderEntityId}
                      onChange={(event) =>
                        setSeatDraft((current) => ({ ...current, holderEntityId: event.target.value }))
                      }
                      placeholder="Titular atual (id)"
                      className="hidden"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {seatHolderCandidates.slice(0, 12).map((candidate) => (
                      <Button
                        key={candidate.id}
                        variant="outline"
                        className={
                          seatDraft.holderEntityId === candidate.id
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-white/10 bg-white/5"
                        }
                        onClick={() =>
                          setSeatDraft((current) => ({
                            ...current,
                            holderEntityId: current.holderEntityId === candidate.id ? "" : candidate.id,
                          }))
                        }
                      >
                        {candidate.name}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button onClick={() => void handleCreateSeat()} disabled={linking}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {linking ? "Criando assento..." : "Criar assento no conselho"}
                    </Button>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {institutionSeats.length > 0 ? (
                      institutionSeats.map((seat) => {
                        const holder = (seat.outgoingRelations ?? []).find((relation) => relation.type === "held_by")?.toEntity;
                        const supporters = (seat.incomingRelations ?? []).filter((relation) =>
                          ["claims", "backed_by", "represented_by"].includes(relation.type)
                        );
                        return (
                          <div key={seat.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{seat.name}</p>
                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                  {seat.subtype || "seat"}
                                </p>
                              </div>
                              {parsePoliticsProfile(seat.metadata).seatPower ? (
                                <Badge className="border-white/10 bg-white/5 text-white/80">
                                  {parsePoliticsProfile(seat.metadata).seatPower}
                                </Badge>
                              ) : null}
                            </div>
                            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                              <p>
                                <span className="font-medium text-foreground">Titular:</span>{" "}
                                {holder?.name || "Sem titular definido"}
                              </p>
                              {supporters.length > 0 ? (
                                <p>
                                  <span className="font-medium text-foreground">Disputa / apoio:</span>{" "}
                                  {supporters
                                    .map((relation) => relation.fromEntity?.name)
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
                        Este bloco ainda nao tem assentos estruturados.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
                <p className="section-eyebrow">Associar alvo politico</p>
                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    {suggestedCandidates.slice(0, 12).map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          targetEntityId === candidate.id
                            ? "border-primary/30 bg-primary/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                        onClick={() => setTargetEntityId(candidate.id)}
                      >
                        <p className="text-sm font-semibold text-foreground">{candidate.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {candidate.type} {candidate.subtype ? `· ${candidate.subtype}` : ""}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {relationTemplates.map((template) => (
                      <Button
                        key={template.type}
                        variant="outline"
                        className="border-white/10 bg-white/5"
                        onClick={() => void handleCreatePoliticalLink(template)}
                        disabled={linking}
                      >
                        {template.label}
                      </Button>
                    ))}
                  </div>
                  {linkError ? <p className="text-sm text-destructive">{linkError}</p> : null}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
                <p className="section-eyebrow">Tensoes e acordos estruturais</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <Input
                    value={tensionDraft.intensity}
                    onChange={(event) =>
                      setTensionDraft((current) => ({ ...current, intensity: event.target.value }))
                    }
                    placeholder="Intensidade: baixa, media, alta"
                  />
                  <Input
                    value={tensionDraft.publicState}
                    onChange={(event) =>
                      setTensionDraft((current) => ({ ...current, publicState: event.target.value }))
                    }
                    placeholder="Estado publico: aberto, velado, secreto"
                  />
                </div>
                <div className="mt-3">
                  <Input
                    value={tensionDraft.notes}
                    onChange={(event) =>
                      setTensionDraft((current) => ({ ...current, notes: event.target.value }))
                    }
                    placeholder="Notas curtas sobre a tensao, pacto ou crise"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {politicalTensionTemplates.map((template) => (
                    <Button
                      key={template.type}
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      onClick={() => void handleCreatePoliticalTension(template)}
                      disabled={linking || !selectedTarget}
                    >
                      {template.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
                  <p className="section-eyebrow">Saidas</p>
                  <div className="mt-4 space-y-3">
                    {(selectedBlock.outgoingRelations ?? []).length > 0 ? (
                      (selectedBlock.outgoingRelations ?? []).map((relation) => (
                        <div key={relation.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {relation.toEntity?.name || "Sem destino"}
                              </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {relation.type}
                            </p>
                            {parsePoliticalRelationMetadata(relation.metadata).intensity ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge className="border-white/10 bg-white/5 text-white/80">
                                  {parsePoliticalRelationMetadata(relation.metadata).intensity}
                                </Badge>
                                {parsePoliticalRelationMetadata(relation.metadata).publicState ? (
                                  <Badge className="border-white/10 bg-white/5 text-white/80">
                                    {parsePoliticalRelationMetadata(relation.metadata).publicState}
                                  </Badge>
                                ) : null}
                              </div>
                            ) : null}
                            {relation.notes ? (
                              <p className="mt-2 text-sm text-muted-foreground">{relation.notes}</p>
                            ) : null}
                          </div>
                          <Button
                            variant="outline"
                              className="border-white/10 bg-white/5"
                              onClick={() => void handleDeleteRelationship(relation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
                        Nenhuma ligacao de saida ainda.
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
                  <p className="section-eyebrow">Entradas</p>
                  <div className="mt-4 space-y-3">
                    {(selectedBlock.incomingRelations ?? []).length > 0 ? (
                      (selectedBlock.incomingRelations ?? []).map((relation) => (
                        <div key={relation.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {relation.fromEntity?.name || "Sem origem"}
                              </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {relation.type}
                            </p>
                            {parsePoliticalRelationMetadata(relation.metadata).intensity ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge className="border-white/10 bg-white/5 text-white/80">
                                  {parsePoliticalRelationMetadata(relation.metadata).intensity}
                                </Badge>
                                {parsePoliticalRelationMetadata(relation.metadata).publicState ? (
                                  <Badge className="border-white/10 bg-white/5 text-white/80">
                                    {parsePoliticalRelationMetadata(relation.metadata).publicState}
                                  </Badge>
                                ) : null}
                              </div>
                            ) : null}
                            {relation.notes ? (
                              <p className="mt-2 text-sm text-muted-foreground">{relation.notes}</p>
                            ) : null}
                          </div>
                            <Button
                              variant="outline"
                              className="border-white/10 bg-white/5"
                              onClick={() => void handleDeleteRelationship(relation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-4 text-sm text-muted-foreground">
                        Nenhuma ligacao de entrada ainda.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[28px] border border-dashed border-white/10 bg-white/4 p-6 text-sm text-muted-foreground">
              Crie uma instituicao ou cargo politico para abrir a estrutura de poder aqui.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
