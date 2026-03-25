# T20 RPG Toolkit - Forja do Mundo Plan

## Como usar
- Marque `[x]` quando concluido
- Use `[-]` para em andamento
- Use `[ ]` para pendente
- Atualize a linha `Notas:` com contexto curto, branch, PR ou decisao

---

## Objetivo

Transformar `criar mundo` em uma experiencia real de produto.

Esta frente existe para corrigir um erro de produto importante:
- criar um mundo nao pode terminar em `nome + card`;
- worldbuilding profundo nao pode ficar espalhado entre conversa, PDF, Pinterest e notas;
- a construcao do mundo precisa nascer dentro do app com estrutura suficiente para o mestre usar depois na preparacao e na mesa.

A `Forja do Mundo` deve permitir ao mestre construir dentro do toolkit:
- conceito e tom do mundo;
- familias, casas, faccoes e blocos de poder;
- genealogias e linhagens;
- personagens-base, temperamentos, segredos e papeis narrativos;
- fichas de personagens importantes, inclusive NPCs;
- fichas rapidas ou geracao aleatoria para personagens improvisados;
- politica, conselhos, tensoes e relacoes de poder;
- eras, calendarios, dias marcantes e eventos fundadores;
- lore-base e corpus documental do mundo;
- referencias visuais amarradas aos elementos centrais do mundo.

---

## Workflow obrigatorio desta frente

### Branches recomendadas
- `codex/world-forge-foundation`
- `codex/world-forge-lineages`
- `codex/world-forge-politics`
- `codex/world-forge-timeline`
- `codex/world-forge-bootstrap-ui`

### Commit pattern recomendado
- `feat(world): add world forge bootstrap workspace`
- `feat(world): add lineages and family structures`
- `feat(world): add political blocks and councils`
- `feat(world): add eras timelines and founding events`
- `refactor(world): route new world creation through forge bootstrap`

### Merge policy
- cada recorte principal abre PR propria;
- merge em `master` via `squash merge`;
- branch apagada apos merge;
- nenhum fluxo critico de criacao de mundo fica morando so em branch.

---

## Dependencias

Esta frente depende de:
- `shell-cockpit-plan.md`
- `codex-do-mundo-plan.md`
- `grafo-narrativo-plan.md`
- `biblioteca-visual-plan.md`

Ela alimenta diretamente:
- `forja-de-sessao-plan.md`
- `mesa-ao-vivo-plan.md`
- `memoria-do-mundo-plan.md`

---

## Estado atual

Hoje o app consegue:
- criar mundo de forma minima;
- listar mundos;
- oferecer um cockpit inicial;
- começar a estruturar entidades via Codex.

Hoje o app ainda nao consegue:
- oferecer um bootstrap guiado ou rico depois da criacao do mundo;
- estruturar familias e casas como blocos do mundo;
- montar genealogias e linhagens como experiencia dedicada;
- registrar politica, conselhos, tronos, cargos e tensoes como superficie de trabalho;
- estruturar eras, dias marcantes e cronologia fundadora;
- consolidar lore-base e visual-base do mundo em uma oficina unica.

---

## Decisoes base

- `Criar mundo` passa a significar entrar em uma oficina de construcao, nao cair em um dashboard vazio.
- O `Codex` continua sendo a fundacao estrutural do dominio, mas nao carrega sozinho a experiencia inteira de worldbuilding profundo.
- Genealogia, politica, cronologia e lore-base precisam de superficie propria, nao apenas campos textuais perdidos.
- A forja precisa suportar tanto construcao detalhada quanto criacao rapida quando o mestre so precisa colocar algo de pe.
- O fluxo deve ser flexivel: guiado quando ajuda, livre quando o mestre ja sabe o que quer.
- A `Forja do Mundo` deve servir tanto para mundos novos quanto para expansao de mundos existentes.
- Nada aqui deve depender do Jarvis para ser util; no futuro, Jarvis apenas acelera a construcao.

---

## Checklist Mestre

- [x] W1. Fechar bootstrap de criacao de mundo
  Notas: `RPG-16` abriu `/app/worlds/[id]/forge`, adicionou persistencia leve em `World.metadata`, redirecionou `novo mundo` para a forja e fechou o primeiro bootstrap com conceito, tom, escopo, escala, pilares, foco atual e salvamento parcial.

