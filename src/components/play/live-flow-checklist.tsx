"use client";

import { CheckSquare2 } from "lucide-react";

type LiveFlowChecklistState = {
  cockpit: boolean;
  combat: boolean;
  consult: boolean;
  visual: boolean;
  notes: boolean;
};

type LiveFlowChecklistProps = {
  state: LiveFlowChecklistState;
  onToggle: (key: keyof LiveFlowChecklistState, checked: boolean) => void;
};

const checklistItems: Array<{
  key: keyof LiveFlowChecklistState;
  label: string;
}> = [
  { key: "cockpit", label: "Mesa principal aberta e estavel" },
  { key: "combat", label: "Combate operavel sem trocar de rota" },
  { key: "consult", label: "Consulta rapida de entidades/NPCs no cockpit" },
  { key: "visual", label: "Reveals/visuais acessiveis sem friccao" },
  { key: "notes", label: "Trilha e notas operacionais no app" },
];

export function LiveFlowChecklist({ state, onToggle }: LiveFlowChecklistProps) {
  const doneCount = checklistItems.filter((item) => state[item.key]).length;

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80">
        <CheckSquare2 className="h-3 w-3" />
        Pronto para mesa
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {doneCount}/{checklistItems.length} checks operacionais concluidos.
      </p>
      <div className="mt-3 space-y-2">
        {checklistItems.map((item) => (
          <label
            key={item.key}
            className="flex items-center gap-2 rounded-lg border border-white/8 bg-sidebar/60 px-2 py-2 text-xs text-foreground/90"
          >
            <input
              type="checkbox"
              checked={state[item.key]}
              onChange={(event) => onToggle(item.key, event.target.checked)}
              className="h-3.5 w-3.5 rounded border border-white/20 bg-black/40 accent-primary"
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
