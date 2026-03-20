"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Search, Shield, Sparkles, Swords } from "lucide-react";

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
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CampaignCreateSchema } from "@/lib/validators";

type Campaign = {
  id: string;
  name: string;
  description?: string | null;
  system: string;
  updatedAt: string;
  roomCode: string;
  world: { title: string };
};

const initialForm = {
  name: "",
  description: "",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function WorldCampaignsPage() {
  const params = useParams();
  const router = useRouter();
  const worldId = params?.id as string;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns?worldId=${worldId}`, { cache: "no-store" });
      const payload = await res.json().catch(() => ({}));
      if (res.ok) setCampaigns(payload.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    if (worldId) void loadCampaigns();
  }, [loadCampaigns, worldId]);

  async function handleCreate(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setFormError(null);
    const parsed = CampaignCreateSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Dados invalidos");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, worldId }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Nao foi possivel criar a campanha");

      setForm(initialForm);
      setDialogOpen(false);
      await loadCampaigns();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Erro ao salvar campanha");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return campaigns;
    return campaigns.filter((campaign) => {
      return [campaign.name, campaign.description ?? "", campaign.roomCode]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [campaigns, search]);

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Campanhas do mundo</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {campaigns.length} campanhas
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Nucleo operacional</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                Campanhas vivas, prontas para entrar em campo.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Esta superficie agora fala a mesma lingua do cockpit principal. Cada campanha e uma frente ativa dentro do mundo, com sala, contexto e retorno rapido para a mesa.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Nova campanha
                  </Button>
                </DialogTrigger>
                <DialogContent className="chrome-panel border-white/10 bg-card/85">
                  <DialogHeader>
                    <DialogTitle>Nova campanha</DialogTitle>
                    <DialogDescription>Crie uma nova saga dentro deste mundo.</DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleCreate}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nome</label>
                      <Input
                        placeholder="Ex.: A Coroa das Cinzas"
                        value={form.name}
                        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Descricao</label>
                      <Textarea
                        placeholder="Resumo curto da campanha"
                        rows={4}
                        value={form.description}
                        onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                      />
                    </div>
                    {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? "Criando..." : "Criar campanha"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => router.push(`/app/worlds/${worldId}`)}>
                Voltar ao cockpit
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura da frente</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ativas</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{campaigns.length}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Papel</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Entrar na mesa</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Direcao</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Mesa viva e memoria</p>
                </div>
              </div>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Busca rapida</p>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nome, descricao ou codigo da sala"
                  className="h-12 rounded-2xl border-white/10 bg-black/25 pl-11"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[250px] animate-pulse rounded-[28px] border border-white/10 bg-white/4" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={campaigns.length === 0 ? "Nenhuma campanha ainda" : "Nenhuma campanha encontrada"}
          description={
            campaigns.length === 0
              ? "Crie a primeira campanha deste mundo para abrir o fluxo de mesa."
              : "Ajuste a busca para encontrar outra campanha."
          }
          icon={<Swords className="h-6 w-6" />}
          action={
            campaigns.length === 0 ? (
              <Button onClick={() => setDialogOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Criar campanha
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((campaign, index) => (
            <Link key={campaign.id} href={`/app/campaign/${campaign.id}`} className="block">
              <Card className="group overflow-hidden rounded-[28px] border-white/10 bg-black/20 transition duration-200 hover:-translate-y-1 hover:border-primary/25">
                <CardContent className="p-0">
                  <div
                    className="flex min-h-[260px] flex-col justify-between p-5"
                    style={{
                      background:
                        index % 2 === 0
                          ? "linear-gradient(135deg, rgba(188,74,63,0.15), rgba(10,10,15,0.9))"
                          : "linear-gradient(135deg, rgba(213,162,64,0.12), rgba(10,10,15,0.9))",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="border-white/10 bg-black/28 text-white">{campaign.system}</Badge>
                      <span className="text-xs uppercase tracking-[0.18em] text-white/55">
                        {formatDate(campaign.updatedAt)}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h2 className="line-clamp-2 text-2xl font-black uppercase tracking-[0.04em] text-white">
                          {campaign.name}
                        </h2>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/70">
                          {campaign.description || "Sem descricao registrada para esta campanha."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/55">
                            <Shield className="h-3.5 w-3.5" />
                            Sala
                          </div>
                          <p className="mt-2 text-sm font-semibold text-white">{campaign.roomCode}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/55">
                            <Swords className="h-3.5 w-3.5" />
                            Mundo
                          </div>
                          <p className="mt-2 text-sm font-semibold text-white">{campaign.world.title}</p>
                        </div>
                      </div>

                      <Button className="w-full justify-between bg-white text-black hover:bg-white/90">
                        Abrir campanha
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
