# T20 RPG Toolkit - Memoria do Mundo Plan

## Como usar
- Marque `[x]` quando concluido
- Use `[-]` para em andamento
- Use `[ ]` para pendente
- Atualize a linha `Notas:` com contexto curto, branch, PR ou decisao

---

## Objetivo

Transformar o que acontece na mesa em continuidade persistente do mundo.

Esta frente existe para resolver o principal problema de longo prazo:
- o mundo muda;
- as pessoas morrem, somem, mudam de lado, descobrem segredos;
- mas essas mudancas nao ficam estruturadas de modo natural e consultavel.

A `Memoria do Mundo` precisa fazer o mundo lembrar por sistema, nao por esforco manual do mestre.
Ela tambem precisa suportar o fluxo de sessao escutada e consolidada depois, sem obrigar o mestre a recontar tudo manualmente.

---

## Workflow obrigatorio desta frente

### Branches recomendadas
- `codex/world-memory-events`
- `codex/world-memory-entity-history`
- `codex/world-memory-derivations`

### Commit pattern recomendado
- `feat(memory): add narrative event layer`
- `feat(memory): derive entity history from world changes`
- `feat(memory): connect session outcomes to world continuity`

### Merge policy
- merge em `master` via `squash merge`;
- branch apagada apos merge;
- sem dependencia de branch paralela para "fechar a continuidade depois".

---

## Dependencias

Esta frente depende de:
- `codex-do-mundo-plan.md`
- `forja-de-sessao-plan.md`
- `mesa-ao-vivo-plan.md`

---

## Checklist Mestre

- [-] W1. Estruturar eventos narrativos do mundo
  Notas: `RPG-20` abriu a primeira sincronizacao narrativa a partir da propria `Session`, usando `Session.metadata.memory` e gerando `WorldEvent` de fechamento, morte, presenca/ausencia e mudanca consolidada.

- [-] W2. Ligar eventos a entidades e campanhas
  Notas: `RPG-21` passou a gerar mudancas persistentes por entidade ligada e a timeline da entidade no Codex ja consome essa camada. Ainda falta consulta cruzada mais profunda com relacoes.

- [-] W3. Derivar historico por entidade
  Notas: `RPG-21` abriu a timeline da entidade no workspace do Codex em cima de `WorldEvent`. Ainda faltam filtros por campanha e leitura temporal mais rica.

- [-] W4. Registrar consequencias de sessao
  Notas: A Forja de Sessao agora possui superficie de fechamento pos-sessao com resumos, presencas, mortes e mudancas persistentes; ainda falta ligar melhor isso a historico de entidade e consulta de campanha.

- [-] W5. Fechar superficies de consulta da memoria
  Notas: `RPG-21` expôs timeline da entidade no Codex e painel de memoria consolidada no cockpit do mundo. Ainda faltam campanha, busca e quick inspect mais profundos.

- [-] W6. Fechar consolidacao pos-sessao e visibilidade
  Notas: O primeiro fluxo manual de consolidacao ja existe em `/app/campaign/[id]/forge/[sessionId]`, incluindo controle de visibilidade `MASTER` vs `PLAYERS`; ainda falta automacao e revisao mais forte.

---

## Frente W1 - Eventos narrativos

Contexto tecnico:
O produto ja tem `WorldEvent`, mas a frente precisa tornar a memoria narrativamente util.

- [x] W1.1 Definir camada de evento narrativo relevante ao mestre
  Notas: O slice inicial usa `Session.metadata.memory` como consolidacao do fechamento da mesa e sincroniza para `WorldEvent`.

- [-] W1.2 Definir tipos minimos de evento de continuidade
  Notas: O fluxo atual cobre `SESSION_END`, `NPC_DEATH`, `WORLD_CHANGE` e `NOTE` como base da memoria consolidada.

