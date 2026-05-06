// codex-data.jsx — Entity definitions for Codex do Mundo

const TYPE_META = {
  Personagem: { color: "#4f7cff", dim: "rgba(79,124,255,.12)", border: "rgba(79,124,255,.3)",  icon: "shield",   label: "Personagem" },
  Facção:     { color: "#bc4a3f", dim: "rgba(188,74,63,.12)",  border: "rgba(188,74,63,.3)",   icon: "swords",   label: "Facção"     },
  Local:      { color: "#4b9f91", dim: "rgba(75,159,145,.12)", border: "rgba(75,159,145,.3)",  icon: "map",      label: "Local"      },
  NPC:        { color: "#9b5de5", dim: "rgba(155,93,229,.12)", border: "rgba(155,93,229,.3)",  icon: "feather",  label: "NPC"        },
  Item:       { color: "#d5a240", dim: "rgba(213,162,64,.12)", border: "rgba(213,162,64,.3)",  icon: "scroll",   label: "Item"       },
  Criatura:   { color: "#f97316", dim: "rgba(249,115,22,.12)", border: "rgba(249,115,22,.3)",  icon: "skull",    label: "Criatura"   },
  Evento:     { color: "#e879f9", dim: "rgba(232,121,249,.12)",border: "rgba(232,121,249,.3)", icon: "clock",    label: "Evento"     },
};

const STATUS_META = {
  Ativo:        { color: "#4b9f91", bg: "rgba(75,159,145,.12)",  border: "rgba(75,159,145,.3)"  },
  Inativo:      { color: "#b5aea4", bg: "rgba(181,174,164,.08)", border: "rgba(181,174,164,.2)" },
  Desconhecido: { color: "#d5a240", bg: "rgba(213,162,64,.1)",   border: "rgba(213,162,64,.3)"  },
  Morto:        { color: "#bc4a3f", bg: "rgba(188,74,63,.1)",    border: "rgba(188,74,63,.3)"   },
  Secreto:      { color: "#9b5de5", bg: "rgba(155,93,229,.1)",   border: "rgba(155,93,229,.3)"  },
};

