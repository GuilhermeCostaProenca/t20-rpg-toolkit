# Balanceamento T20 - A9 Closure Readiness

Data: 2026-03-27  
Issue Linear: RPG-244

## Contexto

A frente A9 recebeu recortes incrementais recentes de qualidade no loop ao vivo (`RPG-235`, `RPG-236`, `RPG-239`, `RPG-242`, `RPG-243`) e ja possui checklist tecnico T1..T5 marcado como concluido no plano de frente.

## Evidencias de prontidao

1. Base de calculo e leitura de risco em preparo
- Heuristica de encontro, confianca, incerteza e breakdown estabilizados em `src/lib/t20-balance.ts`.
- Superficie de campanha consolidada para leitura de risco e ajuste de composicao.

2. Apoio de mesa ao vivo consolidado
- Leitura de pressao em combate com HP, contagem viva, quedas e recursos (PM/SAN).
- Blocos `Sinais ao vivo` e `Ajuste rapido` integrados no cockpit sem painel paralelo.
- Estrutura do cockpit sem duplicacao entre modos tatico e narrativo.

3. Qualidade recente de recomendacao ao vivo
- Recomendacoes orientadas por estresse de PM/SAN (`RPG-239`).
- Prioridade de recuperacao quando ha personagem caido (`RPG-242`).
- Postura conservadora em `stable` para encontro preparado punitivo (`RPG-243`).

4. Cobertura de validacao
- `npm run lint -- src/lib/t20-balance.ts src/lib/t20-balance.test.ts` passando nos recortes recentes.
- `npm run test:run` com 30 testes passando, incluindo cenarios dedicados de ajuste ao vivo.

## Gaps restantes para fechamento executivo de A9

1. Validacao de campo em mesa real
- Confirmar que as recomendacoes do `Ajuste rapido` se mostram acionaveis sem excesso de interferencia durante uso real.
- Executar junto ao protocolo de validacao de mesa em aberto na frente A7 (`A7-R3`), pois o loop ao vivo e compartilhado.

2. Criterio de encerramento no indice executivo
- Com resultado de campo aprovado, atualizar `attack-index` para refletir encerramento formal de A9.

## Criterio objetivo de saida (go/no-go)

Go para encerramento de A9 quando:
1. Validacao de mesa real registrar `APROVADO` ou `APROVADO COM RESSALVAS` sem bloqueador critico no ajuste ao vivo.
2. Nao houver regressao funcional no fluxo de combate/cockpit apos rodada de validacao.

No-go (manter A9 em andamento) quando:
1. Validacao de campo apontar recomendacao incoerente recorrente em cenarios reais.
2. Houver friccao operacional que force override manual constante do ajuste ao vivo.
