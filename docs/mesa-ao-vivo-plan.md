# T20 RPG Toolkit - Mesa ao Vivo Plan

## Como usar
- Marque `[x]` quando concluido
- Use `[-]` para em andamento
- Use `[ ]` para pendente
- Atualize a linha `Notas:` com contexto curto, branch, PR ou decisao

---

## Objetivo

Transformar o toolkit na central operacional da sessao ao vivo.

Esta frente existe para reduzir a fragmentacao durante a mesa:
- abrir varias janelas;
- procurar referencia na pressa;
- alternar entre notas, imagem, mapa e combate;
- alternar entre playlist, ficha, dados, imagens e narrativa;
- perder ritmo narrativo;
- quebrar a imersao por falta de operacao fluida.

`Mesa ao Vivo` e a frente que torna o app utilizavel em jogo real.

---

## Workflow obrigatorio desta frente

### Branches recomendadas
- `codex/live-table-shell`
- `codex/live-table-quick-access`
- `codex/live-table-combat-flow`
- `codex/live-table-reveal-ops`

### Commit pattern recomendado
- `feat(live): unify session operation cockpit`
- `feat(live): add quick entity consultation during play`
- `refactor(combat): align live session controls with cockpit`
- `feat(reveal): streamline visual reveal operations`

### Merge policy
- PR por fluxo operacional fechado;
- merge em `master` via `squash merge`;
- branch apagada apos merge;
- nenhuma melhoria critica de mesa deve ficar isolada aguardando "grande merge".

---

## Dependencias

Esta frente depende de:
- `shell-cockpit-plan.md`
- `codex-do-mundo-plan.md`
- `biblioteca-visual-plan.md`

---

## Checklist Mestre

- [-] M1. Reestruturar cockpit da sessao ao vivo
  Notas: `RPG-19` abriu o primeiro pacote de preparo dentro de `/app/play/[campaignId]`, puxando a sessao ativa ou proxima sessao da campanha para o cockpit ao vivo com objetivo de mesa, contagem operacional e proximas cenas. `RPG-28` acrescentou leitura do encontro preparado em foco no mesmo cockpit, com risco, confianca, composicao e recomendacao.

- [-] M2. Fechar consulta rapida de entidades durante a mesa
  Notas: `RPG-19` agora abre quick inspect world-scoped dentro de `/app/play/[campaignId]`, com busca curta, atalhos para entidades em foco da sessao e drawer de detalhe reaproveitando o padrao do Codex.

- [ ] M3. Integrar combate ao cockpit de forma mais fluida
  Notas:

- [-] M4. Fechar reveal e referencia visual em operacao
  Notas: A mesa agora consome o pacote de preparo da sessao, inclusive reveals planejados e proximas cenas, e ja consegue disparar `reveals` direto do cockpit ao vivo. Ainda falta integrar consulta visual mais profunda e disparo mais guiado por cena.

- [ ] M5. Fechar trilha, estado de ficha e suporte de mesa
  Notas:

- [ ] M6. Reduzir troca de contexto durante sessao real
  Notas:

---

## Frente M1 - Cockpit da sessao

Contexto tecnico:
Hoje a base ja existe, mas precisa consolidacao como cockpit do mestre.

- [ ] M1.1 Definir layout final da sessao ao vivo
  Notas:

- [-] M1.2 Definir paines principais e secundarios
  Notas: O sidebar da mesa agora combina combate, historico e pacote de preparo da sessao; `RPG-33` extraiu esse bloco para `live-prep-cockpit`, `RPG-35` fez o mesmo com historico/chat em `live-history-chat-stack`, `RPG-36` tirou o centro tatico para `live-war-room`, `RPG-37` agrupou a sidebar operacional inteira em `live-operations-sidebar` e `RPG-38` limpou helpers mortos e tipagem local do `play`, zerando o lint do arquivo.

- [-] M1.3 Definir estados de foco narrativo versus foco tatico
  Notas: O pacote de preparo puxa briefing, objetivo e proximas cenas para o modo ao vivo, e agora ja sustenta `cena em foco`, que contextualiza o que aparece no cockpit. Ainda falta uma alternancia mais formal entre narracao e tatica.

- [-] M1.4 Integrar mapa, timeline e consulta rapida sem poluicao
  Notas: `RPG-36` extraiu o bloco central de mapa/war room para `live-war-room`, isolando `InteractiveMap`, monitor de esquadra e bandeja de dados em um componente proprio.