- [-] W2. Fechar familias, casas e blocos de poder
  Notas: `RPG-17` ja semeia `house`, `faction`, `place`, `npc` e `character` dentro da Forja, com perfil politico inicial (`identity`, `motto`, `roleInWorld`, `currentStatus`), banner/retrato e ligacao opcional de lideranca via relacao `led_by`. Ainda faltam perfis mais profundos, simbolos melhores e contexto politico mais denso.

- [-] W3. Fechar genealogias e linhagens
  Notas: `RPG-18` abriu a oficina dedicada em `/app/worlds/[id]/forge/genealogy`, reutilizando `Entity` + `EntityRelationship` e o board do Grafo em modo genealogico. Ja existem filtros por casa em foco, quick inspect, criacao de relacoes de parentesco/linhagem, marcadores formais em `EntityRelationship.metadata` e interacao mais guiada pelo proprio board com lentes e selecao de alvo por clique. Ainda faltam arraste e reorganizacao explicita de ramos.

- [-] W4. Fechar politica, conselhos e tensoes estruturais
  Notas: `GUI-37` abriu `/app/worlds/[id]/forge/politics` como oficina politica dedicada. Ja existe seed de `institution` e `office`, com perfil politico inicial em `metadata.politics`, relacoes sugeridas entre polos de poder, registro de tensoes/pactos em `Relationship.metadata.politics` e salvamento de fragilidades/pressao do bloco politico. Ainda faltam conselhos mais complexos e consulta transversal mais forte.

- [-] W5. Fechar eras, calendarios e eventos fundadores
  Notas: `GUI-38` abriu `/forge/timeline`, persistiu `World.metadata.chronology`, criou eventos macro em `WorldEvent` com `sortKey`, agrupamento por era e ligacoes multiplas com entidades/blocos. Ainda faltam leitura historica mais densa e transicao melhor para memoria/lore.

- [-] W6. Fechar lore-base e corpus de mundo
  Notas: `GUI-39` abriu `/forge/lore` como oficina world-first de corpus textual sobre `RulesetDocument`, com resumo, secao, visibilidade, tags, ligacoes ao Codex, busca, edicao/remocao de blocos e leitura transversal no Compendio. O corpus agora tambem se organiza por contexto de preparo (`politica`, `casas`, `lugares`, `figuras`), por campanha/foco da proxima mesa e por recorte de prep (`arco`, `gancho`, `foco_de_mesa`, `segredo`, `referencia`), e ja sobe para o cockpit do mundo como `Prep imediato` da proxima mesa. Ainda falta aproximar isso mais da futura Forja de Sessao.

- [ ] W7. Integrar referencias visuais do mundo
  Notas:

- [ ] W8. Fechar passagem da forja para Codex e Forja de Sessao
  Notas:

---

## Frente W1 - Bootstrap de criacao de mundo

Contexto tecnico:
Criar mundo precisa sair de um formulario minimo e virar uma experiencia orientada a construcao.

- [x] W1.1 Redesenhar o fluxo `novo mundo`
  Notas: O dialogo de criacao em `/app/worlds` agora coleta a primeira batida da forja e redireciona para `/app/worlds/[id]/forge?mode=new`.

- [x] W1.2 Definir etapa inicial com conceito, tom, pilares e escopo
  Notas: A forja inicial persiste conceito, tom, escopo, escala e pilares em `World.metadata.forge`.

- [x] W1.3 Definir estrutura de onboarding world-first apos a criacao
  Notas: A pagina `/forge` virou a oficina de entrada, com progresso, proximas oficinas e caminhos claros para Codex, Grafo e Biblioteca Visual.

- [x] W1.4 Permitir salvar progresso incompleto sem perder contexto
  Notas: O bootstrap salva parcialmente via `PUT /api/worlds/[id]`, usando `metadata` estruturado para retomar a criacao depois.

- [x] W1.5 Garantir entrada clara para expandir um mundo depois
  Notas: Sidebar e cockpit do mundo agora expõem `Forja`, e a propria forja oferece passagem para continuar o mundo sem cair em dashboard vazio.

### Criterios de aceite da Frente W1
- criar mundo nao termina em tela vazia;
- o mestre recebe superficies reais para comecar a construcao;
- o fluxo e guiado sem parecer engessado;
- o mundo pode nascer de forma parcial e continuar crescendo sem friccao.

---

## Frente W2 - Familias, casas e blocos de poder

