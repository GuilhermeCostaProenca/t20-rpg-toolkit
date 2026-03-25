# Auditoria de Checklists - 2026-03-24

## Escopo

- Reorganizacao da pasta `docs` em subpastas por finalidade.
- Verificacao de consistencia dos checklists (`[x]`, `[-]`, `[ ]`).
- Verificacao de evidencias no codigo para itens ja marcados como feitos.

## Resultado objetivo

- Nao foi encontrado nenhum item `[x]` com `Notas:` vazio.
- Foi encontrada evidencia de implementacao para os principais itens ja declarados como entregues (rotas, APIs e componentes existem no repo).
- Itens que tinham evidencia de entrega parcial, mas ainda estavam como `[ ]`, foram atualizados para `[-]` (em andamento) em frentes de Mesa/Forja de Sessao.

## Estrutura nova de docs

- `docs/00-strategy/`
- `docs/01-fronts/`
- `docs/02-support/`
- `docs/99-reports/`

## Matriz de status por arquivo

- `docs/00-strategy/attack-index.md`: `X:0 | -:9 | P:0`
- `docs/01-fronts/shell-cockpit-plan.md`: `X:24 | -:6 | P:1`
- `docs/01-fronts/codex-do-mundo-plan.md`: `X:36 | -:12 | P:0`
- `docs/01-fronts/grafo-narrativo-plan.md`: `X:20 | -:9 | P:2`
- `docs/01-fronts/biblioteca-visual-plan.md`: `X:17 | -:9 | P:6`
- `docs/01-fronts/forja-do-mundo-plan.md`: `X:9 | -:27 | P:13`
- `docs/01-fronts/forja-de-sessao-plan.md`: `X:11 | -:13 | P:6`
- `docs/01-fronts/mesa-ao-vivo-plan.md`: `X:3 | -:20 | P:14`
- `docs/01-fronts/memoria-do-mundo-plan.md`: `X:12 | -:21 | P:4`
- `docs/01-fronts/balanceamento-t20-plan.md`: `X:0 | -:26 | P:4`
- `docs/02-support/front-cleanup-zero-plan.md`: `X:5 | -:1 | P:0`
- `docs/02-support/reference-harvest-plan.md`: `X:0 | -:0 | P:5`

## Evidencias de implementacao checadas

- Rotas de frente existem:
  - `src/app/app/worlds/[id]/codex/page.tsx`
  - `src/app/app/worlds/[id]/graph/page.tsx`
  - `src/app/app/worlds/[id]/visual-library/page.tsx`
  - `src/app/app/worlds/[id]/forge/page.tsx`
  - `src/app/app/worlds/[id]/forge/genealogy/page.tsx`
  - `src/app/app/worlds/[id]/forge/politics/page.tsx`
  - `src/app/app/worlds/[id]/forge/timeline/page.tsx`
  - `src/app/app/worlds/[id]/forge/lore/page.tsx`
  - `src/app/app/campaign/[id]/forge/[sessionId]/page.tsx`
  - `src/app/app/play/[campaignId]/page.tsx`

- APIs centrais do Codex/Grafo existem:
  - `src/app/api/worlds/[id]/codex/route.ts`
  - `src/app/api/worlds/[id]/entities/route.ts`
  - `src/app/api/worlds/[id]/entities/[entityId]/route.ts`
  - `src/app/api/worlds/[id]/entities/[entityId]/images/route.ts`
  - `src/app/api/worlds/[id]/relationships/route.ts`
  - `src/app/api/worlds/[id]/graph/route.ts`

- Componentes citados nas notas de Mesa ao Vivo existem:
  - `src/components/play/live-prep-cockpit.tsx`
  - `src/components/play/live-codex-inspect.tsx`
  - `src/components/play/live-history-chat-stack.tsx`
  - `src/components/play/live-war-room.tsx`
  - `src/components/play/live-operations-sidebar.tsx`

- Camadas de suporte citadas nos planos existem:
  - `src/lib/t20-balance.ts`
  - `src/lib/visual-library.ts`
  - `src/lib/session-memory.ts`

## Observacao de confianca

Esta auditoria valida consistencia documental + evidencia estrutural no codigo. Ela nao substitui validacao funcional completa em runtime (UX e comportamento final de ponta a ponta).
