# T20 RPG Toolkit - Forja de Sessao Plan

## Como usar
- Marque `[x]` quando concluido
- Use `[-]` para em andamento
- Use `[ ]` para pendente
- Atualize a linha `Notas:` com contexto curto, branch, PR ou decisao

---

## Objetivo

Trazer a preparacao de sessao para dentro do toolkit como uma experiencia de alto nivel.

Esta frente existe para substituir o preparo fragmentado em:
- conversas soltas;
- notas fora do app;
- PDFs;
- improviso sem consolidacao;
- assets visuais sem amarracao.

A `Forja de Sessao` deve permitir ao mestre construir o que vai rodar na mesa sem sair do produto.
Ela nao e o lugar de nascimento do mundo: essa responsabilidade fica explicitamente com a futura `Forja do Mundo`.

---

## Workflow obrigatorio desta frente

### Branches recomendadas
- `codex/session-forge-foundation`
- `codex/session-forge-scenes`
- `codex/session-forge-reveals-hooks`

### Commit pattern recomendado
- `feat(forge): add session planning workspace`
- `feat(forge): add hooks scenes and secret beats`
- `feat(forge): connect session prep with codex and visual assets`

### Merge policy
- PR por fluxo completo, nao por widget solto;
- merge em `master` via `squash merge`;
- branch apagada apos merge;
- nada de deixar roteiro ou sessao futura em estrutura temporaria fora da `master`.

---

## Dependencias

Esta frente depende de:
- `shell-cockpit-plan.md`
- `codex-do-mundo-plan.md`
- `biblioteca-visual-plan.md`
- `forja-do-mundo-plan.md`

---

## Checklist Mestre

- [-] F1. Criar workspace de preparacao de sessao
  Notas: `GUI-40` abriu `/app/campaign/[id]/forge/[sessionId]` em cima da propria `Session`, com `metadata` para briefing, objetivo de mesa, beats, notas do mestre, notas operacionais, entidades em foco e leitura de lore priorizado da campanha.

- [-] F2. Fechar estrutura de roteiro e cenas
  Notas: `GUI-40` agora sustenta `beats`, `cenas` e `subcenas` dentro de `Session.metadata.forge`, com reordenacao, vinculacao a entidades, ligacao de reveals e reaproveitamento de beats como base narrativa. Ainda falta aprofundar a navegacao e ligar isso mais diretamente a mesa ao vivo.

- [-] F3. Fechar ganchos, segredos e revelacoes
  Notas: `GUI-40` ja suporta ganchos, segredos e revelacoes dentro de `Session.metadata.forge`, com status (`planned`, `executed`, `delayed`, `canceled`). Revelacoes ja podem ser enviadas direto para a mesa pela propria forja usando `roomCode`; ainda faltam visibilidade mais forte e ligacao mais profunda com assets visuais.

- [-] F4. Integrar entidades e referencias visuais ao preparo
  Notas: `GUI-40` agora ja permite ligar imagem real a `reveals` da sessao e reaproveitar retrato/capa de entidades do Codex sem sair da forja. `RPG-27` acrescentou `encontros preparados` vindos da campanha e ligados opcionalmente a cenas da sessao. Ainda faltam assets mais ricos da biblioteca visual e ligacao mais forte por cena.

- [-] F5. Definir transicao da forja para a mesa ao vivo
  Notas: `RPG-86` adicionou handoff direto da Forja para a Mesa com contexto de `sceneId` e `subsceneId`, incluindo atalhos `Abrir na mesa` em nivel de cena/subcena. `RPG-87` fechou o gap de contexto da sessao, adicionando `sessionId` no handoff e priorizando essa sessao no carregamento do pacote ao vivo.

---

## Frente F1 - Workspace de preparacao

Contexto tecnico:
Preparar sessao precisa ser atividade de primeira classe, nao campo de texto perdido.

- [x] F1.1 Criar superficie principal de preparacao por sessao
  Notas: Workspace dedicado existe em `/app/campaign/[id]/forge/[sessionId]` e ja salva no `metadata` da `Session`.

- [-] F1.2 Definir estrutura navegavel de secoes da sessao
  Notas: O primeiro recorte ja separa briefing, beats, notas operacionais, lore em foco e entidades em foco. `RPG-98` adicionou barra de navegacao com salto direto para secoes-chave (briefing, cenas, beats, dramatica e visual), reduzindo scroll longo no workspace. `RPG-119` estendeu essa navegacao com atalho direto para `Memoria`, acelerando revisao e fechamento pos-sessao no mesmo workspace.

- [x] F1.3 Definir onde moram notas do mestre e observacoes operacionais
  Notas: `masterNotes` e `operationalNotes` agora vivem em `Session.metadata.forge`.

- [x] F1.4 Integrar o workspace ao contexto de mundo e campanha
  Notas: A forja da sessao consome a campanha, o mundo, o Codex e o corpus de `LORE` ligados a ela.

