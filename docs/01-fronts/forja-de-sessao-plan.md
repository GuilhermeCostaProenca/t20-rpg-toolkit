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

- [x] F2. Fechar estrutura de roteiro e cenas
  Notas: `GUI-40` agora sustenta `beats`, `cenas` e `subcenas` dentro de `Session.metadata.forge`, com reordenacao, vinculacao a entidades, ligacao de reveals e reaproveitamento de beats como base narrativa. A fluidez operacional de navegacao e reorganizacao foi consolidada nos recortes `RPG-98`, `RPG-119`, `RPG-126`, `RPG-127`, `RPG-128`, `RPG-129`, `RPG-130`, `RPG-131`, `RPG-140`, `RPG-147`, `RPG-148` e `RPG-149`.

- [x] F3. Fechar ganchos, segredos e revelacoes
  Notas: `GUI-40` ja suporta ganchos, segredos e revelacoes dentro de `Session.metadata.forge`, com status (`planned`, `executed`, `delayed`, `canceled`). A visibilidade operacional foi fechada com a sequencia `RPG-102`, `RPG-106`, `RPG-141`, `RPG-142`, `RPG-143`, `RPG-144` e `RPG-145`.

- [-] F4. Integrar entidades e referencias visuais ao preparo
  Notas: `GUI-40` agora ja permite ligar imagem real a `reveals` da sessao e reaproveitar retrato/capa de entidades do Codex sem sair da forja. `RPG-27` acrescentou `encontros preparados` vindos da campanha e ligados opcionalmente a cenas da sessao. `RPG-154` adicionou contagem de encontros vinculados por cena na trilha rapida e no card da cena, reforcando leitura operacional por contexto. `RPG-155` adicionou filtro de encontros por cena (incluindo `Sem cena`) na secao de encontros preparados, acelerando triagem e manutencao por contexto narrativo. `RPG-156` adicionou atalho `Ir para cena` no card de encontro vinculado, reduzindo scroll para revisao contextual da cena. `RPG-157` adicionou filtro por rating de encontro (com contagem por risco) combinado ao filtro por cena, acelerando recortes operacionais por perigo narrativo. `RPG-158` adicionou acao `Limpar filtros` nessa secao para reset rapido de cena+risk sem retrabalho manual. `RPG-159` adicionou ordenacao por `Cena` ou `Risco` na lista filtrada de encontros preparados, melhorando leitura por contexto ou perigo. `RPG-160` passou a agrupar visualmente esses encontros por cena vinculada (incluindo grupo `Sem cena`), reforcando leitura operacional por bloco narrativo. `RPG-161` enriqueceu o cabecalho de cada grupo com status e objetivo da cena, melhorando leitura situacional sem abrir o card da cena. `RPG-162` adicionou leitura de risco maximo por cena (na trilha e no card), destacando rapidamente onde a pressao tatica esta concentrada. `RPG-163` passou a exibir titulo da cena nos chips de filtro por cena da secao de encontros, reduzindo ambiguidade em listas longas. `RPG-164` adicionou atalho `Ir para cena` no proprio cabecalho de cada grupo de encontros vinculados, reduzindo cliques repetidos. `RPG-165` adicionou agregados de bloco (total de inimigos e confianca media por grupo), reforcando leitura operacional sem expandir cada encontro. `RPG-166` adicionou preview das ameacas dominantes por grupo (top inimigos), reforcando leitura tatica rapida por cena. `RPG-167` adicionou distribuicao de risco por grupo (chips por rating no cabecalho), deixando a composicao tatica visivel em um olhar. `RPG-168` alinhou a ordenacao por cena com a sequencia narrativa real da sessao, em vez de ordem alfabetica. `RPG-169` adicionou colapso/expansao por grupo com acoes globais para reduzir ruido visual em listas longas. `RPG-170` normalizou o separador do preview de ameacas para ASCII estavel (`|`), evitando artefatos de encoding. `RPG-171` adicionou resumo textual curto para grupos recolhidos, mantendo contexto sem expandir cards. `RPG-172` adicionou contador de grupos recolhidos na secao de encontros preparados para leitura de visibilidade em tempo real. `RPG-173` passou a persistir os grupos recolhidos por campanha/sessao em `localStorage`, mantendo continuidade apos recarregar. `RPG-174` passou a persistir filtros e ordenacao da secao de encontros por campanha/sessao, preservando contexto operacional entre reloads. `RPG-175` fez `Limpar filtros` resetar tambem a ordenacao para `Cena`, devolvendo a visao base em um clique. `RPG-177` adicionou resumo textual do recorte ativo (cena/risco/ordenacao), deixando o contexto operacional explicito. `RPG-178` adicionou acao unica de `Resetar visao` (filtros + ordenacao + grupos), acelerando retorno ao estado base. `RPG-179` adicionou CTA de `Resetar visao` no estado vazio dos encontros, reduzindo friccao para recuperar resultados. `RPG-180` incluiu no resumo ativo a relacao `visiveis/total`, tornando explicito o impacto do recorte atual. `RPG-181` acrescentou no resumo ativo a relacao `inimigos visiveis/total`, complementando leitura de densidade tatica do recorte. `RPG-187` garante auto-expansao do grupo da cena selecionada no filtro (quando aplicavel), evitando estado filtrado oculto por colapso persistido. `RPG-189` estende a mesma regra para o filtro `Sem cena` (grupo `__unlinked__`), evitando resultado vazio aparente quando esse grupo estava recolhido. `RPG-190` adiciona atalho contextual `Ir para cena filtrada` quando o recorte esta em uma cena especifica, reduzindo navegacao manual apos aplicar filtro. `RPG-191` remove validacao duplicada de `encounterSceneFilter`, mantendo fallback funcional em um unico efeito e reduzindo complexidade local. `RPG-192` adiciona acao `Limpar cena` para remover apenas o filtro de cena sem resetar risco/ordenacao, acelerando alternancia de contexto. `RPG-193` adiciona acao `Limpar risco` para remover apenas o filtro de risco sem resetar cena/ordenacao, mantendo controle tatico fino. `RPG-194` adiciona acao `Limpar ordenacao` para retornar ao modo `Cena` sem alterar filtros ativos, completando o controle granular do recorte. `RPG-195` consolida essas limpezas granulares em uma unica linha de acoes rapidas, reduzindo ruido vertical sem perder controle. `RPG-196` unifica essa linha com `Limpar filtros` e `Resetar visao` em uma barra unica de comandos, reduzindo fragmentacao da secao sem mudar comportamento. `RPG-197` adiciona indicador `Acoes rapidas: N` nessa barra, tornando explicito o volume de comandos ativos no recorte atual. `RPG-198` integra `Ir para cena filtrada` na mesma barra unificada, eliminando linha separada e mantendo o salto contextual imediato. `RPG-200` corrige a contagem do indicador para refletir exatamente os botoes visiveis na barra (incluindo o salto de cena), sem dupla contagem por estados derivados. `RPG-201` incorpora tambem os controles de grupos (`recolhidos`, `Recolher grupos`, `Expandir grupos`) na mesma barra principal, removendo mais uma linha isolada sem alterar logica de colapso. `RPG-202` ajusta o contador para incluir tambem as duas acoes de grupo quando visiveis, mantendo `Acoes rapidas: N` aderente a todos os botoes da barra. `RPG-203` estabiliza a leitura do toolbar em dois blocos fixos (badges à esquerda e ações à direita), reduzindo saltos visuais quando ações condicionais entram/saem. `RPG-204` unifica o modelo de acoes em uma fonte derivada unica usada tanto para render quanto para contagem, reduzindo risco de divergencia futura. `RPG-205` memoiza esse modelo com dependencias explicitas para estabilidade no ciclo de render. `RPG-206` deduplica os handlers de `Limpar filtros` e `Resetar visao`, reaproveitando a mesma logica no toolbar e no estado vazio para evitar drift funcional. `RPG-207` adiciona contagem de reveals ligados (cena + subcenas) no cabecalho de cada grupo vinculado, reforcando o elo narrativo no mesmo bloco tatico. `RPG-208` adiciona tambem contagem de entidades ligadas (cena + subcenas), completando a leitura de contexto narrativo no mesmo cabeçalho dos grupos. `RPG-209` adiciona contagem de beats ligados por cena no mesmo cabeçalho, fechando o trio de sinais narrativos (beats, entidades e reveals) junto da leitura tatica do encontro. `RPG-210` adiciona contagem de subcenas ativas por cena, reforcando o sinal de progressao narrativa no mesmo bloco operacional. `RPG-211` adiciona badge de progresso de reveals por cena (`Reveals exec. X/Y`) no cabecalho dos grupos, deixando o andamento narrativo explicito sem sair da leitura tatico-operacional. `RPG-212` enriquece o resumo de grupos recolhidos com esses mesmos sinais narrativos para manter contexto mesmo com a lista compactada. `RPG-213` adiciona estado visual ao badge de progresso de reveals (nao iniciado/em andamento/concluido), acelerando leitura de andamento em um olhar. `RPG-214` adiciona tambem rotulo textual de fase no mesmo badge, reforcando acessibilidade e clareza sem mudar a logica de progresso. `RPG-215` adiciona percentual (`Z%`) no badge de progresso para leitura quantitativa imediata junto de fase e contagem. `RPG-216` adiciona tooltip nativo (`title`) no badge com fase, executados/total e percentual, melhorando leitura contextual sem aumentar ruido visual. `RPG-217` adiciona `aria-label` com o mesmo contexto do tooltip, fechando acessibilidade textual do badge para leitores de tela. `RPG-218` deduplica a logica de fase/percentual/estilo em helper unico, reduzindo repeticao e risco de drift entre texto, classe, tooltip e aria-label. `RPG-219` reutiliza esse helper tambem no resumo de grupo recolhido, garantindo consistencia de mensagem entre estados expandido e recolhido. `RPG-220` extrai helper dedicado para compor o texto do resumo recolhido, limpando o render e preservando o mesmo output funcional. `RPG-221` extrai helper dedicado para alternar colapso/expansao por grupo, removendo callback inline extenso no botao e simplificando o render. `RPG-222` deduplica os quatro badges narrativos do cabecalho de grupo em uma lista derivada unica, reduzindo repeticao e risco de drift nas pluralizacoes. `RPG-223` extrai helper de pluralizacao para contagem de encontros, reaproveitado no badge do cabecalho e no resumo recolhido para manter consistencia textual. `RPG-224` extrai helper para o texto visivel do badge de progresso de reveals, centralizando o formato e removendo composicao inline no JSX. `RPG-225` extrai helper para o badge de contagem de inimigos por grupo, removendo mais um literal inline e mantendo consistencia textual no cabecalho. `RPG-226` extrai helper para o label de confianca media por grupo, removendo template inline no badge e mantendo a mesma leitura operacional. `RPG-227` extrai helper para o label de confianca nos cards de encontro, reduzindo composicao inline adicional dentro da lista de encontros. `RPG-228` extrai helper para o preview de ameacas principais por grupo, removendo concatenação inline no paragrafo expandido e preservando a mesma saida textual. Ainda faltam assets mais ricos da biblioteca visual e ligacao mais forte por cena.

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