const ENTITIES = [
  {
    id: 1, name: "Serafina Valdris", type: "Personagem", status: "Ativo",
    tagline: "Paladina de Khalmyr",
    desc: "Filha do General Valdris, campeã da justiça divina. Lidera o grupo com determinação inabalável.",
    image: null,
    attrs: [
      { label: "Força",      val: "18" }, { label: "Destreza",  val: "14" },
      { label: "Constituição",val:"16" }, { label: "Inteligência",val:"10"},
      { label: "Sabedoria",  val: "15" }, { label: "Carisma",   val: "17" },
    ],
    history: "Nascida em Valkaria, treinada desde os 8 anos no Templo de Khalmyr. Sobreviveu à Batalha do Porto e descobriu a infiltração da Ordem da Chama na guarda da cidade. Seu pai, o General Valdris, desapareceu durante o confronto.",
    relations: [
      { name: "Ordem da Chama", type: "Facção",   rel: "Inimiga" },
      { name: "Trog Irontooth",  type: "NPC",       rel: "Aliado cauteloso" },
      { name: "Valkaria",        type: "Local",      rel: "Cidade natal" },
    ],
    notes: "Serafina é desconfiada de magias de ilusão. Tem um segredo: ela sabe onde está o General, mas não revelou ao grupo.",
  },
  {
    id: 2, name: "Ordem da Chama", type: "Facção", status: "Secreto",
    tagline: "Culto sombrio de Tenebra",
    desc: "Irmandade secreta que venera o dragão Tenebra. Opera nas sombras de Valkaria há décadas.",
    image: null,
    attrs: [
      { label: "Membros",    val: "40+" }, { label: "Influência", val: "Alta" },
      { label: "Recursos",   val: "Vasto"}, { label: "Sigilo",    val: "Máximo"},
      { label: "Alcance",    val: "Capital"}, { label: "Ameaça",  val: "Crítica"},
    ],
    history: "Fundada há 60 anos por ex-membros da guarda real corrompidos por promessas de imortalidade. Controla metade da guarda de Valkaria. O Capitão Sombrio é seu tenente operacional na cidade.",
    relations: [
      { name: "Serafina Valdris", type: "Personagem", rel: "Alvo prioritário" },
      { name: "Valkaria",          type: "Local",      rel: "Base de operações" },
      { name: "Grimório da Sombra",type: "Item",       rel: "Objeto de busca" },
    ],
    notes: "O líder verdadeiro da Ordem nunca foi identificado. Suspeita-se que seja alguém do Conselho dos Arcanistas.",
  },
  {
    id: 3, name: "Valkaria", type: "Local", status: "Ativo",
    tagline: "Capital do Reinado de Arton",
    desc: "Centro político, mágico e comercial do mundo de Arton. Lar de meio milhão de almas.",
    image: null,
    attrs: [
      { label: "População", val: "500k"  }, { label: "Defesa",   val: "Forte"  },
      { label: "Magia",     val: "Alta"  }, { label: "Comércio", val: "Máximo" },
      { label: "Perigo",    val: "Médio" }, { label: "Tamanho",  val: "Imensa" },
    ],
    history: "Fundada há 800 anos pelo Rei Thorald I, Valkaria cresceu de uma fortaleza ribeirinha a uma metrópole com torres de cristal e portos movimentados. A Batalha do Porto deixou cicatrizes no setor leste.",
    relations: [
      { name: "Ordem da Chama",   type: "Facção",     rel: "Infiltrada" },
      { name: "Serafina Valdris", type: "Personagem", rel: "Defensora" },
      { name: "Batalha do Porto", type: "Evento",     rel: "Evento recente" },
    ],
    notes: "O porto está em reconstrução. O Conselho dos Arcanistas está investigando silenciosamente a corrupção na guarda.",
  },
  {
    id: 4, name: "Trog Irontooth", type: "NPC", status: "Desconhecido",
    tagline: "Mercenário e informante anão",
    desc: "Negociante com conexões em ambos os lados da lei. Sobrevivente nato, leal ao maior pagador.",
    image: null,
    attrs: [
      { label: "Força",     val: "16" }, { label: "Destreza",  val: "12" },
      { label: "Resistência",val:"18" }, { label: "Astúcia",   val: "15" },
      { label: "Contatos",  val: "Alto"}, { label: "Confiança", val: "Baixa"},
    ],
    history: "Anão de 180 anos nascido nas minas de Doherimm. Trabalhou como mercenário por décadas antes de estabelecer uma rede de informações em Valkaria. Desapareceu após a Batalha do Porto — seu paradeiro atual é desconhecido.",
    relations: [
      { name: "Serafina Valdris", type: "Personagem", rel: "Aliado ocasional" },
      { name: "Ordem da Chama",   type: "Facção",     rel: "Suspeito de contato" },
      { name: "Valkaria",         type: "Local",      rel: "Base de operações" },
    ],
    notes: "Trog foi visto conversando com um membro da Ordem antes da batalha. Pode ser um traidor — ou uma vítima. Investigar com cautela.",
  },
  {
    id: 5, name: "Grimório da Sombra", type: "Item", status: "Desconhecido",
    tagline: "Tomo arcanamente selado",
    desc: "Encontrado nas ruínas de Yuden. Emana energia sombria. Seu conteúdo resiste a todas as tentativas de decifração.",
    image: null,
    attrs: [
      { label: "Raridade",  val: "Único"    }, { label: "Magia",    val: "Sombria"  },
      { label: "Perigo",    val: "Extremo"  }, { label: "Origem",   val: "Yuden"    },
      { label: "Idioma",    val: "Arcano"   }, { label: "Selo",     val: "Ativo"    },
    ],
    history: "Recuperado nas ruínas da cidade maldita de Yuden há três sessões. Arcanistas do grupo identificaram pulsos de energia vinculados a Tenebra. A Ordem da Chama busca ativamente este item.",
    relations: [
      { name: "Ordem da Chama",   type: "Facção",     rel: "Objeto de busca" },
      { name: "Serafina Valdris", type: "Personagem", rel: "Guardiã atual" },
    ],
    notes: "O grimório reagiu à presença de Serafina — as runas brilharam por um momento. Pode haver uma conexão com a linhagem Valdris.",
  },
  {
    id: 6, name: "Batalha do Porto", type: "Evento", status: "Inativo",
    tagline: "Confronto que mudou Valkaria",
    desc: "Ataque coordenado pela Ordem da Chama no porto leste. Destruiu metade dos armazéns reais.",
    image: null,
    attrs: [
      { label: "Data",      val: "23 Abr"  }, { label: "Baixas",   val: "38"      },
      { label: "Duração",   val: "4h"      }, { label: "Resultado",val: "Parcial" },
      { label: "Sessão",    val: "12"      }, { label: "Impacto",  val: "Crítico" },
    ],
    history: "A batalha começou quando a Ordem ativou agentes dormentes dentro da guarda portuária. O grupo interveio a tempo de evitar a destruição total do porto, mas o Capitão Sombrio escapou com documentos do Arsenal Real.",
    relations: [
      { name: "Serafina Valdris", type: "Personagem", rel: "Presente" },
      { name: "Ordem da Chama",   type: "Facção",     rel: "Orquestrou" },
      { name: "Valkaria",         type: "Local",      rel: "Local do evento" },
    ],
    notes: "Os documentos roubados incluem a localização de três depósitos secretos de armas. Recuperar é prioridade.",
  },
  {
    id: 7, name: "Kulthar Rex", type: "Personagem", status: "Ativo",
    tagline: "Guerreiro bárbaro de Khubar",
    desc: "Nômade das estepes do norte. Une força bruta com intuição tática surpreendente para um bárbaro.",
    image: null,
    attrs: [
      { label: "Força",     val: "20" }, { label: "Destreza",  val: "13" },
      { label: "Constituição",val:"18"}, { label: "Inteligência",val:"8" },
      { label: "Sabedoria", val: "12" }, { label: "Carisma",   val: "9"  },
    ],
    history: "Exilado de Khubar após recusar-se a executar civis durante uma guerra tribal. Vaga pelo Reinado em busca de batalhas dignas e, secretamente, de seu irmão desaparecido.",
    relations: [
      { name: "Serafina Valdris", type: "Personagem", rel: "Companheira de grupo" },
      { name: "Trog Irontooth",   type: "NPC",        rel: "Desconfiança mútua" },
    ],
    notes: "Kulthar está ferido — apenas 12 de 38 PV. Precisa de cura antes do próximo encontro. Não aceita poções de magia arcana.",
  },
  {
    id: 8, name: "Templo de Khalmyr", type: "Local", status: "Ativo",
    tagline: "Santuário da justiça em Valkaria",
    desc: "Grande templo de Khalmyr no centro de Valkaria. Refúgio seguro e centro de informações para os paladinos.",
    image: null,
    attrs: [
      { label: "Segurança", val: "Máxima"  }, { label: "Magia",    val: "Sagrada" },
      { label: "Recursos",  val: "Amplos"  }, { label: "Aliados",  val: "Muitos"  },
      { label: "Tamanho",   val: "Grande"  }, { label: "Influência",val:"Alta"    },
    ],
    history: "Construído há 400 anos como primeiro templo de Khalmyr no Reinado. Sobreviveu a três guerras. A Grande Sacerdotisa Aldrana suspeita da infiltração da Ordem mas não tem provas suficientes.",
    relations: [
      { name: "Serafina Valdris", type: "Personagem", rel: "Formação e lar" },
      { name: "Valkaria",         type: "Local",      rel: "Localizado em" },
    ],
    notes: "Aldrana pode ser uma aliada poderosa se o grupo trouxer evidências concretas contra a Ordem da Chama.",
  },
];

const FILTER_TYPES = ["Todos", "Personagem", "Facção", "Local", "NPC", "Item", "Criatura", "Evento"];

Object.assign(window, { ENTITIES, TYPE_META, STATUS_META, FILTER_TYPES });
