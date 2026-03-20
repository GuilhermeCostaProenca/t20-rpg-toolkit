"use client";

import { LegacyWorldBridge } from "@/components/legacy-world-bridge";

export default function CompendiumPage() {
  return (
    <LegacyWorldBridge
      title="O compendium global saiu do fluxo principal."
      description="A atualizacao 1 moveu o compendio jogavel para dentro do mundo. Esta rota agora funciona como ponte para o primeiro mundo ativo."
      targetLabel="compendio do mundo"
      segment="compendium"
    />
  );
}
