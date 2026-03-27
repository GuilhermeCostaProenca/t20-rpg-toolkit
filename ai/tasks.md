# Plano de Execucao (Vivo)

## Regras
- Marcar `[x]` somente apos concluir de verdade (codigo + validacao + documentacao).
- Toda tarefa deve ter rastreio (issue/PR/commit quando aplicavel).

## Backlog Ativo
- [ ] [A7] Fechar recorte final de Mesa ao Vivo (validacao de mesa real apos ajustes de handoff/ficha).
- [ ] [A8] Aprofundar derivacao temporal da memoria do mundo apos busca transversal forte.
- [ ] [A9] Refinar loop de balanceamento ao vivo com leitura mais profunda de recursos de ficha.
- [ ] [DOCS] Atualizar referencias de caminho em docs que ainda apontam para estrutura antiga.

## Em Execucao
- [ ] [A7-R3] Validar em mesa real o fluxo pos-combate narrativo com checklist operacional (`docs/99-reports/live-table-a7-r3-field-validation-2026-03-27.md`).
- [ ] [A8-R5] Preparar PR e merge do recorte de busca transversal para `master`.
- [ ] [DOCS] Sincronizar status executivo entre `ai/current_state.md` e `docs/00-strategy/attack-index.md` nos proximos recortes.

## Concluidas
- [x] Inicializar estrutura de memoria externa em `ai/`.
- [x] Preencher `ai/*` com contexto real baseado em README, arquitetura, planos e relatorios de 2026-03-25.
- [x] [A7-R1] Sincronizar QuickSheet com estado vivo da ficha (polling) e corrigir leitura de DEF/SAN no `OrdemSheet`.
- [x] [A7-R2] Aplicar handoff automatico de fim de combate para modo narrativo (focus, paineis, historico e camada publica).
- [x] [A8-R1] Entregar endpoint world-scoped de busca transversal de memoria e integrar primeira consulta na estacao de campanha.
- [x] [A8-R2] Expandir busca transversal para o cockpit do mundo com filtros equivalentes e fallback local.
- [x] [A8-R3] Ordenar busca transversal por relevancia e expor score no resultado/inspect (campanha + mundo).
- [x] [A8-R4] Consolidar estado executivo em `attack-index` e relatorio de merge readiness.

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
