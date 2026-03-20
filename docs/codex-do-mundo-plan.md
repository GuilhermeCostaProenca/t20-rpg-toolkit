# T20 RPG Toolkit - Codex do Mundo Plan

## Como usar
- Marque `[x]` quando concluido
- Use `[-]` para em andamento
- Use `[ ]` para pendente
- Atualize a linha `Notas:` com contexto curto, branch, PR ou decisao

---

## Objetivo

Entregar o primeiro modulo completo e realmente utilizavel do produto: o `Codex do Mundo`.

Este modulo existe para resolver o maior gargalo real do mestre:
- centralizacao de entidades;
- consulta de contexto;
- organizacao de referencias;
- preparacao do mundo antes da sessao;
- uso rapido durante a sessao.

Se esta frente ficar pronta, o toolkit ja passa a ser util no dia a dia mesmo antes das demais.
Mas o Codex nao substitui a futura `Forja do Mundo`: ele fornece a base estrutural para que a criacao profunda de mundo aconteca depois em cima de entidades, relacoes e referencias reais.

---

## Workflow obrigatorio desta frente

### Branches recomendadas
- `codex/codex-entity-schema`
- `codex/codex-entity-api`
- `codex/codex-entity-workspace`
- `codex/codex-world-index`

### Commit pattern recomendado
- `feat(codex): add universal entity model`
- `feat(codex): build world codex index and filters`
- `feat(codex): add entity workspace and quick inspect`
- `refactor(world): route npc access through codex primitives`

### Merge policy
- cada subfrente principal deve abrir PR propria;
- PRs pequenas e acopladas ao checklist;
- merge em `master` via `squash merge`;
- branch apagada apos merge;
- nenhuma parte do codex deve depender permanentemente de branch irma.

---

## Estado atual

O repositorio ja possui:
- `World` como raiz conceitual;
- `Npc`, `Character`, `RulesetDocument` e `WorldEvent`;
- telas de mundo, NPCs, campanhas e compendium;
- upload de imagem simples.

Mas nao possui:
- uma camada universal de entidade;
- relacoes de primeira classe;
- workspace real de entidade;
- quick inspect;
- indice do codex;
- uma superficie de consulta de mundo a altura do fluxo do mestre.

---

## Decisoes base

- `Entity` universal sera o centro do novo codex.
- O legado pode coexistir temporariamente, mas nao define o futuro do modulo.
- O modulo precisa servir tanto para preparacao quanto para consulta.
- Imagens sao parte da entidade, nao so anexos.
- Relacoes sao primeira classe.
- `worldId` e obrigatorio em toda entidade.
- `campaignId` pode contextualizar, mas nao substituir a raiz do mundo.

---

## Checklist Mestre

- [-] C1. Introduzir modelo universal de `Entity`
  Notas: `Entity` entrou no Prisma com tipo, subtipo, resumo, status, visibilidade, imagens principais, tags e metadata.

- [-] C2. Introduzir `EntityRelationship`
  Notas: Schema, rotas e UI inicial de criacao/remocao/edicao no workspace entregues; ainda falta uma experiencia mais refinada de manipulacao.

- [-] C3. Introduzir `EntityImage`
  Notas: Modelo, rotas e galeria do workspace entregues; add/remove/edicao simples e upload por arquivo agora entram no fluxo.

- [-] C4. Criar APIs do Codex
  Notas: Rotas world-scoped de entidade, relacao, imagem e indice agregado ja existem.

- [-] C5. Criar `Codex Index`
  Notas: `/app/worlds/[id]/codex` entregue com busca, filtros, tag forte do mundo, agrupamento por tipo, destaque do mundo e cards iniciais.

- [-] C6. Criar `Quick Inspect`
  Notas: Quick inspect no Codex via `CockpitDetailSheet` agora mostra imagem principal, tags, relacoes, memoria recente e salto para o workspace.

- [-] C7. Criar `Entity Workspace`
  Notas: Workspace entregue em `/app/worlds/[id]/codex/[entityId]` com overview editavel, relacoes, galeria, upload simples, edicao inline e memoria recente. Falta refino visual e aprofundamento maior do fluxo.

- [-] C8. Integrar o shell do mundo ao novo Codex
  Notas: Sidebar e cockpit ja apontam para o Codex, o quick inspect leva ao workspace e NPCs/Characters ja conseguem abrir ou criar entidades no Codex. Ainda falta reduzir mais o peso das rotas legadas.

---

## Frente C1 - Modelo universal de entidade

Contexto tecnico:
Hoje o app tem modelos separados para partes do dominio. O codex precisa consolidar a experiencia sem explodir o legado.

- [x] C1.1 Definir schema inicial de `Entity`
  Notas: Modelo adicionado ao Prisma.

- [x] C1.2 Definir tipos iniciais suportados
  Notas: Primeira passada do indice usa `character`, `npc`, `faction`, `house`, `place`, `artifact` e `event`.

