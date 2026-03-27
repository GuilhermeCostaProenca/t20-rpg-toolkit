# Trial Jarvez + Mundo do Zero - Runbook

Data base: 2026-03-27  
Issue Linear: RPG-246

## 1) Objetivo do trial

Validar duas coisas em fluxo real:
1. Se o Jarvez consegue operar de ponta a ponta nas tarefas esperadas.
2. Se o fluxo de criar um mundo do zero (seu mundo antigo) esta bom de verdade para uso real.

Saida esperada: backlog acionavel de melhorias para ajustar agora, antes de continuar frentes novas.

## 2) Contexto da rodada

- Responsavel pela execucao:
- Data/hora inicio:
- Data/hora fim:
- Ambiente (local/docker):
- Branch/commit:
- Campanha/mundo de teste:

## 3) Smoke test do Jarvez

Status geral:
- [ ] APROVADO
- [ ] APROVADO COM RESSALVAS
- [ ] REPROVADO

### 3.1 Conexao e disponibilidade

- [ ] Conecta sem erro.
- [ ] Responde dentro de tempo aceitavel.
- [ ] Nao cai durante a sessao.

Observacoes:

### 3.2 Operacoes minimas esperadas

- [ ] Criar entidade.
- [ ] Editar entidade.
- [ ] Consultar entidade/contexto.
- [ ] Recuperar informacao do mundo ativo.
- [ ] Executar acao de apoio em sessao/mesa (quando aplicavel).

Observacoes por operacao:

### 3.3 Qualidade de resultado do Jarvez

- [ ] Resposta correta semanticamente.
- [ ] Nao inventa dado critico.
- [ ] Mantem contexto entre passos.
- [ ] Ajuda mais do que atrapalha no fluxo real.

Observacoes:

## 4) Criacao do mundo do zero (mundo antigo)

Status geral:
- [ ] APROVADO
- [ ] APROVADO COM RESSALVAS
- [ ] REPROVADO

### 4.1 Fluxo de onboarding de mundo

- [ ] Criacao inicial clara.
- [ ] Proximo passo apos criar mundo e obvio.
- [ ] Sem friccao estrutural de navegação.

Observacoes:

### 4.2 Modelagem do mundo

- [ ] Entidades principais cabem no modelo atual.
- [ ] Relacoes/familias/linhagens funcionam no seu caso real.
- [ ] Politica/cronologia/lore comportam seu mundo antigo.

Observacoes:

### 4.3 Operacao de prep

- [ ] Consegue preparar sessao sem workaround pesado.
- [ ] Consegue manter contexto vivo durante montagem.
- [ ] Bibliotecas visuais ajudam, nao travam.

Observacoes:

### 4.4 Operacao de mesa

- [ ] Fluxo ao vivo ficou fluido.
- [ ] Consulta rapida ajudou.
- [ ] Handoff combate->narrativo ficou consistente.

Observacoes:

## 5) Diario de friccoes (preencher durante uso)

| ID | Area | Passo | O que incomodou | Impacto (1-5) | Frequencia | Severidade | Sugestao objetiva |
|---|---|---|---|---:|---|---|---|
| F-01 |  |  |  |  |  |  |  |
| F-02 |  |  |  |  |  |  |  |
| F-03 |  |  |  |  |  |  |  |

Legenda de severidade:
- `S1` bloqueador
- `S2` alto impacto
- `S3` medio
- `S4` baixo

## 6) Conversao de gaps em backlog executavel

| Gap ID | Tipo (`bug`/`ux`/`domain`/`perf`/`ai`) | Decisao | Issue Linear | Frente sugerida | Prioridade |
|---|---|---|---|---|---|
| F-01 |  |  |  |  |  |
| F-02 |  |  |  |  |  |
| F-03 |  |  |  |  |  |

## 7) Priorizacao imediata (antes de continuar roadmap)

Top 5 correcoes para atacar agora:
1.
2.
3.
4.
5.

## 8) Decisao final da rodada

- [ ] Prosseguir roadmap normal
- [ ] Pausar roadmap e corrigir gaps criticos primeiro

Justificativa:

## 9) Encerramento operacional

1. Atualizar `ai/tasks.md` com os gaps priorizados.
2. Abrir/atualizar issues no Linear para cada item do Top 5.
3. Atualizar `docs/00-strategy/attack-index.md` se houver mudanca de prioridade entre frentes.
