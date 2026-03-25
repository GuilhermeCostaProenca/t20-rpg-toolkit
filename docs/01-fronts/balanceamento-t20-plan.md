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

- [-] T1. Definir a base de calculo de encontro T20
  Notas: `RPG-25` abriu uma base heuristica inicial em `src/lib/t20-balance.ts`, usando nivel do grupo e estatisticas minimas das ameacas (`hpMax`, `defenseFinal`, `damageFormula`).

- [-] T2. Definir leitura de poder do grupo
  Notas: O slice inicial usa nivel medio, quantidade de personagens e peso leve por funcao para evitar leitura puramente cega.

- [-] T3. Criar superficie de analise de dificuldade
  Notas: `RPG-25` abriu o primeiro painel de leitura na estacao da campanha, com classificacao, confianca, score de grupo, score de pressao e fatores explicitos.

- [-] T4. Criar apoio para preparo de encontro
  Notas: `RPG-26` abriu o primeiro slice operacional dentro da estacao da campanha, com selecao de ameacas hostis, composicao de encontro preparada, releitura dedicada do risco e sugestao de ajuste. `RPG-27` passou a persistir essa composicao na sessao e a liga-la opcionalmente a uma cena da Forja.

- [-] T5. Criar apoio para ajuste durante a mesa
  Notas: `RPG-28` abriu o primeiro slice ao vivo, levando o encontro preparado da sessao para o cockpit de `/app/play/[campaignId]` com risco, confianca, composicao e recomendacao.

---

## Frente T1 - Base de calculo

Contexto tecnico:
Sem fundacao clara, a frente vira sugestao vaga.

- [-] T1.1 Definir modelo de entrada do grupo
  Notas: O modelo inicial usa `level`, `role` e `className` dos personagens da campanha.

- [-] T1.2 Definir modelo de entrada das ameacas
  Notas: O modelo inicial usa apenas NPCs do tipo `enemy` e considera `hpMax`, `defenseFinal` e `damageFormula`.

- [-] T1.3 Definir calculo de dificuldade e risco
  Notas: O primeiro recorte usa `partyScore`, `threatScore` e `pressureRatio`, mapeando para `trivial`, `manageable`, `risky` e `deadly`.

- [x] T1.4 Definir como lidar com composicoes nao triviais
  Notas: `codex/t20-balance-t1-4` introduziu heuristicas para composicoes de enxame, elite, mista e boss solo no motor de risco (`src/lib/t20-balance.ts`), com impacto em fatores, confianca e recomendacao.

- [-] T1.5 Definir limites e mensagens de confianca
  Notas: O painel ja expõe confianca `alta`, `media` ou `baixa` e fatores de incerteza quando faltam dados do grupo ou das ameacas.

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

- [ ] T2.2 Integrar dados disponiveis de personagens e sheets
  Notas:

- [-] T2.3 Expor leitura resumida do grupo
  Notas: A campanha agora exibe nivel medio do grupo e `partyScore` no painel de balanceamento.

- [-] T2.4 Definir como o app lida com dados incompletos
  Notas: O helper reduz a confianca e expõe fatores quando faltam `role`, `hpMax`, `defenseFinal` ou `damageFormula`.

- [ ] T2.5 Garantir que a leitura nao seja caixa-preta
  Notas:

### Criterios de aceite da Frente T2
- o app consegue avaliar grupo com utilidade real;
- o mestre entende a base da recomendacao;
- dados incompletos nao quebram o fluxo.

---

## Frente T3 - Superficie de analise

Contexto tecnico:
O mestre precisa ler rapidamente se o encontro esta facil, medio, dificil ou perigoso.

- [-] T3.1 Criar tela ou painel de analise de encontro
  Notas: `RPG-25` abriu o primeiro painel dentro da estacao da campanha, sem abrir uma frente isolada ainda.

- [-] T3.2 Exibir dificuldade resumida e risco
  Notas: O painel exibe classificacao de risco e `pressureRatio`.

