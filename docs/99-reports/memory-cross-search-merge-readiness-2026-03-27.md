# Memoria do Mundo - Cross Search Merge Readiness

Data: 2026-03-27  
Issue Linear: RPG-233  
Branch de trabalho: `codex/a7-live-end-combat-sheet-flow`

## Escopo fechado (A8-R1 -> A8-R3)

1. Endpoint de busca transversal world-scoped
- `GET /api/worlds/[id]/memory/search`
- filtros: `q`, `campaignId`, `entityId`, `visibility`, `tone`, `timeWindow`, `limit`
- recorte memory-only via `memorySource=session-closeout`

2. Integracao na estacao de campanha
- busca transversal ativa com `memoryQuery >= 2`
- fallback para filtro local quando busca transversal nao esta ativa
- score de relevancia visivel em card e inspect

3. Integracao no cockpit do mundo
- mesma logica de ativacao/fallback
- mesma leitura de score em card e inspect

4. Ordenacao por relevancia
- score textual por evento no backend
- desempate por recencia
- `meta.scores` retornado pela API para consumo de UI

## Validacoes executadas

- `npx eslint \"src/app/api/worlds/[id]/memory/search/route.ts\" \"src/app/app/campaign/[id]/page.tsx\" \"src/app/app/worlds/[id]/page.tsx\"` -> ok
- `npm run test:run` -> 6 arquivos / 22 testes passando

## Riscos e observacoes

- scoring atual e heuristico (substring/tokens + recencia), nao semantico.
- ainda falta derivacao temporal mais profunda para fechar A8 por completo no attack index.

## Proximo passo recomendado

1. abrir PR do recorte A8 e mergear em `master` com squash.
2. na sequencia, atacar derivacao temporal (A8 follow-up) em issue dedicada.
