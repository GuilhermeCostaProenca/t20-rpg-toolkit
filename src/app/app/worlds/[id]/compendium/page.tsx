"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Book, BookOpenText, FileText, Search, Sparkles, Waypoints } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAppFeedback } from "@/components/app-feedback-provider";
import { inferLoreCampaignIds, inferLorePrepContexts, parseLoreTextIndex, type LorePrepContext, type LorePrepFocus } from "@/lib/lore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type LoreEntity = { id: string; name: string; type: string; campaign?: { id: string; name: string } | null };
type WorldContext = {
  campaigns?: Array<{ id: string; name: string }>;
  nextSession?: { id: string; title: string; scheduledAt: string; campaign: { id: string; name: string } } | null;
};

type CompendiumDoc = {
  id: string;
  title: string;
  createdAt: string;
  filePath: string;
  type: string;
  pages?: number | null;
  rulesetId: string;
  textIndex?: string | null;
};

type DocFilter = "ALL" | "RULE" | "LORE";
const createRuleFormSchema = z.object({
  title: z.string().trim().min(2, "Titulo precisa de pelo menos 2 caracteres"),
  content: z.string().optional(),
});
const initialCreateRuleForm = {
  title: "",
  content: "",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function WorldCompendiumPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const worldId = params?.id as string;
  const initialFilter = (searchParams.get("view")?.toUpperCase() as DocFilter | null) ?? "ALL";

  const [items, setItems] = useState<CompendiumDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("text");
  const [search, setSearch] = useState("");
  const [docFilter, setDocFilter] = useState<DocFilter>(initialFilter === "RULE" || initialFilter === "LORE" ? initialFilter : "ALL");
  const [contextFilter, setContextFilter] = useState<LorePrepContext | "ALL">("ALL");
  const [campaignFilter, setCampaignFilter] = useState<string>("ALL");
  const [prepFocusFilter, setPrepFocusFilter] = useState<LorePrepFocus | "ALL">("ALL");
  const [entities, setEntities] = useState<LoreEntity[]>([]);
  const [world, setWorld] = useState<WorldContext | null>(null);
  const createForm = useForm<typeof initialCreateRuleForm>({
    resolver: zodResolver(createRuleFormSchema),
    defaultValues: initialCreateRuleForm,
  });
  const { notifyError, notifySuccess } = useAppFeedback();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, codexRes, worldRes] = await Promise.all([
        fetch(`/api/ruleset-docs?worldId=${worldId}`, { cache: "no-store" }),
        fetch(`/api/worlds/${worldId}/codex?limit=200`, { cache: "no-store" }),
        fetch(`/api/worlds/${worldId}`, { cache: "no-store" }),
      ]);
      const payload = await docsRes.json().catch(() => ({}));
      const codexPayload = await codexRes.json().catch(() => ({}));
      const worldPayload = await worldRes.json().catch(() => ({}));
      setItems(payload.data ?? []);
      setEntities((codexPayload.data?.entities ?? []) as LoreEntity[]);
      setWorld((worldPayload.data ?? null) as WorldContext | null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    if (worldId) void loadData();
  }, [loadData, worldId]);

  useEffect(() => {
    const nextFilter = (searchParams.get("view")?.toUpperCase() as DocFilter | null) ?? "ALL";
    if (nextFilter === "RULE" || nextFilter === "LORE" || nextFilter === "ALL") {
      setDocFilter(nextFilter);
    }
  }, [searchParams]);

  async function handleCreate(values: typeof initialCreateRuleForm) {
    createForm.clearErrors("root");
    try {
      const formData = new FormData();
      formData.append("worldId", worldId);
      formData.append("title", values.title);
      formData.append("type", "RULE");

      if (activeTab === "text") {
        if (!values.content?.trim()) {
          createForm.setError("content", { type: "manual", message: "Informe o conteudo da regra" });
          return;
        }
        formData.append("content", values.content);
      } else if (file) {
        formData.append("file", file);
      } else {
        createForm.setError("root", { type: "manual", message: "Selecione um arquivo para upload" });
        return;
      }

      const res = await fetch("/api/ruleset-docs", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Erro ao criar regra");

      setCreateOpen(false);
      createForm.reset(initialCreateRuleForm);
      setFile(null);
      notifySuccess("Regra salva.");
      await loadData();
    } catch (error) {
      console.error(error);
      createForm.setError("root", {
        type: "server",
        message: error instanceof Error ? error.message : "Erro inesperado ao salvar regra",
      });
      notifyError(
        "Falha ao salvar regra",
        error instanceof Error ? error.message : "Erro inesperado ao salvar regra",
        true
      );
    }
  }

  const counts = useMemo(
    () => ({
      total: items.length,
      rules: items.filter((item) => item.type === "RULE").length,
      lore: items.filter((item) => item.type === "LORE").length,
    }),
    [items]
  );

  const loreSections = useMemo(() => {
    const countsBySection = new Map<string, number>();
    for (const item of items.filter((doc) => doc.type === "LORE")) {
      const section = parseLoreTextIndex(item.textIndex).section || "Sem secao";
      countsBySection.set(section, (countsBySection.get(section) ?? 0) + 1);
    }
    return Array.from(countsBySection.entries()).map(([section, total]) => ({ section, total }));
  }, [items]);

  const loreContexts = useMemo(() => {
    const countsByContext = new Map<LorePrepContext, number>();
    for (const item of items.filter((doc) => doc.type === "LORE")) {
      const lore = parseLoreTextIndex(item.textIndex);
      const linked = lore.linkedEntityIds
        .map((id) => entities.find((entity) => entity.id === id))
        .filter((entity): entity is LoreEntity => Boolean(entity));
      for (const context of inferLorePrepContexts(linked)) {
        countsByContext.set(context, (countsByContext.get(context) ?? 0) + 1);
      }
    }
    return Array.from(countsByContext.entries()).map(([context, total]) => ({ context, total }));
  }, [entities, items]);

  const lorePrepFocuses = useMemo(() => {
    const countsByFocus = new Map<LorePrepFocus, number>();
    for (const item of items.filter((doc) => doc.type === "LORE")) {
      const lore = parseLoreTextIndex(item.textIndex);
      for (const focus of lore.prepFocuses) {
        countsByFocus.set(focus, (countsByFocus.get(focus) ?? 0) + 1);
      }
    }
    return Array.from(countsByFocus.entries()).map(([focus, total]) => ({ focus, total }));
  }, [items]);

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return items.filter((item) => {
      const lore = item.type === "LORE" ? parseLoreTextIndex(item.textIndex) : null;
      const linked = lore
        ? lore.linkedEntityIds
            .map((id) => entities.find((entity) => entity.id === id))
            .filter((entity): entity is LoreEntity => Boolean(entity))
        : [];
      const contexts = lore ? inferLorePrepContexts(linked) : [];
      const campaignIds = lore ? inferLoreCampaignIds(linked) : [];
      const filterMatches = docFilter === "ALL" || item.type === docFilter;
      const contextMatches = contextFilter === "ALL" || (item.type === "LORE" && contexts.includes(contextFilter));
      const prepFocusMatches = prepFocusFilter === "ALL" || (item.type === "LORE" && lore?.prepFocuses.includes(prepFocusFilter));
      const nextCampaignId = world?.nextSession?.campaign?.id ?? null;
      const campaignMatches =
        campaignFilter === "ALL"
          ? true
          : campaignFilter === "GENERAL"
            ? item.type === "LORE" ? campaignIds.length === 0 : false
            : campaignFilter === "NEXT"
              ? item.type === "LORE" && (nextCampaignId ? campaignIds.includes(nextCampaignId) : false)
              : item.type === "LORE" && campaignIds.includes(campaignFilter);
      const textMatches =
        !normalized ||
        [
          item.title,
          item.rulesetId,
          item.type,
          lore?.summary,
          lore?.section,
          lore?.visibility,
          lore?.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return filterMatches && contextMatches && prepFocusMatches && campaignMatches && textMatches;
    });
  }, [campaignFilter, contextFilter, docFilter, entities, items, prepFocusFilter, search, world]);

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Compendio do mundo</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">{counts.total} documentos</Badge>
              <Badge className="border-white/10 bg-white/5 text-white/80">{counts.rules} regras</Badge>
              <Badge className="border-violet-300/20 bg-violet-300/10 text-violet-100">{counts.lore} blocos de lore</Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Arquivo canonico</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                Regras, documentos e memoria textual em contexto de mundo.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                O compendio agora conversa com o lore-base do mundo, sem deixar o corpus preso so a oficina da Forja.
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
                    Nova regra
                  </Button>
                </DialogTrigger>
                <DialogContent className="chrome-panel border-white/10 bg-card/85">
                  <DialogHeader>
                    <DialogTitle>Adicionar ao compendio</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text">Texto</TabsTrigger>
                      <TabsTrigger value="file">PDF ou arquivo</TabsTrigger>
                    </TabsList>
                    <Form {...createForm}>
                      <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4 pt-4">
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
                        <TabsContent value="text" className="space-y-2">
                          <FormField
                            control={createForm.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Conteudo</FormLabel>
                                <FormControl>
                                  <Textarea className="min-h-[160px]" value={field.value ?? ""} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                        <TabsContent value="file" className="space-y-2">
                          <label className="text-sm font-medium">Arquivo</label>
                          <Input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                        </TabsContent>
                        {createForm.formState.errors.root?.message ? (
                          <p className="text-sm text-destructive">{createForm.formState.errors.root.message}</p>
                        ) : null}
                        <Button type="submit" className="w-full" disabled={createForm.formState.isSubmitting}>
                          {createForm.formState.isSubmitting ? "Salvando..." : "Salvar documento"}
                        </Button>
                      </form>
                    </Form>
                  </Tabs>
                </DialogContent>
              </Dialog>

              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href={`/app/worlds/${worldId}/forge/lore`}>
                  <BookOpenText className="mr-2 h-4 w-4" />
                  Abrir lore-base
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura do acervo</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Documentos</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{counts.total}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Foco</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{docFilter === "LORE" ? "Corpus do mundo" : docFilter === "RULE" ? "Regras operacionais" : "Arquivo completo"}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Secoes de lore</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{loreSections.slice(0, 2).map((item) => item.section).join(" · ") || "Sem corpus ainda"}</p>
                </div>
              </div>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Busca rapida</p>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Titulo, tipo, secao, tag ou visibilidade" className="h-12 rounded-2xl border-white/10 bg-black/25 pl-11" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className={docFilter === "ALL" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setDocFilter("ALL")}>Tudo</Button>
                <Button type="button" variant="outline" className={docFilter === "RULE" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setDocFilter("RULE")}>Regras</Button>
                <Button type="button" variant="outline" className={docFilter === "LORE" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setDocFilter("LORE")}>Lore-base</Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className={contextFilter === "ALL" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setContextFilter("ALL")}>Todos os contextos</Button>
                {loreContexts.map((item) => (
                  <Button key={item.context} type="button" variant="outline" className={contextFilter === item.context ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setContextFilter(item.context)}>
                    {item.context} · {item.total}
                  </Button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className={campaignFilter === "ALL" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setCampaignFilter("ALL")}>Todas as campanhas</Button>
                <Button type="button" variant="outline" className={campaignFilter === "GENERAL" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setCampaignFilter("GENERAL")}>Base do mundo</Button>
                {world?.nextSession?.campaign?.id ? (
                  <Button type="button" variant="outline" className={campaignFilter === "NEXT" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setCampaignFilter("NEXT")}>
                    Proxima mesa · {world.nextSession.campaign.name}
                  </Button>
                ) : null}
                {(world?.campaigns ?? []).slice(0, 5).map((campaign) => (
                  <Button key={campaign.id} type="button" variant="outline" className={campaignFilter === campaign.id ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setCampaignFilter(campaign.id)}>
                    {campaign.name}
                  </Button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className={prepFocusFilter === "ALL" ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setPrepFocusFilter("ALL")}>Todos os recortes</Button>
                {lorePrepFocuses.map((item) => (
                  <Button key={item.focus} type="button" variant="outline" className={prepFocusFilter === item.focus ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5"} onClick={() => setPrepFocusFilter(item.focus)}>
                    {item.focus} · {item.total}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[140px] animate-pulse rounded-[28px] border border-white/10 bg-white/4" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? "Compendio vazio" : "Nenhum documento encontrado"}
          description={items.length === 0 ? "Adicione a primeira regra ou documento textual deste mundo." : "Ajuste a busca para encontrar outro documento."}
          icon={<Book className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((item, index) => {
            const lore = item.type === "LORE" ? parseLoreTextIndex(item.textIndex) : null;
            const linked = lore
              ? lore.linkedEntityIds
                  .map((id) => entities.find((entity) => entity.id === id))
                  .filter((entity): entity is LoreEntity => Boolean(entity))
              : [];
            const contexts = lore ? inferLorePrepContexts(linked) : [];
            const campaignIds = lore ? inferLoreCampaignIds(linked) : [];
            return (
              <Card key={item.id} className="overflow-hidden rounded-[28px] border-white/10 bg-black/20 transition duration-200 hover:border-primary/25">
                <CardContent className="p-0">
                  <div
                    className="grid gap-4 p-5 md:grid-cols-[220px_minmax(0,1fr)_220px]"
                    style={{
                      background:
                        item.type === "LORE"
                          ? "linear-gradient(135deg, rgba(118,73,188,0.10), rgba(10,10,15,0.92))"
                          : index % 2 === 0
                            ? "linear-gradient(135deg, rgba(188,74,63,0.08), rgba(10,10,15,0.92))"
                            : "linear-gradient(135deg, rgba(213,162,64,0.06), rgba(10,10,15,0.92))",
                    }}
                  >
                    <div className="rounded-[24px] border border-white/10 bg-black/28 p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/55">
                        {item.type === "LORE" ? <BookOpenText className="h-3.5 w-3.5" /> : <Book className="h-3.5 w-3.5" />}
                        Documento
                      </div>
                      <p className="mt-3 text-sm font-semibold text-white">{item.rulesetId}</p>
                      <p className="mt-2 text-sm text-white/70">{formatDate(item.createdAt)}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-white/10 bg-black/28 text-white">{item.type}</Badge>
                        {item.type === "LORE" && lore ? (
                          <>
                            <Badge className="border-violet-300/20 bg-violet-300/10 text-violet-100">{lore.section || "Lore"}</Badge>
                            <Badge className={lore.visibility === "MASTER" ? "border-red-300/20 bg-red-300/10 text-red-100" : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"}>
                              {lore.visibility === "MASTER" ? "Somente mestre" : "Revelavel"}
                            </Badge>
                            {contexts.map((context) => (
                              <Badge key={context} className="border-white/10 bg-black/25 text-white/70">{context}</Badge>
                            ))}
                            {lore.prepFocuses.map((focus) => (
                              <Badge key={focus} className="border-violet-300/20 bg-violet-300/10 text-violet-100">{focus}</Badge>
                            ))}
                            {campaignIds.slice(0, 2).map((campaignId) => {
                              const campaignName = world?.campaigns?.find((campaign) => campaign.id === campaignId)?.name;
                              return campaignName ? <Badge key={campaignId} className="border-amber-300/20 bg-amber-300/10 text-amber-100">{campaignName}</Badge> : null;
                            })}
                          </>
                        ) : (
                          <Badge className="border-primary/20 bg-primary/10 text-primary">{item.pages ? `${item.pages} paginas` : "Paginas nao informadas"}</Badge>
                        )}
                      </div>
                      <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">{item.title}</h2>
                      {item.type === "LORE" && lore ? (
                        <div className="space-y-3">
                          <p className="text-sm leading-6 text-muted-foreground">{lore.summary || "Bloco de lore sem resumo registrado ainda."}</p>
                          {lore.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {lore.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} className="border-white/10 bg-white/5 text-white/80">{tag}</Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 md:justify-end">
                      {item.type === "LORE" ? (
                        <Button asChild variant="outline" className="w-full border-white/10 bg-white/5 md:w-auto">
                          <Link href={`/app/worlds/${worldId}/forge/lore?docId=${item.id}`}>
                            <Waypoints className="mr-2 h-4 w-4" />
                            Abrir na forja
                          </Link>
                        </Button>
                      ) : null}
                      <Button variant="outline" className="w-full border-white/10 bg-white/5 md:w-auto" onClick={() => window.open(item.filePath, "_blank")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Abrir
                      </Button>
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
