import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookMarked, FileText, ScrollText } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PageProps = { params: Promise<{ id: string }> };

async function getDoc(id: string) {
  return prisma.rulesetDocument.findUnique({ where: { id } });
}

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function LibraryDocPage({ params }: PageProps) {
  const { id } = await params;
  const doc = await getDoc(id);
  if (!doc) return notFound();

  const pageParam = 1;
  const src = `${doc.filePath}#page=${pageParam}`;

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">{doc.rulesetId}</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">{doc.type}</Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Documento</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                {doc.title}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Leitura documental dentro do arquivo do mestre. Esta superficie prioriza consulta rapida e contexto antes de qualquer automacao.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-white/10 bg-white/5">
                <Link href="/app/library">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para biblioteca
                </Link>
              </Button>
              <Button asChild>
                <Link href={doc.filePath} target="_blank">
                  <FileText className="mr-2 h-4 w-4" />
                  Abrir arquivo
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Metadados</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <BookMarked className="h-3.5 w-3.5" />
                    Ruleset
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">{doc.rulesetId}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <ScrollText className="h-3.5 w-3.5" />
                    Registro
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {doc.pages ? `${doc.pages} paginas` : "Paginas nao informadas"} · {formatDate(doc.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Card className="chrome-panel rounded-[30px] border-white/10 bg-card/80">
        <CardContent className="p-6">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-white/10 bg-black/40">
            <embed src={src} type="application/pdf" className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
