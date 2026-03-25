# T20 RPG Toolkit - Grafo Narrativo Plan

## Como usar
- Marque `[x]` quando concluido
- Use `[-]` para em andamento
- Use `[ ]` para pendente
- Atualize a linha `Notas:` com contexto curto, branch, PR ou decisao

---

## Objetivo

Transformar as relacoes do mundo em uma superficie visual viva.

O `Grafo Narrativo` nao e decoracao.
Ele existe para:
- dar legibilidade ao tecido politico e emocional do mundo;
- dar legibilidade a familias, casas e genealogias complexas;
- ajudar o mestre a pensar conexoes;
- apoiar consulta rapida;
- reduzir dependencia de memoria manual;
- tornar relacoes navegaveis e editaveis.

---

## Workflow obrigatorio desta frente

### Branches recomendadas
- `codex/graph-foundation`
- `codex/graph-ui-navigation`
- `codex/graph-editing-and-filters`

### Commit pattern recomendado
- `feat(graph): add narrative relation graph view`
- `feat(graph): add entity graph navigation and focus`
- `feat(graph): support relation editing inside graph flow`

### Merge policy
- PRs curtas e orientadas por capacidade;
- merge em `master` via `squash merge`;
- branch removida apos merge;
- nada de manter visualizacao de grafo em branch longa.

---

## Dependencias

Esta frente depende de:
- `shell-cockpit-plan.md`
- `codex-do-mundo-plan.md`

Sem codex firme, o grafo vira visual vazio.

---

## Checklist Mestre

- [-] G1. Criar base tecnica da visualizacao em grafo
  Notas: API world-scoped e primeira board visual entregues sem biblioteca pesada, com base em `Entity` e `EntityRelationship`.

- [-] G2. Definir linguagem visual do grafo
  Notas: Primeira linguagem de lanes por tipo, cards cinematograficos e arestas com cor por semantica entrou; ainda falta refino maior.

- [-] G3. Permitir foco e navegacao por entidade
  Notas: Grafo ja permite selecionar entidade, abrir quick inspect, focar conexoes locais, saltar para o workspace do Codex e alternar para um primeiro modo genealogico.

- [-] G4. Permitir filtros narrativos uteis
  Notas: Busca, tipo, campanha, tipo de relacao e um primeiro preset genealogico ja existem; ainda faltam status, tag forte e presets salvos.

- [-] G5. Permitir edicao de relacao a partir do fluxo do grafo
  Notas: Quick inspect do grafo ja cria, edita e remove relacoes direto na superficie; ainda falta aprofundar o contexto da aresta e a parte mais board-driven.

---

## Frente G1 - Base tecnica do grafo

Contexto tecnico:
O grafo precisa funcionar em volume real e nao pode travar a exploracao do mundo.

- [x] G1.1 Escolher a base de renderizacao do grafo
  Notas: Slice inicial usa board custom com SVG + layout por lanes, sem dependencia externa pesada.

- [x] G1.2 Definir formato de dados de nos e arestas
  Notas: `/api/worlds/[id]/graph` expõe `nodes`, `edges`, `stats` e `relationTypes`.

- [x] G1.3 Definir estrategia de carregamento por mundo
  Notas: Carregamento world-scoped com filtros por busca, tipo, campanha, tag e tipo de relacao.

- [x] G1.4 Definir estrategia de foco e expansao incremental
  Notas: Slice inicial usa foco local na entidade selecionada para reduzir o subgrafo a conexoes diretas.

- [x] G1.5 Garantir integracao com `EntityRelationship`
  Notas: Arestas do board nascem diretamente de `EntityRelationship`.

### Criterios de aceite da Frente G1
- o grafo carrega dados reais do mundo;
- a estrutura suporta crescimento sem explodir em performance;
- foco por entidade e viavel;
- dados de relacao estao corretos.

---

## Frente G2 - Linguagem visual do grafo

Contexto tecnico:
O grafo precisa ser legivel, bonito e util.

- [x] G2.1 Definir visual dos nos por tipo de entidade
  Notas: Nos organizados por lanes de tipo com leitura distinta no board.

- [x] G2.2 Definir visual das arestas por tipo de relacao
  Notas: Arestas ja mudam de tom conforme semantica basica da relacao.

- [x] G2.3 Definir estados de hover, foco, selecao e contexto
  Notas: Board inicial ja tem selecao, foco local e dim de nos/arestas fora do contexto.

- [x] G2.4 Integrar imagem ou retrato quando fizer sentido
  Notas: Cards do board e quick inspect usam retrato/imagem principal quando existir.

