# Mesa ao Vivo - Merge Readiness

Data: 2026-03-25  
Branch de trabalho: `codex/m3-14-convocar-enemies`

## Estado da frente

- Checklist mestre de `docs/01-fronts/mesa-ao-vivo-plan.md` promovido para concluido (`M1` a `M6` em `[x]`).
- Superficie de mesa consolidada no `play/[campaignId]` com:
  - cockpit seccional e foco narrativo/tatico;
  - combate integrado sem superficie paralela;
  - fluxo visual (reveal, segunda tela, biblioteca visual) dentro do cockpit;
  - suporte operacional (trilha, notas, estado do grupo, checklist de prontidao);
  - atalhos de teclado e presets de operacao.

## Validacoes executadas

- `npx eslint` nos arquivos alterados ao longo dos recortes: sem erros.
- `npm run test:run`: verde no escopo principal (`4 files / 13 tests`).
- Suite de `references/**` removida da validacao principal em `vitest.config.ts`.

## Riscos e observacoes

- Existem alteracoes nao relacionadas no workspace (fora do escopo desta frente):
  - `AGENTS.md`
  - `ARCHITECTURE.md`
  - `CONTRIBUTING.md`
  - `README.md`
  - `docs/00-strategy/attack-index.md`
  - `docs/01-fronts/forja-de-sessao-plan.md`
  - `docs/99-reports/docs-audit-2026-03-24.md` (untracked)
  - `docs/README.md` (untracked)
- Essas alteracoes nao foram revertidas nem incluídas no pacote de Mesa ao Vivo.

## Proximo passo operacional

1. Abrir PR da branch atual para `master`.
2. Revisar diff final garantindo escopo apenas de Mesa ao Vivo + docs de validacao.
3. Fazer squash merge.
4. Apagar branch remota/local e retornar o workspace para `master`.
