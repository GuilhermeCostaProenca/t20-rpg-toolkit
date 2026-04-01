"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { BookOpen, Calendar, Clock, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { useAppFeedback } from "@/components/app-feedback-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Campaign = {
  id: string;
  name: string;
};

type Session = {
  id: string;
  title: string;
  description?: string | null;
  campaignId: string;
  scheduledAt?: string | null;
  status: string;
  campaign?: Campaign | null;
};

const initialForm = {
  title: "",
  description: "",
  campaignId: "",
  scheduledAt: "",
  status: "planned",
};
const createSessionFormSchema = z.object({
  title: z.string().trim().min(2, "Titulo precisa de pelo menos 2 caracteres"),
  description: z.string().optional(),
  campaignId: z.string().trim().min(1, "Selecione uma campanha"),
  scheduledAt: z.string().optional(),
  status: z.enum(["planned", "active", "finished"]),
});

function formatDate(value?: string | null) {
  if (!value) return "Sem data";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value?: string | null) {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WorldDiaryPage() {
  const params = useParams();
  const worldId = params?.id as string;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const createForm = useForm<typeof initialForm>({
    resolver: zodResolver(createSessionFormSchema),
    defaultValues: initialForm,
  });
  const { notifyError, notifySuccess } = useAppFeedback();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionsRes, campaignsRes] = await Promise.all([
        fetch(`/api/sessions?worldId=${worldId}`, { cache: "no-store" }),
        fetch(`/api/worlds/${worldId}`, { cache: "no-store" }),
      ]);

      const sessionsData = await sessionsRes.json().catch(() => ({}));
      const worldData = await campaignsRes.json().catch(() => ({}));

      const nextCampaigns = worldData.data?.campaigns ?? [];
      setSessions(sessionsData.data ?? []);
      setCampaigns(nextCampaigns);

      if (nextCampaigns.length > 0 && !createForm.getValues("campaignId")) {
        createForm.setValue("campaignId", nextCampaigns[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [createForm, worldId]);

  useEffect(() => {
    if (worldId) void loadData();
  }, [loadData, worldId]);

  async function handleCreate(values: typeof initialForm) {
    createForm.clearErrors("root");
    try {
      const payload = {
        ...values,
        worldId,
        scheduledAt: values.scheduledAt ? new Date(values.scheduledAt).toISOString() : undefined,
      };

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro ao criar sessao");

      const currentCampaignId = createForm.getValues("campaignId");
      setCreateOpen(false);
      createForm.reset({ ...initialForm, campaignId: currentCampaignId });
      notifySuccess("Sessao agendada.");
      await loadData();
    } catch (error) {
      console.error(error);
      createForm.setError("root", {
        type: "server",
        message: error instanceof Error ? error.message : "Erro inesperado ao agendar sessao",
      });
      notifyError("Falha ao agendar sessao", error instanceof Error ? error.message : "Erro inesperado ao agendar sessao", true);
    }
  }

  const scheduledCount = sessions.filter((session) => session.status === "planned").length;
  const finishedCount = sessions.filter((session) => session.status === "finished").length;
  const orderedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) => {
        const aValue = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const bValue = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        return bValue - aValue;
      }),
    [sessions]
  );

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Diario do mundo</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {sessions.length} sessoes
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Linha de sessao</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                Agenda, memoria curta e rastro das mesas.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                O diario deixa de ser uma lista utilitaria. Agora ele organiza a cadencia das sessoes e mostra o rastro vivo das campanhas dentro do mundo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Dialog
                open={createOpen}
                onOpenChange={(open) => {
                  setCreateOpen(open);
                  if (!open) createForm.clearErrors("root");
                }}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Agendar sessao
                  </Button>
                </DialogTrigger>
                <DialogContent className="chrome-panel border-white/10 bg-card/85">
                  <DialogHeader>
                    <DialogTitle>Nova sessao</DialogTitle>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titulo</FormLabel>
                            <FormControl>
                              <Input value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="campaignId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campanha</FormLabel>
                            <FormControl>
                              <SelectField
                                className="h-10 rounded-2xl border-white/10 bg-black/25 px-4 text-sm"
                                value={field.value}
                                onValueChange={field.onChange}
                                options={campaigns.map((campaign) => ({
                                  value: campaign.id,
                                  label: campaign.name,
                                }))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="scheduledAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data e hora</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" value={field.value ?? ""} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notas iniciais</FormLabel>
                            <FormControl>
                              <Textarea rows={4} value={field.value ?? ""} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {createForm.formState.errors.root?.message ? (
                        <p className="text-sm text-destructive">{createForm.formState.errors.root.message}</p>
                      ) : null}
                      <Button type="submit" className="w-full" disabled={createForm.formState.isSubmitting}>
                        {createForm.formState.isSubmitting ? "Salvando..." : "Salvar sessao"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura da agenda</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Planejadas</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{scheduledCount}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Concluidas</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{finishedCount}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Campanhas</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{campaigns.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-[160px] animate-pulse rounded-[28px] border border-white/10 bg-white/4" />
          ))}
        </div>
      ) : orderedSessions.length === 0 ? (
        <EmptyState
          title="Nenhuma sessao registrada"
          description="Agende a primeira sessao para comecar a formar a linha viva do mundo."
          icon={<BookOpen className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-4">
          {orderedSessions.map((session, index) => (
            <Card key={session.id} className="overflow-hidden rounded-[28px] border-white/10 bg-black/20">
              <CardContent className="p-0">
                <div
                  className="grid gap-4 p-5 md:grid-cols-[220px_minmax(0,1fr)]"
                  style={{
                    background:
                      index % 2 === 0
                        ? "linear-gradient(135deg, rgba(188,74,63,0.1), rgba(10,10,15,0.92))"
                        : "linear-gradient(135deg, rgba(213,162,64,0.08), rgba(10,10,15,0.92))",
                  }}
                >
                  <div className="rounded-[24px] border border-white/10 bg-black/28 p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/55">
                      <Calendar className="h-3.5 w-3.5" />
                      Sessao
                    </div>
                    <p className="mt-3 text-lg font-black uppercase tracking-[0.04em] text-white">
                      {formatDate(session.scheduledAt)}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-white/70">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(session.scheduledAt)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-white/10 bg-black/28 text-white">{session.status}</Badge>
                      <Badge className="border-primary/20 bg-primary/10 text-primary">
                        {session.campaign?.name ?? "Campanha nao informada"}
                      </Badge>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                        {session.title}
                      </h2>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                        {session.description || "Sem notas iniciais registradas para esta sessao."}
                      </p>
                    </div>
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
