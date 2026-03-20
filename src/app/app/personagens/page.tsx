"use client";

import { LegacyWorldBridge } from "@/components/legacy-world-bridge";

export default function PersonagensPage() {
  return (
    <LegacyWorldBridge
      title="Personagens agora entram pelo mundo."
      description="A estrutura nova coloca personagens dentro do contexto canonico do mundo. Vamos abrir os personagens do primeiro mundo ativo."
      targetLabel="personagens do mundo"
      segment="characters"
    />
  );
}
