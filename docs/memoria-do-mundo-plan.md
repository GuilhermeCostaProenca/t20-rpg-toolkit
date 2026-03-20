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

- [ ] W1. Estruturar eventos narrativos do mundo
  Notas:

- [ ] W2. Ligar eventos a entidades e campanhas
  Notas:

- [ ] W3. Derivar historico por entidade
  Notas:

- [ ] W4. Registrar consequencias de sessao
  Notas:

- [ ] W5. Fechar superficies de consulta da memoria
  Notas:

- [ ] W6. Fechar consolidacao pos-sessao e visibilidade
  Notas:

---

## Frente W1 - Eventos narrativos

Contexto tecnico:
O produto ja tem `WorldEvent`, mas a frente precisa tornar a memoria narrativamente util.

- [ ] W1.1 Definir camada de evento narrativo relevante ao mestre
  Notas:

- [ ] W1.2 Definir tipos minimos de evento de continuidade
  Notas:

- [ ] W1.3 Definir visibilidade e escopo
  Notas:

- [ ] W1.4 Definir como eventos nascem a partir da mesa e da forja
  Notas:

- [ ] W1.5 Garantir integridade temporal e consulta por mundo
  Notas:

### Criterios de aceite da Frente W1
- o sistema registra eventos narrativos com clareza;
- os eventos sao consultaveis e uteis;
- a camada de memoria nao e redundante nem caotica.

---

## Frente W2 - Vinculo com entidades e campanhas

Contexto tecnico:
Memoria sem entidade ligada perde valor.

- [ ] W2.1 Permitir ligar evento a uma ou mais entidades
  Notas:

- [ ] W2.2 Permitir contextualizacao por campanha
  Notas:

- [ ] W2.3 Permitir referencia cruzada com relacoes
  Notas:

- [ ] W2.4 Definir comportamento de consulta no workspace da entidade
  Notas:

- [ ] W2.5 Garantir consistencia entre mundo, campanha e entidade
  Notas:

### Criterios de aceite da Frente W2
- eventos importantes aparecem no lugar certo;
- a entidade ganha memoria real;
- a campanha contextualiza sem quebrar a raiz de mundo.

---

## Frente W3 - Historico por entidade

Contexto tecnico:
O mestre precisa abrir uma entidade e ver "o que aconteceu com ela".

- [ ] W3.1 Criar timeline de entidade
  Notas:

- [ ] W3.2 Exibir eventos ordenados e legiveis
  Notas:

- [ ] W3.3 Destacar mudancas de status e de relacao
  Notas:

- [ ] W3.4 Integrar timeline ao workspace da entidade
  Notas:

- [ ] W3.5 Definir filtros temporais e por campanha
  Notas:

### Criterios de aceite da Frente W3
- a entidade possui historico proprio;
- a timeline ajuda consulta e continuidade;
- o mestre entende rapidamente o que mudou com ela.

---

## Frente W4 - Consequencias de sessao

Contexto tecnico:
Sessao jogada precisa alimentar memoria do mundo.

- [ ] W4.1 Definir quais resultados da mesa viram memoria persistente
  Notas:

- [ ] W4.2 Definir como a forja e a sessao geram consequencias
  Notas:

- [ ] W4.3 Permitir registrar morte, descoberta, alianca, ruptura e eventos chave
  Notas:

- [ ] W4.4 Garantir revisao/confirmacao do mestre onde necessario
  Notas:

- [ ] W4.5 Garantir que a continuidade do mundo fique refletida apos a sessao
  Notas:

- [ ] W4.6 Consolidar quem apareceu, quem nao apareceu, quem morreu e o que mudou
  Notas:

### Criterios de aceite da Frente W4
- o mundo de fato muda apos a sessao;
- as mudancas ficam consultaveis;
- o mestre nao precisa reensinar o sistema manualmente toda hora.

---

## Frente W5 - Consulta da memoria

Contexto tecnico:
Memoria so vale se puder ser consultada sem friccao.

- [ ] W5.1 Expor memoria no workspace de entidade
  Notas:

- [ ] W5.2 Expor memoria em contexto de campanha
  Notas:

- [ ] W5.3 Expor eventos recentes no cockpit do mundo
  Notas:

- [ ] W5.4 Integrar memoria a busca e inspect
  Notas:

- [ ] W5.5 Garantir leitura clara do que mudou
  Notas:

### Criterios de aceite da Frente W5
- a memoria do mundo participa do uso diario;
- a consulta e clara e rapida;
- o app ajuda a continuidade de fato.

---

## Frente W6 - Consolidacao pos-sessao e visibilidade

Contexto tecnico:
Depois da sessao, o sistema precisa transformar o caos do jogo em memoria util do mundo.

- [ ] W6.1 Definir fluxo de consolidacao pos-sessao
  Notas:

- [ ] W6.2 Preparar suporte para captacao, transcricao ou escuta da sessao
  Notas:

- [ ] W6.3 Permitir revisar automaticamente aparicoes, mortes e eventos-chave
  Notas:

- [ ] W6.4 Permitir marcar o que fica publico versus privado do mestre
  Notas:

- [ ] W6.5 Garantir que isso alimente entidades, campanha e mundo corretamente
  Notas:

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
