import Link from "next/link";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Search } from "lucide-react";

import { VisualLibraryBrowser } from "@/components/visual/visual-browser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ModeSwitcher } from "@/components/world/mode-switcher";
import { prisma } from "@/lib/prisma";
import {
  getVisualKindLabel,
  getVisualKindPriority,
  normalizeVisualKind,
} from "@/lib/visual";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    term?: string;
    kind?: string;
    type?: string;
    subtype?: string;
    preset?: string;
    campaignId?: string;
    tag?: string;
    assetId?: string;
  }>;
};

type VisualAsset = {
  id: string;
  url: string;
  kind: string;
  caption?: string | null;
  sortOrder?: number | null;
  entityId: string;
  entityName: string;
  entityType: string;
  entitySubtype?: string | null;
  entitySummary?: string | null;
  campaignId?: string | null;
  campaignName?: string | null;
  tags: string[];
  isEntityCover?: boolean;
  isEntityPortrait?: boolean;
};

function pickAssets(
  assets: VisualAsset[],
  predicate: (asset: VisualAsset) => boolean,
  limit = 3
) {
  return assets.filter(predicate).slice(0, limit);
}

function buildVisualLibraryHref(
  worldId: string,
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams(
    Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]))
  );
  const suffix = search.toString();
  return `/app/worlds/${worldId}/visual${suffix ? `?${suffix}` : ""}`;
}

