# Overlay vs Full-Route Decision Model

## Objetivo

Padronizar quando usar `overlay`, `detail sheet`, `painel persistente`, `workspace` ou `rota completa` no produto.

Este modelo reduz troca de contexto e evita que cada frente invente sua propria regra.

---

## Regra principal

1. Se a tarefa precisa preservar leitura do contexto atual e terminar em menos de 60-90 segundos, use `overlay` (`sheet`/drawer/dialog curto).
2. Se a tarefa exige edicao densa, multiplas secoes, ou ciclo de trabalho continuo, use `workspace` na rota atual.
3. Se a tarefa muda o contexto de dominio (ex.: sair de campanha para mundo; entrar em mesa ao vivo), use `rota completa`.

---

## Matriz decisoria

| Situacao | Superficie preferida | Por que |
| --- | --- | --- |
| Consulta rapida de entidade, relacao, imagem, condicao | Detail sheet / drawer lateral | Mantem o cockpit vivo sem quebrar o fluxo |
| Acao pontual com confirmacao curta (excluir, aplicar, disparar) | Dialog curto | Interacao transacional com risco controlado |
| Operacao recorrente dentro do mesmo contexto (mesa, forja, grafos) | Painel persistente no workspace | Menos abre/fecha, mais continuidade |
| Edicao longa com campos extensos e dependencias | Workspace dedicado (route-level dentro do modulo) | Melhor hierarquia, validacao e navegacao interna |
| Mudanca de modulo/escopo (mundo -> campanha; campanha -> mesa) | Rota completa | Troca real de contexto de dominio |

---

## Regras de corte (gates)

- Nao usar rota completa para consulta que pode caber em `sheet`.
- Nao usar overlay para formulario longo com scroll extenso e varios passos.
- Se o usuario precisa comparar lista + detalhe em paralelo, priorizar painel persistente.
- Se a acao impacta operacao ao vivo (mesa/combate), manter tudo no cockpit sempre que possivel.

---

## Exemplos no repo

- `CockpitDetailSheet` para quick inspect:
  - `src/components/cockpit/cockpit-detail-sheet.tsx`
- Grafo narrativo com inspect sem sair da superficie:
  - `src/app/app/worlds/[id]/graph/page.tsx`
- Mesa ao vivo com paineis operacionais persistentes:
  - `src/app/app/play/[campaignId]/page.tsx`
  - `src/components/play/live-operations-sidebar.tsx`

---

## Checklist rapido para PR

- A tarefa exigia troca de contexto de dominio? Se sim, rota completa.
- A tarefa e consulta/acao curta contextual? Se sim, overlay.
- A tarefa e loop de trabalho continuo do mestre? Se sim, painel persistente/workspace.
- A solucao reduz ou aumenta troca de contexto em sessao real?

