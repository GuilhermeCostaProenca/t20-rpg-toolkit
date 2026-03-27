# Plano de Execucao (Vivo)

## Regras
- Marcar `[x]` somente apos concluir de verdade (codigo + validacao + documentacao).
- Toda tarefa deve ter rastreio (issue/PR/commit quando aplicavel).

## Backlog Ativo
- [ ] [A7] Fechar recorte final de Mesa ao Vivo (handoff de fim de combate e validacao de mesa real).
- [ ] [A8] Implementar busca transversal de memoria por mundo/campanha/entidade com filtros operacionais.
- [ ] [A9] Refinar loop de balanceamento ao vivo com leitura mais profunda de recursos de ficha.
- [ ] [DOCS] Atualizar referencias de caminho em docs que ainda apontam para estrutura antiga.

## Em Execucao
- [ ] [A7-R2] Fechar handoff de fim de combate no cockpit com validacao de uso real.
- [ ] [DOCS] Sincronizar status executivo entre `ai/current_state.md` e `docs/00-strategy/attack-index.md` nos proximos recortes.

## Concluidas
- [x] Inicializar estrutura de memoria externa em `ai/`.
- [x] Preencher `ai/*` com contexto real baseado em README, arquitetura, planos e relatorios de 2026-03-25.
- [x] [A7-R1] Sincronizar QuickSheet com estado vivo da ficha (polling) e corrigir leitura de DEF/SAN no `OrdemSheet`.

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
