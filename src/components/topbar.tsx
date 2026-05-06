"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Clock3, Compass, CornerUpRight, Swords } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SessionDialog } from "@/components/session/session-dialog";
import { CortexInput } from "@/components/ai/cortex-input";
import { Brand } from "./brand";
import { extractWorldIdFromPath } from "@/lib/active-world";

type WorldContext = {
  id: string;
  title: string;
};

function formatClock(value: Date) {
  return value.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function resolveSectionLabel(pathname: string) {
  if (pathname === "/app") return "Painel do mestre";
  if (pathname === "/app/worlds") return "Biblioteca de mundos";
  if (pathname.includes("/campaign")) return "Campanha";
  if (pathname.includes("/quadro")) return "Mesa ao Vivo";
  if (pathname.includes("/lousa")) return "Modo Lousa";
  if (pathname.includes("/memory")) return "Memoria";
  if (pathname.includes("/visual")) return "Visual";
  if (pathname.includes("/visual-library")) return "Visual";
  if (pathname.includes("/characters")) return "Personagens";
  if (pathname.includes("/npcs")) return "NPCs";
  if (pathname.includes("/locations")) return "Locais";
  if (pathname.includes("/compendium")) return "Compendio";
  if (pathname.includes("/diary")) return "Diario";
  if (pathname.includes("/map")) return "Atlas";
  return "Cockpit do mundo";
}

export function Topbar() {
  const pathname = usePathname();
  const worldId = extractWorldIdFromPath(pathname);
  const [worldContext, setWorldContext] = useState<WorldContext | null>(null);
  const [formattedClock, setFormattedClock] = useState("--:--:--");

  useEffect(() => {
    let cancelled = false;

    async function loadWorld() {
      if (!worldId) {
        setWorldContext(null);
        return;
      }

      try {
        const response = await fetch(`/api/worlds/${worldId}`, { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (!cancelled && response.ok && payload.data) {
          setWorldContext({ id: payload.data.id, title: payload.data.title });
        }
      } catch {
        if (!cancelled) setWorldContext(null);
      }
    }

    loadWorld();

    return () => {
      cancelled = true;
    };
  }, [worldId]);

  useEffect(() => {
    const timer = window.setInterval(() => setFormattedClock(formatClock(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const sectionLabel = useMemo(() => resolveSectionLabel(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[linear-gradient(90deg,rgba(8,7,12,0.96),rgba(12,10,16,0.9))] backdrop-blur-2xl">
      <div className="mx-auto flex h-[58px] max-w-[1840px] items-center gap-3 px-5 sm:px-6 xl:px-8 2xl:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <Brand subtle />
          <div className="hidden min-w-0 items-center gap-2 lg:flex">
            <div className="h-9 w-px bg-white/10" />
            <div className="min-w-0">
              <p className="section-eyebrow">Atualizacao 1</p>
              <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                <Compass className="h-3.5 w-3.5 text-primary/80" />
                <span className="truncate">{sectionLabel}</span>
                {worldContext ? (
                  <>
                    <CornerUpRight className="h-3.5 w-3.5 text-white/30" />
                    <span className="truncate text-foreground">{worldContext.title}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto hidden max-w-2xl flex-1 xl:max-w-3xl lg:block">
          <CortexInput />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge className="hidden border-emerald-300/25 bg-emerald-500/10 text-emerald-100 lg:flex">
            Sessao ativa
          </Badge>
          {worldContext ? (
            <Badge className="hidden border-amber-400/20 bg-amber-300/8 text-amber-100 lg:flex">
              <Swords className="mr-1.5 h-3.5 w-3.5 text-amber-300/80" />
              {worldContext.id.slice(0, 8)}
            </Badge>
          ) : (
            <Badge className="hidden border-primary/20 bg-primary/10 text-primary lg:flex">
              Operacao viva
            </Badge>
          )}
          <Badge className="hidden border-white/10 bg-white/5 font-mono text-[11px] text-white/75 xl:flex">
            <Clock3 className="mr-1.5 h-3.5 w-3.5 text-white/60" />
            {formattedClock}
          </Badge>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden border-white/10 bg-white/5 text-foreground hover:bg-white/10 sm:flex"
          >
            <Link href="/">Landing</Link>
          </Button>
          <SessionDialog />
        </div>
      </div>
    </header>
  );
}
