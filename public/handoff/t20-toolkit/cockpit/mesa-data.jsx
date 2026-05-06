// mesa-data.jsx — Live table session state

const CONDITIONS = [
  { id: "poison",    label: "Envenenado",  color: "#4b9f91", icon: "droplet"  },
  { id: "stunned",   label: "Atordoado",   color: "#d5a240", icon: "zap"      },
  { id: "bleeding",  label: "Sangrando",   color: "#bc4a3f", icon: "activity" },
  { id: "burning",   label: "Em Chamas",   color: "#f97316", icon: "flame"    },
  { id: "cursed",    label: "Amaldiçoado", color: "#9b5de5", icon: "skull"    },
  { id: "prone",     label: "Caído",       color: "#b5aea4", icon: "minus"    },
  { id: "invisible", label: "Invisível",   color: "#4f7cff", icon: "eye-off"  },
  { id: "blessed",   label: "Abençoado",   color: "#d5a240", icon: "sparkles" },
];

const MESA_COMBATANTS = [
  {
    id: 1, name: "Serafina Valdris", type: "PJ",     hp: 34, maxHp: 42,
    mana: 12, maxMana: 20, init: 18, ac: 18,
    status: "ativa", conditions: ["blessed"],
    color: "#4f7cff", class: "Paladina Nv.8",
  },
  {
    id: 2, name: "Kulthar Rex",      type: "PJ",     hp: 12, maxHp: 38,
    mana: 0,  maxMana: 0,  init: 14, ac: 16,
    status: "crítico", conditions: ["bleeding"],
    color: "#4f7cff", class: "Guerreiro Nv.8",
  },
  {
    id: 3, name: "Trog Irontooth",   type: "PJ",     hp: 28, maxHp: 36,
    mana: 8,  maxMana: 14, init: 11, ac: 15,
    status: "ativa", conditions: [],
    color: "#4f7cff", class: "Ladino Nv.7",
  },
  {
    id: 4, name: "Cap. Sombrio",     type: "Inimigo",hp: 28, maxHp: 55,
    mana: 20, maxMana: 30, init: 20, ac: 17,
    status: "ativa", conditions: ["cursed"],
    color: "#bc4a3f", class: "Chefe",
  },
  {
    id: 5, name: "Guarda Corrupto",  type: "Inimigo",hp: 0,  maxHp: 20,
    mana: 0,  maxMana: 0,  init: 9,  ac: 13,
    status: "morto", conditions: [],
    color: "#bc4a3f", class: "Minion",
  },
  {
    id: 6, name: "Guarda Corrupto II",type:"Inimigo",hp: 8,  maxHp: 20,
    mana: 0,  maxMana: 0,  init: 6,  ac: 13,
    status: "ativa", conditions: ["bleeding"],
    color: "#bc4a3f", class: "Minion",
  },
];

const MESA_BEATS = [
  { id: "b1", type: "Abertura",  label: "Porto em alerta",              done: true  },
  { id: "b2", type: "Escalada",  label: "Interrogatório de Trog",        done: true  },
  { id: "b3", type: "Escalada",  label: "Infiltração descoberta",        done: true  },
  { id: "b4", type: "Clímax",    label: "Confronto — Armazém 7",         done: false, current: true },
  { id: "b5", type: "Resolução", label: "Fuga pelo portal",              done: false },
];

const BEAT_COLORS = {
  Abertura:  "#4b9f91",
  Escalada:  "#d5a240",
  Clímax:    "#bc4a3f",
  Resolução: "#9b5de5",
};

const MESA_SCENES = [
  {
    id: "s1", beatId: "b4",
    title: "Armazém 7 — Confronto Final",
    mood: "Urgência extrema",
    hook: "Cap. Sombrio tem 3 reféns e o Grimório. Portal ativa em 5 rodadas.",
    npcs: ["Cap. Sombrio", "Guarda Corrupto", "Guarda Corrupto II", "Reféns (3)"],
    countdown: 5, // rounds until portal
  },
];

const QUICK_ENTITIES = [
  {
    id: 1, name: "Serafina Valdris",
    stats: { "FOR":18,"DES":14,"CON":16,"INT":10,"SAB":15,"CAR":17 },
    ac: 18, attacks: ["Espada Longa +7 (1d8+4)", "Golpe Divino (2d8)"],
    passive: ["Paladina — Imposição de Mãos (3/dia)", "Aura de Proteção (+SAB na CD)"],
  },
  {
    id: 4, name: "Cap. Sombrio",
    stats: { "FOR":16,"DES":14,"CON":18,"INT":14,"SAB":12,"CAR":10 },
    ac: 17, attacks: ["Espada das Sombras +8 (1d8+5, 1d6 sombras)", "Raio Sombrio 15m CD16"],
    passive: ["Manto das Sombras — invisível no escuro", "Resistência Sombria — reduz 5 de dano"],
  },
];

const INITIAL_MESA_ROLLS = [
  { id: 1, char: "Cap. Sombrio", type: "Ataque",    dice: "d20", raw: 17, mod: 8, total: 25, crit: false, ts: "23:04" },
  { id: 2, char: "Serafina",     type: "Defesa",     dice: "d20", raw: 8,  mod: 5, total: 13, crit: false, ts: "23:03" },
  { id: 3, char: "Kulthar",      type: "Fortitude",  dice: "d20", raw: 3,  mod: 3, total: 6,  crit: false, ts: "23:02" },
  { id: 4, char: "Trog",         type: "Ataque",     dice: "d20", raw: 20, mod: 5, total: 25, crit: true,  ts: "23:01" },
];

Object.assign(window, {
  CONDITIONS, MESA_COMBATANTS, MESA_BEATS, BEAT_COLORS,
  MESA_SCENES, QUICK_ENTITIES, INITIAL_MESA_ROLLS,
});
