"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SearchResult = {
  id: string;
  title: string;
  rulesetId: string;
  filePath: string;
  snippet?: string | null;
  page?: number;
};

export function LibrarySearch() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ruleset-docs/search?term=${encodeURIComponent(term)}`, {
        cache: "no-store",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Falha na busca");
      setResults(payload.data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro na busca";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="chrome-panel rounded-[30px] border-white/10 bg-card/80">
      <CardContent className="p-6">
        <div className="space-y-5">
          <div>
            <p className="section-eyebrow">Busca textual</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
              Procure pelo acervo
            </h2>
          </div>

          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Ex.: Valkaria, guerra, linhagem, deuses"
                className="h-12 rounded-2xl border-white/10 bg-black/25 pl-11"
              />
            </div>
            <Button type="submit" disabled={loading || term.trim().length === 0} className="h-12 px-6">
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </form>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {results.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {results.map((result) => (
                <Link key={result.id} href={`/app/library/${result.id}`}>
                  <div className="rounded-[24px] border border-white/10 bg-white/4 p-4 transition hover:border-primary/25 hover:bg-white/6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="line-clamp-1 text-base font-semibold text-foreground">{result.title}</p>
                      <Badge className="border-white/10 bg-black/28 text-white">{result.rulesetId}</Badge>
                    </div>
                    {result.snippet ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        ...{result.snippet}...
                      </p>
                    ) : null}
                    {result.page ? (
                      <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Pagina sugerida: {result.page}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
