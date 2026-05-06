// lousa-data.jsx — Mock data para Modo Lousa

const LOUSA_LIBRARY = [
  { id:"lib-c1", tipo:"character", nome:"Lyssara Vahn",     subt:"Arcanista · PJ",        cor:"#d5a240" },
  { id:"lib-c2", tipo:"character", nome:"Kael Pyranthos",    subt:"Cavaleiro · PJ",        cor:"#d5a240" },
  { id:"lib-c3", tipo:"character", nome:"Rufus Kessler",     subt:"Ladino · PJ",           cor:"#d5a240" },
  { id:"lib-n1", tipo:"npc",       nome:"Mestra Vorthuun",   subt:"Mago Ancião",           cor:"#a87fc4" },
  { id:"lib-n2", tipo:"npc",       nome:"Cap. Drusen",       subt:"Guarda da Coroa",       cor:"#a87fc4" },
  { id:"lib-n3", tipo:"npc",       nome:"Marka, a Velha",    subt:"Vidente",               cor:"#a87fc4" },
  { id:"lib-f1", tipo:"faction",   nome:"Casa Kessler",      subt:"Nobreza decadente",     cor:"#5b8fc4" },
  { id:"lib-f2", tipo:"faction",   nome:"Cultistas das Marés",subt:"Seita herege",         cor:"#5b8fc4" },
  { id:"lib-f3", tipo:"faction",   nome:"Ordem da Coroa",    subt:"Cavalaria real",        cor:"#5b8fc4" },
  { id:"lib-p1", tipo:"place",     nome:"Sambúrdia",         subt:"Cidade do deserto",     cor:"#7fb3a3" },
  { id:"lib-p2", tipo:"place",     nome:"Templo Submerso",   subt:"Ruína sagrada",         cor:"#7fb3a3" },
  { id:"lib-p3", tipo:"place",     nome:"Pântano de Mhor",   subt:"Terras marginais",      cor:"#7fb3a3" },
  { id:"lib-a1", tipo:"artifact",  nome:"Coroa Rachada",     subt:"Relíquia perdida",      cor:"#bc4a3f" },
  { id:"lib-a2", tipo:"artifact",  nome:"Diário de Vahn",    subt:"Memórias arcanas",      cor:"#bc4a3f" },
  { id:"lib-e1", tipo:"event",     nome:"A Marcha Verde",    subt:"Há 200 anos",           cor:"#e8b04f" },
];

const LIB_TYPES = [
  { id:"all",       label:"Tudo",        icon:"layers" },
  { id:"character", label:"Personagens", icon:"crown" },
  { id:"npc",       label:"NPCs",        icon:"user-plus" },
  { id:"faction",   label:"Facções",     icon:"shield" },
  { id:"place",     label:"Lugares",     icon:"map-pin" },
  { id:"artifact",  label:"Artefatos",   icon:"key" },
  { id:"event",     label:"Eventos",     icon:"calendar-days" },
];

// Initial canvas state
const INITIAL_NODES = [
  { id:"n1", refId:"lib-c1", x: 380, y: 220 },
  { id:"n2", refId:"lib-c2", x: 220, y: 360 },
  { id:"n3", refId:"lib-n1", x: 600, y: 180 },
  { id:"n4", refId:"lib-a1", x: 540, y: 380 },
  { id:"n5", refId:"lib-f1", x: 240, y: 540 },
  { id:"n6", refId:"lib-p2", x: 760, y: 380 },
];

const INITIAL_EDGES = [
  { id:"ed1", from:"n1", to:"n3", label:"foi aprendiz" },
  { id:"ed2", from:"n1", to:"n4", label:"busca" },
  { id:"ed3", from:"n4", to:"n6", label:"está em" },
  { id:"ed4", from:"n2", to:"n5", label:"oposição" },
  { id:"ed5", from:"n3", to:"n4", label:"conhece" },
];

Object.assign(window, { LOUSA_LIBRARY, LIB_TYPES, INITIAL_NODES, INITIAL_EDGES });
