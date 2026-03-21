# T20 RPG Toolkit - Attack Index

## Como usar
- Marque `[x]` quando concluido
- Use `[-]` para em andamento
- Use `[ ]` para pendente
- Atualize a linha `Notas:` com contexto curto, branch, PR ou decisao

---

## Objetivo

Este arquivo e o indice executivo do rework do `t20-rpg-toolkit`.

Ele existe para:
- definir a ordem oficial de ataque;
- registrar dependencias entre frentes;
- impedir trabalho paralelo demais em partes que ainda nao tem base;
- garantir que cada frente feche de ponta a ponta;
- deixar claro o que pode entrar em branch, o que pode virar PR e quando uma frente pode ser considerada encerrada.

Este arquivo deve sempre refletir a verdade atual do programa de trabalho.

---

## Regra de ouro do programa

- Nada e implementado direto na `master`.
- Toda frente nasce em branch propria com prefixo `codex/`.
- Toda branch precisa ter escopo claro e prazo de vida curto.
- Toda branch precisa abrir PR contra `master`.
- Toda PR precisa ter criterio de aceite fechado no respectivo plano.
- Merge padrao: `squash merge`.
- Depois do merge, a branch morre.
- Nada fica "morando" em branch antiga.
- Nada fica "so comitado" fora de PR.
- O que foi mergeado precisa ficar estavel na `master`.

---

## Workflow oficial de branch, commit, PR e merge

### Branches
- Prefixo obrigatorio: `codex/`
- Formato recomendado: `codex/<frente>-<recorte>`
- Exemplos:
  - `codex/shell-cockpit-foundation`
  - `codex/codex-world-schema`
  - `codex/graph-entity-relations`

### Commits
- Padrao obrigatorio: Conventional Commits
- Exemplos:
  - `feat(shell): build cockpit workspace foundation`
  - `feat(codex): add universal entity model`
  - `refactor(world): align world shell and navigation`
  - `docs(plan): expand attack plan acceptance criteria`

### Pull requests
- Toda branch relevante abre PR contra `master`
- Estrutura obrigatoria da PR:
  - Summary
  - Motivation
  - Changes
  - Testing
  - Risks
  - Notes
- PR deve referenciar explicitamente o plano atacado
- PR deve listar o que ficou fora de escopo

### Merge
- Merge padrao: `squash merge`
- Branch apagada apos merge
- Nao usar `rebase and merge` como padrao
- Nao manter branch viva apos merge "por garantia"

### Condicoes minimas para merge
- checklist da frente atualizado;
- criterios de aceite atendidos;
- testes relevantes passando;
- sem regressao visivel no fluxo principal;
- sem dependencia escondida de branch paralela;
- docs atualizados se a entrega mudou direcao, escopo ou operacao.

---

## Ordem oficial de ataque

1. `shell-cockpit-plan.md`
2. `codex-do-mundo-plan.md`
3. `grafo-narrativo-plan.md`
4. `biblioteca-visual-plan.md`
5. `forja-do-mundo-plan.md`
6. `forja-de-sessao-plan.md`
7. `mesa-ao-vivo-plan.md`
8. `memoria-do-mundo-plan.md`
9. `balanceamento-t20-plan.md`

Racional:
- `shell` define o produto;
- `codex` define o nucleo de dominio;
- `grafo` e `biblioteca visual` enriquecem a camada de mundo;
- `forja do mundo` transforma criacao profunda de mundo em fluxo de produto;
- `forja de sessao` e `mesa` dependem dessa fundacao;
- `memoria` consolida consequencia;
- `balanceamento` fecha a frente T20 de apoio ao mestre.

---

## Dependencias entre frentes

- `shell-cockpit-plan.md` destrava `codex-do-mundo-plan.md`
- `codex-do-mundo-plan.md` destrava `grafo-narrativo-plan.md`
- `codex-do-mundo-plan.md` destrava `biblioteca-visual-plan.md`
- `codex-do-mundo-plan.md` destrava `forja-do-mundo-plan.md`
- `grafo-narrativo-plan.md` e `biblioteca-visual-plan.md` fortalecem `forja-do-mundo-plan.md`
- `forja-do-mundo-plan.md` destrava `forja-de-sessao-plan.md`
- `shell-cockpit-plan.md` destrava `mesa-ao-vivo-plan.md`
- `codex-do-mundo-plan.md` destrava `memoria-do-mundo-plan.md`
- `forja-de-sessao-plan.md` e `mesa-ao-vivo-plan.md` alimentam `memoria-do-mundo-plan.md`
- `balanceamento-t20-plan.md` pode iniciar em paralelo apenas depois de `codex` estar firme

---

## Checklist Mestre

