"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  GalleryVerticalEnd,
  Image as ImageIcon,
  MonitorPlay,
  Pencil,
  Save,
  Sparkles,
  Star,
  UserSquare2,
  X,
} from "lucide-react";

import { useAppFeedback } from "@/components/app-feedback-provider";
import { RevealButton } from "@/components/reveal-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import {
  VISUAL_KIND_OPTIONS,
  getVisualKindDescription,
  getVisualKindLabel,
  getVisualReadiness,
} from "@/lib/visual-library";

type Campaign = { id: string; name: string; roomCode?: string | null };
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
type VisualEntityGroup = {
  entityId: string;
  entityName: string;
  entityType: string;
  entitySubtype?: string | null;
  campaignName?: string | null;
  tags: string[];
  assets: VisualAsset[];
};

type VisualLibraryBrowserProps = {
  worldId: string;
  campaigns: Campaign[];
  entityGroups: VisualEntityGroup[];
  initialInspectAssetId?: string | null;
};

function isManagedImage(asset: VisualAsset) {
  return !asset.id.startsWith("cover:") && !asset.id.startsWith("portrait:");
}

export function VisualLibraryBrowser({
  worldId,
  campaigns,
  entityGroups,
  initialInspectAssetId,
}: VisualLibraryBrowserProps) {
  const router = useRouter();
  const { notifyError, notifySuccess } = useAppFeedback();
  const allAssets = useMemo(
    () => entityGroups.flatMap((group) => group.assets),
    [entityGroups]
  );
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [inspectAssetId, setInspectAssetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editDraft, setEditDraft] = useState({
    kind: "reference",
    caption: "",
    sortOrder: "0",
  });

  const activeAsset = useMemo(
    () => allAssets.find((asset) => asset.id === activeAssetId) ?? null,
    [activeAssetId, allAssets]
  );
  const inspectAsset = useMemo(
    () => allAssets.find((asset) => asset.id === inspectAssetId) ?? null,
    [inspectAssetId, allAssets]
  );
  const inspectGroup = useMemo(
    () =>
      inspectAsset
        ? entityGroups.find((group) => group.entityId === inspectAsset.entityId) ?? null
        : null,
    [entityGroups, inspectAsset]
  );

  const activeIndex = useMemo(
    () => allAssets.findIndex((asset) => asset.id === activeAssetId),
    [activeAssetId, allAssets]
  );

  useEffect(() => {
    if (!inspectAsset || !isManagedImage(inspectAsset)) return;
    setEditDraft({
      kind: inspectAsset.kind || "reference",
      caption: inspectAsset.caption || "",
      sortOrder: String(inspectAsset.sortOrder ?? 0),
    });
  }, [inspectAsset]);

  useEffect(() => {
    if (!initialInspectAssetId) return;
    if (!allAssets.some((asset) => asset.id === initialInspectAssetId)) return;
    setInspectAssetId(initialInspectAssetId);
  }, [allAssets, initialInspectAssetId]);

  function openAsset(assetId: string) {
    setActiveAssetId(assetId);
  }

  function openInspect(assetId: string) {
    setInspectAssetId(assetId);
  }

  function moveAsset(direction: -1 | 1) {
    if (activeIndex < 0) return;
    const nextIndex = activeIndex + direction;
    if (nextIndex < 0 || nextIndex >= allAssets.length) return;
    setActiveAssetId(allAssets[nextIndex]?.id ?? null);
  }

async function refreshVisualState(successMessage?: string) {
  router.refresh();
  if (successMessage) notifySuccess(successMessage);
}

  async function handleSaveInlineEdit() {
    if (!inspectAsset || !isManagedImage(inspectAsset)) return;

    setSaving(true);
    try {
      const res = await fetch(
        `/api/worlds/${worldId}/entities/${inspectAsset.entityId}/images/${inspectAsset.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: editDraft.kind,
            caption: editDraft.caption || undefined,
            sortOrder: Number(editDraft.sortOrder || "0"),
          }),
        }
      );
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao atualizar asset.");
      await refreshVisualState("Asset visual atualizado.");
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Falha ao atualizar asset.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePromoteEntityImage(role: "coverImageUrl" | "portraitImageUrl") {
    if (!inspectAsset) return;

    setSaving(true);
    try {
      const res = await fetch(
        `/api/worlds/${worldId}/entities/${inspectAsset.entityId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            [role]: inspectAsset.url,
          }),
        }
      );
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao promover asset.");
      await refreshVisualState(
        role === "coverImageUrl" ? "Asset definido como capa." : "Asset definido como retrato."
      );
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Falha ao promover asset.");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkAsReveal() {
    if (!inspectAsset) return;

    if (!isManagedImage(inspectAsset)) {
      notifyError(
        "Capa e retrato principais sao derivados da entidade. Use um asset da galeria para marcar reveal."
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `/api/worlds/${worldId}/entities/${inspectAsset.entityId}/images/${inspectAsset.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "reveal",
          }),
        }
      );
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Falha ao marcar asset como reveal.");
      await refreshVisualState("Asset marcado como reveal.");
    } catch (error) {
      notifyError(
        error instanceof Error ? error.message : "Falha ao marcar asset como reveal."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        {entityGroups.map((group) => (
          <section key={group.entityId} className="chrome-panel rounded-[30px] p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-primary/20 bg-primary/10 text-primary">
                    {group.entityType}
                  </Badge>
                  {group.entitySubtype ? (
                    <Badge className="border-white/10 bg-black/24 text-white/72">
                      {group.entitySubtype}
                    </Badge>
                  ) : null}
                  {group.campaignName ? (
                    <Badge className="border-white/10 bg-black/24 text-white/72">
                      {group.campaignName}
                    </Badge>
                  ) : null}
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-foreground">
                    {group.entityName}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {group.assets.length} asset{group.assets.length > 1 ? "s" : ""} visuais ligados a esta entidade.
                  </p>
                </div>
                {group.tags.length ? (
                  <div className="flex flex-wrap gap-2">
                    {group.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} className="border-white/10 bg-white/5 text-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              <Button variant="outline" className="border-white/10 bg-white/5" asChild>
                <Link href={`/app/worlds/${worldId}/codex/${group.entityId}`}>
                  Abrir entidade
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3 2xl:grid-cols-4">
              {group.assets.map((asset) => (
                <Card key={asset.id} className="overflow-hidden rounded-[28px] border-white/10 bg-black/20">
                  <CardContent className="p-0">
                    <div className="relative min-h-[320px]">
                      <button
                        type="button"
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.14), rgba(8,8,13,0.94)), url(${asset.url})`,
                        }}
                        onClick={() => openAsset(asset.id)}
                      />

                      <div className="relative flex min-h-[320px] flex-col justify-between p-5">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                              <Badge className="border-white/10 bg-black/28 text-white">
                                {getVisualKindLabel(asset.kind)}
                              </Badge>
                              {asset.isEntityCover ? (
                                <Badge className="border-amber-300/20 bg-amber-300/10 text-amber-100">
                                  capa ativa
                                </Badge>
                              ) : null}
                              {asset.isEntityPortrait ? (
                                <Badge className="border-sky-300/20 bg-sky-300/10 text-sky-100">
                                  retrato ativo
                                </Badge>
                              ) : null}
                              <Badge
                                className={
                                  getVisualReadiness(asset).status === "ready"
                                    ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                                    : getVisualReadiness(asset).status === "curating"
                                      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                                      : "border-white/10 bg-black/28 text-white/72"
                                }
                              >
                                {getVisualReadiness(asset).label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <RevealButton
                                type="IMAGE"
                                title={`${group.entityName} · ${getVisualKindLabel(asset.kind)}`}
                                content={asset.caption || undefined}
                                imageUrl={asset.url}
                                campaigns={campaigns}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white/70 hover:text-white"
                                onClick={() => openInspect(asset.id)}
                                title="Inspecionar asset"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-black uppercase tracking-[0.04em] text-white">
                              {group.entityName}
                            </h3>
                            <p className="mt-2 text-sm text-white/72">
                              {asset.caption || "Sem legenda registrada para este asset visual."}
                            </p>
                            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/45">
                              {getVisualReadiness(asset).description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/55">
                                <ImageIcon className="h-3.5 w-3.5" />
                                Papel
                              </div>
                              <p className="mt-2 text-sm font-semibold text-white">
                                {getVisualKindLabel(asset.kind)}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/28 p-3">
                              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/55">
                                <GalleryVerticalEnd className="h-3.5 w-3.5" />
                                Ordem
                              </div>
                              <p className="mt-2 text-sm font-semibold text-white">
                                {asset.sortOrder ?? 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Dialog open={activeAsset !== null} onOpenChange={(open) => !open && setActiveAssetId(null)}>
        <DialogContent className="chrome-panel max-w-[min(92vw,1440px)] border-white/10 bg-card/92 p-0">
          {activeAsset ? (
            <div className="grid min-h-[80vh] gap-0 xl:grid-cols-[minmax(0,1.4fr)_380px]">
              <div className="relative flex items-center justify-center overflow-hidden bg-black/70 p-4">
                <img
                  src={activeAsset.url}
                  alt={activeAsset.caption || activeAsset.entityName}
                  className="max-h-[74vh] w-full rounded-[24px] object-contain"
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute left-4 top-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-black/35 text-white"
                    onClick={() => moveAsset(-1)}
                    disabled={activeIndex <= 0}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-black/35 text-white"
                    onClick={() => moveAsset(1)}
                    disabled={activeIndex < 0 || activeIndex >= allAssets.length - 1}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 text-white/80 hover:text-white"
                  onClick={() => setActiveAssetId(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex flex-col border-l border-white/8 p-6">
                <DialogHeader className="space-y-3 text-left">
                  <Badge className="w-fit border-primary/20 bg-primary/10 text-primary">
                    {getVisualKindLabel(activeAsset.kind)}
                  </Badge>
                  <DialogTitle className="text-2xl font-black uppercase tracking-[0.04em]">
                    {activeAsset.entityName}
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-7 text-muted-foreground">
                    {activeAsset.caption || getVisualKindDescription(activeAsset.kind)}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Contexto</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className="border-white/10 bg-black/24 text-foreground">
                        {activeAsset.entityType}
                      </Badge>
                      {activeAsset.entitySubtype ? (
                        <Badge className="border-white/10 bg-black/24 text-foreground">
                          {activeAsset.entitySubtype}
                        </Badge>
                      ) : null}
                      {activeAsset.campaignName ? (
                        <Badge className="border-white/10 bg-black/24 text-foreground">
                          {activeAsset.campaignName}
                        </Badge>
                      ) : null}
                      {activeAsset.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} className="border-white/10 bg-black/24 text-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Uso de mesa</p>
                    <div className="mt-4 space-y-3">
                      <RevealButton
                        type="IMAGE"
                        title={`${activeAsset.entityName} · ${getVisualKindLabel(activeAsset.kind)}`}
                        content={activeAsset.caption || undefined}
                        imageUrl={activeAsset.url}
                        campaigns={campaigns}
                      />
                      <Button
                        variant="outline"
                        className="w-full justify-between border-white/10 bg-white/5"
                        onClick={() => openInspect(activeAsset.id)}
                      >
                        Abrir quick inspect
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-muted-foreground">
                        Use reveal para TV/segunda tela. O quick inspect serve para curadoria e preparo do asset sem voltar ao Codex inteiro.
                      </div>
                      <div className="space-y-2">
                        {campaigns.filter((campaign) => campaign.roomCode).length ? (
                          campaigns
                            .filter((campaign) => campaign.roomCode)
                            .map((campaign) => (
                              <Button
                                key={campaign.id}
                                variant="outline"
                                className="w-full justify-between border-white/10 bg-white/5"
                                asChild
                              >
                                <Link href={`/play/${campaign.roomCode}`} target="_blank">
                                  Abrir segunda tela · {campaign.name}
                                  <MonitorPlay className="h-4 w-4" />
                                </Link>
                              </Button>
                            ))
                        ) : (
                          <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-muted-foreground">
                            Nenhuma campanha deste mundo tem `roomCode` pronto para abrir a segunda tela ainda.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-6">
                  <Button variant="outline" className="justify-between border-white/10 bg-white/5" asChild>
                    <Link href={activeAsset.url} target="_blank">
                      Abrir imagem original
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-between border-white/10 bg-white/5" asChild>
                    <Link href={`/app/worlds/${worldId}/codex/${activeAsset.entityId}`}>
                      Abrir entidade
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Sheet open={inspectAsset !== null} onOpenChange={(open) => !open && setInspectAssetId(null)}>
        <SheetContent
          side="right"
          className="chrome-panel w-full max-w-[calc(100%-1rem)] overflow-y-auto border-white/10 bg-card/96 p-0 sm:max-w-xl xl:max-w-2xl"
        >
          {inspectAsset ? (
            <div className="flex min-h-full flex-col">
              <div
                className="min-h-[240px] border-b border-white/8 bg-cover bg-center p-6"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(8,8,13,0.22), rgba(8,8,13,0.92)), url(${inspectAsset.url})`,
                }}
              >
                <SheetHeader className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="border-primary/20 bg-primary/10 text-primary">
                      Quick inspect
                    </Badge>
                    <Badge className="border-white/10 bg-black/28 text-white">
                      {getVisualKindLabel(inspectAsset.kind)}
                    </Badge>
                    {inspectAsset.isEntityCover ? (
                      <Badge className="border-amber-300/20 bg-amber-300/10 text-amber-100">
                        capa ativa
                      </Badge>
                    ) : null}
                    {inspectAsset.isEntityPortrait ? (
                      <Badge className="border-sky-300/20 bg-sky-300/10 text-sky-100">
                        retrato ativo
                      </Badge>
                    ) : null}
                  </div>
                  <SheetTitle className="text-3xl font-black uppercase tracking-[0.04em] text-foreground">
                    {inspectAsset.entityName}
                  </SheetTitle>
                  <SheetDescription className="max-w-2xl text-sm leading-7 text-white/72">
                    {inspectAsset.caption ||
                      inspectAsset.entitySummary ||
                      getVisualKindDescription(inspectAsset.kind)}
                  </SheetDescription>
                </SheetHeader>
              </div>

              <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Contexto do asset</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge className="border-white/10 bg-black/24 text-foreground">
                          {inspectAsset.entityType}
                        </Badge>
                        {inspectAsset.entitySubtype ? (
                          <Badge className="border-white/10 bg-black/24 text-foreground">
                            {inspectAsset.entitySubtype}
                          </Badge>
                        ) : null}
                        {inspectAsset.campaignName ? (
                          <Badge className="border-white/10 bg-black/24 text-foreground">
                            {inspectAsset.campaignName}
                          </Badge>
                        ) : null}
                        <Badge className="border-white/10 bg-black/24 text-foreground">
                          ordem {inspectAsset.sortOrder ?? 0}
                        </Badge>
                        <Badge
                          className={
                            getVisualReadiness(inspectAsset).status === "ready"
                              ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                              : getVisualReadiness(inspectAsset).status === "curating"
                                ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                                : "border-white/10 bg-black/24 text-foreground"
                          }
                        >
                          {getVisualReadiness(inspectAsset).label}
                        </Badge>
                      </div>
                      {inspectAsset.tags.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {inspectAsset.tags.map((tag) => (
                            <Badge key={tag} className="border-white/10 bg-white/5 text-foreground">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {getVisualReadiness(inspectAsset).description}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Curadoria rápida</p>
                      {isManagedImage(inspectAsset) ? (
                        <div className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Papel visual</label>
                            <SelectField
                              className="h-11 w-full rounded-2xl border-white/10 bg-black/20 px-3 text-sm text-foreground"
                              value={editDraft.kind}
                              onValueChange={(value) =>
                                setEditDraft((prev) => ({ ...prev, kind: value }))
                              }
                              options={VISUAL_KIND_OPTIONS.map((option) => ({
                                value: option.value,
                                label: option.label,
                              }))}
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Ordem</label>
                              <Input
                                value={editDraft.sortOrder}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({
                                    ...prev,
                                    sortOrder: event.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Legenda</label>
                              <Textarea
                                rows={3}
                                value={editDraft.caption}
                                onChange={(event) =>
                                  setEditDraft((prev) => ({
                                    ...prev,
                                    caption: event.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                          <Button onClick={() => void handleSaveInlineEdit()} disabled={saving}>
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? "Salvando..." : "Salvar asset"}
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-6 text-muted-foreground">
                          Este asset e derivado da entidade principal. Ele participa da leitura visual, mas a curadoria
                          fina acontece via promocao de capa ou retrato, nao por edicao direta da biblioteca.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Preparo de mesa</p>
                      <div className="mt-4 space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-between border-white/10 bg-white/5"
                          onClick={() => void handlePromoteEntityImage("coverImageUrl")}
                          disabled={saving}
                        >
                          Definir como capa da entidade
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-between border-white/10 bg-white/5"
                          onClick={() => void handlePromoteEntityImage("portraitImageUrl")}
                          disabled={saving}
                        >
                          Definir como retrato principal
                          <UserSquare2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-between border-white/10 bg-white/5"
                          onClick={() => void handleMarkAsReveal()}
                          disabled={saving || !isManagedImage(inspectAsset)}
                        >
                          Marcar como reveal
                          <Sparkles className="h-4 w-4" />
                        </Button>
                        <RevealButton
                          type="IMAGE"
                          title={`${inspectAsset.entityName} · ${getVisualKindLabel(inspectAsset.kind)}`}
                          content={inspectAsset.caption || undefined}
                          imageUrl={inspectAsset.url}
                          campaigns={campaigns}
                        />
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-white/8 bg-white/4 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Navegação</p>
                      <div className="mt-4 space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-between border-white/10 bg-white/5"
                          onClick={() => openAsset(inspectAsset.id)}
                        >
                          Abrir lightbox
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between border-white/10 bg-white/5" asChild>
                          <Link href={`/app/worlds/${worldId}/codex/${inspectAsset.entityId}`}>
                            Abrir entidade
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        {inspectGroup ? (
                          <div className="rounded-2xl border border-white/8 bg-black/20 p-3 text-sm text-muted-foreground">
                            {inspectGroup.assets.length} assets visuais ligados a esta entidade nesta leitura.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
