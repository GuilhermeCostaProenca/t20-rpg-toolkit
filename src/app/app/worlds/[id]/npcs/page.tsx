"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, Plus, Search, Skull, Shield, Heart } from "lucide-react";
import { RevealButton } from "@/components/reveal-button";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppFeedback } from "@/components/app-feedback-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type CodexEntity = {
    id: string;
    name: string;
    type: string;
    campaignId?: string | null;
    metadata?: { legacyNpcId?: string } | null;
};

type NpcItem = {
    id: string;
    name: string;
    type: string;
    hpMax: number;
    defenseFinal: number;
    description?: string | null;
    tags?: string | null;
    imageUrl?: string | null;
    campaignId?: string | null;
    campaign?: { id: string; name: string } | null;
};

const createNpcFormSchema = z.object({
    name: z.string().trim().min(2, "Nome precisa de pelo menos 2 caracteres"),
    campaignId: z.string().optional(),
    hpMax: z.coerce.number().int().min(1, "PV maximo deve ser >= 1"),
    defenseFinal: z.coerce.number().int().min(0, "Defesa deve ser >= 0"),
    description: z.string().optional(),
    tags: z.string().optional(),
    type: z.enum(["npc", "enemy"]),
});

const initialNpcForm = {
    name: "",
    campaignId: "",
    hpMax: 10,
    defenseFinal: 10,
    description: "",
    tags: "",
    type: "npc" as "npc" | "enemy",
};

