"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type LegacyWorldBridgeProps = {
  title: string;
  description: string;
  targetLabel: string;
  segment: "characters" | "npcs" | "locations" | "diary" | "compendium";
};

export function LegacyWorldBridge({
  title,
  description,
  targetLabel,
  segment,
}: LegacyWorldBridgeProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const [targetHref, setTargetHref] = useState<string>("/app/worlds");

  useEffect(() => {
    let cancelled = false;

    async function resolveTarget() {
      try {
        const res = await fetch("/api/worlds", { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok || !payload.data?.length) {
          if (!cancelled) {
            setStatus("fallback");
            setTargetHref("/app/worlds");
          }
          return;
        }

        const firstWorld = payload.data[0];
        const href = `/app/worlds/${firstWorld.id}/${segment}`;
        if (!cancelled) {
          setTargetHref(href);
          setStatus("ready");
        }

        window.setTimeout(() => {
          if (!cancelled) router.replace(href);
        }, 700);
      } catch {
        if (!cancelled) {
          setStatus("fallback");
          setTargetHref("/app/worlds");
        }
      }
    }

    resolveTarget();

    return () => {
      cancelled = true;
    };
  }, [router, segment]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
      <section className="world-hero w-full rounded-[32px] px-6 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Fluxo legado</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">Atualizacao 1</Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Redirecionando para o novo centro</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.replace(targetHref)}>
                Ir para {targetLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" onClick={() => router.push("/app/worlds")}>
                Abrir mundos
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura da transicao</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                  <Compass className="mt-0.5 h-4 w-4 text-primary/80" />
                  <span>As superfices globais antigas sairam do caminho principal do produto.</span>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                  <Sparkles className="mt-0.5 h-4 w-4 text-amber-300/80" />
                  <span>
                    {status === "loading"
                      ? "Localizando o primeiro mundo disponivel para entrar no fluxo novo."
                      : status === "ready"
                        ? `Destino encontrado. Entrando em ${targetLabel}.`
                        : "Nenhum mundo ativo encontrado. Abrindo a biblioteca de mundos."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
