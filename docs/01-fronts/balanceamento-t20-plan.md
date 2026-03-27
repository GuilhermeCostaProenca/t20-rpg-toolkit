# T20 RPG Toolkit - Balanceamento T20 Plan

## Como usar
- Marque `[x]` quando concluido
- Use `[-]` para em andamento
- Use `[ ]` para pendente
- Atualize a linha `Notas:` com contexto curto, branch, PR ou decisao

---

## Objetivo

Dar ao mestre ferramentas confiaveis para preparar, revisar e ajustar o nivel de desafio em Tormenta 20.

Esta frente existe para atacar um problema real ja explicitado no produto:
- grupo forte demais versus inimigos fracos;
- grupo fragil versus encontro punitivo;
- falta de leitura rapida do risco;
- montagem de sessao e combate sem apoio suficiente.

O objetivo nao e substituir a criatividade do mestre.
E dar instrumentos praticos para calibrar encontros com mais seguranca.

---

## Workflow obrigatorio desta frente

### Branches recomendadas
- `codex/t20-balance-engine`
- `codex/t20-balance-ui`
- `codex/t20-balance-live-adjustments`

### Commit pattern recomendado
- `feat(t20): add encounter balance foundation`
- `feat(t20): add difficulty and party risk analysis`
- `feat(t20): add live encounter adjustment helpers`

### Merge policy
- PR por capacidade fechada;
- merge em `master` via `squash merge`;
- branch apagada apos merge;
- nada de regra ou calculadora importante ficando fora da `master`.

---

## Dependencias

Esta frente depende de:
- `codex-do-mundo-plan.md`
- `mesa-ao-vivo-plan.md`

Pode iniciar modelagem antes, mas a experiencia final depende dessas frentes.

---

## Checklist Mestre

- [x] T1. Definir a base de calculo de encontro T20
  Notas: Consolidado em `master` com base heuristica + composicoes nao triviais + limites de confianca (RPG-25, RPG-61, RPG-62).

- [x] T2. Definir leitura de poder do grupo
  Notas: Consolidado em `master` com perfil por eixos, prontidao de ficha, resumo curto, tratamento de lacunas e breakdown explicito (RPG-61, RPG-62, RPG-63).

- [x] T3. Criar superficie de analise de dificuldade
  Notas: Consolidado em `master` com painel de risco, fatores, sinais de incerteza e leitura rapida em preparo (`RPG-25`, `RPG-61`, `RPG-62`, `RPG-63`).

- [x] T4. Criar apoio para preparo de encontro
  Notas: Consolidado em `master` com composicao, leitura dedicada, sugestao, persistencia e manutencao do vinculo sessao/cena (RPG-26, RPG-27, RPG-66).

- [x] T5. Criar apoio para ajuste durante a mesa
  Notas: Consolidado em `master` com leitura do encontro preparado + sinais ao vivo de pressao + ajuste rapido discreto no cockpit (`RPG-28`, `RPG-31`, `RPG-32`).

---

## Frente T1 - Base de calculo

Contexto tecnico:
Sem fundacao clara, a frente vira sugestao vaga.

- [x] T1.1 Definir modelo de entrada do grupo
  Notas: Modelo de entrada estabilizado com `level`, `role`, `className` e leitura opcional de ficha (`pv/pm`) no motor.

- [x] T1.2 Definir modelo de entrada das ameacas
  Notas: Modelo de ameacas estabilizado via NPC `enemy` com `hpMax`, `defenseFinal` e `damageFormula`.

- [x] T1.3 Definir calculo de dificuldade e risco
  Notas: Calculo consolidado em `master` com `partyScore`, `threatScore`, `pressureRatio`, recomendacao e fatores explicitos.

- [x] T1.4 Definir como lidar com composicoes nao triviais
  Notas: `codex/t20-balance-t1-4` introduziu heuristicas para composicoes de enxame, elite, mista e boss solo no motor de risco (`src/lib/t20-balance.ts`), com impacto em fatores, confianca e recomendacao.