- [-] A1. Fechar shell e cockpit base
  Notas: Atualizacao 1 ganhou shell unificado, cockpit do mundo, biblioteca de mundos, estacao de campanha e atlas redesenhados. Build de producao passou; falta consolidar drawers/detail surfaces e validacao final de densidade.

- [-] A2. Fechar modulo 1 - Codex do Mundo
  Notas: Schema Prisma, APIs world-scoped, Codex Index com agrupamento visual, tags fortes e quick inspect completo, alem de `Entity Workspace` com overview editavel, relacoes, galeria, upload e edicao inline. NPCs e Characters ja convergem para o Codex; ainda faltam refinamento maior do fluxo e reducao mais profunda do legado.

- [-] A3. Fechar Grafo Narrativo
  Notas: Base world-scoped entregue com board visual, quick inspect, salto para o Codex, modo genealogico e criacao/edicao/remocao de relacoes no fluxo. Navegacao encadeada entre entidades conectadas ja entrou; ainda faltam filtros mais profundos e interacao mais board-driven.

- [-] A4. Fechar Biblioteca Visual
  Notas: Biblioteca visual world-scoped entrou com agrupamento por entidade, reveal direto, lightbox, quick inspect proprio, curadoria inline de asset com `sortOrder`, papel visual, promocao para capa/retrato, filtros por subtipo, `mesa pack` cinematografico por campanha e leitura de prontidao do asset. Ainda faltam refinamentos finais de preparo de mesa/TV por contexto de cena.

- [-] A5. Fechar Forja do Mundo
  Notas: `RPG-16` fechou o bootstrap real da forja, `RPG-17` estruturou casas/faccoes, `RPG-18` abriu a oficina genealogica em `/forge/genealogy`, `GUI-37` amadureceu politica/conselhos em `/forge/politics`, `GUI-38` abriu a oficina de cronologia em `/forge/timeline` com `World.metadata.chronology` e `WorldEvent` macro, e `GUI-39` abriu a oficina de lore-base em `/forge/lore` sobre `RulesetDocument` com busca, visibilidade, ligacoes ao Codex e subida de `Prep imediato` para o cockpit do mundo. Ainda faltam conselhos mais profundos, manipulacao genealogica mais forte, refinamento da cronologia e passagem mais direta para a futura Forja de Sessao.

- [-] A6. Fechar Forja de Sessao
  Notas: `GUI-40` abriu a superficie real em `/app/campaign/[id]/forge/[sessionId]`, reaproveitando a propria `Session` como fonte de verdade, com briefing, objetivo de mesa, beats, ganchos, segredos, revelacoes, notas operacionais, entidades em foco, lore priorizado da campanha, `cenas` + `subcenas` com reordenacao, ligacao a beats e reveals, envio direto de `reveals` para a mesa usando `roomCode`, reveals visuais com `imageUrl` reaproveitado de entidades do Codex e agora `pacote visual da mesa` + `pacote operacional` dentro da propria forja. `RPG-27` acrescentou `encontros preparados` persistidos em `Session.metadata.forge`, vindos da campanha e ligados opcionalmente a cenas. Ainda faltam integracao mais forte com a biblioteca visual completa e passagem mais ampla da forja para a operacao ao vivo.

- [-] A7. Fechar Mesa ao Vivo
  Notas: `RPG-19` abriu o primeiro consumo real da `Forja de Sessao` dentro de `/app/play/[campaignId]`, puxando sessao ativa ou proxima sessao para o cockpit ao vivo com objetivo de mesa, contagem operacional e proximas cenas, depois adicionou quick inspect world-scoped com busca curta e drawer de detalhe, passou a permitir disparar `reveals` preparados direto do cockpit da mesa e agora ja trabalha com `cena em foco` para contextualizar o pacote narrativo. `RPG-28` acrescentou leitura de `encontro preparado` no proprio cockpit da mesa, com composicao, risco, confianca e recomendacao. `RPG-33` comecou a atacar a divida estrutural de `play`, extraindo o pacote de preparo/balanceamento/reveal para `live-prep-cockpit` sem alterar a operacao. `RPG-34` continuou essa limpeza extraindo o quick inspect world-scoped para `live-codex-inspect`. `RPG-35` isolou o stack de historico/chat em `live-history-chat-stack`, `RPG-36` fez o mesmo com o centro tatico da mesa em `live-war-room`, `RPG-37` agrupou a sidebar inteira em `live-operations-sidebar`, `RPG-38` removeu helper morto, estados locais sem uso e tipou melhor o `play`, zerando o lint do arquivo, `RPG-39` aprofundou o reveal por `cena em foco` com hierarquia entre `reveal principal`, `secundarios` e `gerais da sessao`, `RPG-40` conectou entidades em foco da cena a referencias visuais sugeridas no cockpit, com retratos e lugares, `RPG-41` sincronizou esses cards visuais com o `quick inspect`, destacando a entidade atualmente em consulta e permitindo abrir o inspect direto do contexto visual, `RPG-42` marcou readiness de segunda tela nesses assets e reveals, permitindo exibir retratos e lugares da cena direto para os jogadores pelo fluxo de `roomCode`, `RPG-43` separou explicitamente no cockpit o que e superficie `Para jogadores` e o que e `Apenas mestre`, deixando o fluxo publico de TV/segunda tela mais claro sem sacrificar o contexto privado do mestre, `RPG-44` passou a mostrar `Na tela agora` dentro do bloco publico, reduzindo a ambiguidade entre asset pronto e asset efetivamente em exibicao para os jogadores, `RPG-45` conectou a pressao ao vivo ao bloco publico com a leitura `Ritmo da cena`, indicando quando segurar, manter ou escalar a exposicao visual para os jogadores, `RPG-46` passou a sugerir explicitamente a `Proxima exposicao` no mesmo bloco, reduzindo improviso entre um reveal/asset e o proximo, e `RPG-47` evoluiu isso para uma fila curta com `Proxima` e `Depois`, deixando a progressao visual da cena ainda mais previsivel para o mestre. Ainda faltam integracao visual mais profunda e encaixe melhor entre narracao, combate e reveal.

