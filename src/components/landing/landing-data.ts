export type FeatureItem = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  previewTitle: string;
  accentFrom: string;
  accentTo: string;
};

export const LANDING_FEATURES: FeatureItem[] = [
  {
    id: "codex",
    title: "Codex vivo de mundo",
    eyebrow: "Entidades conectadas",
    description:
      "Personagens, faccoes, lugares e eventos em um mesmo dominio com historico navegavel.",
    previewTitle: "Indice world-first com contexto narrativo",
    accentFrom: "#4f7cff",
    accentTo: "#78d4ff",
  },
  {
    id: "forge",
    title: "Forja de sessao",
    eyebrow: "Prep orientado a mesa",
    description:
      "Transforme ideias em cenas, subcenas, beats e reveals prontos para uso ao vivo.",
    previewTitle: "Pipeline de preparo com passagem direta para a mesa",
    accentFrom: "#15b79e",
    accentTo: "#67e8b8",
  },
  {
    id: "live",
    title: "Mesa ao vivo",
    eyebrow: "Cockpit em tempo real",
    description:
      "Ritmo de cena, combat tracker, quick inspect e operacao visual sem trocar de contexto.",
    previewTitle: "War room operacional para sessao longa",
    accentFrom: "#e879f9",
    accentTo: "#fda4af",
  },
  {
    id: "memory",
    title: "Memoria de mundo",
    eyebrow: "Continuidade narrativa",
    description:
      "Eventos, mudancas persistentes e busca transversal para manter consequencia entre sessoes.",
    previewTitle: "Timeline consultavel por mundo, campanha e entidade",
    accentFrom: "#f59e0b",
    accentTo: "#fde047",
  },
  {
    id: "balance",
    title: "Balanceamento T20",
    eyebrow: "Sinal tatico acionavel",
    description:
      "Leitura de pressao e ajuste rapido com foco em tensao dramatica e seguranca de mesa.",
    previewTitle: "Ajustes contextuais sem quebrar o fluxo narrativo",
    accentFrom: "#f97316",
    accentTo: "#fb7185",
  },
];

export const LANDING_GENRES = [
  { id: "fantasia", label: "Fantasia epica" },
  { id: "sombria", label: "Fantasia sombria" },
  { id: "politica", label: "Intriga politica" },
  { id: "mitica", label: "Saga mitologica" },
  { id: "urbana", label: "Aventura urbana" },
  { id: "fronteira", label: "Expedicao de fronteira" },
];

export const LANDING_STAGES = [
  {
    id: "spark",
    title: "Da faisca ao eixo da campanha",
    text: "Capture a ideia inicial, conecte entidades centrais e defina o tom sem perder velocidade.",
  },
  {
    id: "forge",
    title: "Da preparacao para a mesa",
    text: "Consolide cenas, objetivos e reveals para operar a sessao com clareza sob pressao.",
  },
  {
    id: "legacy",
    title: "Da sessao para memoria duravel",
    text: "Feche o ciclo com consequencia persistente e material pronto para o proximo encontro.",
  },
];