- [-] W1.3 Definir visibilidade e escopo
  Notas: O slice inicial ja diferencia `MASTER` e `PLAYERS` em resumo, presencas, mortes e mudancas; ainda falta expandir isso para historico e consulta.

- [-] W1.4 Definir como eventos nascem a partir da mesa e da forja
  Notas: O `PUT /api/sessions/[id]` agora sincroniza a memoria consolidada da Forja para `WorldEvent`.

- [-] W1.5 Garantir integridade temporal e consulta por mundo
  Notas: A memoria ja nasce em `WorldEvent` com `worldId`, `campaignId`, `sessionId` e `ts`, e o cockpit do mundo ja consome essa camada.

### Criterios de aceite da Frente W1
- o sistema registra eventos narrativos com clareza;
- os eventos sao consultaveis e uteis;
- a camada de memoria nao e redundante nem caotica.

---

## Frente W2 - Vinculo com entidades e campanhas

Contexto tecnico:
Memoria sem entidade ligada perde valor.

- [-] W2.1 Permitir ligar evento a uma ou mais entidades
  Notas: Mudancas persistentes agora geram eventos por entidade ligada, permitindo historico no Codex.

- [-] W2.2 Permitir contextualizacao por campanha
  Notas: `RPG-22` abriu leitura dedicada por campanha usando `recentMemoryEvents` no `GET /api/campaigns/[id]` e painel proprio na estacao da campanha. Ainda faltam filtros temporais mais profundos.

- [ ] W2.3 Permitir referencia cruzada com relacoes
  Notas:

- [x] W2.4 Definir comportamento de consulta no workspace da entidade
  Notas: O workspace da entidade agora mostra timeline de memoria consolidada.

- [-] W2.5 Garantir consistencia entre mundo, campanha e entidade
  Notas: O fluxo ja liga sessao, campanha, mundo e entidade; ainda falta ampliar isso para filtros dedicados.

### Criterios de aceite da Frente W2
- eventos importantes aparecem no lugar certo;
- a entidade ganha memoria real;
- a campanha contextualiza sem quebrar a raiz de mundo.

---

## Frente W3 - Historico por entidade

Contexto tecnico:
O mestre precisa abrir uma entidade e ver "o que aconteceu com ela".

- [x] W3.1 Criar timeline de entidade
  Notas: Timeline da entidade aberta no workspace do Codex.

- [x] W3.2 Exibir eventos ordenados e legiveis
  Notas: A timeline agora destaca tipo, visibilidade e texto consolidado do evento.

- [ ] W3.3 Destacar mudancas de status e de relacao
  Notas:

- [x] W3.4 Integrar timeline ao workspace da entidade
  Notas: A timeline substituiu a antiga memoria recente no workspace da entidade.

- [-] W3.5 Definir filtros temporais e por campanha
  Notas: O recorte de campanha ja existe na estacao de campanha e o inspect de sessao ja mostra o fechamento consolidado; ainda faltam filtros dedicados dentro da timeline da entidade.

### Criterios de aceite da Frente W3
- a entidade possui historico proprio;
- a timeline ajuda consulta e continuidade;
- o mestre entende rapidamente o que mudou com ela.

---

## Frente W4 - Consequencias de sessao

Contexto tecnico:
Sessao jogada precisa alimentar memoria do mundo.

- [x] W4.1 Definir quais resultados da mesa viram memoria persistente
  Notas: O primeiro recorte formalizou resumo publico, resumo do mestre, presencas, ausencias, mortes e mudancas persistentes.

- [-] W4.2 Definir como a forja e a sessao geram consequencias
  Notas: A consolidacao agora nasce na Forja de Sessao, desagua automaticamente em `WorldEvent` e ja reaparece no inspect da sessao dentro da estacao da campanha.

- [-] W4.3 Permitir registrar morte, descoberta, alianca, ruptura e eventos chave
  Notas: O slice inicial cobre morte e mudanca persistente com tipos como `discovery`, `alliance`, `rupture`, `status`, `world_change`, `secret` e `other`.