- [x] F2.5 Permitir reorganizar a ordem das cenas
  Notas: A ordem ja pode ser reorganizada com controles de subir/descer em cenas e subcenas; `RPG-100` estendeu esse controle para beats. `RPG-104` adicionou duplicacao rapida de beat para acelerar variacoes de roteiro. `RPG-105` incluiu acao `Topo` em cenas e beats para reduzir cliques em listas longas. `RPG-117` estendeu a acao `Topo` para subcenas, reduzindo friccao na reorganizacao de listas densas. `RPG-118` adicionou duplicacao rapida de subcena para iteracao de variacoes sem retrabalho manual. `RPG-124` adicionou duplicacao rapida de cena com regeneracao de IDs de cena/subcenas para evitar colisao. `RPG-125` adicionou colapso/expansao por cena e acoes de `Recolher todas`/`Expandir todas`, reduzindo scroll operacional em sessoes longas. `RPG-126` adicionou trilha rapida de cenas no topo da secao (indice + titulo + status) com salto direto para cada card. `RPG-127` estendeu a fluidez para subcenas com colapso/expansao por item e controles de `Recolher todas`/`Expandir todas` no bloco de subcenas da cena. `RPG-128` adicionou destaque visual de cena ativa na trilha rapida para leitura imediata de foco durante navegacao. `RPG-129` adicionou navegacao sequencial (`Anterior`/`Proxima`) na trilha para percorrer cenas em fluxo continuo. `RPG-130` adicionou atalhos de teclado (`[` e `]`) para navegar a trilha sem tirar foco operacional. `RPG-131` adicionou sincronizacao automatica da cena ativa da trilha com o viewport via scrollspy (IntersectionObserver). `RPG-140` adicionou reorganizacao por arrastar e soltar para cenas e subcenas (com feedback visual e fallback dos controles existentes). `RPG-147` adicionou zonas de drop explicitas para mover cena/subcena para o fim da lista, reduzindo friccao no DnD. `RPG-148` adicionou hint visual explicito de insercao antes do item alvo durante arraste em cenas/subcenas, reforcando previsibilidade do drop. `RPG-149` adicionou zonas de drop de topo para cenas/subcenas, acelerando reposicionamento para inicio da lista sem cliques extras.

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

- [x] F3.4 Definir visibilidade e uso pelo mestre
  Notas: O recorte atual ja separa estruturalmente esses itens no workspace do mestre, e `reveals` ja podem ser enviados para a mesa ao vivo. `RPG-102` adicionou filtro operacional por status na camada dramatica (`all/planned/executed/delayed/canceled`) para leitura rapida de uso em mesa. `RPG-106` acrescentou contadores por status no proprio filtro, consolidando hooks+segredos+revelacoes para leitura situacional imediata. `RPG-141` adicionou busca textual na camada dramatica (titulo/notas), combinada com status, para localizar rapidamente itens durante preparo e operacao. `RPG-142` adicionou filtro por colecao (`ganchos`, `segredos`, `revelacoes`) combinado com status e busca, reduzindo ruido visual na triagem operacional. `RPG-143` adicionou acao `Limpar filtros` contextual na camada dramatica para reset rapido (colecao, status e busca) sem retrabalho manual. `RPG-144` adicionou contadores por coluna no formato `visiveis/total` para leitura imediata do impacto dos filtros. `RPG-145` corrigiu o estado vazio para considerar qualquer filtro ativo (colecao/status/busca), evitando mensagem enganosa de coluna vazia.

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
