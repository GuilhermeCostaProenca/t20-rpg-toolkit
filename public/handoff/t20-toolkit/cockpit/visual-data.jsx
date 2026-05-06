// visual-data.jsx — Visual asset library for T20 OS

const VISUAL_CATEGORIES = ["Todos", "Mapas", "Personagens", "Locais", "Criaturas", "Cenas", "Itens"];

// SVG placeholder art — atmospheric, editorial
// Each asset has: id, title, category, aspect (w/h ratio), entity link, mood, gradient colors
const VISUAL_ASSETS = [
  // ── Mapas ──
  {
    id: "v1", title: "Arton — Mapa do Reinado",
    category: "Mapas", aspect: 16/9,
    entityName: "Valkaria", featured: true,
    realImage: "assets/arton-map.jpg",
    mood: "Épico, cartográfico",
    gradient: ["#1a1208", "#2a1e08", "#0d1a18"],
    accent: "#d5a240",
    label: "MAPA COMPLETO",
  },
  {
    id: "v2", title: "Porto de Valkaria — Setor Leste",
    category: "Mapas", aspect: 4/3,
    entityName: "Valkaria",
    mood: "Urbano, noturno",
    gradient: ["#08101a", "#0a1420", "#06070c"],
    accent: "#4b9f91",
    label: "MAPA DE BATALHA",
  },
  {
    id: "v3", title: "Ruínas de Yuden",
    category: "Mapas", aspect: 1,
    entityName: "Grimório da Sombra",
    mood: "Sombrio, maldito",
    gradient: ["#120810", "#1a0d18", "#06070c"],
    accent: "#9b5de5",
    label: "LOCAL AMALDIÇOADO",
  },

  // ── Personagens ──
  {
    id: "v4", title: "Serafina Valdris",
    category: "Personagens", aspect: 3/4,
    entityName: "Serafina Valdris",
    mood: "Heroico, divino",
    gradient: ["#0a1020", "#101828", "#060c18"],
    accent: "#4f7cff",
    label: "PALADINA · NÍV. 8",
  },
  {
    id: "v5", title: "Kulthar Rex",
    category: "Personagens", aspect: 3/4,
    entityName: "Kulthar Rex",
    mood: "Brutal, selvagem",
    gradient: ["#180a08", "#220e0a", "#06070c"],
    accent: "#bc4a3f",
    label: "GUERREIRO · NÍV. 8",
  },
  {
    id: "v6", title: "Trog Irontooth",
    category: "Personagens", aspect: 3/4,
    entityName: "Trog Irontooth",
    mood: "Ambíguo, sombrio",
    gradient: ["#100e08", "#1a180a", "#06070c"],
    accent: "#d5a240",
    label: "NPC · INFORMANTE",
  },
  {
    id: "v7", title: "Capitão Sombrio",
    category: "Personagens", aspect: 3/4,
    entityName: null,
    mood: "Ameaçador, corrupto",
    gradient: ["#14060c", "#200810", "#06070c"],
    accent: "#e879f9",
    label: "ANTAGONISTA",
  },

  // ── Locais ──
  {
    id: "v8", title: "Valkaria — Vista Aérea",
    category: "Locais", aspect: 16/9,
    entityName: "Valkaria",
    mood: "Grandioso, imperial",
    gradient: ["#080c18", "#0c1220", "#06070c"],
    accent: "#4b9f91",
    label: "CAPITAL DO REINADO",
  },
  {
    id: "v9", title: "Templo de Khalmyr",
    category: "Locais", aspect: 3/4,
    entityName: "Templo de Khalmyr",
    mood: "Sagrado, imponente",
    gradient: ["#0a100c", "#101814", "#06070c"],
    accent: "#d5a240",
    label: "SANTUÁRIO",
  },
  {
    id: "v10", title: "Armazém 7 — Cena do Crime",
    category: "Locais", aspect: 16/9,
    entityName: null,
    mood: "Tenso, sombrio",
    gradient: ["#120808", "#1a0c0a", "#06070c"],
    accent: "#bc4a3f",
    label: "TEATRO DE BATALHA",
  },

  // ── Criaturas ──
  {
    id: "v11", title: "Guarda Corrupto — Forma Verdadeira",
    category: "Criaturas", aspect: 1,
    entityName: null,
    mood: "Horror, distorção",
    gradient: ["#100814", "#18101e", "#06070c"],
    accent: "#9b5de5",
    label: "INIMIGO · CA 13",
  },
  {
    id: "v12", title: "Tenebra — O Dragão Sombrio",
    category: "Criaturas", aspect: 16/9,
    entityName: null,
    mood: "Catastrófico, épico",
    gradient: ["#0c0608", "#160a0c", "#06070c"],
    accent: "#e06155",
    label: "GRANDE AMEAÇA",
  },

  // ── Cenas ──
  {
    id: "v13", title: "Batalha do Porto — Clímax",
    category: "Cenas", aspect: 16/9,
    entityName: "Batalha do Porto",
    mood: "Urgência, caos",
    gradient: ["#180808", "#200c0c", "#06070c"],
    accent: "#bc4a3f",
    label: "SESSÃO 12",
  },
  {
    id: "v14", title: "Interrogatório de Trog",
    category: "Cenas", aspect: 4/3,
    entityName: "Trog Irontooth",
    mood: "Suspense, pressão",
    gradient: ["#0e0c08", "#181408", "#06070c"],
    accent: "#d5a240",
    label: "SESSÃO 12",
  },

  // ── Itens ──
  {
    id: "v15", title: "Grimório da Sombra",
    category: "Itens", aspect: 3/4,
    entityName: "Grimório da Sombra",
    mood: "Sombrio, arcano",
    gradient: ["#080c14", "#0c1020", "#06070c"],
    accent: "#4f7cff",
    label: "ARTEFATO ÚNICO",
  },
  {
    id: "v16", title: "Amuleto do General Valdris",
    category: "Itens", aspect: 1,
    entityName: "Serafina Valdris",
    mood: "Épico, pessoal",
    gradient: ["#0e0c08", "#181408", "#06070c"],
    accent: "#d5a240",
    label: "ITEM PESSOAL",
  },
];

const CATEGORY_META = {
  "Todos":       { color: "#f4efe7", icon: "images" },
  "Mapas":       { color: "#4b9f91", icon: "map" },
  "Personagens": { color: "#4f7cff", icon: "shield" },
  "Locais":      { color: "#d5a240", icon: "target" },
  "Criaturas":   { color: "#bc4a3f", icon: "skull" },
  "Cenas":       { color: "#e879f9", icon: "swords" },
  "Itens":       { color: "#9b5de5", icon: "scroll" },
};

Object.assign(window, { VISUAL_ASSETS, VISUAL_CATEGORIES, CATEGORY_META });