- [-] F1.5 Garantir que a forja se encaixe no cockpit continuo
  Notas: A entrada ja existe pela pagina da campanha com CTA `Forjar sessao`. `RPG-99` aprofundou o handoff com preset de foco da mesa (`focus=narrative|tactical`) na abertura a partir da Forja, reduzindo ajuste manual inicial no cockpit. `RPG-103` completou o preset de cockpit com `preset=narrative|tactical` (foco + visibilidade de paineis + historico) aplicado na entrada da mesa.

### Criterios de aceite da Frente F1
- existe um lugar claro para preparar uma sessao;
- esse lugar tem estrutura real, nao texto solto;
- a sessao esta conectada ao mundo e nao isolada.

---

## Frente F2 - Roteiro e cenas

Contexto tecnico:
O mestre precisa estruturar fluxo narrativo sem ficar preso a documento externo.

- [x] F2.1 Permitir definir beats ou blocos de sessao
  Notas: `beats` existem no workspace e persistem na propria `Session`.

- [x] F2.2 Permitir criar cenas e subcenas
  Notas: `GUI-40` agora cria `cenas` e `subcenas` em `Session.metadata.forge`.

- [x] F2.3 Permitir associar entidades a cada cena
  Notas: Cada cena ja aceita entidades em foco. `RPG-123` adicionou acao de limpeza rapida de entidades e reveals no nivel de subcena, reduzindo friccao para reposicionar contexto narrativo durante o preparo.

- [x] F2.4 Permitir marcar estados como planejado, opcional, improvisado ou descartado
  Notas: Beats, cenas e subcenas usam a mesma semantica de status no preparo.

- [-] F2.5 Permitir reorganizar a ordem das cenas
  Notas: A ordem ja pode ser reorganizada com controles de subir/descer em cenas e subcenas; `RPG-100` estendeu esse controle para beats. `RPG-104` adicionou duplicacao rapida de beat para acelerar variacoes de roteiro. `RPG-105` incluiu acao `Topo` em cenas e beats para reduzir cliques em listas longas. `RPG-117` estendeu a acao `Topo` para subcenas, reduzindo friccao na reorganizacao de listas densas. `RPG-118` adicionou duplicacao rapida de subcena para iteracao de variacoes sem retrabalho manual. `RPG-124` adicionou duplicacao rapida de cena com regeneracao de IDs de cena/subcenas para evitar colisao. Ainda falta uma interacao mais fluida e mais visual.

### Criterios de aceite da Frente F2
- o mestre consegue estruturar uma sessao inteira no app;
- o roteiro e flexivel o bastante para improviso;
- a sessao continua legivel mesmo apos mudancas.

---

## Frente F3 - Ganchos, segredos e revelacoes

Contexto tecnico:
Esses elementos sao centrais para narracao e precisam ser tratados explicitamente.

- [x] F3.1 Criar suporte a hooks
  Notas: A forja da sessao agora cria e edita `hooks` diretamente no workspace.

- [x] F3.2 Criar suporte a segredos
  Notas: `secrets` agora vivem na mesma camada de metadata da sessao.

- [x] F3.3 Criar suporte a revelacoes planejadas
  Notas: `reveals` agora podem ser preparados no mesmo workspace da sessao.

- [-] F3.4 Definir visibilidade e uso pelo mestre
  Notas: O recorte atual ja separa estruturalmente esses itens no workspace do mestre, e `reveals` ja podem ser enviados para a mesa ao vivo. `RPG-102` adicionou filtro operacional por status na camada dramatica (`all/planned/executed/delayed/canceled`) para leitura rapida de uso em mesa. `RPG-106` acrescentou contadores por status no proprio filtro, consolidando hooks+segredos+revelacoes para leitura situacional imediata.

- [x] F3.5 Definir estados de executado, adiado e cancelado
  Notas: Hooks, segredos e revelacoes agora aceitam `planned`, `executed`, `delayed` e `canceled`.

### Criterios de aceite da Frente F3
- ganchos e segredos nao ficam enterrados em notas aleatorias;
- o mestre consegue localizar rapido os elementos dramaticos da sessao;
- a preparacao fica mais forte do que o fluxo atual em documento livre.

---

## Frente F4 - Integracao com mundo e visual

Contexto tecnico:
A forja nao pode ser uma ilha.

- [-] F4.1 Permitir anexar entidades do codex a cena e roteiro
  Notas: A forja ja vinculava entidades em beats e cenas; `RPG-93` fechou o recorte de subcena, permitindo anexar entidades diretamente em `subscene.linkedEntityIds` para granularidade operacional maior durante a mesa.

- [-] F4.2 Permitir anexar imagens e assets visuais
  Notas: `reveals` ja aceitam `imageUrl`, reaproveitam imagens de entidades do Codex e a forja agora monta um `pacote visual da mesa` com assets puxados do preparo. `RPG-96` adicionou previas visuais inline de cena/subcena (reveals com imagem + entidades vinculadas com portrait/cover) para validacao rapida sem trocar de tela. `RPG-101` evoluiu o picker de imagem de reveal para selecao visual com miniaturas dos assets sugeridos. `RPG-116` acrescentou filtro por tipo de asset no picker (`Todos` + kinds disponiveis), reduzindo friccao na curadoria de retrato/capa/referencia. `RPG-120` adicionou busca textual no picker para filtrar por entidade, tipo e legenda do asset. `RPG-121` acrescentou estado vazio explicito no picker quando filtros/busca nao retornam resultados. `RPG-122` adicionou contagem de resultados e acao `Limpar filtros` para reset rapido da curadoria.

