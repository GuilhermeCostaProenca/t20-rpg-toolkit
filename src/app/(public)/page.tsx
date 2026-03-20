import Link from "next/link";
import { BookOpenText, NotebookPen, Sparkles, Swords } from "lucide-react";

import { Shell } from "@/components/shell";
import { SessionRecents } from "@/components/session/session-recents";
import { SessionProvider } from "@/components/session/session-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    title: "Continuar campanha",
    description: "Retomar do ponto onde paramos.",
    icon: Sparkles,
    href: "/app",
  },
  {
    title: "Iniciar sessão",
    description: "Notas, iniciativas e rolagens.",
    icon: Swords,
    href: "/app",
  },
  {
    title: "Compêndio",
    description: "Criaturas, itens e regras.",
    icon: BookOpenText,
    href: "/app",
  },
  {
    title: "Diário da campanha",
    description: "Resumos e próximos ganchos.",
    icon: NotebookPen,
    href: "/app",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(226,69,69,0.12),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(143,108,245,0.1),transparent_26%)]" />

      <Shell className="relative space-y-12 pt-16">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Mesa de Arton</p>
            <h1 className="text-3xl font-bold">Bem-vindo de volta, Gui.</h1>
          </div>
          <Badge className="border-primary/30 bg-primary/10 text-primary mt-1">
            Em andamento
          </Badge>
        </div>

        {/* Quick actions */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Atalhos
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  asChild
                  variant="outline"
                  className="h-auto flex-col items-start gap-2 rounded-2xl border-white/10 bg-white/5 p-5 text-left hover:border-primary/30 hover:bg-white/8"
                >
                  <Link href={action.href}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {action.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </div>
        </section>

        {/* Próxima sessão */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Próxima sessão
              </p>
              <p className="text-sm text-foreground">
                Sessão 12 — Encontro na praça de Valkaria
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
              <Link href="/app">Preparar</Link>
            </Button>
          </div>
        </section>

        {/* Recentes */}
        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            O que rolou na mesa
          </p>
          <SessionProvider>
            <SessionRecents />
          </SessionProvider>
        </section>
      </Shell>
    </div>
  );
}