- [x] W4.4 Garantir revisao/confirmacao do mestre onde necessario
  Notas: O fechamento pos-sessao e manual e controlado pelo mestre dentro da Forja antes de sincronizar.

- [ ] W4.5 Garantir que a continuidade do mundo fique refletida apos a sessao
  Notas:

- [x] W4.6 Consolidar quem apareceu, quem nao apareceu, quem morreu e o que mudou
  Notas: O bloco `memory` da sessao agora registra exatamente esses quatro grupos.

### Criterios de aceite da Frente W4
- o mundo de fato muda apos a sessao;
- as mudancas ficam consultaveis;
- o mestre nao precisa reensinar o sistema manualmente toda hora.

---

## Frente W5 - Consulta da memoria

Contexto tecnico:
Memoria so vale se puder ser consultada sem friccao.

- [x] W5.1 Expor memoria no workspace de entidade
  Notas: A timeline da entidade agora consome a memoria consolidada.

- [-] W5.2 Expor memoria em contexto de campanha
  Notas: `RPG-22` abriu o painel `Memoria da campanha` na estacao de campanha e o resumo consolidado no inspect de sessao. Ainda faltam filtros e quick inspect mais profundos.

- [x] W5.3 Expor eventos recentes no cockpit do mundo
  Notas: O cockpit do mundo agora tem painel proprio de memoria consolidada.

- [-] W5.4 Integrar memoria a busca e inspect
  Notas: O inspect de sessao dentro da campanha ja mostra o fechamento consolidado; ainda falta inspect dedicado de evento de memoria e busca transversal.

- [-] W5.5 Garantir leitura clara do que mudou
  Notas: O cockpit, a timeline da entidade e agora a estacao da campanha ja diferenciam morte, mudanca e fechamento; ainda faltam filtros mais ricos e leitura temporal melhor.

### Criterios de aceite da Frente W5
- a memoria do mundo participa do uso diario;
- a consulta e clara e rapida;
- o app ajuda a continuidade de fato.

---

## Frente W6 - Consolidacao pos-sessao e visibilidade

Contexto tecnico:
Depois da sessao, o sistema precisa transformar o caos do jogo em memoria util do mundo.

- [x] W6.1 Definir fluxo de consolidacao pos-sessao
  Notas: O primeiro fluxo existe dentro da propria Forja de Sessao.

- [ ] W6.2 Preparar suporte para captacao, transcricao ou escuta da sessao
  Notas:

- [-] W6.3 Permitir revisar automaticamente aparicoes, mortes e eventos-chave
  Notas: A revisao existe, mas ainda e inteiramente manual; a automacao vem depois.

- [x] W6.4 Permitir marcar o que fica publico versus privado do mestre
  Notas: Cada item consolidado aceita `MASTER` ou `PLAYERS`.

- [-] W6.5 Garantir que isso alimente entidades, campanha e mundo corretamente
  Notas: O fluxo agora alimenta mundo, campanha, sessao e tambem a entidade no workspace do Codex. `RPG-22` fechou a superficie inicial de campanha; ainda faltam filtros dedicados e quick inspect de memoria.

### Criterios de aceite da Frente W6
- a sessao pode ser consolidada sem reensino manual massivo;
- o mestre controla visibilidade publica e privada;
- o mundo absorve a sessao de forma clara e consultavel.

---

## Definition of Done da frente inteira

Esta frente so termina quando:
- o mundo registra eventos narrativos relevantes;
- entidades ganham historico proprio;
- sessao jogada gera continuidade clara;
- o fluxo pos-sessao consegue consolidar visibilidade e consequencias;
- o mestre consegue consultar o que mudou sem depender de memoria manual.

---

## Criterio de merge final da frente

- eventos narrativos funcionando;
- historico por entidade disponivel;
- integracao com sessao e campanha concluida;
- docs atualizados;
- branch apagada apos merge.