async function getVisualLibrary(
  worldId: string,
  filters: {
    term?: string;
    kind?: string;
    type?: string;
    subtype?: string;
    preset?: string;
    campaignId?: string;
    tag?: string;
  }
) {
  const world = await prisma.world.findUnique({
    where: { id: worldId },
    select: {
      id: true,
      title: true,
      description: true,
      campaigns: {
        select: { id: true, name: true, roomCode: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!world) return null;

  const preset = (filters.preset || "").trim().toLowerCase();
  const presetType =
    preset === "places"
      ? "place"
      : undefined;
  const presetKind =
    preset === "portraits"
      ? "portrait"
      : preset === "reveals"
        ? "reveal"
        : preset === "scenes"
          ? "scene"
          : undefined;

  const entities = await prisma.entity.findMany({
    where: {
      worldId,
      ...((filters.type || presetType) ? { type: filters.type || presetType } : {}),
      ...(filters.subtype
        ? { subtype: { equals: filters.subtype, mode: "insensitive" as const } }
        : {}),
      ...(filters.campaignId ? { campaignId: filters.campaignId } : {}),
      ...(filters.term
        ? {
            OR: [
              { name: { contains: filters.term, mode: "insensitive" } },
              { summary: { contains: filters.term, mode: "insensitive" } },
              { description: { contains: filters.term, mode: "insensitive" } },
              { subtype: { contains: filters.term, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      type: true,
      subtype: true,
      summary: true,
      coverImageUrl: true,
      portraitImageUrl: true,
      tags: true,
      campaignId: true,
      campaign: { select: { id: true, name: true } },
      images: {
        select: {
          id: true,
          url: true,
          kind: true,
          caption: true,
          sortOrder: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
    },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });

  const requestedTag = (filters.tag || "").trim().toLowerCase();
  const requestedKind = normalizeVisualKind(filters.kind || presetKind);

  const assets: VisualAsset[] = entities.flatMap((entity) => {
    const tags = Array.isArray(entity.tags) ? entity.tags.map((tag) => String(tag)) : [];
    const base: VisualAsset[] = [];

    if (entity.coverImageUrl) {
      base.push({
        id: `cover:${entity.id}`,
        url: entity.coverImageUrl,
        kind: "cover",
        caption: entity.summary || null,
        sortOrder: -20,
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        entitySubtype: entity.subtype,
        entitySummary: entity.summary,
        campaignId: entity.campaignId,
        campaignName: entity.campaign?.name ?? null,
        tags,
        isEntityCover: true,
        isEntityPortrait: entity.portraitImageUrl === entity.coverImageUrl,
      });
    }

    if (entity.portraitImageUrl && entity.portraitImageUrl !== entity.coverImageUrl) {
      base.push({
        id: `portrait:${entity.id}`,
        url: entity.portraitImageUrl,
        kind: "portrait",
        caption: entity.summary || null,
        sortOrder: -10,
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        entitySubtype: entity.subtype,
        entitySummary: entity.summary,
        campaignId: entity.campaignId,
        campaignName: entity.campaign?.name ?? null,
        tags,
        isEntityCover: false,
        isEntityPortrait: true,
      });
    }

    for (const image of entity.images) {
      base.push({
        id: image.id,
        url: image.url,
        kind: image.kind || "reference",
        caption: image.caption,
        sortOrder: image.sortOrder,
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        entitySubtype: entity.subtype,
        entitySummary: entity.summary,
        campaignId: entity.campaignId,
        campaignName: entity.campaign?.name ?? null,
        tags,
        isEntityCover: image.url === entity.coverImageUrl,
        isEntityPortrait: image.url === entity.portraitImageUrl,
      });
    }

    return base;
  });

  const filteredAssets = assets.filter((asset) => {
    if (requestedTag && !asset.tags.some((tag) => tag.toLowerCase() === requestedTag)) return false;
    if (filters.kind && normalizeVisualKind(asset.kind) !== requestedKind) return false;
    return true;
  });

  const groupedByEntity = filteredAssets.reduce<Record<string, VisualAsset[]>>((acc, asset) => {
    acc[asset.entityId] = acc[asset.entityId] ?? [];
    acc[asset.entityId].push(asset);
    return acc;
  }, {});

  const entityGroups = Object.entries(groupedByEntity)
    .map(([entityId, entityAssets]) => ({
      entityId,
      entityName: entityAssets[0]?.entityName ?? "Entidade",
      entityType: entityAssets[0]?.entityType ?? "entity",
      entitySubtype: entityAssets[0]?.entitySubtype ?? null,
      campaignName: entityAssets[0]?.campaignName ?? null,
      tags: entityAssets[0]?.tags ?? [],
      assets: entityAssets.sort((a, b) => {
        const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        if (orderDiff !== 0) return orderDiff;
        const priorityDiff = getVisualKindPriority(a.kind) - getVisualKindPriority(b.kind);
        if (priorityDiff !== 0) return priorityDiff;
        return a.kind.localeCompare(b.kind);
      }),
    }))
    .sort((a, b) => b.assets.length - a.assets.length || a.entityName.localeCompare(b.entityName));

  const allKinds = Array.from(new Set(assets.map((asset) => normalizeVisualKind(asset.kind)))).sort((a, b) =>
    a.localeCompare(b)
  );
  const allSubtypes = Array.from(
    new Set(
      entities
        .map((entity) => entity.subtype?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b));
  const allTags = Array.from(
    new Set(assets.flatMap((asset) => asset.tags.map((tag) => tag.trim()).filter(Boolean)))
  ).sort((a, b) => a.localeCompare(b));

  const focusCampaign =
    (filters.campaignId
      ? world.campaigns.find((campaign) => campaign.id === filters.campaignId)
      : null) ??
    world.campaigns.find((campaign) => campaign.roomCode) ??
    world.campaigns[0] ??
    null;

  const campaignScopedAssets = focusCampaign
    ? filteredAssets.filter((asset) => !asset.campaignId || asset.campaignId === focusCampaign.id)
    : filteredAssets;

  const mesaPrep = {
    focusCampaign,
    revealAssets: pickAssets(
      campaignScopedAssets,
      (asset) => normalizeVisualKind(asset.kind) === "reveal",
      4
    ),
    sceneAssets: pickAssets(
      campaignScopedAssets,
      (asset) =>
        normalizeVisualKind(asset.kind) === "scene" || asset.entityType === "place",
      4
    ),
    portraitAssets: pickAssets(
      campaignScopedAssets,
      (asset) =>
        normalizeVisualKind(asset.kind) === "portrait" || Boolean(asset.isEntityPortrait),
      4
    ),
  };

  return {
    world,
    campaigns: world.campaigns,
    entityGroups,
    allKinds,
    allSubtypes,
    allTags,
    mesaPrep,
    stats: {
      assets: filteredAssets.length,
      entities: entityGroups.length,
    },
  };
}

export default async function WorldVisualLibraryPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const filters = await searchParams;
  const data = await getVisualLibrary(id, filters);

  if (!data) return notFound();

  const activeFilters = [
    filters.type ? `tipo: ${filters.type}` : null,
    filters.kind ? `papel: ${getVisualKindLabel(filters.kind)}` : null,
    filters.preset
      ? `preset: ${
          filters.preset === "places"
            ? "Lugares"
            : filters.preset === "portraits"
              ? "Retratos"
              : filters.preset === "reveals"
                ? "Reveals"
                : filters.preset === "scenes"
                  ? "Cenas"
                  : filters.preset
        }`
      : null,
    filters.campaignId
      ? `campanha: ${data.campaigns.find((item) => item.id === filters.campaignId)?.name || "selecionada"}`
      : null,
    filters.subtype ? `subtipo: ${filters.subtype}` : null,
    filters.tag ? `tag: ${filters.tag}` : null,
  ].filter(Boolean) as string[];

  const featuredScene = data.mesaPrep.sceneAssets[0] ?? null;
  const featuredReveal = data.mesaPrep.revealAssets[0] ?? null;
  const featuredPortrait = data.mesaPrep.portraitAssets[0] ?? null;

  return (
    <div className="space-y-8 pb-8">
      <section className="world-hero rounded-[32px] px-6 py-7 sm:px-8 xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.82fr)]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 text-primary">Biblioteca visual</Badge>
              <Badge className="border-amber-300/20 bg-amber-300/8 text-amber-100">
                {data.stats.assets} assets
              </Badge>
              <Badge className="border-white/10 bg-black/24 text-white/72">
                {data.stats.entities} entidades
              </Badge>
            </div>
            <div className="space-y-3">
              <p className="section-eyebrow">Pins, retratos e reveals</p>
              <h1 className="text-4xl font-black uppercase tracking-[0.04em] text-foreground sm:text-5xl">
                A camada visual do mundo deixa de ser pasta solta e entra no cockpit.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Use esta superficie para navegar referencias por entidade, encontrar a imagem certa e revelar
                ativos diretamente para a mesa sem depender de Pinterest e janelas espalhadas.
              </p>
            </div>
            <ModeSwitcher worldId={id} />
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${id}`}>
                  Voltar ao cockpit
                </Link>
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${id}/codex`}>
                  Abrir Codex
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="cinematic-frame rounded-[28px] p-5">
              <p className="section-eyebrow">Leitura visual do mundo</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Assets visiveis</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{data.stats.assets}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Entidades com imagem</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{data.stats.entities}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Uso previsto</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">Curadoria + reveal de mesa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {data.mesaPrep.focusCampaign ? (
        <section className="chrome-panel rounded-[30px] p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-primary/20 bg-primary/10 text-primary">Mesa pack</Badge>
                <Badge className="border-white/10 bg-black/24 text-white/72">
                  {data.mesaPrep.focusCampaign.name}
                </Badge>
              </div>
              <div className="space-y-3">
                <p className="section-eyebrow">Preparo de cena</p>
                <h2 className="text-3xl font-black uppercase tracking-[0.04em] text-foreground">
                  Atalhos visuais para a campanha em foco.
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Esta leitura aproxima a biblioteca do uso real da mesa: retratos prontos, cenas e reveals
                  para abrir no instante certo, sem voltar para uma pasta genérica.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {data.mesaPrep.focusCampaign.roomCode ? (
                  <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                    <Link href={`/play/${data.mesaPrep.focusCampaign.roomCode}`} target="_blank">
                      Abrir segunda tela
                    </Link>
                  </Button>
                ) : null}
                <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                  <Link href={buildVisualLibraryHref(id, {
                    campaignId: data.mesaPrep.focusCampaign.id,
                    preset: "reveals",
                  })}>
                    Ver reveals da campanha
                  </Link>
                </Button>
                <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                  <Link href={buildVisualLibraryHref(id, {
                    campaignId: data.mesaPrep.focusCampaign.id,
                    preset: "scenes",
                  })}>
                    Ver cenas da campanha
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[26px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reveals prontos</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.mesaPrep.revealAssets.length ? (
                    data.mesaPrep.revealAssets.map((asset) => (
                      <Button
                        key={asset.id}
                        variant="outline"
                        className="border-white/10 bg-white/5"
                        asChild
                      >
                        <Link
                          href={`/app/worlds/${id}/visual?${new URLSearchParams({
                            campaignId: data.mesaPrep.focusCampaign?.id || "",
                            assetId: asset.id,
                          }).toString()}`}
                        >
                          {asset.entityName}
                        </Link>
                      </Button>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Nenhum reveal marcado ainda nesta leitura.
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-[26px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cenas e lugares</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.mesaPrep.sceneAssets.length ? (
                    data.mesaPrep.sceneAssets.map((asset) => (
                      <Button
                        key={asset.id}
                        variant="outline"
                        className="border-white/10 bg-white/5"
                        asChild
                      >
                        <Link
                          href={`/app/worlds/${id}/visual?${new URLSearchParams({
                            campaignId: data.mesaPrep.focusCampaign?.id || "",
                            assetId: asset.id,
                          }).toString()}`}
                        >
                          {asset.entitySubtype || asset.entityName}
                        </Link>
                      </Button>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Nenhuma cena destacada ainda nesta campanha.
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-[26px] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Retratos de mesa</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.mesaPrep.portraitAssets.length ? (
                    data.mesaPrep.portraitAssets.map((asset) => (
                      <Button
                        key={asset.id}
                        variant="outline"
                        className="border-white/10 bg-white/5"
                        asChild
                      >
                        <Link
                          href={`/app/worlds/${id}/visual?${new URLSearchParams({
                            campaignId: data.mesaPrep.focusCampaign?.id || "",
                            assetId: asset.id,
                          }).toString()}`}
                        >
                          {asset.entityName}
                        </Link>
                      </Button>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Nenhum retrato principal destacado ainda nesta campanha.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {(featuredScene || featuredReveal || featuredPortrait) ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {featuredScene ? (
                <Link
                  href={buildVisualLibraryHref(id, {
                    campaignId: data.mesaPrep.focusCampaign.id,
                    assetId: featuredScene.id,
                    preset: "scenes",
                  })}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-black/20 p-6"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.22), rgba(8,8,13,0.94)), url(${featuredScene.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-black/40 opacity-80 transition group-hover:opacity-100" />
                  <div className="relative space-y-4">
                    <Badge className="border-white/10 bg-black/28 text-white">Cena em destaque</Badge>
                    <div>
                      <p className="section-eyebrow text-white/65">Leitura de lugar</p>
                      <h3 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-white">
                        {featuredScene.entitySubtype || featuredScene.entityName}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/72">
                        {featuredScene.caption || featuredScene.entitySummary || "Abra este asset para ambientar a próxima cena."}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : null}

              {featuredReveal ? (
                <Link
                  href={buildVisualLibraryHref(id, {
                    campaignId: data.mesaPrep.focusCampaign.id,
                    assetId: featuredReveal.id,
                    preset: "reveals",
                  })}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-black/20 p-6"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.18), rgba(8,8,13,0.95)), url(${featuredReveal.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-300/10 via-transparent to-black/40 opacity-80 transition group-hover:opacity-100" />
                  <div className="relative space-y-4">
                    <Badge className="border-amber-300/20 bg-amber-300/10 text-amber-100">Reveal pronto</Badge>
                    <div>
                      <p className="section-eyebrow text-white/65">Impacto visual</p>
                      <h3 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-white">
                        {featuredReveal.entityName}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/72">
                        {featuredReveal.caption || "Asset já preparado para aparecer na hora certa da sessão."}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : null}

              {featuredPortrait ? (
                <Link
                  href={buildVisualLibraryHref(id, {
                    campaignId: data.mesaPrep.focusCampaign.id,
                    assetId: featuredPortrait.id,
                    preset: "portraits",
                  })}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-black/20 p-6"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.18), rgba(8,8,13,0.95)), url(${featuredPortrait.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-300/10 via-transparent to-black/40 opacity-80 transition group-hover:opacity-100" />
                  <div className="relative space-y-4">
                    <Badge className="border-sky-300/20 bg-sky-300/10 text-sky-100">Retrato de mesa</Badge>
                    <div>
                      <p className="section-eyebrow text-white/65">Consulta rápida</p>
                      <h3 className="mt-2 text-2xl font-black uppercase tracking-[0.04em] text-white">
                        {featuredPortrait.entityName}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/72">
                        {featuredPortrait.caption || featuredPortrait.entitySummary || "Retrato principal para manter leitura rápida de personagem."}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="chrome-panel rounded-[30px] p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="outline" className="border-white/10 bg-white/5" asChild>
            <Link href={`/app/worlds/${id}/visual`}>Todos</Link>
          </Button>
          <Button variant="outline" className="border-white/10 bg-white/5" asChild>
            <Link href={`/app/worlds/${id}/visual?preset=places`}>Lugares</Link>
          </Button>
          <Button variant="outline" className="border-white/10 bg-white/5" asChild>
            <Link href={`/app/worlds/${id}/visual?preset=portraits`}>Retratos</Link>
          </Button>
          <Button variant="outline" className="border-white/10 bg-white/5" asChild>
            <Link href={`/app/worlds/${id}/visual?preset=reveals`}>Reveals</Link>
          </Button>
          <Button variant="outline" className="border-white/10 bg-white/5" asChild>
            <Link href={`/app/worlds/${id}/visual?preset=scenes`}>Cenas</Link>
          </Button>
        </div>
        <form className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,0.9fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="term"
              defaultValue={filters.term || ""}
              placeholder="Entidade, resumo ou subtipo"
              className="h-12 rounded-2xl border-white/10 bg-black/25 pl-11"
            />
          </div>
          <select
            name="type"
            defaultValue={filters.type || ""}
            className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm"
          >
            <option value="">Todos os tipos</option>
            <option value="house">house</option>
            <option value="character">character</option>
            <option value="npc">npc</option>
            <option value="place">place</option>
            <option value="faction">faction</option>
            <option value="artifact">artifact</option>
          </select>
          <select
            name="kind"
            defaultValue={filters.kind || ""}
            className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm"
          >
            <option value="">Todos os papeis</option>
            {data.allKinds.map((kind) => (
              <option key={kind} value={kind}>
                {getVisualKindLabel(kind)}
              </option>
            ))}
          </select>
          <select
            name="campaignId"
            defaultValue={filters.campaignId || ""}
            className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm"
          >
            <option value="">Todas as campanhas</option>
            {data.campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
          <select
            name="subtype"
            defaultValue={filters.subtype || ""}
            className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm"
          >
            <option value="">Todos os subtipos</option>
            {data.allSubtypes.map((subtype) => (
              <option key={subtype} value={subtype}>
                {subtype}
              </option>
            ))}
          </select>
          <select
            name="tag"
            defaultValue={filters.tag || ""}
            className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm"
          >
            <option value="">Todas as tags</option>
            {data.allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <Button type="submit" className="h-12 xl:col-start-6 xl:row-start-2">
            Aplicar leitura
          </Button>
        </form>

        {data.allSubtypes.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {data.allSubtypes.slice(0, 8).map((subtype) => (
              <Button
                key={subtype}
                variant="outline"
                className="border-white/10 bg-white/5"
                asChild
              >
                <Link
                  href={`/app/worlds/${id}/visual?${new URLSearchParams({
                    ...(filters.preset ? { preset: filters.preset } : {}),
                    ...(filters.type ? { type: filters.type } : {}),
                    ...(filters.kind ? { kind: filters.kind } : {}),
                    ...(filters.campaignId ? { campaignId: filters.campaignId } : {}),
                    ...(filters.tag ? { tag: filters.tag } : {}),
                    subtype,
                  }).toString()}`}
                >
                  {subtype}
                </Link>
              </Button>
            ))}
          </div>
        ) : null}

        {activeFilters.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge key={filter} className="border-white/10 bg-white/5 text-foreground">
                {filter}
              </Badge>
            ))}
          </div>
        ) : null}
      </section>

      {data.entityGroups.length === 0 ? (
        <Card className="rounded-[30px] border-white/10 bg-white/4">
          <CardContent className="py-16 text-center text-muted-foreground">
            Nenhum asset visual encontrado com os filtros atuais.
          </CardContent>
        </Card>
      ) : (
        <VisualLibraryBrowser
          worldId={id}
          campaigns={data.campaigns}
          entityGroups={data.entityGroups}
          initialInspectAssetId={filters.assetId || null}
        />
      )}

      <section className="chrome-panel rounded-[30px] p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
          <div className="rounded-[28px] border border-white/8 bg-white/4 p-5">
            <p className="section-eyebrow">Leitura da camada</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Esta slice da biblioteca visual ja resolve curadoria e operacao basica: navegar pins e
              retratos por entidade, abrir em lightbox, seguir para o Codex e disparar reveal para campanhas
              do mesmo mundo sem sair do cockpit.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/8 bg-white/4 p-5">
            <p className="section-eyebrow">Proxima evolucao natural</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="border-white/10 bg-white/5 text-foreground">fila de reveal</Badge>
              <Badge className="border-white/10 bg-white/5 text-foreground">contexto de cena</Badge>
              <Badge className="border-white/10 bg-white/5 text-foreground">lugares menores</Badge>
              <Badge className="border-white/10 bg-white/5 text-foreground">preparo de mesa</Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

