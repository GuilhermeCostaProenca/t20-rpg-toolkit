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

- [ ] T1. Definir a base de calculo de encontro T20
  Notas:

- [ ] T2. Definir leitura de poder do grupo
  Notas:

- [ ] T3. Criar superficie de analise de dificuldade
  Notas:

- [ ] T4. Criar apoio para preparo de encontro
  Notas:

- [ ] T5. Criar apoio para ajuste durante a mesa
  Notas:

---

## Frente T1 - Base de calculo

Contexto tecnico:
Sem fundacao clara, a frente vira sugestao vaga.

- [ ] T1.1 Definir modelo de entrada do grupo
  Notas:

- [ ] T1.2 Definir modelo de entrada das ameacas
  Notas:

- [ ] T1.3 Definir calculo de dificuldade e risco
  Notas:

- [ ] T1.4 Definir como lidar com composicoes nao triviais
  Notas:

- [ ] T1.5 Definir limites e mensagens de confianca
  Notas:

### Criterios de aceite da Frente T1
- a base de calculo e previsivel;
- entradas e saidas sao claras;
- o mestre entende o que o sistema esta dizendo e o que nao esta.

---

## Frente T2 - Leitura do grupo

Contexto tecnico:
Nivel puro nem sempre representa a forca real da mesa.

- [ ] T2.1 Definir o que o sistema considera na leitura do grupo
  Notas:

- [ ] T2.2 Integrar dados disponiveis de personagens e sheets
  Notas:

- [ ] T2.3 Expor leitura resumida do grupo
  Notas:

- [ ] T2.4 Definir como o app lida com dados incompletos
  Notas:

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

- [ ] T3.1 Criar tela ou painel de analise de encontro
  Notas:

- [ ] T3.2 Exibir dificuldade resumida e risco
  Notas:

- [ ] T3.3 Exibir fatores que empurram o risco para cima ou para baixo
  Notas:

- [ ] T3.4 Exibir sinais de incerteza quando houver dados fracos
  Notas:

- [ ] T3.5 Garantir leitura rapida em preparacao
  Notas:

### Criterios de aceite da Frente T3
- a analise e rapida de entender;
- o mestre consegue tomar decisao sem planilha externa;
- o sistema nao entrega so um numero sem contexto.

---

## Frente T4 - Apoio ao preparo

Contexto tecnico:
Balanceamento precisa ajudar antes da sessao, nao so diagnosticar.

- [ ] T4.1 Integrar analise a preparacao de encontro
  Notas:

- [ ] T4.2 Sugerir ajuste de composicao ou intensidade
  Notas:

- [ ] T4.3 Integrar a ameacas e entidades relevantes
  Notas:

- [ ] T4.4 Permitir salvar composicoes de encontro
  Notas:

- [ ] T4.5 Permitir associar encontro a sessao ou cena
  Notas:

### Criterios de aceite da Frente T4
- o mestre consegue montar encontro com mais seguranca;
- a preparacao fica integrada ao resto do produto;
- a frente gera valor concreto antes da sessao.

---

## Frente T5 - Apoio durante a mesa

Contexto tecnico:
O mestre tambem precisa ajuste em tempo real.

- [ ] T5.1 Definir o que pode ser lido durante combate
  Notas:

- [ ] T5.2 Definir alertas ou heuristicas de desbalanceamento ao vivo
  Notas:

- [ ] T5.3 Criar ferramentas de ajuste rapido
  Notas:

- [ ] T5.4 Integrar com a mesa ao vivo sem poluicao visual
  Notas:

- [ ] T5.5 Garantir que a sugestao seja util sem sequestrar a narracao
  Notas:

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
