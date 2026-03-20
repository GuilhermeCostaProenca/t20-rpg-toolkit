"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, FileUp, Library, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function UploadDocPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/ruleset-docs", {
        method: "POST",
        body: formData,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Falha no upload");
      setStatus("Documento enviado com sucesso.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar";
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.8fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Upload local
              </div>
              <div className="rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                Biblioteca documental
              </div>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Enviar documento</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                Coloque PDFs e textos de regras no arquivo do mestre.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Esta superficie continua fora do cockpit principal, mas agora fala a mesma lingua visual da Atualizacao 1.
                Use para alimentar o acervo do sistema e a busca textual.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href="/app/library">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para biblioteca
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura desta superficie</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                  <Library className="mt-0.5 h-4 w-4 text-primary/80" />
                  <span>Acervo de suporte para regras, PDFs e memoria textual.</span>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                  <Sparkles className="mt-0.5 h-4 w-4 text-amber-300/80" />
                  <span>Funciona em ambiente local e permanece util sem entrar no centro do fluxo world-scoped.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Card className="chrome-panel rounded-[30px] border-white/10 bg-card/80">
        <CardContent className="p-6">
          <form
            className="space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget as HTMLFormElement);
              await handleSubmit(formData);
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Titulo</label>
                <Input name="title" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ruleset</label>
                <Input name="rulesetId" defaultValue="tormenta20" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tipo</label>
                <Input name="type" defaultValue="pdf" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Paginas</label>
                <Input name="pages" type="number" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Arquivo</label>
                <Input name="file" type="file" accept="application/pdf" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Texto para busca</label>
              <Textarea
                name="textIndex"
                rows={5}
                placeholder="Cole aqui o texto indexado, resumo ou anotacoes para busca textual."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={loading}>
                <FileUp className="mr-2 h-4 w-4" />
                {loading ? "Enviando..." : "Enviar documento"}
              </Button>
              {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
