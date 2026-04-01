"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Plus, RefreshCw, Search, Shield, Users2 } from "lucide-react";

import { CharacterWizard } from "@/components/character-wizard";
import { EmptyState } from "@/components/empty-state";
import { useAppFeedback } from "@/components/app-feedback-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";

type Campaign = {
  id: string;
  name: string;
};

type CodexEntity = {
  id: string;
  name: string;
  type: string;
  campaignId?: string | null;
  metadata?: { legacyCharacterId?: string } | null;
};

type Character = {
  id: string;
  campaignId: string;
  name: string;
  ancestry?: string | null;
  className?: string | null;
  role?: string | null;
  level: number;
  updatedAt: string;
  campaign?: Campaign | null;
};

type CharacterWizardPayload = {
  campaignId: string;
  name: string;
  ancestry?: string;
  className?: string;
  attributes?: Record<string, number>;
  stats?: Record<string, unknown>;
  level?: number;
  skills?: Record<string, unknown>;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function WorldCharactersPage() {
  const params = useParams();
  const worldId = params?.id as string;

  const [characters, setCharacters] = useState<Character[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [codexEntities, setCodexEntities] = useState<CodexEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [syncingCharacterId, setSyncingCharacterId] = useState<string | null>(null);
  const { notifyError, notifySuccess } = useAppFeedback();

  const loadData = useCallback(async () => {
    if (!worldId) return;
    setLoading(true);
    setError(null);
    try {
      const [campaignRes, characterRes, codexRes] = await Promise.all([
        fetch(`/api/campaigns?worldId=${worldId}`, { cache: "no-store" }),
        fetch(`/api/characters?worldId=${worldId}`, { cache: "no-store" }),
        fetch(`/api/worlds/${worldId}/codex`, { cache: "no-store" }),
      ]);
      const [campaignPayload, characterPayload, codexPayload] = await Promise.all([
        campaignRes.json().catch(() => ({})),
        characterRes.json().catch(() => ({})),
        codexRes.json().catch(() => ({})),
      ]);

      if (!campaignRes.ok) throw new Error(campaignPayload.error ?? "Falha ao carregar campanhas");
      if (!characterRes.ok) throw new Error(characterPayload.error ?? "Falha ao carregar personagens");
      if (!codexRes.ok) throw new Error(codexPayload.error ?? "Falha ao carregar o Codex");

      setCampaigns(campaignPayload.data ?? []);
      setCharacters(characterPayload.data ?? []);
      setCodexEntities(codexPayload.data?.entities ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar personagens");
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    if (worldId) void loadData();
  }, [loadData, worldId]);

  async function handleCreateCharacter(data: CharacterWizardPayload) {
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worldId, ...data }),
      });
      if (!res.ok) throw new Error("Erro ao criar personagem");
      setWizardOpen(false);
      await loadData();
    } catch (error) {
      console.error(error);
      setError("Falha ao salvar personagem");
    }
  }

  function matchCharacterEntity(character: Character) {
    return codexEntities.find((entity) => {
      const metadata = entity.metadata || {};
      return (
        metadata.legacyCharacterId === character.id ||
        (
          entity.type === "character" &&
          entity.name.trim().toLowerCase() === character.name.trim().toLowerCase() &&
          (entity.campaignId || "") === (character.campaignId || "")
        )
      );
    });
  }

  async function handleCreateCodexEntityFromCharacter(character: Character) {
    setSyncingCharacterId(character.id);
    try {
      const res = await fetch(`/api/worlds/${worldId}/entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: character.campaignId || undefined,
          name: character.name,
          type: "character",
          subtype: character.className || undefined,
          summary: character.role || undefined,
          tags: [character.ancestry, character.className, character.role].filter(Boolean),
          metadata: {
            legacyCharacterId: character.id,
            level: character.level,
            role: character.role,
            ancestry: character.ancestry,
            className: character.className,
          },
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Falha ao criar entidade no Codex");
      notifySuccess("Personagem espelhado no Codex.");
      await loadData();
    } catch (err) {
      notifyError("Falha ao espelhar personagem no Codex", err instanceof Error ? err.message : "Erro inesperado", true);
    } finally {
      setSyncingCharacterId(null);
    }
  }

  const filtered = useMemo(() => {
    const normalizedTerm = term.trim().toLowerCase();
    return characters.filter((character) => {
      if (campaignFilter && character.campaignId !== campaignFilter) return false;
      if (!normalizedTerm) return true;
      return [character.name, character.role ?? "", character.campaign?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedTerm);
    });
  }, [characters, term, campaignFilter]);

  const highestLevel = characters.reduce((max, character) => Math.max(max, character.level), 0);

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Personagens do mundo</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {characters.length} fichas
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Fichas e dossies</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                Personagens tratados como parte viva do mundo.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Esta superficie agora segue a mesma leitura do cockpit. Voce filtra por campanha, abre fichas e cria personagens sem sair do contexto world-scoped.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-white/10 bg-white/5" onClick={loadData} disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
              <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo personagem
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
                  {wizardOpen ? (
                    <CharacterWizard
                      campaigns={campaigns}
                      onComplete={handleCreateCharacter}
                      onCancel={() => setWizardOpen(false)}
                    />
                  ) : null}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura do roster</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Personagens</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{characters.length}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Campanhas</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{campaigns.length}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Maior nivel</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{highestLevel}</p>
                </div>
              </div>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Busca e filtro</p>
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder="Nome, papel ou campanha"
                    className="h-12 rounded-2xl border-white/10 bg-black/25 pl-11"
                  />
                </div>
                <SelectField
                  className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm"
                  value={campaignFilter}
                  onValueChange={setCampaignFilter}
                  placeholder="Todas as campanhas"
                  options={campaigns.map((campaign) => ({
                    value: campaign.id,
                    label: campaign.name,
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[240px] animate-pulse rounded-[28px] border border-white/10 bg-white/4" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Falha ao carregar"
          description={error}
          icon={<Shield className="h-6 w-6" />}
          action={<Button onClick={loadData}>Tentar novamente</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={characters.length === 0 ? "Nenhum personagem ainda" : "Nenhum personagem encontrado"}
          description={
            characters.length === 0
              ? "Crie personagens em uma campanha deste mundo para preencher a superficie."
              : "Ajuste os filtros para encontrar outro personagem."
          }
          icon={<Users2 className="h-6 w-6" />}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((character, index) => {
            const codexEntity = matchCharacterEntity(character);
            return (
              <Card
                key={character.id}
                className="group overflow-hidden rounded-[28px] border-white/10 bg-black/20 transition duration-200 hover:-translate-y-1 hover:border-primary/25"
              >
                <CardContent className="p-0">
                  <div
                    className="flex min-h-[250px] flex-col justify-between p-5"
                    style={{
                      background:
                        index % 2 === 0
                          ? "linear-gradient(135deg, rgba(188,74,63,0.12), rgba(10,10,15,0.9))"
                          : "linear-gradient(135deg, rgba(66,102,135,0.14), rgba(10,10,15,0.9))",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="border-white/10 bg-black/28 text-white">
                        Nivel {character.level}
                      </Badge>
                      <span className="text-xs uppercase tracking-[0.18em] text-white/55">
                        {formatDate(character.updatedAt)}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h2 className="line-clamp-2 text-2xl font-black uppercase tracking-[0.04em] text-white">
                          {character.name}
                        </h2>
                        <p className="mt-3 text-sm text-white/70">
                          {character.role || "Sem papel narrativo definido"}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/45">
                          {[character.ancestry, character.className].filter(Boolean).join(" · ") || "Ficha de campanha"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/55">
                          <Shield className="h-3.5 w-3.5" />
                          Campanha
                        </div>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {character.campaign?.name ?? "Nao informada"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Button asChild className="w-full justify-between bg-white text-black hover:bg-white/90">
                          <Link href={`/app/personagens/${character.id}`}>
                            Abrir ficha
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        {codexEntity ? (
                          <Button asChild variant="outline" className="w-full justify-between border-white/10 bg-white/5 text-white hover:bg-white/10">
                            <Link href={`/app/worlds/${worldId}/codex/${codexEntity.id}`}>
                              Abrir no Codex
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full justify-between border-white/10 bg-white/5 text-white hover:bg-white/10"
                            onClick={() => void handleCreateCodexEntityFromCharacter(character)}
                            disabled={syncingCharacterId === character.id}
                          >
                            {syncingCharacterId === character.id ? "Espelhando..." : "Criar no Codex"}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
