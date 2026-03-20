"use client";

import { LegacyWorldBridge } from "@/components/legacy-world-bridge";

export default function LocaisPage() {
  return (
    <LegacyWorldBridge
      title="Locais agora pertencem ao cockpit do mundo."
      description="A navegacao nova elimina a ida e volta entre listas globais. Esta ponte leva voce direto para os locais do primeiro mundo ativo."
      targetLabel="locais do mundo"
      segment="locations"
    />
  );
}