export default function WorldNpcsPage() {
    const params = useParams();
    const router = useRouter();
    const worldId = params?.id as string;
    const [npcs, setNpcs] = useState<NpcItem[]>([]);
    const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
    const [codexEntities, setCodexEntities] = useState<CodexEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [syncingNpcId, setSyncingNpcId] = useState<string | null>(null);
    const { notifyError, notifySuccess } = useAppFeedback();
    const createForm = useForm<typeof initialNpcForm>({
        resolver: zodResolver(createNpcFormSchema),
        defaultValues: initialNpcForm,
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [npcsRes, worldRes, codexRes] = await Promise.all([
                fetch(`/api/npcs?worldId=${worldId}`),
                fetch(`/api/worlds/${worldId}`),
                fetch(`/api/worlds/${worldId}/codex`)
            ]);

            const [npcsData, worldData, codexData] = await Promise.all([
                npcsRes.json(),
                worldRes.json(),
                codexRes.json(),
            ]);

            setNpcs(npcsData.data || []);
            setCampaigns(worldData.data?.campaigns || []);
            setCodexEntities(codexData.data?.entities || []);

            const firstCampaignId = worldData.data?.campaigns?.[0]?.id as string | undefined;
            if (firstCampaignId && !createForm.getValues("campaignId")) {
                createForm.setValue("campaignId", firstCampaignId);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [createForm, worldId]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    async function handleCreate(values: typeof initialNpcForm) {
        createForm.clearErrors("root");
        try {
            const res = await fetch("/api/npcs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    hpMax: Number(values.hpMax),
                    defenseFinal: Number(values.defenseFinal),
                    worldId
                })
            });
            if (!res.ok) throw new Error("Erro ao criar NPC");

            const selectedCampaignId = createForm.getValues("campaignId");
            setCreateOpen(false);
            createForm.reset({ ...initialNpcForm, campaignId: selectedCampaignId ?? "" });
            notifySuccess("NPC criado.");
            await loadData();
        } catch {
            createForm.setError("root", {
                type: "server",
                message: "Verifique os dados informados e tente novamente.",
            });
            notifyError("Falha ao criar NPC", "Verifique os dados informados e tente novamente.", true);
        }
    }

    function matchNpcEntity(npc: NpcItem) {
        return codexEntities.find((entity) => {
            const metadata = entity.metadata || {};
            return metadata.legacyNpcId === npc.id
                || (
                    entity.type === "npc"
                    && entity.name.trim().toLowerCase() === npc.name.trim().toLowerCase()
                    && (entity.campaignId || "") === (npc.campaignId || "")
                );
        });
    }

    async function handleCreateCodexEntityFromNpc(npc: NpcItem) {
        setSyncingNpcId(npc.id);
        try {
            const res = await fetch(`/api/worlds/${worldId}/entities`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaignId: npc.campaignId || undefined,
                    name: npc.name,
                    type: "npc",
                    summary: npc.description || undefined,
                    description: npc.description || undefined,
                    tags: npc.tags ? npc.tags.split(",").map((item) => item.trim()).filter(Boolean) : [],
                    portraitImageUrl: npc.imageUrl || undefined,
                    metadata: {
                        legacyNpcId: npc.id,
                        legacyNpcType: npc.type,
                        hpMax: npc.hpMax,
                        defenseFinal: npc.defenseFinal,
                        damageFormula: undefined,
                    },
                }),
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(payload.error || "Falha ao criar entidade no Codex");
            notifySuccess("NPC espelhado no Codex.");
            await loadData();
            if (payload.data?.id) router.push(`/app/worlds/${worldId}/codex/${payload.data.id}`);
        } catch (error) {
            notifyError(
                "Falha ao espelhar NPC no Codex",
                error instanceof Error ? error.message : "Erro inesperado ao espelhar NPC",
                true
            );
        } finally {
            setSyncingNpcId(null);
        }
    }

    const filteredNpcs = npcs.filter((n) =>
        n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.tags?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bestiario & NPCs</h1>
                    <p className="text-muted-foreground">Gerencie criaturas e personagens do mestre.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou tag..."
                            className="pl-8 bg-black/20 border-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog
                        open={createOpen}
                        onOpenChange={(open) => {
                            setCreateOpen(open);
                            if (!open) createForm.clearErrors("root");
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Novo NPC
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Criar Novo NPC</DialogTitle>
                            </DialogHeader>
                            <Form {...createForm}>
                                <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                                    <FormField
                                        control={createForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nome</FormLabel>
                                                <FormControl>
                                                    <Input value={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={createForm.control}
                                            name="hpMax"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PV Maximo</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            value={field.value}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={createForm.control}
                                            name="defenseFinal"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Defesa</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            value={field.value}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={createForm.control}
                                        name="campaignId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Campanha</FormLabel>
                                                <FormControl>
                                                    <SelectField
                                                        className="bg-black/40"
                                                        value={field.value || "UNSELECTED"}
                                                        onValueChange={(value) => field.onChange(value === "UNSELECTED" ? "" : value)}
                                                        options={[
                                                            { value: "UNSELECTED", label: "Selecione..." },
                                                            ...campaigns.map((campaign) => ({
                                                                value: campaign.id,
                                                                label: campaign.name,
                                                            })),
                                                        ]}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createForm.control}
                                        name="tags"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tags (separadas por virgula)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Goblin, Humano, Chefe..."
                                                        value={field.value ?? ""}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descricao</FormLabel>
                                                <FormControl>
                                                    <Textarea value={field.value ?? ""} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {createForm.formState.errors.root?.message ? (
                                        <p className="text-sm text-destructive">{createForm.formState.errors.root.message}</p>
                                    ) : null}
                                    <Button type="submit" className="w-full" disabled={createForm.formState.isSubmitting}>
                                        {createForm.formState.isSubmitting ? "Criando..." : "Criar Besta"}
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
                </div>
            ) : filteredNpcs.length === 0 ? (
                <div className="text-center py-20 opacity-50 border border-dashed border-white/10 rounded-xl">
                    Nada encontrado. O mundo esta seguro... por enquanto.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredNpcs.map((npc) => {
                        const codexEntity = matchNpcEntity(npc);
                        return (
                        <Card key={npc.id} className="bg-white/5 border-white/10 hover:border-primary/30 transition-colors group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Skull className="h-4 w-4 text-primary" />
                                    {npc.name}
                                </CardTitle>
                                <div className="flex items-center gap-1">
                                    <RevealButton
                                        type="NPC"
                                        title={npc.name}
                                        content={npc.description || ""}
                                        campaigns={campaigns}
                                    />
                                    <Badge variant="outline" className="text-[10px] uppercase">{npc.type}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground mb-4 line-clamp-2 min-h-[2.5em]">
                                    {npc.description || "Sem descricao."}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1 text-green-400">
                                        <Heart className="h-3 w-3" />
                                        <span>{npc.hpMax} PV</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-blue-400">
                                        <Shield className="h-3 w-3" />
                                        <span>{npc.defenseFinal} Def</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 pb-3 text-[10px] text-muted-foreground flex flex-col items-stretch gap-3">
                                <div className="flex justify-between">
                                    <span className="truncate max-w-[120px]">{npc.campaign?.name}</span>
                                    <span className="opacity-50 group-hover:opacity-100 uppercase tracking-widest">{npc.tags}</span>
                                </div>
                                {codexEntity ? (
                                    <Button asChild size="sm" variant="outline" className="border-white/10 bg-white/5 justify-between">
                                        <Link href={`/app/worlds/${worldId}/codex/${codexEntity.id}`}>
                                            Abrir no Codex
                                            <BookOpen className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" className="border-white/10 bg-white/5 justify-between" onClick={() => void handleCreateCodexEntityFromNpc(npc)} disabled={syncingNpcId === npc.id}>
                                        {syncingNpcId === npc.id ? "Espelhando..." : "Criar no Codex"}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );})}
                </div>
            )}
        </div>
    );
}