- [-] T3.3 Exibir fatores que empurram o risco para cima ou para baixo
  Notas: O painel ja lista fatores como quantidade de personagens, nivel medio, ameacas hostis e dados ausentes.

- [-] T3.4 Exibir sinais de incerteza quando houver dados fracos
  Notas: A confianca e os fatores deixam explicito quando a leitura esta fraca.

- [-] T3.5 Garantir leitura rapida em preparacao
  Notas: O primeiro painel foi colocado na estacao da campanha para funcionar durante o preparo sem sair do cockpit.

### Criterios de aceite da Frente T3
- a analise e rapida de entender;
- o mestre consegue tomar decisao sem planilha externa;
- o sistema nao entrega so um numero sem contexto.

---

## Frente T4 - Apoio ao preparo

Contexto tecnico:
Balanceamento precisa ajudar antes da sessao, nao so diagnosticar.

- [-] T4.1 Integrar analise a preparacao de encontro
  Notas: `RPG-26` integrou a heuristica diretamente ao fluxo da campanha, sem abrir tela paralela, usando os NPCs hostis como base do rascunho de encontro.

- [-] T4.2 Sugerir ajuste de composicao ou intensidade
  Notas: O helper agora gera sugestao simples de ajuste com base na leitura do encontro preparado e das ameacas disponiveis.

- [-] T4.3 Integrar a ameacas e entidades relevantes
  Notas: O recorte usa NPCs `enemy` ja cadastrados na campanha como fonte de composicao do encontro e calcula o risco sobre eles.

- [-] T4.4 Permitir salvar composicoes de encontro
  Notas: `RPG-27` salva o encontro preparado em `Session.metadata.forge.encounters`, preservando composicao, leitura de risco, confianca e recomendacao.

- [-] T4.5 Permitir associar encontro a sessao ou cena
  Notas: `RPG-27` ja associa o encontro a uma sessao alvo e, quando desejado, a uma cena existente da Forja. Falta aprofundar a edicao e manutencao desse vinculo.

### Criterios de aceite da Frente T4
- o mestre consegue montar encontro com mais seguranca;
- a preparacao fica integrada ao resto do produto;
- a frente gera valor concreto antes da sessao.

---

## Frente T5 - Apoio durante a mesa

Contexto tecnico:
O mestre tambem precisa ajuste em tempo real.

- [-] T5.1 Definir o que pode ser lido durante combate
  Notas: `RPG-28` ja expoe o encontro preparado em foco com rating, confianca, composicao e recomendacao curta no cockpit ao vivo. `RPG-31` acrescentou leitura do combate ativo com round, HP medio do grupo/hostis, contagem viva, quedas e resumo de pressao.

- [-] T5.2 Definir alertas ou heuristicas de desbalanceamento ao vivo
  Notas: `RPG-31` abriu o primeiro sinal ao vivo com estados `Sob controle`, `Pressao subindo` e `Critico`, baseado em HP medio, vantagem numerica e personagens caidos.

- [-] T5.3 Criar ferramentas de ajuste rapido
  Notas: `RPG-32` abriu um primeiro bloco de `Ajuste rapido` no cockpit ao vivo, derivado de `livePressure` + encontro preparado, com sugestoes curtas de aliviar, segurar ou escalar a tensao sem automatizar a mesa.

- [-] T5.4 Integrar com a mesa ao vivo sem poluicao visual
  Notas: `RPG-28` integrou a leitura do encontro ao pacote de preparo da mesa sem abrir nova superficie. `RPG-31` consolidou isso com o combate ativo no mesmo card stack do cockpit, sem abrir painel paralelo.

- [-] T5.5 Garantir que a sugestao seja util sem sequestrar a narracao
  Notas: `RPG-31` mantem recomendacao curta e discreta, com no maximo dois fatores de pressao visiveis por vez.

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
