"use client";

import { useState } from "react";
import { Music2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SessionSoundtrack = {
  ambientUrl: string;
  combatUrl: string;
};

type LiveSessionSoundtrackProps = {
  isCombatActive: boolean;
  soundtrack: SessionSoundtrack;
  onSave: (next: SessionSoundtrack) => void;
};

function isHttpUrl(value: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function LiveSessionSoundtrack({
  isCombatActive,
  soundtrack,
  onSave,
}: LiveSessionSoundtrackProps) {
  const [editing, setEditing] = useState(false);
  const [draftAmbientUrl, setDraftAmbientUrl] = useState(soundtrack.ambientUrl);
  const [draftCombatUrl, setDraftCombatUrl] = useState(soundtrack.combatUrl);

  const activeUrl = isCombatActive ? soundtrack.combatUrl : soundtrack.ambientUrl;
  const activeLabel = isCombatActive ? "Combate" : "Ambiental";

  const openUrl = (value: string) => {
    if (!isHttpUrl(value)) return;
    window.open(value, "_blank", "noopener,noreferrer");
  };

  const saveDraft = () => {
    onSave({
      ambientUrl: draftAmbientUrl.trim(),
      combatUrl: draftCombatUrl.trim(),
    });
    setEditing(false);
  };

  const toggleEditing = () => {
    if (!editing) {
      setDraftAmbientUrl(soundtrack.ambientUrl);
      setDraftCombatUrl(soundtrack.combatUrl);
    }
    setEditing((current) => !current);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80">
          <Music2 className="h-3 w-3" />
          Trilha da sessao
        </p>
        <Button
          size="sm"
          variant="outline"
          className="h-7 border-white/10 bg-white/5 text-xs"
          onClick={toggleEditing}
        >
          {editing ? "Fechar" : "Editar"}
        </Button>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-primary/20 bg-primary/10 text-primary"
          disabled={!isHttpUrl(activeUrl)}
          onClick={() => openUrl(activeUrl)}
        >
          Abrir {activeLabel}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 bg-white/5"
          disabled={!isHttpUrl(soundtrack.ambientUrl)}
          onClick={() => openUrl(soundtrack.ambientUrl)}
        >
          Ambiental
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 bg-white/5"
          disabled={!isHttpUrl(soundtrack.combatUrl)}
          onClick={() => openUrl(soundtrack.combatUrl)}
        >
          Combate
        </Button>
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <Input
            value={draftAmbientUrl}
            onChange={(event) => setDraftAmbientUrl(event.target.value)}
            placeholder="URL da playlist/trilha ambiental"
            className="border-white/10 bg-black/30"
          />
          <Input
            value={draftCombatUrl}
            onChange={(event) => setDraftCombatUrl(event.target.value)}
            placeholder="URL da playlist/trilha de combate"
            className="border-white/10 bg-black/30"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="border-primary/20 bg-primary/10 text-primary"
              onClick={saveDraft}
            >
              Salvar trilha
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
