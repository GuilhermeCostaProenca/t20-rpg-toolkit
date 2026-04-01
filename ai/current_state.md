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
- Busca transversal agora tambem retorna derivacao temporal agregada (7d/30d/90d/>90d + buckets mensais) e exibe esse pulso no cockpit de campanha e mundo.
- Estado executivo de A8 foi formalmente encerrado no `attack-index` com report de fechamento dedicado (`RPG-238`).
- Memoria do Mundo com consolidacao de sessao e sincronizacao para `WorldEvent`.
- Balanceamento T20 com heuristica de risco e recomendacoes no fluxo de sessao/mesa.
- Balanceamento ao vivo agora considera desgaste de PM/SAN no `livePressure` e exibe esses sinais no cockpit da mesa.
- Estrutura do loop ao vivo no `LivePrepCockpit` foi refatorada com cards reutilizaveis para `Sinais ao vivo` e `Ajuste rapido`, eliminando duplicacao entre modos tatico/narrativo sem alterar comportamento.
- `Ajuste rapido` agora diferencia cenarios de estresse de recurso (PM/SAN) com acoes especificas de respiro/gestao e cobertura de testes unitarios dedicada.
- `Ajuste rapido` agora tambem prioriza recuperacao/estabilizacao quando ha personagem caido em campo, inclusive em pressao `rising`.
- `Ajuste rapido` agora evita recomendar escalada livre em estado `stable` quando o encontro preparado ja e `deadly/punitivo`, mantendo postura conservadora.
- A9 agora possui report de closure readiness com criterios objetivos de go/no-go para encerramento executivo.
- Motor de pressao/ajuste ao vivo em A9 agora usa limiares nomeados (sem numeros magicos centrais), facilitando calibracao apos validacao de campo.
- Documentacao de governanca (`AGENTS.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`) alinhada para caminhos canonicos `docs/00-strategy/*` e `docs/01-fronts/*` sem referencias legadas mapeadas.
- Validacao A7-R3 agora possui run sheet operacional de campo com criterio final explicito (aprovado/ressalvas/reprovado).
- Trial Jarvez + criacao de mundo do zero agora possui runbook dedicado para captura de friccoes e conversao direta em backlog.
- Benchmark de referencia para upgrade da landing foi consolidado em `docs/99-reports/landing-vvd-reference-benchmark-2026-03-27.md`.
- Diagnostico funcional completo do `vvd.world` foi consolidado como benchmark estrategico em `docs/99-reports/vvd-world-product-diagnosis-benchmark-2026-03-30.md`, com implicacoes mapeadas por frente.
- Landing publica foi reestruturada em secoes modulares premium com Framer Motion (hero video, toolkit com tabs auto-play, trilho de generos, missao por scroll, showcase e CTA final).
- QA visual da landing foi executado em browser real (desktop/mobile) com ajuste fino de legibilidade na secao de missao; `RPG-248` fechado em `Done`.
- Blueprint consolidado de redesign para Figma foi publicado em `docs/99-reports/t20-os-figma-design-blueprint-2026-03-31.md` com IA alvo, modos Normal/Lousa/Quadro, fluxos canonicos e ordem de construcao de telas.
- Shell interno ganhou camada premium imersiva no front operacional (`A1-LP4`), com backdrop cinematografico em video (fallback gradiente), profundidade 3D leve por parallax e ajustes globais de atmosfera sem mexer na landing publica.
- Primeiro corte de refatoracao Figma-guided no app interno (`A1-LP5-R1`) entrou em codigo: sidebar por secoes `MUNDO/MESA/APOIO`, tabs de modo `Normal/Lousa/Quadro` no cockpit e novas rotas canonicas world-scoped (`visual`, `memory`, `lousa`, `quadro`) sem retirar funcionalidades ja existentes.

## Em Andamento
- A8 foi encerrada no `attack-index`; A1-A7 e A9 seguem em `[-]`.
- Mesa ao Vivo esta funcional e madura; handoff pos-combate e leitura de ficha foram reforcados, restando validacao real de mesa.
- Shell ainda pede validacao visual automatizada em browser real (bloqueio reportado por sessao de Chrome no ambiente).
- A7-R3 agora possui pacote operacional de execucao de campo em `docs/99-reports/live-table-a7-r3-field-execution-packet-2026-03-30.md`, pendente de rodada real com mestre.

## Pendencias
- Regularizar encerramento formal progressivo das frentes restantes no `attack-index` com base em criterios de aceite.
- Validar em mesa real o novo fluxo pos-combate e a leitura de ficha ao vivo (A7).
- Fechar recortes finais de refinamento estrutural do loop ao vivo no Balanceamento T20 (A9).
- Executar validacao de campo de mesa para fechar A9 com base no readiness report.
- Executar trial Jarvez + mundo do zero e priorizar correcoes antes de abrir novos recortes de expansao.
- Executar rodada real de A7-R3 usando o pacote de campo e consolidar resultado final em report + Linear.
- Traduzir o benchmark funcional completo do `vvd.world` em backlog acionavel para A1/A2/A3 sem romper a ordem oficial do attack index.
- Materializar o blueprint consolidado em prototipo navegavel no Figma (Fase A + B) para servir de contrato visual antes dos proximos recortes de implementacao.

## Problemas Conhecidos
- Restam varreduras pontuais para garantir que referencias legadas de docs nao reaparecam em novos recortes.
- Estado de planos muito extenso em texto corrido; dificulta leitura rapida de bloqueios por frente.
- Risco operacional de branch longa: parte do historico recente de Mesa ao Vivo aponta necessidade de regularizacao de merge final.

## Proximos Passos Imediatos
1. Executar validacao de mesa real para A7 usando checklist formal em `docs/99-reports/live-table-a7-r3-field-validation-2026-03-27.md`.
2. Executar varredura final de docs para evitar reintroducao de referencias legadas de caminhos.
3. Consolidar fechamento progressivo de A9 apos `RPG-236`, priorizando validacao de usabilidade em mesa real.
4. Consolidar os proximos recortes de refinamento visual dentro da frente A1 com base no feedback real de uso.
5. Derivar recorte `A1-LP3` a partir do benchmark funcional `vvd.world`, com foco em continuidade de cockpit e modelagem de tipos/relacoes.
6. Executar `A1-BP1`: prototipo Figma navegavel com shell, entrada global, biblioteca de mundos e cockpit do mundo como base canonica.
7. Derivar `A1-LP5`: aplicar a mesma linguagem premium imersiva nos modulos Forja/Codex/Grafo/Visual/Campanhas/Memoria com componentes reutilizaveis e estados de carregamento/erro padronizados.
8. Executar `A1-LP5-R2` com foco em consolidar consistencia visual entre modulos internos sem simplificar fluxos funcionais ja maduros do produto.

## Riscos Atuais
- Branch discipline incompleta entre frentes pode gerar codigo funcional fora da linha principal - impacto: alto, mitigacao: encerrar por PR curta e merge sistematico.
- Divergencia entre docs e estado real do produto pode causar decisao errada de priorizacao - impacto: medio, mitigacao: atualizar `attack-index` e `ai/current_state.md` a cada recorte.
- Refinamentos finais da Mesa ao Vivo sem validacao real de mesa podem mascarar friccao de uso - impacto: medio, mitigacao: repetir checklist de prontidao em sessao real e registrar no `session_log`.
