"use client";

import Link from "next/link";
import { Globe2, Library, RadioTower, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CommunityPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
      <section className="world-hero w-full rounded-[32px] px-6 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Quarentena visual</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">Fora da Atualizacao 1</Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Superficie legada</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                Comunidade ainda nao faz parte do novo fluxo central.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Esta area foi retirada do centro do produto para dar lugar ao shell, aos mundos e ao cockpit.
                Enquanto essa frente nao recebe escopo proprio, o caminho principal continua por mundos e biblioteca documental.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/app/worlds">
                  <Globe2 className="mr-2 h-4 w-4" />
                  Abrir mundos
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href="/app/library">
                  <Library className="mr-2 h-4 w-4" />
                  Abrir biblioteca
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Estado atual</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                  <ShieldAlert className="mt-0.5 h-4 w-4 text-primary/80" />
                  <span>Sem fluxo operacional aprovado para a primeira grande atualizacao do front.</span>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                  <RadioTower className="mt-0.5 h-4 w-4 text-amber-300/80" />
                  <span>Quando essa frente entrar, ela deve nascer integrada ao novo shell, e nao como pagina isolada.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