- [x] C1.3 Definir campos obrigatorios e opcionais
  Notas: Nome, tipo, mundo, campanha opcional, resumo, descricao, tags, metadata e imagens principais definidos.

- [x] C1.4 Definir politicas de visibilidade e status
  Notas: `visibility` e `status` entraram como campos explicitos no modelo.

- [x] C1.5 Garantir indexes e consultas basicas por mundo
  Notas: Indices por `worldId`, `type`, `status`, `campaignId` e `updatedAt` adicionados ao schema/migration.

### Criterios de aceite da Frente C1
- o schema de entidade e suficiente para representar o nucleo de worldbuilding;
- toda entidade pertence claramente a um mundo;
- o schema nao nasce acoplado a NPC apenas;
- o modelo suporta crescimento sem virar blob semantico.

---

## Frente C2 - Relacoes do mundo

Contexto tecnico:
Sem relacoes, o mundo continua parecendo um cadastro de fichas soltas.

- [x] C2.1 Definir schema de `EntityRelationship`
  Notas: Modelo Prisma e migration manual adicionados.

- [x] C2.2 Suportar relacoes direcionais
  Notas: Campo `directionality` entrou no schema inicial.

- [x] C2.3 Suportar notas e contexto da relacao
  Notas: `notes`, `weight` e `visibility` adicionados.

- [x] C2.4 Permitir consulta da entidade com ambos os lados da relacao
  Notas: Detalhe de entidade carrega `outgoingRelations` e `incomingRelations`.

- [-] C2.5 Garantir integridade ao remover ou editar entidades
  Notas: Fluxo de edicao e remocao de relacao no workspace entregue; ainda falta tratar melhor convivio com legado e cenarios mais complexos.

### Criterios de aceite da Frente C2
- duas entidades podem ser ligadas de forma clara;
- a relacao tem semantica util para o mestre;
- relacoes podem ser consultadas dos dois lados;
- o sistema nao deixa lixo estrutural ao editar ou remover registros.

---

## Frente C3 - Imagens por entidade

Contexto tecnico:
Hoje ha upload simples. O codex precisa elevar isso para uma camada real de referencia.

- [x] C3.1 Definir schema de `EntityImage`
  Notas: Modelo Prisma e migration manual adicionados.

- [x] C3.2 Suportar capa, retrato e galeria
  Notas: Entidade possui `coverImageUrl`, `portraitImageUrl` e galeria via `EntityImage`.

- [x] C3.3 Definir ordenacao manual de imagens
  Notas: `sortOrder` adicionado no schema e na API.

- [x] C3.4 Definir legenda opcional e classificacao de imagem
  Notas: `kind` e `caption` adicionados no schema e nas rotas.

- [x] C3.5 Integrar upload existente ao novo modelo
  Notas: Workspace agora usa `/api/upload` para preencher a URL da galeria com upload de arquivo.

### Criterios de aceite da Frente C3
- uma entidade pode ter imagem principal e varias referencias;
- a ordem visual e previsivel;
- o mestre nao precisa improvisar com links perdidos;
- a galeria da entidade serve para consulta real.

---

## Frente C4 - APIs do Codex

Contexto tecnico:
O modulo precisa nascer com superficie de dados clara e previsivel.

- [x] C4.1 Implementar `GET/POST /api/worlds/:id/entities`
  Notas: Entregue em `src/app/api/worlds/[id]/entities/route.ts`.

- [x] C4.2 Implementar `GET/PATCH/DELETE /api/worlds/:id/entities/:entityId`
  Notas: Entregue em `src/app/api/worlds/[id]/entities/[entityId]/route.ts`.

- [x] C4.3 Implementar rotas de relacao
  Notas: Rotas list/create/update/delete entregues.

- [x] C4.4 Implementar rotas de imagem
  Notas: Rotas create/update/delete de `EntityImage` entregues.

- [x] C4.5 Implementar `GET /api/worlds/:id/codex`
  Notas: Endpoint agregado entregue com mundo, stats e entidades.

### Criterios de aceite da Frente C4
- o frontend consegue operar o modulo sem hacks;
- as respostas sao estaveis e suficientes para index, inspect e workspace;
- filtros e busca por mundo funcionam;
- a API do codex nao depende de chamadas improvisadas em varios endpoints legados.

---

## Frente C5 - Codex Index

Contexto tecnico:
O indice do codex e a porta principal de entrada para o mundo.

- [x] C5.1 Criar lista principal de entidades do mundo
  Notas: Indice principal do Codex entregue em `/app/worlds/[id]/codex`.

- [x] C5.2 Implementar busca textual util
  Notas: Busca textual por nome, resumo, descricao e subtipo ja opera no endpoint agregado.

- [x] C5.3 Implementar filtros por tipo, status, tag e campanha
  Notas: Tipo, status e campanha ja existiam; tag forte do mundo agora entra no fluxo do indice.