- [ ] M1.5 Garantir leitura clara em monitor de mesa
  Notas:

### Criterios de aceite da Frente M1
- a tela da sessao parece central de operacao;
- o mestre entende onde agir em cada momento;
- o cockpit sustenta sessao longa sem caos visual.

---

## Frente M2 - Consulta rapida em mesa

Contexto tecnico:
Consultar informacao sem travar a narracao e requisito central.

- [x] M2.1 Integrar quick inspect de entidade a sessao
  Notas: O sidebar da mesa ja abre quick inspect para entidades do mundo sem sair do cockpit.

- [x] M2.2 Permitir acesso rapido a relacoes e imagens
  Notas: O drawer ja mostra imagem principal, relacoes e memoria recente da entidade.

- [-] M2.3 Permitir consulta por busca rapida
  Notas: A mesa agora aceita busca curta por nome/tipo/subtipo e prioriza entidades em foco da sessao; `RPG-34` extraiu esse fluxo para `live-codex-inspect`, reduzindo o acoplamento do `play` e preparando a busca para aprofundamento posterior.

- [x] M2.4 Garantir abertura sem perder combate/mapa
  Notas: O quick inspect abre em drawer lateral sem desmontar mapa, combate ou historico.

- [ ] M2.5 Definir atalhos de uso frequente
  Notas: `RPG-41` sincronizou o pacote visual da `cena em foco` com o `quick inspect`, destacando no cockpit quando uma entidade visual da cena ja esta em consulta e permitindo abrir esse inspect direto dos cards de retrato/lugar.

### Criterios de aceite da Frente M2
- o mestre consegue descobrir "quem e quem" em segundos;
- a consulta nao obriga trocar de pagina inteira;
- o fluxo real de mesa fica mais leve do que hoje.

---

## Frente M3 - Combate operacional

Contexto tecnico:
O app ja possui fundacao de combate, mas a experiencia precisa se alinhar ao produto final.

- [ ] M3.1 Revisar encaixe do combat tracker no cockpit
  Notas: `RPG-31` acrescentou `Sinais ao vivo` dentro do cockpit da mesa, lendo round, HP medio, contagem viva e quedas a partir do combate ativo sem abrir superficie paralela.

- [ ] M3.2 Garantir transicao clara entre narracao e combate
  Notas: O pacote narrativo e o pacote tatico agora convivem lado a lado no mesmo sidebar; ainda falta refino estrutural do arquivo `play`, mas o fluxo ja comeca a alternar entre cena em foco, encontro preparado e pressao ao vivo. `RPG-45` acrescentou `Ritmo da cena` na superficie publica, conectando pressao ao vivo com a exposicao de reveals e assets para jogadores.

- [ ] M3.3 Integrar consulta de entidades ao combate
  Notas:

- [ ] M3.4 Melhorar acoes rapidas do mestre
  Notas: `RPG-32` acrescentou `Ajuste rapido` no proprio cockpit da mesa, com opcoes curtas para aliviar, segurar ou escalar a tensao a partir do estado real do combate.

- [ ] M3.5 Garantir que o combate nao monopolize a tela inteira sem necessidade
  Notas:

- [ ] M3.6 Garantir leitura de ficha viva para PCs e NPCs durante a mesa
  Notas:

### Criterios de aceite da Frente M3
- combate e parte do cockpit, nao uma experiencia apartada;
- a mesa continua navegavel durante combate;
- o mestre consegue operar sem abrir muitas superfices paralelas.

---

## Frente M4 - Reveal e referencia visual

Contexto tecnico:
Mostrar imagem e parte concreta da mesa descrita pelo produto.

- [ ] M4.1 Integrar reveals a partir da biblioteca visual
  Notas:

- [ ] M4.2 Permitir disparar visual a partir de entidade ou cena
  Notas: O cockpit ao vivo ja dispara `reveals` preparados a partir do pacote da sessao, e a `cena em foco` agora contextualiza quais reveals aparecem primeiro. `RPG-39` aprofundou isso separando `reveal principal da cena`, `reveals secundarios` e `reveals gerais da sessao`, e `RPG-40` passou a sugerir referencias visuais de entidades em foco da cena, com retratos e lugares ligados ao contexto atual.

