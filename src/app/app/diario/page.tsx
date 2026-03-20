"use client";

import { LegacyWorldBridge } from "@/components/legacy-world-bridge";

export default function DiarioPage() {
  return (
    <LegacyWorldBridge
      title="O diario agora acompanha a vida do mundo."
      description="As anotacoes globais deram lugar a uma memoria contextual. Vamos te levar para o diario do primeiro mundo ativo."
      targetLabel="diario do mundo"
      segment="diary"
    />
  );
}