- [x] T1.5 Definir limites e mensagens de confianca
  Notas: `RPG-62` (`codex/rpg-62-t20-balance-t1-5`) adicionou `confidenceScore` (0-100) e `uncertaintySignals` estruturados com impacto e acao recomendada, refletidos no painel da campanha.

### Criterios de aceite da Frente T1
- a base de calculo e previsivel;
- entradas e saidas sao claras;
- o mestre entende o que o sistema esta dizendo e o que nao esta.

---

## Frente T2 - Leitura do grupo

Contexto tecnico:
Nivel puro nem sempre representa a forca real da mesa.

- [x] T2.1 Definir o que o sistema considera na leitura do grupo
  Notas: `codex/t20-balance-t2-1` definiu leitura explicita por eixos (frente, suporte, ofensiva, controle, desconhecido), com bonus de diversidade, fatores explicativos e reflexo direto no `partyScore`.

- [x] T2.2 Integrar dados disponiveis de personagens e sheets
  Notas: `codex/t20-balance-t2-2` integrou leitura de `CharacterSheet` (PV/PM atuais e maximos) no `partyScore`, com fator explicito de prontidao de ficha e degradacao de confianca quando a cobertura de sheet e insuficiente.

- [x] T2.3 Expor leitura resumida do grupo
  Notas: `RPG-63` (`codex/rpg-63-t20-balance-t2-3-t2-4`) adicionou `partySummary` no snapshot e exibicao direta no card de grupo no painel da campanha.

- [x] T2.4 Definir como o app lida com dados incompletos
  Notas: `RPG-63` adicionou `dataGaps` estruturado (roles, fichas e ameacas incompletas + severidade) e callout explicito no painel, mantendo fluxo funcional com dados parciais.

- [x] T2.5 Garantir que a leitura nao seja caixa-preta
  Notas: `RPG-61` (`codex/rpg-61-t20-balance-t2-5`) adicionou `breakdown` explicito no snapshot (base, papeis, diversidade, prontidao, composicao e razao base/efetiva) e exibiu essa conta no painel de balanceamento da campanha.

### Criterios de aceite da Frente T2
- o app consegue avaliar grupo com utilidade real;
- o mestre entende a base da recomendacao;
- dados incompletos nao quebram o fluxo.

---

## Frente T3 - Superficie de analise

Contexto tecnico:
O mestre precisa ler rapidamente se o encontro esta facil, medio, dificil ou perigoso.

- [x] T3.1 Criar tela ou painel de analise de encontro
  Notas: Painel de analise de encontro consolidado na estacao da campanha e evoluido nos slices seguintes.

- [x] T3.2 Exibir dificuldade resumida e risco
  Notas: Painel exibe rating, confianca, pressure ratio e recomendacao curta.

- [x] T3.3 Exibir fatores que empurram o risco para cima ou para baixo
  Notas: Fatores e breakdown numerico estao visiveis no painel para leitura de causa.

- [x] T3.4 Exibir sinais de incerteza quando houver dados fracos
  Notas: `confidenceScore`, `uncertaintySignals` e `dataGaps` estruturados estao expostos no painel.

- [x] T3.5 Garantir leitura rapida em preparacao
  Notas: Leitura permanece no cockpit da campanha com cards de resumo e callouts acionaveis.

### Criterios de aceite da Frente T3
- a analise e rapida de entender;
- o mestre consegue tomar decisao sem planilha externa;
- o sistema nao entrega so um numero sem contexto.

---

## Frente T4 - Apoio ao preparo

Contexto tecnico:
Balanceamento precisa ajudar antes da sessao, nao so diagnosticar.

- [x] T4.1 Integrar analise a preparacao de encontro
  Notas: `RPG-26` integrou a heuristica diretamente ao fluxo da campanha, sem abrir tela paralela, usando os NPCs hostis como base do rascunho de encontro.

