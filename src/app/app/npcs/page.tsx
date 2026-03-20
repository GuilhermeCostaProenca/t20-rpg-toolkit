"use client";

import { LegacyWorldBridge } from "@/components/legacy-world-bridge";

export default function NpcsPage() {
  return (
    <LegacyWorldBridge
      title="NPCs agora vivem dentro do mundo."
      description="A navegacao global antiga saiu do centro do produto. O novo fluxo leva voce direto para os NPCs do primeiro mundo ativo."
      targetLabel="NPCs do mundo"
      segment="npcs"
    />
  );
}
