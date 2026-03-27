# Mesa ao Vivo - A7-R3 Run Sheet de Campo

Data base: 2026-03-27  
Issue Linear: RPG-241

## 1) Identificacao da rodada de teste

- Data da sessao real:
- Inicio:
- Fim:
- Mestre:
- Campanha:
- Sessao em foco:
- Versao/commit em uso:

## 2) Cenarios obrigatorios

### Cenario A - Ficha viva no QuickSheet

Passos:
1. Abrir ficha por `SquadMonitor`.
2. Abrir ficha por `CombatTracker`.
3. Alterar PV/PM/SAN no cockpit.
4. Confirmar reflexo no `QuickSheet`.
5. Confirmar DEF/SAN corretos no `OrdemSheet`.

Checklist:
- [ ] Reflexo de PV sem atraso operacional relevante.
- [ ] Reflexo de PM sem atraso operacional relevante.
- [ ] Reflexo de SAN sem atraso operacional relevante.
- [ ] DEF correta no `OrdemSheet`.
- [ ] Sem necessidade de refresh manual.

Observacoes:
- Tempo medio de reflexo:
- Friccoes:

### Cenario B - Handoff pos-combate

Passos:
1. Iniciar combate.
2. Jogar ao menos 2 rounds.
3. Encerrar combate no tracker.
4. Verificar preset narrativo automatico.

Checklist:
- [ ] `tableFocusMode = narrative`.
- [ ] `showCodex = true`.
- [ ] `showSupport = true`.
- [ ] `showHistoryChat = true`.
- [ ] `publicLayerLocked = false`.

Observacoes:
- Friccoes:
- Comportamento inesperado:

### Cenario C - Persistencia local

Passos:
1. Encerrar combate.
2. Recarregar pagina.
3. Confirmar estado narrativo persistido.

Checklist:
- [ ] Foco narrativo persistido.
- [ ] Paineis coerentes apos reload.
- [ ] Sem retorno involuntario a estado tatico.

Observacoes:
- Friccoes:

## 3) Evidencias

- Screenshot(s):
- Clip(s):
- Log/stack (se houve erro):

## 4) Resultado final da validacao

Status final:
- [ ] APROVADO
- [ ] APROVADO COM RESSALVAS
- [ ] REPROVADO

Resumo executivo:

Follow-ups:
- [ ] Nao ha follow-up
- [ ] Abrir issue(s) de follow-up (listar IDs):

## 5) Encerramento no fluxo

1. Atualizar `docs/99-reports/live-table-a7-r3-field-validation-2026-03-27.md` com resultado consolidado.
2. Comentar resultado na issue `RPG-232`.
3. Se `APROVADO`, preparar fechamento executivo de A7 no `attack-index`.
