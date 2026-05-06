// forja-data.jsx — Session model and initial state for Forja de Sessão

const FORJA_STAGES = [
  { id: "spark",    label: "Faísca",    icon: "flame",       desc: "A ideia central da sessão" },
  { id: "struct",   label: "Estrutura", icon: "boxes",       desc: "Beats e arco dramático" },
  { id: "scenes",   label: "Cenas",     icon: "presentation",desc: "Cenas e sub-beats" },
  { id: "reveals",  label: "Reveals",   icon: "sparkles",    desc: "Reviravoltas e revelações" },
  { id: "finalize", label: "Finalizar", icon: "check",       desc: "Revisão e pronto para mesa" },
];

const TONE_OPTIONS = [
  { id: "epico",    label: "Épico",       color: "#d5a240", desc: "Grandioso, mítico, heróico" },
  { id: "sombrio",  label: "Sombrio",     color: "#9b5de5", desc: "Tenso, moral ambígua" },
  { id: "misterio", label: "Mistério",    color: "#4b9f91", desc: "Investigativo, revelações" },
  { id: "acao",     label: "Ação",        color: "#bc4a3f", desc: "Combate, urgência, adrenalina" },
  { id: "politico", label: "Político",    color: "#4f7cff", desc: "Intriga, alianças, poder" },
  { id: "horror",   label: "Horror",      color: "#f97316", desc: "Medo, desespero, sobrevivência" },
];

const ARC_OPTIONS = [
  { id: "tragedy",  label: "Tragédia",     icon: "droplet" },
  { id: "triumph",  label: "Triunfo",      icon: "zap" },
  { id: "reveal",   label: "Revelação",    icon: "eye" },
  { id: "loss",     label: "Perda",        icon: "flag" },
  { id: "choice",   label: "Escolha",      icon: "scale" },
];

const INITIAL_BEATS = [
  { id: "b1", type: "Abertura",   label: "O porto em alerta",            detail: "O grupo chega ao cais e percebe a tensão: guardas dobrados, navios parados.", color: "#4b9f91",  icon: "eye"           },
  { id: "b2", type: "Escalada",   label: "Interrogatório do informante", detail: "Trog Irontooth tem informação — mas seu preço é alto e a lealdade, duvidosa.",    color: "#d5a240",  icon: "activity"      },
  { id: "b3", type: "Escalada",   label: "Infiltração na guarda",        detail: "O grupo descobre que metade da guarda é Ordem da Chama. Ninguém é seguro.",       color: "#f97316",  icon: "alert-triangle" },
  { id: "b4", type: "Clímax",     label: "Confronto com o Cap. Sombrio", detail: "Batalha no armazém 7. Ele tem reféns. O grimório está com ele.",                   color: "#bc4a3f",  icon: "swords"        },
  { id: "b5", type: "Resolução",  label: "Fuga pelo portal mágico",      detail: "Com o capitão abatido, o portal se ativa. Decisão: perseguir ou recuperar o grimório?", color: "#9b5de5", icon: "target"   },
];

const INITIAL_SCENES = [
  {
    id: "s1", beatId: "b1", title: "Chegada ao Porto Sul",
    mood: "Tensão crescente", duration: "15min",
    hook: "Um guarda da Ordem reconhece Serafina e começa a segui-la.",
    npcs: ["Guarda Corrupto", "Capitão do Porto (morto)"],
    notes: "Usar sons de tempestade. Iluminação baixa. O NPC informante está na taverna próxima.",
  },
  {
    id: "s2", beatId: "b2", title: "Taberna do Âncora Quebrada",
    mood: "Suspeita e negociação",  duration: "20min",
    hook: "Trog só fala se o grupo pagar 200 TO OU revelar algo que ele não sabe.",
    npcs: ["Trog Irontooth"],
    notes: "Trog está com medo. Sua linguagem corporal trai nervosismo. Ele sabe mais do que diz.",
  },
  {
    id: "s3", beatId: "b4", title: "Armazém 7 — Confronto Final",
    mood: "Urgência extrema", duration: "40min",
    hook: "O Capitão Sombrio tem 3 reféns civis e o grimório. Ele vai ativar o portal em 5 rodadas.",
    npcs: ["Capitão Sombrio", "Guarda Corrupto II", "Reféns civis"],
    notes: "Terreno difícil: caixotes, andaimes, névoa mágica. Usar mapa do porto.",
  },
];

const INITIAL_REVEALS = [
  { id: "r1", title: "Trog é informante duplo", timing: "Cena 2 — se investigado", impact: "Alto",  desc: "Trog trabalha para a Ordem há anos. Mas está com medo — quer sair. Pode ser aliado ou traidor dependendo da abordagem do grupo." },
  { id: "r2", title: "O Grimório reconhece Serafina", timing: "Clímax — ao pegar o livro", impact: "Crítico", desc: "As runas brilham ao toque de Serafina. A conexão com a linhagem Valdris é real. Isso muda a natureza da missão." },
  { id: "r3", title: "O Cap. Sombrio não é o líder", timing: "Resolução — após derrota", impact: "Médio",  desc: "Com a derrota, o Capitão revela que recebe ordens de alguém no Conselho dos Arcanistas. Ele não sabe o nome — só o símbolo." },
];

const INITIAL_SPARK = {
  idea: "O grupo descobre que o capitão da guarda é membro da Ordem da Chama — e que ele está prestes a roubar documentos militares secretos do Arsenal Real usando um portal mágico no porto.",
  tone: "acao",
  arc: "choice",
  stakes: "Se os documentos forem roubados, a Ordem saberá a localização de todos os depósitos de armas do Reinado.",
  secret: "O verdadeiro objetivo da Ordem não é o arsenal — é o Grimório da Sombra que Serafina carrega.",
};

Object.assign(window, { FORJA_STAGES, TONE_OPTIONS, ARC_OPTIONS, INITIAL_BEATS, INITIAL_SCENES, INITIAL_REVEALS, INITIAL_SPARK });
