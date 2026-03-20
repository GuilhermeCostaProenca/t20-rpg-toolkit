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
  Notas: `RPG-19` abriu o primeiro pacote de preparo dentro de `/app/play/[campaignId]`, puxando a sessao ativa ou proxima sessao da campanha para o cockpit ao vivo com objetivo de mesa, contagem operacional e proximas cenas.

- [ ] M2. Fechar consulta rapida de entidades durante a mesa
  Notas:

- [ ] M3. Integrar combate ao cockpit de forma mais fluida
  Notas:

- [-] M4. Fechar reveal e referencia visual em operacao
  Notas: A mesa agora consome o pacote de preparo da sessao, inclusive reveals planejados e proximas cenas, mas ainda falta integrar consulta visual mais profunda e disparo por cena direto do cockpit.

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
  Notas: O sidebar da mesa agora combina combate, historico e pacote de preparo da sessao; ainda falta consolidar melhor estados narrativos versus taticos.

- [-] M1.3 Definir estados de foco narrativo versus foco tatico
  Notas: O pacote de preparo puxa briefing, objetivo e proximas cenas para o modo ao vivo, mas a alternancia formal entre narracao e tatica ainda nao esta fechada.

- [ ] M1.4 Integrar mapa, timeline e consulta rapida sem poluicao
  Notas:

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

- [ ] M2.1 Integrar quick inspect de entidade a sessao
  Notas:

- [ ] M2.2 Permitir acesso rapido a relacoes e imagens
  Notas:

- [ ] M2.3 Permitir consulta por busca rapida
  Notas:

- [ ] M2.4 Garantir abertura sem perder combate/mapa
  Notas:

- [ ] M2.5 Definir atalhos de uso frequente
  Notas:

### Criterios de aceite da Frente M2
- o mestre consegue descobrir "quem e quem" em segundos;
- a consulta nao obriga trocar de pagina inteira;
- o fluxo real de mesa fica mais leve do que hoje.

---

## Frente M3 - Combate operacional

Contexto tecnico:
O app ja possui fundacao de combate, mas a experiencia precisa se alinhar ao produto final.

- [ ] M3.1 Revisar encaixe do combat tracker no cockpit
  Notas:

- [ ] M3.2 Garantir transicao clara entre narracao e combate
  Notas:

- [ ] M3.3 Integrar consulta de entidades ao combate
  Notas:

- [ ] M3.4 Melhorar acoes rapidas do mestre
  Notas:

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
  Notas:

- [ ] M4.3 Definir fluxo rapido para mostrar referencia sem friccao
  Notas:

- [ ] M4.4 Garantir consistencia com TV/segunda tela
  Notas:

- [ ] M4.5 Evitar que reveal dependa de fluxo improvisado
  Notas:

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
  Notas:

- [ ] M6.3 Reduzir rotas e modais desnecessarios durante sessao
  Notas:

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
