"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Command, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type CommandItem = {
  id: string;
  label: string;
  description: string;
  href: string;
};

type WorldCommandBarProps = {
  worldId: string;
};

export function WorldCommandBar({ worldId }: WorldCommandBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo<CommandItem[]>(
    () => [
      {
        id: "codex",
        label: "Abrir Codex",
        description: "Entidades estruturadas e controle do dominio do mundo.",
        href: `/app/worlds/${worldId}/codex`,
      },
      {
        id: "graph",
        label: "Abrir Grafo",
        description: "Rede de relacoes e leitura de conexoes narrativas.",
        href: `/app/worlds/${worldId}/graph`,
      },
      {
        id: "notebook",
        label: "Abrir Caderno",
        description: "Notas fluidas com links e contexto operacional.",
        href: `/app/worlds/${worldId}/notebook`,
      },
      {
        id: "board",
        label: "Abrir Lousa",
        description: "Cards e conexoes visuais para planejamento espacial.",
        href: `/app/worlds/${worldId}/board`,
      },
    ],
    [worldId]
  );

  const filtered = items.filter((item) => {
    const haystack = `${item.label} ${item.description}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-white/10 bg-white/5 text-white hover:bg-white/10"
        onClick={() => setOpen(true)}
      >
        <Command className="mr-2 h-4 w-4" />
        Command Bar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-[#090c14]/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Navegacao rapida do mundo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/45" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar comando..."
                className="border-white/10 bg-black/40 pl-9 text-white placeholder:text-white/45"
              />
            </div>
            <div className="space-y-2">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-primary/35 hover:bg-primary/10"
                >
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-white/65">{item.description}</p>
                </Link>
              ))}
              {filtered.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
                  Nenhum comando encontrado para essa busca.
                </p>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

