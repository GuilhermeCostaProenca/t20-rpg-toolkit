# Mesa ao Vivo - A7-R3 Pacote de Execucao de Campo

Data: 2026-03-30  
Issue Linear: RPG-232  
Status: PRONTO PARA EXECUCAO EM MESA REAL

## Objetivo

Fechar a validacao de campo A7-R3 com criterio objetivo para aprovar ou reprovar o fluxo da Mesa ao Vivo apos os recortes de handoff e ficha viva.

Escopo validado:
- ficha viva no `QuickSheet` (`PV`, `PM`, `SAN`, `DEF`);
- handoff pos-combate para preset narrativo;
- persistencia local coerente apos reload.

## Pre-condicoes obrigatorias

1. Rodar build/ambiente da branch com os recortes A7-R1 e A7-R2 incluidos.
2. Ter uma campanha ativa com sessao utilizavel para combate curto (2+ rounds).
3. Usar uma mesa real com operacao normal do mestre (sem modo de teste sintetico).

## Sequencia operacional (tempo estimado: 15-25 min)

1. Abrir o run sheet: `docs/99-reports/live-table-a7-r3-run-sheet-2026-03-27.md`.
2. Executar cenario A (ficha viva) e preencher checklist + observacoes.
3. Executar cenario B (handoff pos-combate) e preencher checklist + observacoes.
4. Executar cenario C (persistencia local) e preencher checklist + observacoes.
5. Marcar status final (`APROVADO`, `APROVADO COM RESSALVAS`, `REPROVADO`).

## Criterio objetivo de aprovacao

Para `APROVADO`:
- todos os checkboxes dos cenarios A/B/C marcados;
- sem necessidade de refresh manual para refletir estado de ficha;
- sem retorno involuntario ao modo tatico apos encerrar combate e recarregar;
- sem friccao alta reportada pelo mestre durante o fluxo.

Para `APROVADO COM RESSALVAS`:
- fluxo principal funciona, mas ha friccoes menores nao bloqueantes.

Para `REPROVADO`:
- qualquer falha de consistencia de estado que quebre operacao ao vivo.

## Pos-execucao (obrigatorio)

1. Atualizar resultado consolidado em:
   - `docs/99-reports/live-table-a7-r3-field-validation-2026-03-27.md`
2. Comentar resultado na issue `RPG-232` com:
   - status final;
   - friccoes;
   - follow-ups (IDs) se houver.
3. Se `APROVADO`, preparar fechamento executivo de A7 no `docs/00-strategy/attack-index.md`.

## Observacao de governanca

A7-R3 depende de validacao humana em mesa real e nao pode ser fechado apenas por lint/testes locais.
