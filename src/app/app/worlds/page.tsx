"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookMarked,
  Clock3,
  Globe2,
  Plus,
  ScrollText,
  Sparkles,
  Trash2,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
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
import { Textarea } from "@/components/ui/textarea";
import { WorldCreateSchema } from "@/lib/validators";
import {
  buildWorldForgeMetadata,
  getEmptyWorldForgeState,
  WORLD_FORGE_SCALE_OPTIONS,
  WORLD_FORGE_SUGGESTED_PILLARS,
} from "@/lib/world-forge";

type World = {
  id: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
};

const initialForm = {
  title: "",
  description: "",
  coverImage: "",
  forge: getEmptyWorldForgeState(),
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function WorldsPage() {
  const router = useRouter();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");

  const sortedWorlds = useMemo(
    () =>
      [...worlds].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [worlds]
  );

  useEffect(() => {
    void loadWorlds(currentTab);
  }, [currentTab]);

  async function loadWorlds(status: "ACTIVE" | "ARCHIVED") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/worlds?status=${status}`, { cache: "no-store" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error ?? "Nao foi possivel carregar mundos");
      }
      setWorlds(payload.data ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro inesperado ao carregar mundos";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(event: React.MouseEvent, worldId: string) {
    event.stopPropagation();
    if (!confirm("Tem certeza que deseja arquivar este mundo?")) return;

    try {
      await fetch(`/api/worlds/${worldId}`, { method: "DELETE" });
      await loadWorlds(currentTab);
    } catch (archiveError) {
      console.error(archiveError);
    }
  }

  async function handleCreate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setFormError(null);
    const parsed = WorldCreateSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Dados invalidos");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/worlds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          metadata: buildWorldForgeMetadata(form.forge),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error ?? "Nao foi possivel criar o mundo");
      }

      setForm(initialForm);
      setDialogOpen(false);
      const worldId = payload.data?.id as string | undefined;
      if (worldId) {
        router.push(`/app/worlds/${worldId}/forge?mode=new`);
        return;
      }
      await loadWorlds(currentTab);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado ao criar mundo";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Biblioteca viva</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {currentTab === "ACTIVE" ? "Mundos ativos" : "Mundos arquivados"}
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Biblioteca de mundos</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl xl:text-6xl">
                Construa, abra e mantenha seus universos no mesmo centro de comando.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Cada mundo e um contexto vivo. Daqui voce entra no cockpit, retoma campanhas e organiza a camada canonica do que existe.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex rounded-2xl border border-white/10 bg-black/30 p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentTab("ACTIVE")}
                  className={currentTab === "ACTIVE" ? "bg-primary/18 text-primary" : "text-muted-foreground"}
                >
                  Ativos
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentTab("ARCHIVED")}
                  className={currentTab === "ARCHIVED" ? "bg-primary/18 text-primary" : "text-muted-foreground"}
                >
                  Arquivados
                </Button>
              </div>
              <Button
                variant="outline"
                className="border-white/10 bg-white/5"
                onClick={() => loadWorlds(currentTab)}
                disabled={loading}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
              {currentTab === "ACTIVE" ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="shadow-[0_18px_50px_rgba(188,74,63,0.28)]">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo mundo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="chrome-panel flex max-h-[85vh] w-[95vw] max-w-xl flex-col overflow-hidden border-white/10 bg-card/85 p-0 text-left backdrop-blur">
                    <DialogHeader className="shrink-0 px-6 pb-4 pt-6">
                      <DialogTitle>Novo mundo</DialogTitle>
                      <DialogDescription>
                        Crie o universo base para campanhas, memoria e operacao do mestre.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleCreate}>
                      <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Nome</label>
                          <Input
                            placeholder="Ex.: Seis Reinos em Cinzas"
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Descricao</label>
                          <Textarea
                            placeholder="Resumo curto do tom, tensao e foco do mundo"
                            value={form.description}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            rows={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Cover URL</label>
                          <Input
                            placeholder="Opcional: https://"
                            value={form.coverImage}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                coverImage: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="section-eyebrow">Primeira batida da forja</p>
                          <div className="mt-4 grid gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Conceito</label>
                              <Input
                                placeholder="Ex.: dinastias em ruina, guerra fria entre casas"
                                value={form.forge.concept}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    forge: { ...prev.forge, concept: e.target.value },
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Tom</label>
                              <Input
                                placeholder="Ex.: tragico, politico, heroico e sombrio"
                                value={form.forge.tone}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    forge: { ...prev.forge, tone: e.target.value },
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Escopo</label>
                              <Input
                                placeholder="Ex.: uma corte, um reino caindo, um continente em guerra"
                                value={form.forge.scope}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    forge: { ...prev.forge, scope: e.target.value },
                                  }))
                                }
                              />
                            </div>
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
                              <label className="text-sm font-medium text-foreground">Pilares iniciais</label>
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
                                      onClick={() =>
                                        setForm((prev) => ({
                                          ...prev,
                                          forge: {
                                            ...prev.forge,
                                            pillars: active
                                              ? prev.forge.pillars.filter((value) => value !== pillar)
                                              : [...prev.forge.pillars, pillar].slice(0, 8),
                                          },
                                        }))
                                      }
                                    >
                                      {pillar}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
                      </div>
                      <div className="shrink-0 border-t border-white/10 px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            type="button"
                            onClick={() => setDialogOpen(false)}
                            className="text-muted-foreground"
                            disabled={submitting}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={submitting}>
                            {submitting ? "Abrindo forja..." : "Criar mundo e abrir forja"}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura de catalogo</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Universos listados</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{sortedWorlds.length}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Foco da entrega</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Entrada premium e navegacao clara</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Proxima camada</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Codex do Mundo</p>
                </div>
              </div>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">O que muda aqui</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                  <Globe2 className="mt-0.5 h-4 w-4 text-primary/90" />
                  <span>Biblioteca de mundos com leitura premium, contexto e transicao direta para o cockpit.</span>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                  <BookMarked className="mt-0.5 h-4 w-4 text-amber-300/80" />
                  <span>Fluxos antigos continuam vivos no backend, mas o front agora passa a apontar para o novo produto.</span>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                  <ScrollText className="mt-0.5 h-4 w-4 text-sky-200/80" />
                  <span>O mundo deixa de ser uma linha em lista e passa a ser a porta oficial para a operacao do mestre.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="border-white/10" />

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[320px] animate-pulse rounded-[30px] border border-white/10 bg-white/4"
            />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Falha ao carregar"
          description={error}
          icon={<Clock3 className="h-6 w-6" />}
          action={
            <Button onClick={() => loadWorlds(currentTab)}>
              Tentar novamente
            </Button>
          }
        />
      ) : sortedWorlds.length === 0 ? (
        <EmptyState
          title={currentTab === "ACTIVE" ? "Nenhum mundo ativo" : "Nenhum mundo arquivado"}
          description={
            currentTab === "ACTIVE"
              ? "Comece criando o primeiro universo da sua mesa."
              : "Mundos arquivados voltarao a aparecer aqui quando forem movidos para fora da operacao ativa."
          }
          icon={<Globe2 className="h-6 w-6" />}
          action={
            currentTab === "ACTIVE" ? (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo mundo
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedWorlds.map((world) => (
            <Card
              key={world.id}
              className="group overflow-hidden rounded-[30px] border-white/10 bg-black/20 transition duration-200 hover:-translate-y-1 hover:border-primary/25"
              onClick={() => router.push(`/app/worlds/${world.id}`)}
            >
              <CardContent className="p-0">
                <div
                  className="flex min-h-[320px] flex-col justify-between p-6"
                  style={{
                    backgroundImage: world.coverImage
                      ? `linear-gradient(180deg, rgba(8,8,12,0.14), rgba(8,8,12,0.9)), url(${world.coverImage})`
                      : "linear-gradient(135deg, rgba(188,74,63,0.72), rgba(14,10,12,0.92))",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge className="border-white/12 bg-black/28 text-white">
                      {currentTab === "ACTIVE" ? "Ativo" : "Arquivado"}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.18em] text-white/60">
                        {formatDate(world.updatedAt)}
                      </span>
                      {currentTab === "ACTIVE" ? (
                        <button
                          type="button"
                          className="rounded-full p-1 text-white/50 transition hover:bg-red-500/20 hover:text-red-300"
                          onClick={(event) => handleArchive(event, world.id)}
                          title="Arquivar mundo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-[0.04em] text-white">
                        {world.title}
                      </h2>
                      <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/72">
                        {world.description || "Sem descricao registrada para este mundo."}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/28 p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">Criado em</p>
                        <p className="mt-2 text-sm font-semibold text-white">{formatDate(world.createdAt)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/28 p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">Estado</p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {currentTab === "ACTIVE" ? "Em operacao" : "Fora do fluxo ativo"}
                        </p>
                      </div>
                    </div>

                    <Button className="w-full justify-between bg-white text-black hover:bg-white/90">
                      Entrar no cockpit
                      <Globe2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