- [x] T4.2 Sugerir ajuste de composicao ou intensidade
  Notas: O helper gera sugestao operacional de ajuste com base na leitura do encontro preparado e das ameacas disponiveis.

- [x] T4.3 Integrar a ameacas e entidades relevantes
  Notas: O recorte usa NPCs `enemy` cadastrados na campanha como fonte de composicao e calcula risco sobre eles.

- [x] T4.4 Permitir salvar composicoes de encontro
  Notas: `RPG-27` salva o encontro preparado em `Session.metadata.forge.encounters`, preservando composicao, leitura de risco, confianca e recomendacao.

- [x] T4.5 Permitir associar encontro a sessao ou cena
  Notas: `RPG-27` abriu a associacao inicial e `RPG-66` adicionou manutencao operacional no cockpit da campanha (relink de cena, desvinculo e remocao de encontro salvo).

### Criterios de aceite da Frente T4
- o mestre consegue montar encontro com mais seguranca;
- a preparacao fica integrada ao resto do produto;
- a frente gera valor concreto antes da sessao.

---

## Frente T5 - Apoio durante a mesa

Contexto tecnico:
O mestre tambem precisa ajuste em tempo real.

- [x] T5.1 Definir o que pode ser lido durante combate
  Notas: `RPG-28` ja expoe o encontro preparado em foco com rating, confianca, composicao e recomendacao curta no cockpit ao vivo. `RPG-31` acrescentou leitura do combate ativo com round, HP medio do grupo/hostis, contagem viva, quedas e resumo de pressao. `RPG-235` aprofundou o recorte ao incorporar PM/SAN medio e contagem de recursos baixos na leitura ao vivo.

- [x] T5.2 Definir alertas ou heuristicas de desbalanceamento ao vivo
  Notas: `RPG-31` abriu o primeiro sinal ao vivo com estados `Sob controle`, `Pressao subindo` e `Critico`, baseado em HP medio, vantagem numerica e personagens caidos. `RPG-235` passou a somar desgaste de PM/SAN nesses estados para reduzir falso conforto quando o grupo ainda tem HP, mas ja esta sem recurso.

- [x] T5.3 Criar ferramentas de ajuste rapido
  Notas: `RPG-32` abriu um primeiro bloco de `Ajuste rapido` no cockpit ao vivo, derivado de `livePressure` + encontro preparado, com sugestoes curtas de aliviar, segurar ou escalar a tensao sem automatizar a mesa. `RPG-235` refinou esse ajuste para reagir tambem a estresse de PM/SAN.

- [x] T5.4 Integrar com a mesa ao vivo sem poluicao visual
  Notas: `RPG-28` integrou a leitura do encontro ao pacote de preparo da mesa sem abrir nova superficie. `RPG-31` consolidou isso com o combate ativo no mesmo card stack do cockpit, sem abrir painel paralelo.

- [x] T5.5 Garantir que a sugestao seja util sem sequestrar a narracao
  Notas: `RPG-31` e `RPG-32` mantem recomendacao curta e discreta, com no maximo dois fatores de pressao visiveis por vez no cockpit.

### Criterios de aceite da Frente T5
- o mestre consegue reagir a encontro quebrado;
- o apoio ao vivo e rapido e discreto;
- a mesa continua sob controle do mestre.

---

## Definition of Done da frente inteira

Esta frente so termina quando:
- o toolkit ajuda a montar encontros melhores;
- o mestre entende o risco de um encontro;
- o app oferece apoio antes e durante a mesa;
- o balanceamento T20 deixa de ser um chute manual na maior parte dos casos.

---

## Criterio de merge final da frente

- base de calculo estavel;
- superficie de analise funcional;
- apoio ao preparo e ao vivo entregues;
- docs atualizados;
- branch apagada apos merge.