Contexto tecnico:
Grande parte do worldbuilding do mestre passa por familias, casas, faccoes e organizacoes.

- [-] W2.1 Definir modelos e UX para familias, casas e faccoes
  Notas: A Forja ganhou seed rapido e perfil inicial de bloco politico usando `Entity.type` + `metadata.powerProfile`, mas ainda falta uma superficie mais dedicada de leitura/edicao continuada.

- [-] W2.2 Permitir criar perfis estruturados com identidade, lema, status e papel no mundo
  Notas: O seed de `house` e `faction` ja grava identidade, lema, papel e status em `metadata.powerProfile`, mas isso ainda precisa se tornar leitura mais forte fora da propria Forja.

- [-] W2.3 Permitir associar membros, liderancas e figuras-chave
  Notas: A Forja ja permite apontar lideranca inicial para `house`/`faction` usando entidades `npc`/`character` existentes, cria relacao `led_by` e agora tambem associa NPCs, personagens, lugares e outros blocos via relacoes basicas (`belongs_to`, `controls`, `aligned_with`). Ainda faltam associacoes mais ricas de nucleos inteiros e papeis politicos especializados.

- [-] W2.4 Permitir anexar simbolos, banners, retratos e referencias
  Notas: O seed agora aceita banner/imagem de capa e retrato principal para o bloco de poder. Ainda faltam simbolos/brasoes e curadoria visual mais rica por casa ou faccao.

- [-] W2.5 Garantir navegacao rapida desses blocos para o Codex
  Notas: Os cards da Forja ja abrem o workspace das entidades no Codex, mostram conexoes atuais e permitem estruturar/remover associacoes sem sair da oficina. Ainda falta navegacao mais forte para o Grafo e leitura politica mais completa.

### Criterios de aceite da Frente W2
- familias, casas e faccoes nao ficam reduzidas a uma entidade generica sem contexto;
- o mestre consegue entender rapidamente o lugar politico e narrativo de cada bloco;
- essas estruturas servem para consulta e para construcao.

---

## Frente W3 - Genealogias e linhagens

Contexto tecnico:
Arvores familiares e linhagens sao parte central de campanhas politicas e dinasticas.

- [x] W3.1 Definir superficie dedicada para genealogia
  Notas: A superficie `/forge/genealogy` foi criada como oficina propria da Forja do Mundo.

- [-] W3.2 Permitir ligacoes de parentesco e linhagem
  Notas: A oficina ja cria `parent_of`, `child_of`, `sibling_of`, `spouse_of`, `betrothed_to`, `adopted_child_of`, `bastard_child_of` e `branch_of` usando `EntityRelationship`, inclusive com fluxo assistido pelo board para escolher origem/alvo sem sair da superficie.

- [-] W3.3 Permitir marcar legitimidade, bastardia, adocao, casas menores e ramos
  Notas: A oficina agora grava marcadores formais em `EntityRelationship.metadata.genealogy.marker` (`legitimate`, `bastard`, `adopted`, `cadet_branch`, `secret_union`) e ja os le como badges e lentes. Ainda falta deixar essa leitura mais forte no proprio board.

- [x] W3.4 Permitir arrastar, reorganizar e ligar entidades dentro do board genealogico
  Notas: `RPG-81` adicionou reorganizacao manual de ramos na propria oficina de genealogia, com acoes de mover para frente/tras por entidade e persistencia de ordem em `Entity.metadata.genealogy.order`, refletida no `NarrativeGraphBoard` em modo genealogico. `RPG-82` fechou o ciclo com arraste e soltura direto no board genealogico (swap de prioridade por drop no alvo do mesmo eixo), mantendo tambem o fluxo de ligacao por clique no board.

- [x] W3.5 Permitir navegar da genealogia para o workspace da entidade
  Notas: A oficina genealogica ja abre Codex e Grafo a partir da entidade selecionada.

- [x] W3.6 Garantir que o grafo narrativo consiga aproveitar essa estrutura depois
  Notas: O slice reutiliza o `NarrativeGraphBoard` em modo `genealogy` e o mesmo store de `EntityRelationship`, sem camada paralela.

### Criterios de aceite da Frente W3
- o mestre consegue montar e entender uma arvore familiar dentro do app;
- o board genealogico e manipulavel, nao so visualizavel;
- genealogia nao fica escondida em descricao textual;
- a estrutura e forte o bastante para campanhas com politica e heranca.

