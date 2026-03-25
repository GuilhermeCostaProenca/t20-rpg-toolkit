"use client";

import { NotebookPen } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

type LiveGmScratchpadProps = {
  value: string;
  onChange: (next: string) => void;
};

export function LiveGmScratchpad({ value, onChange }: LiveGmScratchpadProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80">
        <NotebookPen className="h-3 w-3" />
        Bloco do mestre
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Anotacoes operacionais rapidas para conduzir a cena sem sair da mesa.
      </p>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Pistas, nomes improvisados, lembretes de turnos e beats..."
        className="mt-3 min-h-24 border-white/10 bg-black/30 text-sm"
      />
    </div>
  );
}
