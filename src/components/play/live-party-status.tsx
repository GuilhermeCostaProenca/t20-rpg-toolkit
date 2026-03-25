"use client";

import { HeartPulse, ShieldPlus } from "lucide-react";

type LivePartyStatusProps = {
  total: number;
  downed: number;
  lowHp: number;
  lowPm: number;
  lowSan: number;
  avgHpPercent: number;
  avgPmPercent: number;
  avgSanPercent: number;
};

export function LivePartyStatus({
  total,
  downed,
  lowHp,
  lowPm,
  lowSan,
  avgHpPercent,
  avgPmPercent,
  avgSanPercent,
}: LivePartyStatusProps) {
  if (total <= 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80">
          <ShieldPlus className="h-3 w-3" />
          Estado da mesa
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sem personagens vinculados a esta campanha.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80">
        <HeartPulse className="h-3 w-3" />
        Estado da mesa
      </p>
      <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-sidebar/60 px-3 py-2">
          <span>Grupo ativo</span>
          <span className="font-semibold text-foreground">{total} PCs</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-sidebar/60 px-3 py-2">
          <span>HP medio</span>
          <span className="font-semibold text-foreground">{avgHpPercent}%</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-sidebar/60 px-3 py-2">
          <span>PM medio</span>
          <span className="font-semibold text-foreground">{avgPmPercent}%</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-sidebar/60 px-3 py-2">
          <span>SAN media</span>
          <span className="font-semibold text-foreground">{avgSanPercent}%</span>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.14em] text-white/70">
        {downed > 0 ? <span className="rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-300">{downed} caidos</span> : null}
        {lowHp > 0 ? <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-300">{lowHp} com HP baixo</span> : null}
        {lowPm > 0 ? <span className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-blue-300">{lowPm} com PM baixo</span> : null}
        {lowSan > 0 ? <span className="rounded border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-purple-300">{lowSan} com SAN baixa</span> : null}
      </div>
    </div>
  );
}