- [x] C5.4 Definir agrupamento e ordenacao visual
  Notas: Leitura sem filtros agora agrupa entidades por tipo, com destaque inicial e CTA de filtragem contextual.

- [x] C5.5 Criar entrada rapida para nova entidade
  Notas: Dialog de criacao rapida ja fica no hero do Codex.

### Criterios de aceite da Frente C5
- o mestre encontra entidades rapido;
- o indice parece vivo e navegavel;
- a busca funciona em mundo com volume real;
- o indice ja reduz a necessidade de abrir outras telas para procurar contexto.

---

## Frente C6 - Quick Inspect

Contexto tecnico:
Consulta rapida e parte critica do fluxo do mestre.

- [x] C6.1 Criar drawer/painel de inspecao rapida
  Notas: Quick inspect entregue com `CockpitDetailSheet`.

- [x] C6.2 Mostrar resumo, imagem principal e tags
  Notas: Quick inspect agora inclui resumo, imagem principal e tags.

- [x] C6.3 Mostrar relacoes principais
  Notas: Quick inspect mostra relacoes de entrada e saida.

- [x] C6.4 Mostrar eventos recentes ligados a entidade
  Notas: Quick inspect mostra memoria recente da entidade.

- [x] C6.5 Permitir saltar do inspect para o workspace completo
  Notas: Footer do quick inspect leva ao workspace da entidade.

### Criterios de aceite da Frente C6
- consultar uma entidade nao exige navegar para outra area;
- o mestre consegue confirmar identidade e contexto em poucos segundos;
- o inspect e util durante preparacao e durante sessao.

---

## Frente C7 - Entity Workspace

Contexto tecnico:
Cada entidade precisa ter um lugar proprio forte o bastante para concentrar trabalho.

- [x] C7.1 Criar overview da entidade
  Notas: Workspace entrega hero, resumo e overview editavel.

- [x] C7.2 Criar secao de descricao e notas
  Notas: Descricao e resumo editaveis no overview.

- [x] C7.3 Criar secao de galeria visual
  Notas: Galeria simples com add/remove por URL entregue.

- [x] C7.4 Criar secao de relacoes
  Notas: Criacao e remocao de relacoes no proprio workspace.

- [x] C7.5 Criar secao de historico narrativo basico
  Notas: Memoria recente baseada em `WorldEvent` entregue.

### Criterios de aceite da Frente C7
- a entidade parece uma unidade viva, nao um formulario;
- o workspace serve para editar e consultar;
- o mestre consegue entender rapidamente quem ou o que aquela entidade e;
- relacoes e imagens estao integradas ao workspace, nao jogadas ao redor.

---

## Frente C8 - Integracao do mundo ao Codex

Contexto tecnico:
O modulo so fecha quando o shell do mundo reconhece o Codex como superficie principal.

- [x] C8.1 Integrar o acesso do mundo ao novo indice
  Notas: Codex acessivel do shell e do cockpit.

- [-] C8.2 Reduzir dependencia da tela antiga de NPCs como entrada principal
  Notas: Tela de NPCs agora consegue abrir ou espelhar fichas no Codex, mas ainda convive como superficie forte do fluxo antigo.

- [-] C8.3 Revisar CTA e navegacao do mundo
  Notas: Quick inspect agora leva ao workspace da entidade, e NPCs/Characters ganharam CTA explicita para abrir ou criar no Codex.

- [x] C8.4 Garantir consistencia com o cockpit base
  Notas: Workspace nasce na mesma linguagem cinematica do shell e do Codex.

- [-] C8.5 Definir convivio temporario com rotas legadas
  Notas: NPCs e Characters agora funcionam como ponte operacional para o Codex sem matar o fluxo legado de uma vez.

### Criterios de aceite da Frente C8
- o novo fluxo do mundo aponta naturalmente para o Codex;
- o shell nao trata o codex como "mais uma pagina";
- o convivio com legado e controlado e claro.

---

## Fora de escopo desta frente

- bootstrap profundo de mundo;
- genealogias como experiencia dedicada;
- politica, conselhos e estruturas de poder como workspace proprio;
- calendarios, eras e cronologias fundadoras do mundo;
- visualizacao em grafo completa;
- forja do mundo;
- forja de sessao;
- timeline narrativa profunda;
- balanceamento T20;
- operacao de combate e mapa.

---

## Definition of Done da frente inteira

Esta frente so termina quando:
- o mestre consegue cadastrar entidades relevantes do mundo;
- consegue ligar essas entidades entre si;
- consegue anexar referencias visuais;
- consegue buscar e consultar rapidamente;
- consegue abrir uma entidade sem perder o fluxo;
- o modulo e forte o bastante para virar uso diario.

---

## Criterio de merge final da frente

Para encerrar esta frente via PR final:
- schema e APIs estaveis;
- index, inspect e workspace funcionais;
- integracao no shell do mundo concluida;
- testes relevantes passando;
- docs atualizados;
- branch apagada apos merge.
