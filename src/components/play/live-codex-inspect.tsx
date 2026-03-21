"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { CockpitDetailSheet } from "@/components/cockpit/cockpit-detail-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type LiveCodexEntity = {
  id: string;
  name: string;
  type: string;
  subtype?: string | null;
  status?: string | null;
  summary?: string | null;
  portraitImageUrl?: string | null;
  coverImageUrl?: string | null;
};

export type LiveEntityDetail = LiveCodexEntity & {
  description?: string | null;
  visibility?: string | null;
  tags?: string[];
  campaign?: { id: string; name: string } | null;
  outgoingRelations: { id: string; type: string; toEntity?: { id: string; name: string } | null }[];
  incomingRelations: {
    id: string;
    type: string;
    fromEntity?: { id: string; name: string } | null;
  }[];
  recentEvents: { id: string; type: string; text?: string | null; ts: string; visibility?: string | null }[];
};

type LiveCodexInspectProps = {
  worldId: string;
  inspectQuery: string;
  inspectCandidates: LiveCodexEntity[];
  inspectId: string | null;
  inspectEntity: LiveEntityDetail | null;
  inspectLoading: boolean;
  onInspectQueryChange: (value: string) => void;
  onInspectIdChange: (value: string | null) => void;
  onOpenSearch: () => void;
};

export function LiveCodexInspect({
  worldId,
  inspectQuery,
  inspectCandidates,
  inspectId,
  inspectEntity,
  inspectLoading,
  onInspectQueryChange,
  onInspectIdChange,
  onOpenSearch,
}: LiveCodexInspectProps) {
  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Quick inspect
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">Consulta world-scoped</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            onClick={onOpenSearch}
            title="Abrir busca completa"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <Input
            value={inspectQuery}
            onChange={(event) => onInspectQueryChange(event.target.value)}
            placeholder="Buscar entidade, casa, faccao, lugar..."
            className="bg-white/5 border-white/10"
          />
          <div className="flex flex-wrap gap-2">
            {inspectCandidates.length > 0 ? (
              inspectCandidates.map((entity) => (
                <Button
                  key={entity.id}
                  type="button"
                  variant="outline"
                  className="border-white/10 bg-white/5"
                  onClick={() => onInspectIdChange(entity.id)}
                >
                  {entity.name}
                </Button>
              ))
            ) : (
              <div className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-sm text-muted-foreground">
                Nenhuma entidade encontrada para este filtro.
              </div>
            )}
          </div>
        </div>
      </div>

      <CockpitDetailSheet
        open={inspectId !== null}
        onOpenChange={(open) => {
          if (!open) {
            onInspectIdChange(null);
          }
        }}
        badge="Quick inspect"
        title={inspectEntity?.name || "Carregando entidade"}
        description={
          inspectEntity
            ? `${inspectEntity.type}${inspectEntity.subtype ? ` • ${inspectEntity.subtype}` : ""} • ${
                inspectEntity.status || "sem status"
              }`
            : "Lendo detalhes do mundo"
        }
        footer={
          inspectEntity ? (
            <Button variant="outline" className="w-full justify-between border-white/10 bg-white/5" asChild>
              <Link href={`/app/worlds/${worldId}/codex/${inspectEntity.id}`}>
                Abrir no Codex
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : undefined
        }
      >
        {inspectLoading || !inspectEntity ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-[24px] border border-white/8 bg-white/4" />
            <div className="h-24 animate-pulse rounded-[24px] border border-white/8 bg-white/4" />
            <div className="h-24 animate-pulse rounded-[24px] border border-white/8 bg-white/4" />
          </div>
        ) : (
          <div className="space-y-4">
            {inspectEntity.portraitImageUrl || inspectEntity.coverImageUrl ? (
              <div
                className="min-h-[180px] rounded-[24px] border border-white/8 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.16), rgba(8,8,13,0.82)), url(${inspectEntity.portraitImageUrl || inspectEntity.coverImageUrl})`,
                }}
              />
            ) : null}

            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Resumo</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {inspectEntity.summary || inspectEntity.description || "Sem resumo registrado."}
              </p>
            </div>

            {Array.isArray(inspectEntity.tags) && inspectEntity.tags.length ? (
              <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {inspectEntity.tags.map((tag) => (
                    <Badge key={tag} className="border-white/10 bg-black/24 text-foreground">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Relacoes</p>
              <div className="mt-3 space-y-2">
                {inspectEntity.outgoingRelations.slice(0, 4).map((relation) => (
                  <div key={relation.id} className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-foreground">
                    {relation.type} → {relation.toEntity?.name || "Destino"}
                  </div>
                ))}
                {inspectEntity.incomingRelations.slice(0, 4).map((relation) => (
                  <div key={relation.id} className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-foreground">
                    {relation.fromEntity?.name || "Origem"} → {relation.type}
                  </div>
                ))}
                {!inspectEntity.outgoingRelations.length && !inspectEntity.incomingRelations.length ? (
                  <p className="text-sm text-muted-foreground">Nenhuma relacao registrada ainda.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Memoria recente</p>
              <div className="mt-3 space-y-2">
                {inspectEntity.recentEvents.length ? (
                  inspectEntity.recentEvents.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                      <p className="text-sm font-semibold text-foreground">{event.text || event.type}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {new Date(event.ts).toLocaleDateString("pt-BR")} • {event.visibility || "MASTER"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum evento recente ligado a esta entidade.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CockpitDetailSheet>
    </>
  );
}
