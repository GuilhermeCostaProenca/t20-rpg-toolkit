# Plano de Execucao (Vivo)

## Regras
- Marcar `[x]` somente apos concluir de verdade (codigo + validacao + documentacao).
- Toda tarefa deve ter rastreio (issue/PR/commit quando aplicavel).

## Backlog Ativo
- [ ] [A7] Fechar recorte final de Mesa ao Vivo (validacao de mesa real apos ajustes de handoff/ficha).
- [ ] [A9] Refinar loop de balanceamento ao vivo com leitura mais profunda de recursos de ficha.
- [ ] [TRIAL] Executar trial Jarvez + criacao de mundo do zero e converter gaps em backlog priorizado.

## Em Execucao
- [ ] [A7-R3] Validar em mesa real o fluxo pos-combate narrativo com checklist operacional (`docs/99-reports/live-table-a7-r3-field-validation-2026-03-27.md`).
- [ ] [DOCS] Sincronizar status executivo entre `ai/current_state.md` e `docs/00-strategy/attack-index.md` nos proximos recortes.
- [ ] [A1-LP3] Traduzir benchmark funcional completo do `vvd.world` em backlog priorizado de UX world-first para shell/codex/grafo sem quebrar ordem oficial das frentes.

## Concluidas
- [x] Inicializar estrutura de memoria externa em `ai/`.
- [x] Preencher `ai/*` com contexto real baseado em README, arquitetura, planos e relatorios de 2026-03-25.
- [x] [A7-R1] Sincronizar QuickSheet com estado vivo da ficha (polling) e corrigir leitura de DEF/SAN no `OrdemSheet`.
- [x] [A7-R2] Aplicar handoff automatico de fim de combate para modo narrativo (focus, paineis, historico e camada publica).
- [x] [A8-R1] Entregar endpoint world-scoped de busca transversal de memoria e integrar primeira consulta na estacao de campanha.
- [x] [A8-R2] Expandir busca transversal para o cockpit do mundo com filtros equivalentes e fallback local.
- [x] [A8-R3] Ordenar busca transversal por relevancia e expor score no resultado/inspect (campanha + mundo).
- [x] [A8-R4] Consolidar estado executivo em `attack-index` e relatorio de merge readiness.
- [x] [A8-R5] Preparar PR e merge do recorte de busca transversal para `master`.
- [x] [A8-R6] Aprofundar derivacao temporal da busca transversal com agregacao server-side e leitura no cockpit de mundo/campanha (`RPG-234`).
- [x] [A8-R7] Fechar PR/merge do recorte temporal (`RPG-234`) e refletir status final em `attack-index`.
- [x] [A9-R1] Aprofundar leitura ao vivo de recursos de ficha (PM/SAN) no `livePressure` e no bloco `Sinais ao vivo` (`RPG-235`).
- [x] [A9-R2] Refatorar estrutura do loop ao vivo removendo duplicacao entre blocos tatico e narrativo (`RPG-236`).
- [x] [A9-R3] Qualificar `Ajuste rapido` com acoes orientadas a estresse de PM/SAN e testes dedicados (`RPG-239`).
- [x] [A9-R4] Priorizar recuperacao de personagem caido no `Ajuste rapido` com testes dedicados (`RPG-242`).
- [x] [A9-R5] Evitar escalada sugerida em estado `stable` quando encontro preparado ja e punitivo (`RPG-243`).
- [x] [A9-R6] Consolidar readiness executivo de fechamento com criterios objetivos de saida (`RPG-244`).
- [x] [A9-R7] Extrair limiares de pressao/recursos para constantes calibraveis no motor ao vivo (`RPG-245`).
- [x] [DOCS-R1] Sanear referencias legadas de planos/indice para estrutura `00-strategy/01-fronts` (`RPG-237`).
- [x] [A8-R8] Consolidar fechamento executivo da frente Memoria do Mundo no `attack-index` com report de readiness (`RPG-238`).
- [x] [DOCS-R2] Executar varredura final de referencias legadas e alinhar docs ativos para caminhos canonicos (`RPG-240`).
- [x] [A7-R4] Preparar run sheet operacional para execucao de campo da validacao A7-R3 (`RPG-241`).
- [x] [TRIAL-R1] Preparar runbook de validacao Jarvez + world-from-zero com saida orientada a backlog (`RPG-246`).
- [x] [DOCS-R3] Consolidar benchmark de referencia da landing premium (estrutura, design system e interacoes) em `docs/99-reports/landing-vvd-reference-benchmark-2026-03-27.md` para guiar A1-LP1.
- [x] [DOCS-R4] Consolidar diagnostico funcional completo do `vvd.world` em `docs/99-reports/vvd-world-product-diagnosis-benchmark-2026-03-30.md` e mapear implicacoes por frente (`RPG-250`).
- [x] [A1-LP1] Reestruturar a landing publica (`src/app/(public)/page.tsx`) com secoes premium e interacoes (hero video, tabs auto-play, carrossel, scroll reveal e showcase sticky) (`RPG-248`).
- [x] [A1-LP2] Executar QA visual em browser real (desktop/mobile), ajustar legibilidade da secao de missao e fechar issue `RPG-248` em `Done`.

## Template de Tarefa (copiar e preencher)
### `[ID opcional]` `[Nome da tarefa]`
- Contexto: `[problema/oportunidade]`
- Escopo: `[o que entra e o que nao entra]`
- Criterios de aceitacao:
  - [ ] `[criterio 1]`
  - [ ] `[criterio 2]`
- Definition of Done (DoD):
  - [ ] Implementacao concluida
  - [ ] Testes adicionados/atualizados (ou justificativa)
  - [ ] Verificacao local executada
  - [ ] `ai/current_state.md` atualizado
  - [ ] `ai/architecture.md` atualizado (se aplicavel)
  - [ ] `ai/decisions.md` atualizado (se aplicavel)
  - [ ] `ai/session_log.md` atualizado
  - [ ] Issue/PR/commit vinculados (se aplicavel)