- [-] G2.5 Evitar poluicao visual e excesso de ruido
  Notas: Lanes e foco local reduziram ruido, mas mundos maiores ainda exigirao filtros/presets melhores.

### Criterios de aceite da Frente G2
- o grafo e interpretavel em poucos segundos;
- os tipos principais de relacao sao distinguiveis;
- a linguagem visual conversa com o cockpit premium.

---

## Frente G3 - Navegacao e foco

Contexto tecnico:
O grafo deve ser superficie de descoberta, nao screenshot bonita.

- [x] G3.1 Permitir abrir grafo a partir do workspace da entidade
  Notas: Workspace da entidade agora abre o grafo ja focado em `focusEntityId`.

- [x] G3.2 Permitir centralizar o grafo em uma entidade
  Notas: Quick inspect do grafo ja permite focar conexoes da entidade selecionada.

- [x] G3.3 Permitir navegar para entidades conectadas
  Notas: Quick inspect do grafo agora permite seguir relacoes para a entidade conectada sem sair da superficie, atualizando inspect e foco local.

- [x] G3.4 Permitir abrir quick inspect a partir do grafo
  Notas: Selecionar um no abre quick inspect lateral.

- [x] G3.5 Permitir saltar do grafo para o workspace completo
  Notas: Footer do quick inspect abre o workspace completo da entidade no Codex.

### Extensao esperada desta frente
O grafo precisa suportar dois modos de leitura:
- modo narrativo geral, para relacoes politicas, emocionais e estruturais;
- modo genealogico, para familias, casas, herancas, morte e linhagem.

### Criterios de aceite da Frente G3
- o grafo participa do fluxo do mundo;
- e possivel explorar o mundo a partir das conexoes;
- a navegacao nao quebra o contexto do mestre.

---

## Frente G4 - Filtros narrativos

Contexto tecnico:
Sem filtros, o grafo vira ruido.

- [x] G4.1 Filtrar por tipo de entidade
  Notas: Filtro por tipo ja existe na tela do grafo.

- [x] G4.2 Filtrar por tipo de relacao
  Notas: Filtro por tipo de relacao ja existe na tela do grafo.

- [-] G4.3 Filtrar por campanha ou linha temporal
  Notas: Filtro por campanha ja existe; linha temporal ainda nao entrou.

- [x] G4.4 Filtrar por tag ou status
  Notas: Tela do grafo agora expõe filtros por status e tag forte sem sair da superficie.

- [-] G4.5 Definir estados salvos ou presets de consulta
  Notas: Grafo agora tem presets rapidos para leitura geral, genealogia, vivos e casas; ainda faltam estados salvos persistentes e outros modos.

### Criterios de aceite da Frente G4
- o mestre consegue reduzir o ruido do grafo;
- filtros suportam preparacao e consulta;
- o grafo continua util em mundo grande.

---

## Frente G5 - Edicao no fluxo do grafo

Contexto tecnico:
O grafo so vira ferramenta de verdade quando tambem deixa o mestre agir sobre ele.

- [x] G5.1 Criar fluxo para adicionar relacao a partir do grafo
  Notas: Quick inspect do grafo agora cria relacao nova com destino, tipo, direcionalidade, visibilidade e notas.

- [x] G5.2 Criar fluxo para editar relacao existente
  Notas: Quick inspect do grafo agora edita tipo, direcionalidade, visibilidade e notas da relacao.

- [x] G5.3 Criar fluxo para remover relacao com seguranca
  Notas: Quick inspect do grafo agora remove relacoes existentes e recarrega board + entidade.

- [-] G5.4 Expor contexto de notas e peso da relacao
  Notas: Notas e peso agora entram no fluxo do quick inspect, e o board ja usa o peso para reforcar a leitura visual da aresta.

- [ ] G5.5 Garantir consistencia com o workspace da entidade
  Notas:

- [ ] G5.6 Permitir interacao tipo board com arraste e reorganizacao onde fizer sentido
  Notas:

### Criterios de aceite da Frente G5
- o mestre pode usar o grafo para construir o mundo, nao so observar;
- a edicao nao cria estados divergentes;
- alteracoes ficam refletidas imediatamente no fluxo visual.

---

## Definition of Done da frente inteira

Esta frente so termina quando:
- o grafo carrega o mundo real;
- e possivel navegar e filtrar;
- e possivel consultar entidades a partir dele;
- e possivel editar relacoes no proprio fluxo;
- o grafo e claramente util para o mestre.

---

## Criterio de merge final da frente

- visualizacao funcional em mundo real;
- filtros e navegacao concluidos;
- edicao de relacoes integrada;
- sem regressao no codex;
- docs atualizados;
- branch apagada apos merge.
