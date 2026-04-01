"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { getVisualKindLabel } from "@/lib/visual-library";

type FilterOption = { value: string; label: string };

type VisualLibraryFiltersProps = {
  initial: {
    term?: string;
    type?: string;
    kind?: string;
    campaignId?: string;
    subtype?: string;
    tag?: string;
  };
  campaigns: FilterOption[];
  allKinds: string[];
  allSubtypes: string[];
  allTags: string[];
};

export function VisualLibraryFilters({
  initial,
  campaigns,
  allKinds,
  allSubtypes,
  allTags,
}: VisualLibraryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [term, setTerm] = useState(initial.term || "");
  const [type, setType] = useState(initial.type || "");
  const [kind, setKind] = useState(initial.kind || "");
  const [campaignId, setCampaignId] = useState(initial.campaignId || "");
  const [subtype, setSubtype] = useState(initial.subtype || "");
  const [tag, setTag] = useState(initial.tag || "");

  const kindOptions = useMemo(
    () => allKinds.map((value) => ({ value, label: getVisualKindLabel(value) })),
    [allKinds]
  );

  function applyFilters() {
    const params = new URLSearchParams();
    if (term.trim()) params.set("term", term.trim());
    if (type) params.set("type", type);
    if (kind) params.set("kind", kind);
    if (campaignId) params.set("campaignId", campaignId);
    if (subtype) params.set("subtype", subtype);
    if (tag) params.set("tag", tag);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,0.9fr))]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Entidade, resumo ou subtipo"
          className="h-12 rounded-2xl border-white/10 bg-black/25 pl-11"
        />
      </div>
      <SelectField
        className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm"
        value={type}
        onValueChange={setType}
        placeholder="Todos os tipos"
        options={[
          { value: "house", label: "house" },
          { value: "character", label: "character" },
          { value: "npc", label: "npc" },
          { value: "place", label: "place" },
          { value: "faction", label: "faction" },
          { value: "artifact", label: "artifact" },
        ]}
      />
      <SelectField
        className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm"
        value={kind}
        onValueChange={setKind}
        placeholder="Todos os papeis"
        options={kindOptions}
      />
      <SelectField
        className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm"
        value={campaignId}
        onValueChange={setCampaignId}
        placeholder="Todas as campanhas"
        options={campaigns}
      />
      <SelectField
        className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm"
        value={subtype}
        onValueChange={setSubtype}
        placeholder="Todos os subtipos"
        options={allSubtypes.map((value) => ({ value, label: value }))}
      />
      <SelectField
        className="h-12 rounded-2xl border-white/10 bg-black/25 px-4 text-sm"
        value={tag}
        onValueChange={setTag}
        placeholder="Todas as tags"
        options={allTags.map((value) => ({ value, label: value }))}
      />
      <Button type="button" onClick={applyFilters} className="h-12 xl:col-start-6 xl:row-start-2">
        Aplicar leitura
      </Button>
    </div>
  );
}