- [-] A8. Fechar Memoria do Mundo
  Notas: `RPG-20` abriu o primeiro slice real da frente em cima da propria `Session`: a Forja de Sessao agora consolida resumo publico, resumo do mestre, presencas, ausencias, mortes e mudancas persistentes em `Session.metadata.memory`, e o `PUT /api/sessions/[id]` ja sincroniza isso para `WorldEvent` com visibilidade e vinculo por sessao/campanha/mundo. `RPG-21` aprofundou a frente com timeline da entidade no Codex, painel de memoria consolidada no cockpit do mundo e sincronizacao de mudancas persistentes por entidade ligada. `RPG-22` abriu memoria por campanha na estacao de campanha, com `recentMemoryEvents` no `GET /api/campaigns/[id]` e bloco de fechamento consolidado no inspect de sessao. `RPG-23` aprofundou a consulta com filtros leves de memoria e quick inspect dedicado em mundo e campanha. `RPG-24` trouxe leitura temporal melhor e contexto cruzado no inspect, com links rapidos para campanha, sessao e entidades quando possivel. Ainda falta busca transversal mais forte e derivacao temporal mais profunda.

- [-] A9. Fechar Balanceamento T20
  Notas: `RPG-25` abriu a base heuristica em `src/lib/t20-balance.ts` e o primeiro painel de leitura de risco/encontro na estacao da campanha. `RPG-26` ampliou isso com preparo de encontro real no cockpit da campanha, selecao de composicao por ameaca inimiga, recalculo dedicado do encontro preparado e sugestao de ajuste de intensidade/composicao. `RPG-27` passou a salvar composicoes em `Session.metadata.forge`, com escolha de sessao alvo, ligacao opcional a cena e leitura desse encontro dentro da propria Forja de Sessao. `RPG-28` levou o encontro preparado para a Mesa ao Vivo com risco, confianca, composicao e recomendacao no cockpit da sessao. `RPG-31` acrescentou leitura de pressao ao vivo no combate real, com round, HP medio, vantagem numerica, quedas e recomendacao discreta no mesmo cockpit. `RPG-32` adicionou `Ajuste rapido` ao vivo, sugerindo aliviar, segurar ou escalar a tensao com base no estado real do combate e no encontro preparado. Ainda faltam refinamento estrutural do loop ao vivo e leitura mais profunda de sheets/recursos.

---

## Criterio de encerramento do programa

O rework principal so e considerado consolidado quando:
- o app funciona como cockpit continuo do mestre;
- o modulo de mundo e a fonte natural de preparacao;
- o mundo deixa de parecer um conjunto de tabelas e paginas dispersas;
- a mesa ao vivo funciona com consulta e operacao fluida;
- a memoria do mundo preserva continuidade real;
- o visual final parece produto premium, nao template adaptado;
- a `master` contem todas as entregas importantes sem dependencia de branches paralelas.

---

## Arquivos deste pacote

- `docs/t20-toolkit-master-plan.md`
- `docs/attack-index.md`
- `docs/front-cleanup-zero-plan.md`
- `docs/reference-harvest-plan.md`
- `docs/shell-cockpit-plan.md`
- `docs/codex-do-mundo-plan.md`
- `docs/grafo-narrativo-plan.md`
- `docs/biblioteca-visual-plan.md`
- `docs/forja-do-mundo-plan.md`
- `docs/forja-de-sessao-plan.md`
- `docs/mesa-ao-vivo-plan.md`
- `docs/memoria-do-mundo-plan.md`
- `docs/balanceamento-t20-plan.md`
