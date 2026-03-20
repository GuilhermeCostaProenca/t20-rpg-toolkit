import Link from "next/link";
export const dynamic = "force-dynamic";

import { BookMarked, ChevronRight, ScrollText, Upload } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LibrarySearch } from "@/components/library/library-search";

async function getDocs() {
  return prisma.rulesetDocument.findMany({
    orderBy: { createdAt: "desc" },
  });
}

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function LibraryPage() {
  const docs = await getDocs();

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Biblioteca documental</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {docs.length} documentos
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Arquivo do mestre</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl xl:text-6xl">
                Regras, PDFs e memoria textual em uma camada separada do cockpit.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                A biblioteca documental continua util, mas agora fala a mesma lingua visual do resto do sistema.
                Ela guarda material de regras, uploads e busca textual sem disputar o papel dos mundos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/app/library/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar documento
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href="/app/worlds">Voltar aos mundos</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura do acervo</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{docs.length}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Funcao</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Arquivo e consulta</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Papel</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Suporte ao mestre</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LibrarySearch />

      <section className="chrome-panel rounded-[30px] p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="section-eyebrow">Documentos recentes</p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-foreground">
              Acervo navegavel
            </h2>
          </div>
        </div>

        {docs.length === 0 ? (
          <Card className="rounded-[26px] border-white/10 bg-white/4">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum documento enviado ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {docs.map((doc, index) => (
              <Link key={doc.id} href={`/app/library/${doc.id}`}>
                <Card className="group overflow-hidden rounded-[28px] border-white/10 bg-black/20 transition hover:-translate-y-1 hover:border-primary/25">
                  <CardContent className="p-0">
                    <div
                      className="flex min-h-[240px] flex-col justify-between p-5"
                      style={{
                        background:
                          index % 3 === 0
                            ? "linear-gradient(135deg, rgba(188,74,63,0.15), rgba(10,10,15,0.9))"
                            : index % 3 === 1
                              ? "linear-gradient(135deg, rgba(213,162,64,0.12), rgba(10,10,15,0.9))"
                              : "linear-gradient(135deg, rgba(66,102,135,0.14), rgba(10,10,15,0.9))",
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Badge className="border-white/10 bg-black/28 text-white">{doc.rulesetId}</Badge>
                        <span className="text-xs uppercase tracking-[0.18em] text-white/55">
                          {formatDate(doc.createdAt)}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="line-clamp-2 text-2xl font-black uppercase tracking-[0.04em] text-white">
                            {doc.title}
                          </h3>
                          <p className="mt-3 text-sm text-white/68">
                            {doc.pages ? `${doc.pages} paginas` : "Paginas nao informadas"} · {doc.type}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/55">
                              <ScrollText className="h-3.5 w-3.5" />
                              Tipo
                            </div>
                            <p className="mt-2 text-sm font-semibold text-white">{doc.type}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/55">
                              <BookMarked className="h-3.5 w-3.5" />
                              Fonte
                            </div>
                            <p className="mt-2 text-sm font-semibold text-white">{doc.rulesetId}</p>
                          </div>
                        </div>

                        <Button className="w-full justify-between bg-white text-black hover:bg-white/90">
                          Abrir documento
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
