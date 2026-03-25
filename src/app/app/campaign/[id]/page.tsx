"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  CalendarClock,
  Castle,
  Compass,
  Crosshair,
  LayoutGrid,
  Plus,
  RefreshCw,
  Shield,
  Swords,
  Trash2,
  UserRound,
  Users2,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { CockpitDetailSheet } from "@/components/cockpit/cockpit-detail-sheet";
import { CombatPanel } from "@/components/combat/combat-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { buildSessionMetadata, normalizeSessionForgeState } from "@/lib/session-forge";
import {
  analyzeT20Encounter,
  estimateEnemyUnitScore,
  formatBalanceConfidence,
  formatEncounterRating,
  suggestEncounterAdjustment,
} from "@/lib/t20-balance";
import {
  formatMemoryEventTemporalLabel,
  formatMemoryEventKind,
  formatMemoryEventText,
  formatMemoryEventType,
  formatMemoryEventVisibility,
  getMemoryEventLinkedEntityIds,
  getMemoryEventLinkedEntityCount,
  getMemoryEventSearchText,
  getMemoryEventTone,
  isMemoryWorldEvent,
} from "@/lib/world-memory";
import {
  CharacterCreateSchema,
  NpcCreateSchema,
  SessionCreateSchema,
} from "@/lib/validators";

type Campaign = {
  id: string;
  name: string;
  description?: string | null;
  system: string;
  roomCode: string;
  createdAt: string;
  updatedAt: string;
  world: { id: string; title: string };
  recentMemoryEvents?: WorldEvent[];
};

type Character = {
  id: string;
  campaignId: string;
  name: string;
  ancestry?: string | null;
  className?: string | null;
  role?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  level: number;
  createdAt: string;
  updatedAt: string;
};

type Session = {
  id: string;
  campaignId: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  scheduledAt?: string | null;
  status?: "planned" | "active" | "finished";
  createdAt: string;
  updatedAt: string;
};

