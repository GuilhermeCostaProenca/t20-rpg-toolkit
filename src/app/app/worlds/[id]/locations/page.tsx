"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Image as ImageIcon, MapPin, Search, Sparkles } from "lucide-react";

import { RevealButton } from "@/components/reveal-button";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Campaign = {
  id: string;
  name: string;
};

type LocationDoc = {
  id: string;
  title: string;
  filePath: string;
  createdAt: string;
  type: string;
};

function isImage(path: string) {
  return /\.(jpg|jpeg|png|webp)$/i.test(path);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function WorldLocationsPage() {
  const params = useParams();
  const worldId = params?.id as string;

  const [items, setItems] = useState<LocationDoc[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("text");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, worldRes] = await Promise.all([
        fetch(`/api/ruleset-docs?worldId=${worldId}&type=LOCATION`, { cache: "no-store" }),
        fetch(`/api/worlds/${worldId}`, { cache: "no-store" }),
      ]);

      const payload = await res.json().catch(() => ({}));
      const worldPayload = await worldRes.json().catch(() => ({}));

      setItems(payload.data ?? []);
      setCampaigns(worldPayload.data?.campaigns ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    if (worldId) void loadData();
  }, [loadData, worldId]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("worldId", worldId);
      formData.append("title", title);
      formData.append("type", "LOCATION");

      if (activeTab === "text") {
        formData.append("content", content);
      } else if (file) {
        formData.append("file", file);
      } else {
        return;
      }

      const response = await fetch("/api/ruleset-docs", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Erro ao criar local");

      setCreateOpen(false);
      setTitle("");
      setContent("");
      setFile(null);
      await loadData();
    } catch (error) {
      alert("Falha ao salvar local");
      console.error(error);
    }
  }

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => item.title.toLowerCase().includes(normalized));
  }, [items, search]);

  const imageCount = items.filter((item) => isImage(item.filePath)).length;

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Locais do mundo</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {items.length} registros
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Atlas narrativo</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                Mapa emocional, geografico e visual do mundo.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Esta superficie agora assume de vez o papel de atlas do mestre. Lugares, mapas e referencias visuais ficam juntos, com reveal pronto para a mesa.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Novo local
                  </Button>
                </DialogTrigger>
                <DialogContent className="chrome-panel border-white/10 bg-card/85">
                  <DialogHeader>
                    <DialogTitle>Registrar local</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text">Descricao</TabsTrigger>
                      <TabsTrigger value="file">Arquivo ou mapa</TabsTrigger>
                    </TabsList>
                    <form onSubmit={handleCreate} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nome do local</label>
                        <Input required value={title} onChange={(event) => setTitle(event.target.value)} />
                      </div>
                      <TabsContent value="text" className="space-y-2">
                        <label className="text-sm font-medium">Conteudo</label>
                        <Textarea
                          required={activeTab === "text"}
                          className="min-h-[160px]"
                          value={content}
                          onChange={(event) => setContent(event.target.value)}
                        />
                      </TabsContent>
                      <TabsContent value="file" className="space-y-2">
                        <label className="text-sm font-medium">Imagem ou PDF</label>
                        <Input
                          type="file"
                          required={activeTab === "file"}
                          onChange={(event) => setFile(event.target.files?.[0] || null)}
                        />
                      </TabsContent>
                      <Button type="submit" className="w-full">
                        Salvar local
                      </Button>
                    </form>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura do atlas</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Locais</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{items.length}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Imagens</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{imageCount}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Campanhas</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{campaigns.length}</p>
                </div>
              </div>
            </div>

            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Busca rapida</p>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nome do local"
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-[250px] animate-pulse rounded-[28px] border border-white/10 bg-white/4" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? "Nenhum local registrado" : "Nenhum local encontrado"}
          description={
            items.length === 0
              ? "Registre o primeiro local importante deste mundo."
              : "Ajuste a busca para encontrar outro local."
          }
          icon={<MapPin className="h-6 w-6" />}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((item) => {
            const image = isImage(item.filePath);
            return (
              <Card key={item.id} className="group overflow-hidden rounded-[28px] border-white/10 bg-black/20 transition duration-200 hover:-translate-y-1 hover:border-primary/25">
                <CardContent className="p-0">
                  {image ? (
                    <div className="relative h-40 w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.filePath}
                        alt={item.title}
                        className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-[linear-gradient(135deg,rgba(188,74,63,0.14),rgba(10,10,15,0.92))]">
                      <MapPin className="h-10 w-10 text-white/35" />
                    </div>
                  )}
                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="border-white/10 bg-black/28 text-white">
                        {image ? "Imagem" : "Documento"}
                      </Badge>
                      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <div>
                      <h2 className="line-clamp-2 text-xl font-black uppercase tracking-[0.04em] text-foreground">
                        {item.title}
                      </h2>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-white/10 bg-white/5"
                        onClick={() => window.open(item.filePath, "_blank")}
                      >
                        {image ? <ImageIcon className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                        Abrir
                      </Button>
                      <RevealButton
                        type={image ? "IMAGE" : "LOCATION"}
                        title={item.title}
                        imageUrl={image ? item.filePath : undefined}
                        campaigns={campaigns}
                      />
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
