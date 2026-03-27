# Estado Atual

## Funcionalidades Prontas
- Base world-first consolidada com `World`, `Campaign`, `Session`, `WorldEvent`, `Npc` e `Character`.
- Shell/cockpit com layout unificado, quick inspect e linguagem visual premium em primeira passada.
- Codex do Mundo com workspace de entidade, relacoes, galeria e fluxo world-scoped.
- Grafo Narrativo e Biblioteca Visual em operacao world-scoped com quick inspect e integracoes.
- Forja do Mundo com oficinas de genealogia, politica, cronologia e lore-base.
- Forja de Sessao com cenas/subcenas, beats, reveals e encontro preparado persistido.
- Mesa ao Vivo com cockpit operacional, combate integrado, consulta rapida, reveal/segunda tela e suporte de mesa.
- Memoria do Mundo com consolidacao de sessao e sincronizacao para `WorldEvent`.
- Balanceamento T20 com heuristica de risco e recomendacoes no fluxo de sessao/mesa.

## Em Andamento
- A1 a A9 no `attack-index` estao em `[-]` (nenhuma frente foi marcada como encerrada de ponta a ponta ainda).
- Mesa ao Vivo esta funcional e madura, mas com pendencias de refinamento operacional em combate/sheets.
- Shell ainda pede validacao visual automatizada em browser real (bloqueio reportado por sessao de Chrome no ambiente).

## Pendencias
- Regularizar encerramento formal das frentes no `attack-index` com base em criterios de aceite (hoje todas seguem em andamento).
- Refinar fluxo de fim de combate e leitura de fichas completas de PCs ao vivo (A7).
- Aprofundar busca transversal e derivacao temporal na Memoria do Mundo (A8).
- Fechar refinamento estrutural do loop ao vivo no Balanceamento T20 (A9).

## Problemas Conhecidos
- Divergencia de caminhos de docs em alguns arquivos legados (ex.: referencias antigas sem `00-strategy` / `01-fronts`).
- Estado de planos muito extenso em texto corrido; dificulta leitura rapida de bloqueios por frente.
- Risco operacional de branch longa: parte do historico recente de Mesa ao Vivo aponta necessidade de regularizacao de merge final.

## Proximos Passos Imediatos
1. Priorizar recorte curto para pendencias finais de A7 (fim de combate + leitura de sheets em mesa real).
2. Fechar recorte de busca transversal de memoria (A8) com criterio de aceite objetivo.
3. Executar ciclo de regularizacao Git por frente (PR, squash merge, delete branch, retorno a `master`).

## Riscos Atuais
- Branch discipline incompleta entre frentes pode gerar codigo funcional fora da linha principal - impacto: alto, mitigacao: encerrar por PR curta e merge sistematico.
- Divergencia entre docs e estado real do produto pode causar decisao errada de priorizacao - impacto: medio, mitigacao: atualizar `attack-index` e `ai/current_state.md` a cada recorte.
- Refinamentos finais da Mesa ao Vivo sem validacao real de mesa podem mascarar friccao de uso - impacto: medio, mitigacao: repetir checklist de prontidao em sessao real e registrar no `session_log`.