type Npc = {
  id: string;
  campaignId: string;
  name: string;
  type: "npc" | "enemy";
  hpMax: number;
  defenseFinal: number;
  damageFormula: string;
  description?: string | null;
  tags?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

type CombatSnapshot = {
  id: string;
  isActive: boolean;
  round: number;
  turnIndex: number;
  combatants: Array<{ id: string }>;
} | null;

type InspectItem =
  | { type: "character"; item: Character }
  | { type: "session"; item: Session }
  | { type: "npc"; item: Npc }
  | { type: "memory"; item: WorldEvent };

type WorldEvent = {
  id: string;
  campaignId?: string | null;
  sessionId?: string | null;
  actorId?: string | null;
  targetId?: string | null;
  type: string;
  scope: string;
  ts: string;
  text?: string | null;
  visibility: string;
  meta?: Record<string, unknown> | null;
};

type EntityRelationshipPreview = {
  id: string;
  type: string;
  fromEntity: { id: string; name: string; type: string };
  toEntity: { id: string; name: string; type: string };
};

const initialCharacter = {
  name: "",
  ancestry: "",
  className: "",
  role: "",
  description: "",
  avatarUrl: "",
  level: 1,
};

function toDatetimeLocal(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

const initialSession = {
  title: "",
  description: "",
  scheduledAt: toDatetimeLocal(new Date()),
  coverUrl: "",
  status: "planned" as "planned" | "active" | "finished",
};

const initialNpc = {
  name: "",
  type: "npc" as "npc" | "enemy",
  hpMax: 1,
  defenseFinal: 10,
  damageFormula: "1d6",
  description: "",
  tags: "",
  imageUrl: "",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Sem data";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Sem agenda";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSessionTone(status?: Session["status"]) {
  switch (status) {
    case "active":
      return "border-emerald-400/25 bg-emerald-400/10 text-emerald-100";
    case "finished":
      return "border-white/10 bg-white/8 text-white/70";
    default:
      return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  }
}

function buildMemoryInspectBody(
  event: WorldEvent,
  options?: {
    sessionTitle?: string;
  }
) {
  const parts = [
    formatMemoryEventText(event),
    `Registrado em ${formatDateTime(event.ts)}.`,
    `Escopo: ${event.scope}.`,
    `Visibilidade: ${formatMemoryEventVisibility(event.visibility)}.`,
  ];

  if (options?.sessionTitle) {
    parts.push(`Sessao ligada: ${options.sessionTitle}.`);
  }

  const linkedCount = getMemoryEventLinkedEntityCount(event);
  if (linkedCount > 0) {
    parts.push(`Entidades ligadas: ${linkedCount}.`);
  }

  return parts.join("\n");
}

export default function CampaignPage() {
  const params = useParams<{ id: string }>();
  const campaignId = params?.id;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [combat, setCombat] = useState<CombatSnapshot>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspectItem, setInspectItem] = useState<InspectItem | null>(null);
  const [memoryQuery, setMemoryQuery] = useState("");
  const [memoryVisibility, setMemoryVisibility] = useState<"ALL" | "MASTER" | "PLAYERS">("ALL");
  const [memoryTone, setMemoryTone] = useState<"ALL" | "summary" | "change" | "death" | "note">("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [form, setForm] = useState(initialCharacter);
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionForm, setSessionForm] = useState(initialSession);
  const [sessionFormError, setSessionFormError] = useState<string | null>(null);
  const [sessionUploading, setSessionUploading] = useState(false);
  const [sessionSubmitting, setSessionSubmitting] = useState(false);

  const [npcDialogOpen, setNpcDialogOpen] = useState(false);
  const [editingNpc, setEditingNpc] = useState<Npc | null>(null);
  const [npcForm, setNpcForm] = useState(initialNpc);
  const [npcFormError, setNpcFormError] = useState<string | null>(null);
  const [npcUploading, setNpcUploading] = useState(false);
  const [npcSubmitting, setNpcSubmitting] = useState(false);
  const [encounterDraft, setEncounterDraft] = useState<Record<string, number>>({});
  const [encounterTargetSessionId, setEncounterTargetSessionId] = useState("");
  const [encounterTargetSceneId, setEncounterTargetSceneId] = useState("");
  const [encounterSaving, setEncounterSaving] = useState(false);
  const [encounterSaveMessage, setEncounterSaveMessage] = useState<string | null>(null);
  const [encounterSaveError, setEncounterSaveError] = useState<string | null>(null);
  const [worldRelationships, setWorldRelationships] = useState<EntityRelationshipPreview[]>([]);

  const loadData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [campaignRes, characterRes, sessionRes, npcRes, combatRes] =
        await Promise.all([
          fetch(`/api/campaigns/${id}`, { cache: "no-store" }),
          fetch(`/api/campaigns/${id}/characters`, { cache: "no-store" }),
          fetch(`/api/campaigns/${id}/sessions`, { cache: "no-store" }),
          fetch(`/api/campaigns/${id}/npcs`, { cache: "no-store" }),
          fetch(`/api/campaigns/${id}/combat`, { cache: "no-store" }),
        ]);

      const campaignPayload = await campaignRes.json().catch(() => ({}));
      const characterPayload = await characterRes.json().catch(() => ({}));
      const sessionPayload = await sessionRes.json().catch(() => ({}));
      const npcPayload = await npcRes.json().catch(() => ({}));
      const combatPayload = await combatRes.json().catch(() => ({}));

      if (!campaignRes.ok) throw new Error(campaignPayload.error ?? "Erro ao buscar campanha");
      if (!characterRes.ok) throw new Error(characterPayload.error ?? "Erro ao buscar personagens");
      if (!sessionRes.ok) throw new Error(sessionPayload.error ?? "Erro ao buscar sessoes");
      if (!npcRes.ok) throw new Error(npcPayload.error ?? "Erro ao buscar NPCs");

      const worldId = campaignPayload?.data?.world?.id as string | undefined;
      let relationshipItems: EntityRelationshipPreview[] = [];
      if (worldId) {
        const relationshipRes = await fetch(`/api/worlds/${worldId}/relationships`, {
          cache: "no-store",
        });
        const relationshipPayload = await relationshipRes.json().catch(() => ({}));
        if (relationshipRes.ok && Array.isArray(relationshipPayload?.data)) {
          relationshipItems = relationshipPayload.data as EntityRelationshipPreview[];
        }
      }

      setCampaign(campaignPayload.data ?? null);
      setCharacters(characterPayload.data ?? []);
      setSessions(sessionPayload.data ?? []);
      setNpcs(npcPayload.data ?? []);
      setCombat(combatRes.ok ? (combatPayload.data ?? null) : null);
      setWorldRelationships(relationshipItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (campaignId) void loadData(campaignId);
  }, [campaignId, loadData]);

  const sortedCharacters = useMemo(
    () =>
      [...characters].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [characters]
  );
  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) => {
        const aDate = new Date(a.scheduledAt ?? a.updatedAt).getTime();
        const bDate = new Date(b.scheduledAt ?? b.updatedAt).getTime();
        return bDate - aDate;
      }),
    [sessions]
  );
  const sortedNpcs = useMemo(
    () =>
      [...npcs].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [npcs]
  );
  const nextSession = useMemo(
    () =>
      sortedSessions.find(
        (session) => session.status !== "finished" && session.scheduledAt
      ) ?? sortedSessions[0] ?? null,
    [sortedSessions]
  );
  useEffect(() => {
    if (!encounterTargetSessionId && nextSession) {
      setEncounterTargetSessionId(nextSession.id);
    }
  }, [encounterTargetSessionId, nextSession]);
  const campaignMemoryEvents = useMemo(
    () => (campaign?.recentMemoryEvents ?? []).filter((event) => isMemoryWorldEvent(event)),
    [campaign?.recentMemoryEvents]
  );
  const filteredCampaignMemoryEvents = useMemo(() => {
    const query = memoryQuery.trim().toLowerCase();
    return campaignMemoryEvents.filter((event) => {
      if (memoryVisibility !== "ALL" && event.visibility !== memoryVisibility) return false;
      if (memoryTone !== "ALL" && getMemoryEventTone(event) !== memoryTone) return false;
      if (query && !getMemoryEventSearchText(event).includes(query)) return false;
      return true;
    });
  }, [campaignMemoryEvents, memoryQuery, memoryTone, memoryVisibility]);
  const sessionTitleById = useMemo(
    () => new Map(sessions.map((session) => [session.id, session.title])),
    [sessions]
  );
  const memoryInspectRelations = useMemo(() => {
    if (inspectItem?.type !== "memory") return [];
    const linked = new Set(getMemoryEventLinkedEntityIds(inspectItem.item));
    if (linked.size === 0) return [];
    return worldRelationships
      .filter((relation) => linked.has(relation.fromEntity.id) || linked.has(relation.toEntity.id))
      .slice(0, 6);
  }, [inspectItem, worldRelationships]);
  const threatCount = useMemo(
    () => sortedNpcs.filter((npc) => npc.type === "enemy").length,
    [sortedNpcs]
  );
  const encounterBalance = useMemo(
    () =>
      analyzeT20Encounter(
        sortedCharacters.map((character) => ({
          level: character.level,
          role: character.role,
          className: character.className,
        })),
        sortedNpcs.map((npc) => ({
          type: npc.type,
          hpMax: npc.hpMax,
          defenseFinal: npc.defenseFinal,
          damageFormula: npc.damageFormula,
          name: npc.name,
        }))
      ),
    [sortedCharacters, sortedNpcs]
  );
  const availableEnemies = useMemo(
    () => sortedNpcs.filter((npc) => npc.type === "enemy"),
    [sortedNpcs]
  );
  const preparedEncounterEnemies = useMemo(
    () =>
      availableEnemies.flatMap((enemy) => {
        const quantity = encounterDraft[enemy.id] ?? 0;
        return Array.from({ length: Math.max(quantity, 0) }, () => enemy);
      }),
    [availableEnemies, encounterDraft]
  );
  const preparedEncounterBalance = useMemo(
    () =>
      analyzeT20Encounter(
        sortedCharacters.map((character) => ({
          level: character.level,
          role: character.role,
          className: character.className,
        })),
        preparedEncounterEnemies.map((enemy) => ({
          id: enemy.id,
          type: enemy.type,
          hpMax: enemy.hpMax,
          defenseFinal: enemy.defenseFinal,
          damageFormula: enemy.damageFormula,
          name: enemy.name,
        }))
      ),
    [preparedEncounterEnemies, sortedCharacters]
  );
  const encounterAdjustmentSuggestion = useMemo(
    () =>
      suggestEncounterAdjustment(
        preparedEncounterBalance,
        availableEnemies.map((enemy) => ({
          id: enemy.id,
          type: enemy.type,
          hpMax: enemy.hpMax,
          defenseFinal: enemy.defenseFinal,
          damageFormula: enemy.damageFormula,
          name: enemy.name,
        }))
      ),
    [availableEnemies, preparedEncounterBalance]
  );
  const encounterTargetSession = useMemo(
    () =>
      sortedSessions.find((session) => session.id === encounterTargetSessionId) ?? nextSession ?? null,
    [encounterTargetSessionId, nextSession, sortedSessions]
  );
  const encounterTargetForge = useMemo(
    () => (encounterTargetSession ? normalizeSessionForgeState(encounterTargetSession.metadata) : null),
    [encounterTargetSession]
  );
  const encounterTargetScenes = useMemo(
    () =>
      (encounterTargetForge?.scenes ?? []).filter((scene) => scene.status !== "discarded"),
    [encounterTargetForge]
  );
  useEffect(() => {
    if (
      encounterTargetSceneId &&
      !encounterTargetScenes.some((scene) => scene.id === encounterTargetSceneId)
    ) {
      setEncounterTargetSceneId("");
    }
  }, [encounterTargetSceneId, encounterTargetScenes]);

  async function uploadImage(file: File) {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error ?? "Falha ao enviar imagem");
    return payload.url as string;
  }

  async function handleAvatarUpload(file: File) {
    setFormError(null);
    setAvatarUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, avatarUrl: url }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao enviar avatar");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleCoverUpload(file: File) {
    setSessionFormError(null);
    setSessionUploading(true);
    try {
      const url = await uploadImage(file);
      setSessionForm((prev) => ({ ...prev, coverUrl: url }));
    } catch (err) {
      setSessionFormError(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setSessionUploading(false);
    }
  }

  async function handleNpcUpload(file: File) {
    setNpcFormError(null);
    setNpcUploading(true);
    try {
      const url = await uploadImage(file);
      setNpcForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setNpcFormError(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setNpcUploading(false);
    }
  }

  function openCreateCharacter() {
    setEditingCharacter(null);
    setForm(initialCharacter);
    setFormError(null);
    setDialogOpen(true);
  }

  function openEditCharacter(character: Character) {
    setEditingCharacter(character);
    setForm({
      name: character.name ?? "",
      ancestry: character.ancestry ?? "",
      className: character.className ?? "",
      role: character.role ?? "",
      description: character.description ?? "",
      avatarUrl: character.avatarUrl ?? "",
      level: character.level ?? 1,
    });
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSaveCharacter(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setFormError(null);
    const parsed = CharacterCreateSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Dados invalidos");
      return;
    }
    if (!campaignId) {
      setFormError("Campanha invalida");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = editingCharacter
        ? `/api/characters/${editingCharacter.id}`
        : `/api/campaigns/${campaignId}/characters`;
      const res = await fetch(endpoint, {
        method: editingCharacter ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Erro ao salvar personagem");

      const saved: Character = payload.data ?? payload;
      setCharacters((prev) =>
        editingCharacter
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...prev]
      );
      setDialogOpen(false);
      setEditingCharacter(null);
      setForm(initialCharacter);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro inesperado ao salvar personagem");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCharacter(character: Character) {
    if (typeof window !== "undefined") {
      const ok = window.confirm(`Remover personagem "${character.name}"?`);
      if (!ok) return;
    }
    try {
      const res = await fetch(`/api/characters/${character.id}`, { method: "DELETE" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Erro ao remover personagem");
      setCharacters((prev) => prev.filter((item) => item.id !== character.id));
    } catch (err) {
      if (typeof window !== "undefined") {
        window.alert(err instanceof Error ? err.message : "Erro ao remover personagem");
      }
    }
  }

  function openCreateSession() {
    setEditingSession(null);
    setSessionForm({ ...initialSession, scheduledAt: toDatetimeLocal(new Date()) });
    setSessionFormError(null);
    setSessionDialogOpen(true);
  }

  function openEditSession(session: Session) {
    setEditingSession(session);
    setSessionForm({
      title: session.title ?? "",
      description: session.description ?? "",
      scheduledAt: toDatetimeLocal(session.scheduledAt),
      coverUrl: session.coverUrl ?? "",
      status: session.status ?? "planned",
    });
    setSessionFormError(null);
    setSessionDialogOpen(true);
  }

  async function handleSaveSession(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setSessionFormError(null);
    const scheduledAt = sessionForm.scheduledAt ? new Date(sessionForm.scheduledAt) : null;
    if (sessionForm.scheduledAt && Number.isNaN(scheduledAt?.getTime())) {
      setSessionFormError("Data invalida");
      return;
    }
    const parsed = SessionCreateSchema.safeParse({
      title: sessionForm.title,
      description: sessionForm.description,
      scheduledAt: scheduledAt ? scheduledAt.toISOString() : undefined,
      coverUrl: sessionForm.coverUrl,
      status: sessionForm.status,
    });
    if (!parsed.success) {
      setSessionFormError(parsed.error.issues[0]?.message ?? "Dados invalidos");
      return;
    }
    if (!campaignId) {
      setSessionFormError("Campanha invalida");
      return;
    }

    setSessionSubmitting(true);
    try {
      const endpoint = editingSession
        ? `/api/sessions/${editingSession.id}`
        : `/api/campaigns/${campaignId}/sessions`;
      const res = await fetch(endpoint, {
        method: editingSession ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Erro ao salvar sessao");

      const saved: Session = payload.data ?? payload;
      setSessions((prev) =>
        editingSession
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...prev]
      );
      setSessionDialogOpen(false);
      setEditingSession(null);
      setSessionForm(initialSession);
    } catch (err) {
      setSessionFormError(err instanceof Error ? err.message : "Erro inesperado ao salvar sessao");
    } finally {
      setSessionSubmitting(false);
    }
  }

  async function handleDeleteSession(session: Session) {
    if (typeof window !== "undefined") {
      const ok = window.confirm(`Remover sessao "${session.title}"?`);
      if (!ok) return;
    }
    try {
      const res = await fetch(`/api/sessions/${session.id}`, { method: "DELETE" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Erro ao remover sessao");
      setSessions((prev) => prev.filter((item) => item.id !== session.id));
    } catch (err) {
      if (typeof window !== "undefined") {
        window.alert(err instanceof Error ? err.message : "Erro ao remover sessao");
      }
    }
  }

  function openSessionMode(session: Session) {
    if (typeof window === "undefined") return;
    localStorage.setItem("t20-session-id", session.id);
    window.dispatchEvent(new CustomEvent("t20-open-session"));
  }

  function openCreateNpc() {
    setEditingNpc(null);
    setNpcForm(initialNpc);
    setNpcFormError(null);
    setNpcDialogOpen(true);
  }

  function openEditNpc(npc: Npc) {
    setEditingNpc(npc);
    setNpcForm({
      name: npc.name ?? "",
      type: npc.type ?? "npc",
      hpMax: npc.hpMax ?? 1,
      defenseFinal: npc.defenseFinal ?? 10,
      damageFormula: npc.damageFormula ?? "1d6",
      description: npc.description ?? "",
      tags: npc.tags ?? "",
      imageUrl: npc.imageUrl ?? "",
    });
    setNpcFormError(null);
    setNpcDialogOpen(true);
  }

  async function handleSaveNpc(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setNpcFormError(null);
    const parsed = NpcCreateSchema.safeParse(npcForm);
    if (!parsed.success) {
      setNpcFormError(parsed.error.issues[0]?.message ?? "Dados invalidos");
      return;
    }
    if (!campaignId) {
      setNpcFormError("Campanha invalida");
      return;
    }

    setNpcSubmitting(true);
    try {
      const endpoint = editingNpc
        ? `/api/npcs/${editingNpc.id}`
        : `/api/campaigns/${campaignId}/npcs`;
      const res = await fetch(endpoint, {
        method: editingNpc ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Erro ao salvar NPC");
      const saved: Npc = payload.data ?? payload;
      setNpcs((prev) =>
        editingNpc
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...prev]
      );
      setNpcDialogOpen(false);
      setEditingNpc(null);
      setNpcForm(initialNpc);
    } catch (err) {
      setNpcFormError(err instanceof Error ? err.message : "Erro inesperado ao salvar NPC");
    } finally {
      setNpcSubmitting(false);
    }
  }

  async function handleDeleteNpc(npc: Npc) {
    if (typeof window !== "undefined") {
      const ok = window.confirm(`Remover NPC "${npc.name}"?`);
      if (!ok) return;
    }
    try {
      const res = await fetch(`/api/npcs/${npc.id}`, { method: "DELETE" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Erro ao remover NPC");
      setNpcs((prev) => prev.filter((item) => item.id !== npc.id));
    } catch (err) {
      if (typeof window !== "undefined") {
        window.alert(err instanceof Error ? err.message : "Erro ao remover NPC");
      }
    }
  }

  async function handleAddNpcToCombat(npc: Npc) {
    if (!campaignId) return;
    try {
      const payload = {
        name: npc.name,
        kind: npc.type === "enemy" ? "MONSTER" : "NPC",
        hpMax: npc.hpMax,
        defenseFinal: npc.defenseFinal,
        damageFormula: npc.damageFormula ?? "1d6",
      };
      const res = await fetch(`/api/campaigns/${campaignId}/combat/combatants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Erro ao adicionar NPC ao combate");
      await loadData(campaignId);
    } catch (err) {
      if (typeof window !== "undefined") {
        window.alert(err instanceof Error ? err.message : "Erro ao adicionar NPC");
      }
    }
  }

  async function handleSaveEncounterToSession() {
    setEncounterSaveError(null);
    setEncounterSaveMessage(null);

    if (!encounterTargetSession) {
      setEncounterSaveError("Escolha uma sessao para anexar o encontro preparado.");
      return;
    }

    const draftEntries = availableEnemies
      .map((enemy) => ({
        enemy,
        quantity: Math.max(encounterDraft[enemy.id] ?? 0, 0),
      }))
      .filter((entry) => entry.quantity > 0);

    if (draftEntries.length === 0) {
      setEncounterSaveError("Selecione pelo menos uma ameaca para salvar o encontro.");
      return;
    }

    const targetForge = normalizeSessionForgeState(encounterTargetSession.metadata);
    const linkedScene = encounterTargetScenes.find((scene) => scene.id === encounterTargetSceneId);
    const encounterTitle = linkedScene?.title
      ? `Encontro: ${linkedScene.title}`
      : `Encontro preparado ${draftEntries.length}`;

    const nextForge = {
      ...targetForge,
      encounters: [
        ...targetForge.encounters,
        {
          id: `encounter-${Math.random().toString(36).slice(2, 10)}`,
          title: encounterTitle,
          notes: encounterAdjustmentSuggestion,
          linkedSceneId: linkedScene?.id,
          enemies: draftEntries.map(({ enemy, quantity }) => ({
            npcId: enemy.id,
            label: enemy.name,
            quantity,
            unitScore: estimateEnemyUnitScore({
              id: enemy.id,
              type: enemy.type,
              hpMax: enemy.hpMax,
              defenseFinal: enemy.defenseFinal,
              damageFormula: enemy.damageFormula,
              name: enemy.name,
            }),
          })),
          rating: preparedEncounterBalance.rating,
          confidence: preparedEncounterBalance.confidence,
          pressureRatio: preparedEncounterBalance.pressureRatio,
          recommendation: preparedEncounterBalance.recommendation,
        },
      ],
    };

    setEncounterSaving(true);
    try {
      const response = await fetch(`/api/sessions/${encounterTargetSession.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: encounterTargetSession.title,
          description: encounterTargetSession.description,
          coverUrl: encounterTargetSession.coverUrl,
          scheduledAt: encounterTargetSession.scheduledAt ?? undefined,
          status: encounterTargetSession.status ?? "planned",
          metadata: buildSessionMetadata(nextForge, encounterTargetSession.metadata),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? "Nao foi possivel salvar o encontro no preparo da sessao.");
      }
      const saved = payload.data as Session;
      setSessions((current) => current.map((session) => (session.id === saved.id ? saved : session)));
      setEncounterSaveMessage(
        linkedScene
          ? `Encontro salvo em ${saved.title} e ligado a ${linkedScene.title}.`
          : `Encontro salvo em ${saved.title}.`
      );
    } catch (saveError) {
      setEncounterSaveError(
        saveError instanceof Error
          ? saveError.message
          : "Erro inesperado ao salvar o encontro preparado."
      );
    } finally {
      setEncounterSaving(false);
    }
  }

  if (loading || !campaignId) {
    return (
      <div className="space-y-6">
        <div className="h-[320px] animate-pulse rounded-[32px] border border-white/10 bg-white/5" />
        <div className="h-[720px] animate-pulse rounded-[32px] border border-white/10 bg-white/5" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <EmptyState
        title="Algo deu errado"
        description={error ?? "Campanha nao encontrada"}
        action={<Button onClick={() => campaignId && loadData(campaignId)}>Tentar novamente</Button>}
        icon={<Swords className="h-6 w-6" />}
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">
                {campaign.system}
              </Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                Sala {campaign.roomCode}
              </Badge>
              <Badge
                className={
                  combat?.isActive
                    ? "border-red-400/25 bg-red-500/12 text-red-100"
                    : "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
                }
              >
                {combat?.isActive ? "Combate em andamento" : "Sem combate ativo"}
              </Badge>
            </div>

            <div className="space-y-3">
              <p className="section-eyebrow">Estacao de campanha</p>
              <h1 className="max-w-4xl text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl xl:text-6xl">
                {campaign.name}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {campaign.description ||
                  "Campanha pronta para operar elenco, sessoes, combate e contexto de mundo em uma unica superficie."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/app/play/${campaign.id}`}>
                  <Swords className="mr-2 h-4 w-4" />
                  Abrir mesa ao vivo
                </Link>
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${campaign.world.id}/map`}>
                  <Compass className="mr-2 h-4 w-4" />
                  Abrir atlas
                </Link>
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${campaign.world.id}`}>
                  <Castle className="mr-2 h-4 w-4" />
                  Voltar ao mundo
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-white/10 bg-white/5"
                onClick={() => campaignId && loadData(campaignId)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar leitura
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Personagens</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-black text-foreground">
                    {characters.length}
                  </span>
                  <Users2 className="h-5 w-5 text-amber-300/80" />
                </div>
              </div>
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Ameacas</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-black text-foreground">
                    {threatCount}
                  </span>
                  <Crosshair className="h-5 w-5 text-red-200/90" />
                </div>
              </div>
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Sessoes</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-3xl font-black text-foreground">
                    {sessions.length}
                  </span>
                  <CalendarClock className="h-5 w-5 text-amber-100/80" />
                </div>
              </div>
              <div className="cinematic-frame rounded-2xl p-4">
                <p className="section-eyebrow">Atualizada</p>
                <div className="mt-3 text-sm font-semibold text-foreground">
                  {formatDate(campaign.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura tatica</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Mundo
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {campaign.world.title}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Proxima sessao
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {nextSession ? nextSession.title : "Nenhuma sessao programada"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {nextSession
                      ? formatDateTime(nextSession.scheduledAt)
                      : "Crie a proxima sessao para alimentar o ritmo da campanha."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Combate
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {combat?.isActive
                      ? `Round ${combat.round || 1} • ${combat.combatants.length} combatentes`
                      : "Nenhum confronto aberto"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Use a aba de combate para operar a cena sem sair desta estacao.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Balanceamento T20
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge
                      className={
                        encounterBalance.rating === "deadly"
                          ? "border-red-300/20 bg-red-300/10 text-red-100"
                          : encounterBalance.rating === "risky"
                            ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                            : encounterBalance.rating === "trivial"
                              ? "border-sky-300/20 bg-sky-300/10 text-sky-100"
                              : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                      }
                    >
                      {formatEncounterRating(encounterBalance.rating)}
                    </Badge>
                    <Badge className="border-white/10 bg-black/25 text-white/75">
                      Confianca {formatBalanceConfidence(encounterBalance.confidence)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    Razao de pressao {encounterBalance.pressureRatio}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {encounterBalance.recommendation}
                  </p>
                </div>
              </div>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Atalhos da campanha</p>
              <div className="mt-4 grid gap-3">
                <Button variant="outline" className="justify-between border-white/10 bg-white/5" asChild>
                  <Link href={`/app/worlds/${campaign.world.id}/characters`}>
                    Elenco do mundo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-between border-white/10 bg-white/5" asChild>
                  <Link href={`/app/worlds/${campaign.world.id}/diary`}>
                    Diario e memoria
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-between border-white/10 bg-white/5" asChild>
                  <Link href={`/app/worlds/${campaign.world.id}/compendium`}>
                    Biblioteca de regras
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-auto flex-wrap rounded-2xl border border-white/10 bg-black/25 p-1 text-foreground">
          <TabsTrigger value="overview">Visao geral</TabsTrigger>
          <TabsTrigger value="characters">Personagens</TabsTrigger>
          <TabsTrigger value="sessions">Sessoes</TabsTrigger>
          <TabsTrigger value="npcs">NPCs e ameacas</TabsTrigger>
          <TabsTrigger value="combat">Combate</TabsTrigger>
          <TabsTrigger value="links">Ecossistema</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
            <div className="cinematic-frame rounded-[28px] p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="section-eyebrow">Pressao atual</p>
                  <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                    Frente pronta para operar.
                  </h2>
                </div>
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  Estacao ativa
                </Badge>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Elenco principal
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {characters.length
                      ? `${characters.length} personagens prontos para entrar em cena.`
                      : "Nenhum personagem registrado ainda."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Pressao hostil
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {threatCount
                      ? `${threatCount} ameacas preparadas para confronto.`
                      : "Nenhuma ameaca catalogada nesta campanha."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Ritmo da mesa
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {nextSession
                      ? `Proxima entrada marcada para ${formatDateTime(nextSession.scheduledAt)}.`
                      : "Sem proxima sessao definida."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4 md:col-span-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Balanceamento T20
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        Leitura heuristica do encontro com base no nivel do grupo e nas ameacas hostis cadastradas.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className={
                          encounterBalance.rating === "deadly"
                            ? "border-red-300/20 bg-red-300/10 text-red-100"
                            : encounterBalance.rating === "risky"
                              ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                              : encounterBalance.rating === "trivial"
                                ? "border-sky-300/20 bg-sky-300/10 text-sky-100"
                                : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                        }
                      >
                        {formatEncounterRating(encounterBalance.rating)}
                      </Badge>
                      <Badge className="border-white/10 bg-black/25 text-white/75">
                        Confianca {formatBalanceConfidence(encounterBalance.confidence)}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Grupo</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {characters.length} personagens · nivel medio {encounterBalance.avgPartyLevel || 0}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Score de grupo {encounterBalance.partyScore}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ameacas</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {encounterBalance.enemyCount} hostis consideradas
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Score de pressao {encounterBalance.threatScore}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Leitura</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        Razao {encounterBalance.pressureRatio}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {encounterBalance.recommendation}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {encounterBalance.factors.map((factor) => (
                      <div
                        key={factor}
                        className="rounded-2xl border border-white/8 bg-white/4 px-3 py-2 text-sm text-muted-foreground"
                      >
                        {factor}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-[24px] border border-white/8 bg-black/20 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Preparo de encontro
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-foreground">
                          Monte a composicao hostil da proxima cena
                        </h3>
                      </div>
                      <Badge className="border-white/10 bg-black/25 text-white/75">
                        {preparedEncounterEnemies.length} ameacas selecionadas
                      </Badge>
                    </div>

                    {availableEnemies.length > 0 ? (
                      <div className="mt-4 grid gap-3 xl:grid-cols-2">
                        <div className="space-y-3">
                          {availableEnemies.map((enemy) => {
                            const quantity = encounterDraft[enemy.id] ?? 0;
                            return (
                              <div
                                key={enemy.id}
                                className="rounded-2xl border border-white/8 bg-white/4 p-4"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">{enemy.name}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {enemy.hpMax} PV • DEF {enemy.defenseFinal} • {enemy.damageFormula || "sem dano"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-white/10 bg-black/25"
                                      onClick={() =>
                                        setEncounterDraft((current) => ({
                                          ...current,
                                          [enemy.id]: Math.max((current[enemy.id] ?? 0) - 1, 0),
                                        }))
                                      }
                                    >
                                      -
                                    </Button>
                                    <div className="min-w-8 text-center text-sm font-semibold text-foreground">
                                      {quantity}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-white/10 bg-black/25"
                                      onClick={() =>
                                        setEncounterDraft((current) => ({
                                          ...current,
                                          [enemy.id]: (current[enemy.id] ?? 0) + 1,
                                        }))
                                      }
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              className={
                                preparedEncounterBalance.rating === "deadly"
                                  ? "border-red-300/20 bg-red-300/10 text-red-100"
                                  : preparedEncounterBalance.rating === "risky"
                                    ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                                    : preparedEncounterBalance.rating === "trivial"
                                      ? "border-sky-300/20 bg-sky-300/10 text-sky-100"
                                      : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                              }
                            >
                              {formatEncounterRating(preparedEncounterBalance.rating)}
                            </Badge>
                            <Badge className="border-white/10 bg-black/25 text-white/75">
                              Confianca {formatBalanceConfidence(preparedEncounterBalance.confidence)}
                            </Badge>
                          </div>
                          <p className="mt-3 text-sm font-semibold text-foreground">
                            Razao de pressao {preparedEncounterBalance.pressureRatio}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {preparedEncounterBalance.recommendation}
                          </p>
                          <div className="mt-4 grid gap-2">
                            {preparedEncounterBalance.factors.map((factor) => (
                              <div
                                key={factor}
                                className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-sm text-muted-foreground"
                              >
                                {factor}
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 rounded-2xl border border-amber-300/10 bg-amber-300/6 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-amber-100/80">
                              Sugestao de ajuste
                            </p>
                            <p className="mt-2 text-sm leading-6 text-foreground">
                              {encounterAdjustmentSuggestion}
                            </p>
                          </div>
                          <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                  Anexar ao preparo
                                </p>
                                <p className="mt-2 text-sm text-foreground">
                                  Salve esta composicao em uma sessao e, se quiser, prenda o encontro a uma cena.
                                </p>
                              </div>
                              <Badge className="border-white/10 bg-black/25 text-white/75">
                                {(encounterTargetForge?.encounters.length ?? 0)} encontros salvos
                              </Badge>
                            </div>
                            <div className="mt-4 grid gap-3">
                              <label className="grid gap-2 text-sm">
                                <span className="text-muted-foreground">Sessao alvo</span>
                                <select
                                  value={encounterTargetSession?.id ?? ""}
                                  onChange={(event) => setEncounterTargetSessionId(event.target.value)}
                                  className="h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-foreground outline-none"
                                >
                                  <option value="">Selecione uma sessao</option>
                                  {sortedSessions.map((session) => (
                                    <option key={session.id} value={session.id}>
                                      {session.title}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="grid gap-2 text-sm">
                                <span className="text-muted-foreground">Cena alvo</span>
                                <select
                                  value={encounterTargetSceneId}
                                  onChange={(event) => setEncounterTargetSceneId(event.target.value)}
                                  className="h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-foreground outline-none"
                                >
                                  <option value="">Sem cena especifica</option>
                                  {encounterTargetScenes.map((scene) => (
                                    <option key={scene.id} value={scene.id}>
                                      {scene.title || "Cena sem titulo"}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <Button
                                onClick={() => void handleSaveEncounterToSession()}
                                disabled={encounterSaving || preparedEncounterEnemies.length === 0}
                              >
                                {encounterSaving ? "Salvando encontro..." : "Salvar no preparo da sessao"}
                              </Button>
                              {encounterSaveMessage ? (
                                <p className="text-sm text-emerald-200">{encounterSaveMessage}</p>
                              ) : null}
                              {encounterSaveError ? (
                                <p className="text-sm text-destructive">{encounterSaveError}</p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-muted-foreground">
                        Cadastre ameacas do tipo `enemy` para montar uma composicao de encontro.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-6 bg-white/10" />

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="section-eyebrow">Proxima sessao</p>
                      <h3 className="mt-2 text-lg font-bold text-foreground">
                        {nextSession?.title ?? "Sem sessao programada"}
                      </h3>
                    </div>
                    <Button size="sm" onClick={openCreateSession}>
                      <Plus className="mr-2 h-4 w-4" />
                      Sessao
                    </Button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {nextSession
                      ? nextSession.description ||
                        "Abra a ficha da sessao e refine a frente antes de entrar na mesa."
                      : "Crie a proxima sessao para organizar roteiro, reveal e ritmo."}
                  </p>
                </div>

              <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="section-eyebrow">Pressao narrativa</p>
                      <h3 className="mt-2 text-lg font-bold text-foreground">
                        Combate e elenco no mesmo eixo
                      </h3>
                    </div>
                    <Button size="sm" variant="outline" className="border-white/10 bg-white/5" asChild>
                      <Link href={`/app/play/${campaign.id}`}>Mesa</Link>
                    </Button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Personagens, NPCs e sessao ao vivo agora ficam amarrados dentro da mesma superficie de campanha.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/8 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="section-eyebrow">Memoria da campanha</p>
                    <h3 className="mt-2 text-lg font-bold text-foreground">
                      O que ficou das ultimas mesas
                    </h3>
                  </div>
                  <Badge className="border-primary/20 bg-primary/10 text-primary">
                    {campaignMemoryEvents.length} marcos
                  </Badge>
                </div>
                {campaignMemoryEvents.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,0.6fr))]">
                        <Input
                          value={memoryQuery}
                          onChange={(event) => setMemoryQuery(event.target.value)}
                          placeholder="Buscar morte, ausencia, mudanca, sessao..."
                        />
                        <select
                          className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground"
                          value={memoryVisibility}
                          onChange={(event) =>
                            setMemoryVisibility(event.target.value as "ALL" | "MASTER" | "PLAYERS")
                          }
                        >
                          <option value="ALL">Toda visibilidade</option>
                          <option value="PLAYERS">Publico</option>
                          <option value="MASTER">Mestre</option>
                        </select>
                        <select
                          className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground"
                          value={memoryTone}
                          onChange={(event) =>
                            setMemoryTone(event.target.value as "ALL" | "summary" | "change" | "death" | "note")
                          }
                        >
                          <option value="ALL">Todo tipo</option>
                          <option value="summary">Resumo</option>
                          <option value="change">Mudanca</option>
                          <option value="death">Morte</option>
                          <option value="note">Nota</option>
                        </select>
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {filteredCampaignMemoryEvents.length} marcos neste recorte
                      </p>
                    </div>
                    {filteredCampaignMemoryEvents.length > 0 ? filteredCampaignMemoryEvents.slice(0, 6).map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className="w-full rounded-2xl border border-white/8 bg-white/4 p-4 text-left transition hover:border-primary/20 hover:bg-white/6"
                        onClick={() => setInspectItem({ type: "memory", item: event })}
                      >
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
                          <Badge className="border-white/10 bg-black/25 text-white/75">
                            {formatMemoryEventVisibility(event.visibility)}
                          </Badge>
                          <Badge className="border-white/10 bg-white/5 text-white/75">
                            {formatMemoryEventKind(event)}
                          </Badge>
                          <Badge className="border-white/10 bg-white/5 text-white/75">
                            {formatMemoryEventTemporalLabel(event.ts)}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-foreground">{formatMemoryEventText(event)}</p>
                        {event.sessionId ? (
                          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-amber-100/80">
                            {sessionTitleById.get(event.sessionId) || "Sessao ligada"}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {formatDateTime(event.ts)}
                        </p>
                      </button>
                    )) : (
                      <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-muted-foreground">
                        Nenhum marco de memoria corresponde aos filtros atuais.
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Ainda nao existe memoria consolidada para esta campanha.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="cinematic-frame rounded-[28px] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="section-eyebrow">Elenco em foco</p>
                    <h3 className="mt-2 text-lg font-bold text-foreground">
                      Ultimos personagens
                    </h3>
                  </div>
                  <Button size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={openCreateCharacter}>
                    <Plus className="mr-2 h-4 w-4" />
                    Personagem
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {sortedCharacters.slice(0, 4).map((character) => (
                    <div key={character.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{character.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Nv. {character.level}
                            {character.className ? ` • ${character.className}` : ""}
                            {character.ancestry ? ` • ${character.ancestry}` : ""}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => openEditCharacter(character)}>
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!sortedCharacters.length ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum personagem registrado nesta campanha ainda.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="cinematic-frame rounded-[28px] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="section-eyebrow">Pressao hostil</p>
                    <h3 className="mt-2 text-lg font-bold text-foreground">
                      NPCs e ameacas
                    </h3>
                  </div>
                  <Button size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={openCreateNpc}>
                    <Plus className="mr-2 h-4 w-4" />
                    NPC
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {sortedNpcs.slice(0, 4).map((npc) => (
                    <div key={npc.id} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{npc.name}</p>
                            <Badge className={npc.type === "enemy" ? "border-red-400/20 bg-red-500/10 text-red-100" : "border-sky-400/20 bg-sky-500/10 text-sky-100"}>
                              {npc.type === "enemy" ? "Ameaca" : "Aliado"}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {npc.hpMax} PV • DEF {npc.defenseFinal} • {npc.damageFormula}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => openEditNpc(npc)}>
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!sortedNpcs.length ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum NPC registrado nesta campanha ainda.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="characters" className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-eyebrow">Elenco jogavel</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                Personagens da campanha
              </h2>
            </div>
            <Button onClick={openCreateCharacter}>
              <Plus className="mr-2 h-4 w-4" />
              Novo personagem
            </Button>
          </div>

          {sortedCharacters.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sortedCharacters.map((character, index) => (
                <Card key={character.id} className="overflow-hidden rounded-[28px] border-white/10 bg-black/20">
                  <CardContent className="p-0">
                    <div
                      className="flex min-h-[320px] flex-col justify-between p-5"
                      style={{
                        backgroundImage: character.avatarUrl
                          ? `linear-gradient(180deg, rgba(8,8,13,0.2), rgba(8,8,13,0.92)), url(${character.avatarUrl})`
                          : index % 2 === 0
                            ? "linear-gradient(135deg, rgba(188,74,63,0.2), rgba(8,8,13,0.95))"
                            : "linear-gradient(135deg, rgba(213,162,64,0.14), rgba(8,8,13,0.95))",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Badge className="border-white/12 bg-black/28 text-white">
                          Nivel {character.level}
                        </Badge>
                        <span className="text-xs uppercase tracking-[0.18em] text-white/55">
                          {formatDate(character.updatedAt)}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-2xl font-black uppercase tracking-[0.04em] text-white">
                            {character.name}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-white/72">
                            {character.role || "Sem funcao narrativa registrada"}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                              Classe
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                              {character.className || "Sem classe"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">
                              Linhagem
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                              {character.ancestry || "Sem raca"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" className="bg-white text-black hover:bg-white/90" asChild>
                            <Link href={`/app/characters/${character.id}`}>Abrir ficha</Link>
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/10 bg-black/25 text-white" onClick={() => setInspectItem({ type: "character", item: character })}>
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            Inspecionar
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/10 bg-black/25 text-white" onClick={() => openEditCharacter(character)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/10 bg-black/25 text-white" onClick={() => handleDeleteCharacter(character)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum personagem ainda"
              description="Crie o primeiro personagem desta campanha para consolidar elenco e ficha."
              icon={<UserRound className="h-6 w-6" />}
              action={
                <Button onClick={openCreateCharacter}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar personagem
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-eyebrow">Ritmo e agenda</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                Sessoes da campanha
              </h2>
            </div>
            <Button onClick={openCreateSession}>
              <Plus className="mr-2 h-4 w-4" />
              Nova sessao
            </Button>
          </div>

          {sortedSessions.length ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {sortedSessions.map((session) => (
                <Card key={session.id} className="overflow-hidden rounded-[28px] border-white/10 bg-black/20">
                  <CardContent className="p-0">
                    <div
                      className="flex min-h-[280px] flex-col justify-between p-5"
                      style={{
                        backgroundImage: session.coverUrl
                          ? `linear-gradient(180deg, rgba(8,8,13,0.24), rgba(8,8,13,0.94)), url(${session.coverUrl})`
                          : "linear-gradient(135deg, rgba(188,74,63,0.14), rgba(8,8,13,0.95))",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Badge className={getSessionTone(session.status)}>
                          {session.status || "planned"}
                        </Badge>
                        <span className="text-xs uppercase tracking-[0.18em] text-white/55">
                          {formatDateTime(session.scheduledAt ?? session.updatedAt)}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-2xl font-black uppercase tracking-[0.04em] text-white">
                            {session.title}
                          </h3>
                          <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/72">
                            {session.description ||
                              "Sem briefing registrado. Abra a sessao para aprofundar a frente de mesa."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" className="bg-white text-black hover:bg-white/90" onClick={() => openSessionMode(session)}>
                            Abrir modo sessao
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/10 bg-black/25 text-white" asChild>
                            <Link href={`/app/campaign/${campaign.id}/forge/${session.id}`}>
                              Forjar sessao
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/10 bg-black/25 text-white" onClick={() => setInspectItem({ type: "session", item: session })}>
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            Inspecionar
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/10 bg-black/25 text-white" onClick={() => openEditSession(session)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/10 bg-black/25 text-white" onClick={() => handleDeleteSession(session)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma sessao ainda"
              description="Crie a primeira sessao para amarrar ritmo, agenda e reveal."
              icon={<CalendarClock className="h-6 w-6" />}
              action={
                <Button onClick={openCreateSession}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar sessao
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="npcs" className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-eyebrow">Pressao narrativa</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                NPCs, aliados e ameacas
              </h2>
            </div>
            <Button onClick={openCreateNpc}>
              <Plus className="mr-2 h-4 w-4" />
              Novo NPC
            </Button>
          </div>

          {sortedNpcs.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sortedNpcs.map((npc) => (
                <Card key={npc.id} className="overflow-hidden rounded-[28px] border-white/10 bg-black/20">
                  <CardContent className="p-0">
                    <div
                      className="flex min-h-[300px] flex-col justify-between p-5"
                      style={{
                        backgroundImage: npc.imageUrl
                          ? `linear-gradient(180deg, rgba(8,8,13,0.2), rgba(8,8,13,0.94)), url(${npc.imageUrl})`
                          : npc.type === "enemy"
                            ? "linear-gradient(135deg, rgba(146,26,26,0.24), rgba(8,8,13,0.95))"
                            : "linear-gradient(135deg, rgba(54,90,150,0.22), rgba(8,8,13,0.95))",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Badge className={npc.type === "enemy" ? "border-red-400/20 bg-red-500/10 text-red-100" : "border-sky-400/20 bg-sky-500/10 text-sky-100"}>
                          {npc.type === "enemy" ? "Ameaca" : "Aliado"}
                        </Badge>
                        <span className="text-xs uppercase tracking-[0.18em] text-white/55">
                          {formatDate(npc.updatedAt)}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-2xl font-black uppercase tracking-[0.04em] text-white">
                            {npc.name}
                          </h3>
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/72">
                            {npc.description || "Sem descricao registrada para este NPC."}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">PV</p>
                            <p className="mt-2 text-sm font-semibold text-white">{npc.hpMax}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">DEF</p>
                            <p className="mt-2 text-sm font-semibold text-white">{npc.defenseFinal}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">Dano</p>
                            <p className="mt-2 text-sm font-semibold text-white">{npc.damageFormula}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" className="bg-white text-black hover:bg-white/90" onClick={() => handleAddNpcToCombat(npc)}>
                            <Swords className="mr-2 h-4 w-4" />
                            Entrar no combate
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/10 bg-black/25 text-white" onClick={() => setInspectItem({ type: "npc", item: npc })}>
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            Inspecionar
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/10 bg-black/25 text-white" onClick={() => openEditNpc(npc)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/10 bg-black/25 text-white" onClick={() => handleDeleteNpc(npc)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum NPC ainda"
              description="Cadastre aliados, ameacas e figuras recorrentes desta campanha."
              icon={<Shield className="h-6 w-6" />}
              action={
                <Button onClick={openCreateNpc}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar NPC
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="combat" className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-eyebrow">Operacao tatica</p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                Painel de combate
              </h2>
            </div>
            <Badge
              className={
                combat?.isActive
                  ? "border-red-400/25 bg-red-500/12 text-red-100"
                  : "border-white/10 bg-white/8 text-white/70"
              }
            >
              {combat?.isActive ? "Em andamento" : "Aguardando abertura"}
            </Badge>
          </div>
          <CombatPanel
            campaignId={campaign.id}
            characters={sortedCharacters.map((character) => ({
              id: character.id,
              name: character.name,
            }))}
          />
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Nucleo do mundo</p>
              <h3 className="mt-2 text-xl font-black uppercase tracking-[0.04em] text-foreground">
                Voltar para o cockpit
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Reabrir o contexto geral do mundo, campanhas irmas, proximos passos e eventos recentes.
              </p>
              <Button className="mt-5 w-full justify-between" asChild>
                <Link href={`/app/worlds/${campaign.world.id}`}>
                  Abrir cockpit do mundo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Atlas e terreno</p>
              <h3 className="mt-2 text-xl font-black uppercase tracking-[0.04em] text-foreground">
                Ler o mapa como superficie de jogo
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Abrir o atlas para consultar deslocamento, posicionamento e referencias de lugar sem sair da lingua visual do shell.
              </p>
              <Button className="mt-5 w-full justify-between" asChild>
                <Link href={`/app/worlds/${campaign.world.id}/map`}>
                  Abrir atlas
                  <Compass className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Biblioteca viva</p>
              <h3 className="mt-2 text-xl font-black uppercase tracking-[0.04em] text-foreground">
                Regras, diario e referencias
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                O compendio do mundo, o diario e a memoria continuam acessiveis como ecossistema conectado desta campanha.
              </p>
              <div className="mt-5 grid gap-2">
                <Button variant="outline" className="justify-between border-white/10 bg-white/5" asChild>
                  <Link href={`/app/worlds/${campaign.world.id}/compendium`}>
                    <BookOpenText className="mr-2 h-4 w-4" />
                    Compendio
                  </Link>
                </Button>
                <Button variant="outline" className="justify-between border-white/10 bg-white/5" asChild>
                  <Link href={`/app/worlds/${campaign.world.id}/diary`}>
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Diario
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {inspectItem ? (
        <CockpitDetailSheet
          open={inspectItem !== null}
          onOpenChange={(open) => !open && setInspectItem(null)}
          badge={inspectItem.type === "memory" ? "Memoria" : "Detail surface"}
          title={
            inspectItem.type === "memory"
              ? formatMemoryEventText(inspectItem.item)
              : inspectItem.type === "character" || inspectItem.type === "npc"
              ? inspectItem.item.name
              : inspectItem.item.title
          }
          description={
            inspectItem.type === "character"
              ? `Nivel ${inspectItem.item.level}${inspectItem.item.className ? ` • ${inspectItem.item.className}` : ""}`
              : inspectItem.type === "session"
                ? `${inspectItem.item.status || "planned"} • ${formatDateTime(inspectItem.item.scheduledAt ?? inspectItem.item.updatedAt)}`
                : inspectItem.type === "npc"
                  ? `${inspectItem.item.type === "enemy" ? "Ameaca" : "Aliado"} • DEF ${inspectItem.item.defenseFinal}`
                  : `${formatMemoryEventType(inspectItem.item.type)} • ${formatMemoryEventVisibility(inspectItem.item.visibility)}`
          }
          footer={
            inspectItem.type === "character" ? (
              <Button className="w-full justify-between" asChild>
                <Link href={`/app/characters/${inspectItem.item.id}`}>
                  Abrir superficie completa
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : inspectItem.type === "session" ? (
              <Button className="w-full justify-between" onClick={() => openSessionMode(inspectItem.item)}>
                Abrir modo sessao
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : inspectItem.type === "npc" ? (
              <Button className="w-full justify-between" onClick={() => handleAddNpcToCombat(inspectItem.item)}>
                Levar ao combate
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : undefined
          }
        >
          {inspectItem.type === "memory" ? (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={
                      getMemoryEventTone(inspectItem.item) === "death"
                        ? "border-red-300/20 bg-red-300/10 text-red-100"
                        : getMemoryEventTone(inspectItem.item) === "change"
                          ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                          : "border-primary/20 bg-primary/10 text-primary"
                    }
                  >
                    {formatMemoryEventType(inspectItem.item.type)}
                  </Badge>
                  <Badge className="border-white/10 bg-black/25 text-white/75">
                    {formatMemoryEventKind(inspectItem.item)}
                  </Badge>
                  <Badge className="border-white/10 bg-black/25 text-white/75">
                    {formatMemoryEventVisibility(inspectItem.item.visibility)}
                  </Badge>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {buildMemoryInspectBody(inspectItem.item, {
                    sessionTitle: inspectItem.item.sessionId
                      ? sessionTitleById.get(inspectItem.item.sessionId)
                      : undefined,
                  })}
                </p>
                {memoryInspectRelations.length > 0 ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Relacoes ligadas ao evento
                    </p>
                    <div className="mt-2 space-y-2">
                      {memoryInspectRelations.map((relation) => (
                        <p key={relation.id} className="text-sm text-foreground">
                          <span className="font-semibold">{relation.fromEntity.name}</span>
                          {" -> "}
                          <span className="text-amber-100/90">
                            {relation.type.replaceAll("_", " ")}
                          </span>
                          {" -> "}
                          <span className="font-semibold">{relation.toEntity.name}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {inspectItem.item.sessionId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      onClick={() => {
                        const session = sessions.find((item) => item.id === inspectItem.item.sessionId);
                        if (session) openSessionMode(session);
                      }}
                    >
                      Abrir modo sessao
                    </Button>
                  ) : null}
                  {inspectItem.item.sessionId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      asChild
                    >
                      <Link href={`/app/campaign/${campaignId}/forge/${inspectItem.item.sessionId}`}>
                        Abrir forja da sessao
                      </Link>
                    </Button>
                  ) : null}
                  {memoryInspectRelations.length > 0 && campaign?.world?.id ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 bg-white/5"
                      asChild
                    >
                      <Link href={`/app/worlds/${campaign.world.id}/graph`}>
                        Abrir grafo de relacoes
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : inspectItem.type === "character" ? (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Funcao</p>
                <p className="mt-2 text-sm leading-7 text-foreground">
                  {inspectItem.item.role || "Sem funcao registrada"}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Raca</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {inspectItem.item.ancestry || "Nao definida"}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Classe</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {inspectItem.item.className || "Nao definida"}
                  </p>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Descricao</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {inspectItem.item.description || "Sem descricao registrada."}
                </p>
              </div>
            </div>
          ) : inspectItem.type === "session" ? (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {inspectItem.item.status || "planned"}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Descricao</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {inspectItem.item.description || "Sem briefing registrado."}
                </p>
              </div>
              {(() => {
                const memory = normalizeSessionForgeState(inspectItem.item.metadata).memory;
                if (!memory.publicSummary && !memory.masterSummary) return null;
                return (
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Fechamento consolidado</p>
                    {memory.publicSummary ? (
                      <div className="mt-3 space-y-2">
                        <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">Publico</Badge>
                        <p className="text-sm leading-7 text-foreground">{memory.publicSummary}</p>
                      </div>
                    ) : null}
                    {memory.masterSummary ? (
                      <div className="mt-3 space-y-2">
                        <Badge className="border-red-300/20 bg-red-300/10 text-red-100">Mestre</Badge>
                        <p className="text-sm leading-7 text-muted-foreground">{memory.masterSummary}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">PV</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{inspectItem.item.hpMax}</p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">DEF</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{inspectItem.item.defenseFinal}</p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dano</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{inspectItem.item.damageFormula}</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Descricao</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {inspectItem.item.description || "Sem descricao registrada."}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tags</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {inspectItem.item.tags || "Sem tags"}
                </p>
              </div>
            </div>
          )}
        </CockpitDetailSheet>
      ) : null}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingCharacter(null);
            setFormError(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent className="chrome-panel max-h-[88vh] overflow-y-auto border-white/10 bg-card/85 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingCharacter ? "Editar personagem" : "Novo personagem"}
            </DialogTitle>
            <DialogDescription>
              Elenco jogavel da campanha, com nivel, classe, funcao e retrato.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSaveCharacter}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome</label>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Raca</label>
                <Input
                  value={form.ancestry}
                  onChange={(event) => setForm((prev) => ({ ...prev, ancestry: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Classe</label>
                <Input
                  value={form.className}
                  onChange={(event) => setForm((prev) => ({ ...prev, className: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Funcao</label>
                <Input
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nivel</label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={form.level}
                  onChange={(event) => setForm((prev) => ({ ...prev, level: Number(event.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Descricao</label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Avatar</label>
              <Input
                placeholder="URL do retrato"
                value={form.avatarUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, avatarUrl: event.target.value }))}
              />
              <Input
                type="file"
                accept="image/*"
                disabled={avatarUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleAvatarUpload(file);
                }}
              />
              {avatarUploading ? (
                <p className="text-sm text-muted-foreground">Enviando avatar...</p>
              ) : null}
            </div>
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Salvando..." : editingCharacter ? "Salvar alteracoes" : "Criar personagem"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={sessionDialogOpen}
        onOpenChange={(open) => {
          setSessionDialogOpen(open);
          if (!open) {
            setEditingSession(null);
            setSessionFormError(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent className="chrome-panel max-h-[88vh] overflow-y-auto border-white/10 bg-card/85 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingSession ? "Editar sessao" : "Nova sessao"}</DialogTitle>
            <DialogDescription>
              Agenda, cover e status para manter o ritmo da campanha sob controle.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSaveSession}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Titulo</label>
              <Input
                value={sessionForm.title}
                onChange={(event) => setSessionForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Descricao</label>
              <Textarea
                rows={4}
                value={sessionForm.description}
                onChange={(event) => setSessionForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Data</label>
                <Input
                  type="datetime-local"
                  value={sessionForm.scheduledAt}
                  onChange={(event) => setSessionForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground"
                  value={sessionForm.status}
                  onChange={(event) =>
                    setSessionForm((prev) => ({
                      ...prev,
                      status: event.target.value as "planned" | "active" | "finished",
                    }))
                  }
                >
                  <option value="planned">planned</option>
                  <option value="active">active</option>
                  <option value="finished">finished</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Capa</label>
              <Input
                placeholder="URL da capa"
                value={sessionForm.coverUrl}
                onChange={(event) => setSessionForm((prev) => ({ ...prev, coverUrl: event.target.value }))}
              />
              <Input
                type="file"
                accept="image/*"
                disabled={sessionUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleCoverUpload(file);
                }}
              />
              {sessionUploading ? (
                <p className="text-sm text-muted-foreground">Enviando capa...</p>
              ) : null}
            </div>
            {sessionFormError ? <p className="text-sm text-destructive">{sessionFormError}</p> : null}
            <Button type="submit" className="w-full" disabled={sessionSubmitting}>
              {sessionSubmitting ? "Salvando..." : editingSession ? "Salvar alteracoes" : "Criar sessao"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={npcDialogOpen}
        onOpenChange={(open) => {
          setNpcDialogOpen(open);
          if (!open) {
            setEditingNpc(null);
            setNpcFormError(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
        <DialogContent className="chrome-panel max-h-[88vh] overflow-y-auto border-white/10 bg-card/85 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingNpc ? "Editar NPC" : "Novo NPC"}</DialogTitle>
            <DialogDescription>
              Cadastre aliados, figuras neutras ou ameacas com estatisticas minimas para combate.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSaveNpc}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome</label>
              <Input
                value={npcForm.name}
                onChange={(event) => setNpcForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tipo</label>
                <select
                  className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-foreground"
                  value={npcForm.type}
                  onChange={(event) =>
                    setNpcForm((prev) => ({
                      ...prev,
                      type: event.target.value as "npc" | "enemy",
                    }))
                  }
                >
                  <option value="npc">npc</option>
                  <option value="enemy">enemy</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tags</label>
                <Input
                  value={npcForm.tags}
                  onChange={(event) => setNpcForm((prev) => ({ ...prev, tags: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">PV</label>
                <Input
                  type="number"
                  min={1}
                  value={npcForm.hpMax}
                  onChange={(event) => setNpcForm((prev) => ({ ...prev, hpMax: Number(event.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">DEF</label>
                <Input
                  type="number"
                  min={0}
                  value={npcForm.defenseFinal}
                  onChange={(event) =>
                    setNpcForm((prev) => ({ ...prev, defenseFinal: Number(event.target.value) }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Dano</label>
                <Input
                  value={npcForm.damageFormula}
                  onChange={(event) => setNpcForm((prev) => ({ ...prev, damageFormula: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Descricao</label>
              <Textarea
                rows={4}
                value={npcForm.description}
                onChange={(event) => setNpcForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Imagem</label>
              <Input
                placeholder="URL da imagem"
                value={npcForm.imageUrl}
                onChange={(event) => setNpcForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              />
              <Input
                type="file"
                accept="image/*"
                disabled={npcUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleNpcUpload(file);
                }}
              />
              {npcUploading ? <p className="text-sm text-muted-foreground">Enviando imagem...</p> : null}
            </div>
            {npcFormError ? <p className="text-sm text-destructive">{npcFormError}</p> : null}
            <Button type="submit" className="w-full" disabled={npcSubmitting}>
              {npcSubmitting ? "Salvando..." : editingNpc ? "Salvar alteracoes" : "Criar NPC"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