- [-] F4.3 Permitir preparar reveals ligados a cena
  Notas: Cenas e subcenas ja prendem `reveals` por ID. `RPG-97` adicionou operacao direta de reveal no proprio contexto de cena/subcena (`Enviar para mesa`), sem precisar abrir o painel geral de revelacoes.

- [-] F4.4 Permitir referencia cruzada para lugar, faccao e personagem
  Notas: `RPG-95` adicionou atalhos de referencia cruzada por tipo (personagem, NPC, faccao, casa e lugar) dentro dos blocos de cena e subcena, abrindo o Codex ja filtrado para consulta rapida durante o preparo.

- [-] F4.5 Garantir consulta rapida do mundo durante o preparo
  Notas: A forja agora sobe `pacote operacional` e `pacote visual da mesa` no proprio workspace, reduzindo a necessidade de sair da sessao para consultar o essencial. `RPG-94` adicionou atalhos de consulta direta para o Codex a partir das entidades ja vinculadas em cena e subcena.

### Criterios de aceite da Frente F4
- preparar sessao usa o mundo real do app;
- assets visuais ficam integrados ao planejamento;
- a preparacao nao exige sair para outras ferramentas.

---

## Frente F5 - Passagem para a mesa

Contexto tecnico:
Preparar e rodar precisam conversar.

- [-] F5.1 Definir o que da forja aparece na mesa ao vivo
  Notas: Alem de `reveals` via `roomCode`, a mesa agora pode ser aberta a partir da Forja com foco narrativo por `sceneId`/`subsceneId` e sessao explicita por `sessionId`, reduzindo ruptura de contexto. `RPG-111` ampliou o pacote textual no cockpit ao vivo com `briefing` e `notas operacionais` da Forja, reduzindo retorno manual para a tela de preparo durante execucao.

- [-] F5.2 Definir o que pode ser aberto rapidamente durante a sessao
  Notas: A abertura rapida da mesa com foco de cena/subcena da Forja foi entregue (`RPG-86`/`RPG-87`). `RPG-114` adicionou atalho direto `Abrir Forja da sessao` no cockpit ao vivo (nova aba), reduzindo ida/volta operacional para ajustes de preparo durante execucao.

- [-] F5.3 Definir o que pode virar acao operacional
  Notas: O cockpit ao vivo ganhou acao operacional direta para marcar `cena` e `subcena` em foco como `executed`, sem sair da mesa (`RPG-89`). A acao foi ligada a persistencia de `Session.metadata.forge` com update otimista e rollback em erro. `RPG-91` adicionou autoavanco de foco para a proxima cena/subcena operacional apos a marcacao, reduzindo clique manual repetitivo durante a mesa. `RPG-92` trouxe feedback de operacao em voo (`Salvando...`) nos botoes de execucao para tornar o estado transitorio explicito.

- [-] F5.4 Definir o que deve ser registrado como executado
  Notas: O registro de executado agora cobre `scenes` e `subscenes` direto na mesa, alem de `reveals` ja existentes. `RPG-112` adicionou fechamento operacional de `hooks` e `segredos` no cockpit ao vivo (marcacao `executed` com persistencia na sessao). `RPG-113` passou a gerar rastro em `memory.changes` para esses fechamentos dramaticos durante a mesa, reduzindo perda de contexto no pos-sessao. Ainda falta consolidar memoria pos-cena em camadas mais profundas.

- [-] F5.5 Preparar integracao futura com memoria do mundo
  Notas: `RPG-20` abriu o primeiro fechamento pos-sessao dentro da propria Forja, com `Session.metadata.memory` para resumo publico, resumo do mestre, presencas, mortes e mudancas persistentes, alem de sincronizacao inicial com `WorldEvent`. A mesa ao vivo agora tambem injeta `memory.changes` (tipo `status`, visibilidade `MASTER`) quando cena/subcena e marcada como `executed` (`RPG-90`), criando ponte operacional entre execucao e memoria. `RPG-115` adicionou atalho direto no cockpit para abrir a secao de memoria da sessao na Forja (`#forge-section-memory`), reduzindo friccao no fechamento pos-mesa.

### Criterios de aceite da Frente F5
- a forja nao termina em si mesma;
- o que foi planejado pode ser levado para a mesa;
- o modulo encaixa naturalmente com o resto do produto.

---

## Definition of Done da frente inteira

Esta frente so termina quando:
- o mestre consegue preparar sessoes inteiras dentro do app;
- roteiro, cenas, segredos e reveals estao estruturados;
- entidades e referencias visuais participam do preparo;
- a forja ja reduz fortemente a dependencia de notas externas.

---

## Criterio de merge final da frente

- workspace de preparacao funcional;
- estrutura de roteiro e cenas estavel;
- integracao com codex e assets visuais fechada;
- docs atualizados;
- branch apagada apos merge.