---

## Frente W4 - Politica, conselhos e tensoes estruturais

Contexto tecnico:
Worldbuilding nao e so personagem; e tambem poder, organizacao e conflito.

- [-] W4.1 Definir modelos para cargos, tronos, cadeiras, conselhos e blocos de poder
  Notas: O primeiro slice usa `Entity` com tipos `institution` e `office`, mais `subtype` e `metadata.politics`, sem abrir um dominio paralelo. A oficina politica agora tambem cria assentos dentro de instituicoes e le composicao basica de conselho (assento, titular e disputa/apoio).

- [-] W4.2 Permitir registrar rivalidades, lealdades, acordos e tensoes
  Notas: A oficina politica agora cria relacoes estruturais e tensoes dedicadas (`rivals_with`, `bound_by_pact`, `owes_allegiance_to`, `pressures`, `undermines`) com `metadata.politics` para intensidade e estado publico.

- [-] W4.3 Permitir associar familias, personagens e faccoes aos polos politicos
  Notas: A oficina politica ja sugere ligacoes entre casas, faccoes, cargos, instituicoes, personagens e lugares usando relacoes explicitas como `contains_seat`, `held_by`, `backed_by`, `seeks_influence_over`, `rules` e `rivals_with`.

- [-] W4.4 Permitir registrar situacao atual e fragilidades politicas do mundo
  Notas: Cada bloco politico ja pode salvar `currentStatus`, `pressureNotes` e `fragilities` em `metadata.politics`, com leitura direta na oficina.

- [-] W4.5 Garantir consulta rapida dessas estruturas no cockpit
  Notas: O cockpit agora ja exibe leitura politica resumida com total de instituicoes, cargos, tensoes ativas e fragilidades principais, com passagem direta para a oficina politica. Ainda falta aprofundar essa leitura por campanha e contexto de sessao.

### Criterios de aceite da Frente W4
- o app consegue representar politica do mundo de forma util;
- o mestre nao depende de notas externas para lembrar quem manda, quem responde, quem rivaliza;
- tensoes estruturais ajudam a preparar sessao e improviso.

---

## Frente W5 - Eras, calendarios e eventos fundadores

Contexto tecnico:
Mundos fortes costumam nascer de tempo historico, nao apenas de elenco.

- [-] W5.1 Definir estrutura para eras e recortes historicos
  Notas: `GUI-38` abriu `/app/worlds/[id]/forge/timeline`, com configuracao de cronologia do mundo em `World.metadata.chronology`, registro de eras em `WorldEvent` macro com `meta.chronology.kind = era` e leitura agrupada por era na propria oficina.

- [-] W5.2 Permitir calendario, dias marcantes e datas importantes
  Notas: A oficina de cronologia ja salva nome do calendario, era atual, ano corrente, regra de datacao e tom historico base em `World.metadata.chronology`.

- [-] W5.3 Permitir cadastrar eventos fundadores e macroeventos
  Notas: A rota `POST /api/worlds/[id]/events` foi aberta e a oficina ja cria `founding_event` e `milestone` como `WorldEvent` de escopo `MACRO`, com `sortKey` para ordenar pela historia do mundo em vez da data de criacao.

- [-] W5.4 Permitir ligar eventos a entidades, lugares e blocos politicos
  Notas: A oficina de cronologia agora suporta multiplas ligacoes por marco via `meta.chronology.linkedEntityIds`, com filtros por tipo de bloco (`politica`, `casas`, `lugares`, `figuras`) e leitura direta dessas ligacoes na timeline.

- [-] W5.5 Preparar transicao disso para Memoria do Mundo
  Notas: A cronologia nasce em cima de `WorldEvent`, o que ja deixa a transicao para `Memoria do Mundo` muito mais natural do que uma timeline paralela.

### Criterios de aceite da Frente W5
- o mundo consegue nascer com tempo e historia proprios;
- datas e eras deixam de ficar em PDF solto;
- eventos fundadores alimentam o resto do produto.

---

## Frente W6 - Lore-base e corpus do mundo

Contexto tecnico:
O mestre costuma ter muito texto, ideia, documento e resumo espalhado.

- [-] W6.1 Definir superficie de lore-base por mundo
  Notas: A superficie dedicada existe em `/app/worlds/[id]/forge/lore`, ligada a Forja e ao cockpit.