- [ ] M4.3 Definir fluxo rapido para mostrar referencia sem friccao
  Notas: `reveals` prontos agora aparecem no sidebar da mesa e podem ser enviados sem sair do cockpit. `RPG-41` aproximou isso do fluxo de consulta, sincronizando cards visuais da cena com o `quick inspect`.

- [ ] M4.4 Garantir consistencia com TV/segunda tela
  Notas: `RPG-42` passou a marcar `pronto para segunda tela` nos reveals e assets visuais da cena, e o cockpit agora consegue exibir retratos/lugares direto para os jogadores usando o mesmo fluxo de `roomCode` dos reveals.

- [ ] M4.5 Evitar que reveal dependa de fluxo improvisado
  Notas: `RPG-43` separou explicitamente no cockpit o que e `Para jogadores` e o que e `Apenas mestre`, agrupando reveals e assets prontos para TV/segunda tela em uma superficie publica e mantendo objetivo, encontro, pressao e ajuste rapido no bloco privado do mestre. `RPG-44` acrescentou o estado `Na tela agora`, para o mestre saber qual asset ou reveal ja esta efetivamente em exibicao para os jogadores. `RPG-46` acrescentou `Proxima exposicao sugerida`, reduzindo improviso na progressao visual da cena, `RPG-47` evoluiu isso para uma fila curta com `Proxima` e `Depois`, e `RPG-48` tornou essa fila sensivel ao contexto da cena, priorizando melhor `reveal`, `lugar` e `rosto` conforme o momento narrativo.

### Criterios de aceite da Frente M4
- mostrar referencias na mesa e rapido;
- o reveal usa a estrutura do mundo e da biblioteca;
- o fluxo visual da mesa fica mais forte.

---

## Frente M5 - Trilha, ficha e suporte de mesa

Contexto tecnico:
Operar a mesa nao e so combate e reveal; envolve trilha, estado de ficha e apoio rapido ao mestre.

- [ ] M5.1 Definir superficie para trilha e playlist da sessao
  Notas:

- [ ] M5.2 Integrar o estado operacional de PCs e NPCs
  Notas:

- [ ] M5.3 Permitir ficha rapida e acesso a NPCs improvisados
  Notas:

- [ ] M5.4 Garantir que rolagem, ficha e consulta convivam sem caos
  Notas:

- [ ] M5.5 Garantir que o mestre nao precise sair do app para controlar a sessao
  Notas:

### Criterios de aceite da Frente M5
- trilha, ficha e operacao rapida participam da mesa;
- o mestre consegue acompanhar o estado vivo da sessao;
- NPCs importantes e improvisados ficam acessiveis durante o jogo.

---

## Frente M6 - Reducao de troca de contexto

Contexto tecnico:
Essa frente mede o sucesso operacional da mesa.

- [ ] M6.1 Revisar pontos onde o mestre ainda precisa sair da tela principal
  Notas:

- [ ] M6.2 Consolidar acessos rapidos mais frequentes
  Notas: `RPG-33` consolidou o pacote de preparo em um componente proprio, `RPG-34` fez o mesmo com o quick inspect e `RPG-35` isolou o historico/chat. O cockpit agora esta mais modular sem mudar o fluxo do mestre.

- [ ] M6.3 Reduzir rotas e modais desnecessarios durante sessao
  Notas: `RPG-43` reduziu a ambiguidade dentro do proprio cockpit ao vivo, sem criar nova rota ou modal, deixando claro o que e superficie publica para jogadores e o que continua privado para consulta operacional do mestre.

- [ ] M6.4 Validar o fluxo com cenarios completos de mesa
  Notas:

- [ ] M6.5 Fechar o criterio de "mesa inteira em um fluxo principal"
  Notas:

### Criterios de aceite da Frente M6
- a quantidade de trocas de contexto cai visivelmente;
- o mestre sente que o app aguenta o uso real;
- a sessao flui melhor do que no estado atual.

---

## Definition of Done da frente inteira

Esta frente so termina quando:
- a sessao ao vivo tem cockpit forte;
- consulta rapida, combate e reveal convivem bem;
- a operacao da mesa exige menos ferramentas externas;
- o app sustenta sessao real com menos friccao.

---

## Criterio de merge final da frente

- cockpit da mesa funcional;
- consulta rapida integrada;
- reveal e combate consistentes;
- testes e validacoes basicas concluidos;
- docs atualizados;
- branch apagada apos merge.
