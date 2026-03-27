# Estado Atual

## Funcionalidades Prontas
- Base world-first consolidada com `World`, `Campaign`, `Session`, `WorldEvent`, `Npc` e `Character`.
- Shell/cockpit com layout unificado, quick inspect e linguagem visual premium em primeira passada.
- Codex do Mundo com workspace de entidade, relacoes, galeria e fluxo world-scoped.
- Grafo Narrativo e Biblioteca Visual em operacao world-scoped com quick inspect e integracoes.
- Forja do Mundo com oficinas de genealogia, politica, cronologia e lore-base.
- Forja de Sessao com cenas/subcenas, beats, reveals e encontro preparado persistido.
- Mesa ao Vivo com cockpit operacional, combate integrado, consulta rapida, reveal/segunda tela e suporte de mesa.
- QuickSheet da Mesa ao Vivo agora acompanha estado vivo de ficha por polling e exibe DEF/SAN corretamente no `OrdemSheet`.
- Encerramento de combate agora executa handoff narrativo completo (foco, paineis, historico e camada publica).
- Busca transversal de memoria ganhou endpoint world-scoped e primeira integracao no painel de campanha.
- Busca transversal de memoria agora tambem opera no cockpit do mundo quando ha consulta textual (2+ caracteres).
- Busca transversal agora ordena por relevancia textual e exibe score no resultado/inspect de campanha e mundo.
- Memoria do Mundo com consolidacao de sessao e sincronizacao para `WorldEvent`.
- Balanceamento T20 com heuristica de risco e recomendacoes no fluxo de sessao/mesa.

## Em Andamento
- A1 a A9 no `attack-index` estao em `[-]` (nenhuma frente foi marcada como encerrada de ponta a ponta ainda).
- Mesa ao Vivo esta funcional e madura; handoff pos-combate e leitura de ficha foram reforcados, restando validacao real de mesa.
- Shell ainda pede validacao visual automatizada em browser real (bloqueio reportado por sessao de Chrome no ambiente).

## Pendencias
- Regularizar encerramento formal das frentes no `attack-index` com base em criterios de aceite (hoje todas seguem em andamento).
- Validar em mesa real o novo fluxo pos-combate e a leitura de ficha ao vivo (A7).
- Consolidar fechamento documental de A8 no indice executivo e reduzir lacunas de derivacao temporal (A8).
- Fechar refinamento estrutural do loop ao vivo no Balanceamento T20 (A9).

## Problemas Conhecidos
- Divergencia de caminhos de docs em alguns arquivos legados (ex.: referencias antigas sem `00-strategy` / `01-fronts`).
- Estado de planos muito extenso em texto corrido; dificulta leitura rapida de bloqueios por frente.
- Risco operacional de branch longa: parte do historico recente de Mesa ao Vivo aponta necessidade de regularizacao de merge final.

## Proximos Passos Imediatos
1. Executar validacao de mesa real para A7 usando checklist formal em `docs/99-reports/live-table-a7-r3-field-validation-2026-03-27.md`.
2. Executar A8-R4: consolidar fechamento de A8 em `attack-index` e relatorio de readiness.
3. Executar ciclo de regularizacao Git por frente (PR, squash merge, delete branch, retorno a `master`).

## Riscos Atuais
- Branch discipline incompleta entre frentes pode gerar codigo funcional fora da linha principal - impacto: alto, mitigacao: encerrar por PR curta e merge sistematico.
- Divergencia entre docs e estado real do produto pode causar decisao errada de priorizacao - impacto: medio, mitigacao: atualizar `attack-index` e `ai/current_state.md` a cada recorte.
- Refinamentos finais da Mesa ao Vivo sem validacao real de mesa podem mascarar friccao de uso - impacto: medio, mitigacao: repetir checklist de prontidao em sessao real e registrar no `session_log`.
