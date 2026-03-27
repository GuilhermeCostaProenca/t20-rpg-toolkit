# Mesa ao Vivo - A7-R3 Validacao de Mesa Real

Data: 2026-03-27  
Issue Linear: RPG-232  
Branch: `codex/a7-live-end-combat-sheet-flow`

## Objetivo

Validar em uso real de mesa se os ajustes recentes de A7 reduziram friccao no fluxo ao vivo:

- leitura de ficha viva no `QuickSheet` (PV/PM/SAN/DEF);
- transicao pos-combate para modo narrativo sem estado tatico residual.

## Escopo validado

1. Ficha viva (QuickSheet)
- abrir ficha por `SquadMonitor` e por `CombatTracker`;
- alterar PV/PM/SAN no cockpit e confirmar reflexo no `QuickSheet`;
- confirmar DEF e SAN corretos no `OrdemSheet` sem reabrir pagina.

2. Handoff pos-combate
- iniciar combate;
- operar pelo menos 2 rounds;
- encerrar combate no `CombatTracker`;
- confirmar retorno automatico para preset narrativo:
  - `tableFocusMode = narrative`
  - `showCodex = true`
  - `showSupport = true`
  - `showHistoryChat = true`
  - `publicLayerLocked = false`

3. Persistencia local
- recarregar pagina apos encerrar combate;
- confirmar que preferencias narrativas persistidas continuam coerentes.

## Resultado da rodada

Status: `PENDENTE` (aguardando execucao em mesa real)

Run sheet operacional: `docs/99-reports/live-table-a7-r3-run-sheet-2026-03-27.md`

## Evidencias a registrar ao executar

- horario de inicio/fim da validacao;
- campanha usada e sessao em foco;
- qualquer friccao observada (passo exato + impacto);
- screenshot/clip quando houver falha visual ou de estado;
- decisao final:
  - `APROVADO` (A7 pode fechar)
  - `APROVADO COM RESSALVAS` (abrir follow-up)
  - `REPROVADO` (abrir correcao imediata)

## Proximo passo

Executar este checklist em sessao real e registrar resultado final aqui + no comentario da issue `RPG-232`.
