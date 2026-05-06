// campanha-data.jsx — Mock data para Cockpit de Campanha

const CAMPANHA = {
  nome: "A Marcha das Dunas Verdes",
  mundo: "Arton",
  arco: "Arco II — A Coroa Rachada",
  sessoesRealizadas: 12,
  sessoesPlanejadas: 18,
  proximaSessaoData: "Sábado, 14 de Junho · 20h",
  status: "Em arco ativo",
  resumoArco: "O grupo segue o rastro da Coroa Rachada através do deserto de Sambúrdia. Lyssara recuperou parte da memória; Rufus carrega o segredo do irmão.",
};

const ELENCO = [
  { id:"k1", nome:"Kael Pyranthos",  jogador:"Marina",  classe:"Cavaleiro",   nivel:8, hp:[68,72], ca:21, status:"saudável",     destaque:"Líder tático" },
  { id:"l1", nome:"Lyssara Vahn",     jogador:"Rafael",  classe:"Arcanista",   nivel:8, hp:[44,52], ca:14, status:"ferida",        destaque:"Memória parcial" },
  { id:"r1", nome:"Rufus Kessler",    jogador:"Diego",   classe:"Ladino",      nivel:8, hp:[51,58], ca:17, status:"saudável",     destaque:"Carrega segredo" },
  { id:"v1", nome:"Vesna Halgrim",    jogador:"Camila",  classe:"Druida",      nivel:8, hp:[55,62], ca:16, status:"envenenada",   destaque:"Vínculo com lobo" },
  { id:"o1", nome:"Olin Brightspear", jogador:"Lucas",   classe:"Clérigo",     nivel:8, hp:[60,64], ca:19, status:"saudável",     destaque:"Crise de fé" },
];

const PROXIMA_SESSAO = {
  numero: 13,
  titulo: "O Templo Submerso",
  cenas: 4,
  reveals: 3,
  encontrosPrep: 2,
  prontidao: 78,
  beats: [
    { id:"b1", titulo:"Chegada às ruínas",        tipo:"narrativa", duracao:"30min" },
    { id:"b2", titulo:"Câmara dos Espelhos",       tipo:"exploração", duracao:"45min" },
    { id:"b3", titulo:"Confronto com o Guardião",  tipo:"combate",    duracao:"60min" },
    { id:"b4", titulo:"Revelação da Coroa",        tipo:"narrativa",  duracao:"20min" },
  ],
  checklist: [
    { id:"c1", label:"Mapa do templo carregado",       feito:true },
    { id:"c2", label:"Stats do Guardião revisados",    feito:true },
    { id:"c3", label:"Reveals priorizados",            feito:true },
    { id:"c4", label:"Trilha sonora preparada",        feito:false },
    { id:"c5", label:"Notas de memória abertas",       feito:false },
  ],
};

const ENCONTROS_PREP = [
  { id:"e1", titulo:"Guardião dos Espelhos",  cr:"ND 9",  ameacas:1, suporte:0, risco:"alto",     pronto:true  },
  { id:"e2", titulo:"Cultistas das Marés",    cr:"ND 7",  ameacas:4, suporte:1, risco:"médio",    pronto:true  },
  { id:"e3", titulo:"Emboscada no Pântano",   cr:"ND 8",  ameacas:6, suporte:0, risco:"médio",    pronto:false },
];

const MEMORIA_RECENTE = [
  { id:"m1", sessao:12, evento:"Lyssara recuperou fragmento de memória",   tipo:"narrativa", impacto:"alto" },
  { id:"m2", sessao:12, evento:"Rufus revelou laço com Casa Kessler",      tipo:"política",  impacto:"alto" },
  { id:"m3", sessao:12, evento:"Vesna fez pacto com espírito do pântano",  tipo:"narrativa", impacto:"médio" },
  { id:"m4", sessao:11, evento:"Vitória contra Lobos da Cinza",            tipo:"combate",   impacto:"baixo" },
  { id:"m5", sessao:11, evento:"Encontro com Mestra Vorthuun",             tipo:"narrativa", impacto:"médio" },
];

const BALANCO = {
  pressaoAtual: 64,
  recursosGrupo: 71,
  riscoSessao: "moderado",
  alertas: [
    { tipo:"warn", txt:"Lyssara em 84% do HP máx — atenção em combates duros" },
    { tipo:"info", txt:"Grupo está 0.8 ND acima do encontro previsto" },
  ],
};

Object.assign(window, { CAMPANHA, ELENCO, PROXIMA_SESSAO, ENCONTROS_PREP, MEMORIA_RECENTE, BALANCO });