- [-] W6.2 Permitir organizar corpus em blocos legiveis e navegaveis
  Notas: O slice atual cria blocos `LORE` via `RulesetDocument`, com secao, resumo, tags, busca, filtros por secao/visibilidade/contexto de preparo e painel de leitura/edicao no proprio workspace.

- [-] W6.3 Permitir associar lore a entidades, familias, lugares e eventos
  Notas: Os blocos ja guardam `linkedEntityIds` e mostram chips navegaveis para entidades do Codex. Eventos ainda nao entram explicitamente.

- [-] W6.4 Permitir distinguir conhecimento do mestre de informacao revelavel
  Notas: O slice inicial ja diferencia `MASTER` e `PLAYERS` em metadados estruturados de lore.

- [-] W6.5 Garantir busca e consulta uteis durante prep
  Notas: A oficina ja permite filtrar por titulo, secao, resumo, visibilidade, tags, contexto de preparo, campanha, foco da proxima mesa e recorte de prep (`arco`, `gancho`, `foco_de_mesa`), com preview, edicao e remocao do conteudo salvo no corpus. O Compendio world-scoped tambem enxerga `LORE`, diferencia regras de corpus textual e abre deep-link de volta para a Forja. O cockpit do mundo agora tambem resume o corpus mais relevante em `Prep imediato`.

### Criterios de aceite da Frente W6
- o lore do mundo deixa de depender de PDFs e notas externas para existir;
- o mestre consegue guardar conhecimento de forma estruturada;
- o corpus de mundo ajuda consulta, nao vira deposito morto.

---

## Frente W7 - Referencias visuais do mundo

Contexto tecnico:
Boa parte do worldbuilding do mestre acontece por imagem, pasta, pin e moodboard.

- [ ] W7.1 Permitir boards visuais por mundo, familia, faccao, lugar ou arco
  Notas:

- [ ] W7.2 Permitir associar imagens aos blocos estruturais do mundo
  Notas:

- [ ] W7.3 Permitir separar referencia de mestre e reveal de mesa
  Notas:

- [ ] W7.4 Permitir selecionar imagens-chave para TV e presentacao
  Notas:

- [ ] W7.5 Garantir que as referencias conversem com Codex e biblioteca visual
  Notas:

### Criterios de aceite da Frente W7
- o mestre consegue construir atmosfera visual sem sair para Pinterest o tempo todo;
- as imagens do mundo ficam conectadas ao dominio real;
- referencia visual ajuda construcao e operacao, nao so decoracao.

---

## Frente W8 - Passagem para Codex e Forja de Sessao

Contexto tecnico:
A construcao do mundo nao pode morrer numa tela bonita; ela precisa alimentar o resto do produto.

- [ ] W8.1 Garantir que o que nasce na forja apareca naturalmente no Codex
  Notas:

- [ ] W8.2 Garantir que worldbuilding profundo alimente o Grafo Narrativo
  Notas:

- [ ] W8.3 Garantir que a Forja de Sessao consiga puxar blocos do mundo
  Notas:

- [ ] W8.4 Definir quais elementos do mundo entram no cockpit como quick access
  Notas:

- [ ] W8.5 Preparar ganchos para Memoria do Mundo e operacao futura
  Notas:

### Criterios de aceite da Frente W8
- o mundo construido alimenta o produto inteiro;
- o mestre nao precisa reconstruir a mesma informacao em varias areas;
- o fluxo da criacao do mundo para a sessao fica natural.

---

## Fora de escopo desta frente

- operacao detalhada de combate;
- balanceamento T20 completo;
- memoria pos-sessao profunda;
- automacao do Jarvis;
- graph renderer final de mesa.

---

## Definition of Done da frente inteira

Esta frente so termina quando:
- criar um mundo deixa de ser um cadastro minimo;
- o mestre consegue estruturar familias, linhagens, politica, cronologia e lore dentro do app;
- referencias visuais de mundo ficam ligadas aos elementos reais do dominio;
- o mundo criado serve de base concreta para Codex, Forja de Sessao e uso futuro em mesa.

---

## Criterio de merge final da frente

- bootstrap de mundo funcional;
- superfices de familias, genealogias, politica e cronologia estaveis;
- integracao clara com Codex e Biblioteca Visual;
- docs atualizados;
- branch apagada apos merge.
