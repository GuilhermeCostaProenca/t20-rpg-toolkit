# Decisoes Tecnicas e Arquiteturais

## Template de Decisao (ADR enxuto)
### DEC-`[numero]`: `[titulo]`
- Data: `[YYYY-MM-DD]`
- Status: `[proposta|aceita|substituida|revogada]`
- Contexto: `[problema que motivou]`
- Decisao: `[o que foi decidido]`
- Alternativas consideradas:
  - `[alternativa 1]`
  - `[alternativa 2]`
- Impacto:
  - Positivo: `[beneficio]`
  - Negativo / trade-off: `[custo]`
- Plano de revisao: `[quando revisar ou gatilho]`

## Historico
### DEC-001: Inicializacao da memoria externa do projeto
- Data: 2026-03-27
- Status: aceita
- Contexto: instrucoes do projeto exigem continuidade e rastreabilidade fora do chat.
- Decisao: criar `ai/` com arquivos de contexto, estado, tarefas, arquitetura, decisoes e log de sessao.
- Alternativas consideradas:
  - manter contexto so no historico de conversa;
  - usar apenas issues sem documentacao local.
- Impacto:
  - Positivo: continuidade operacional entre sessoes.
  - Negativo / trade-off: custo de manutencao documental continua.
- Plano de revisao: revisar em 2 semanas para simplificar se houver excesso de overhead.

### DEC-002: Fonte canonica de planos e status executivo
- Data: 2026-03-27
- Status: aceita
- Contexto: os planos estrategicos foram organizados em `docs/00-strategy` e planos de frente em `docs/01-fronts`, mas ha referencias antigas no repositorio.
- Decisao: tratar `docs/00-strategy/attack-index.md` como indice executivo canonico de status e `docs/00-strategy/t20-toolkit-master-plan.md` como direcao macro.
- Alternativas consideradas:
  - inferir status por notas dispersas em cada frente;
  - usar apenas estado do codigo sem documento executivo.
- Impacto:
  - Positivo: priorizacao e rastreabilidade mais objetivas.
  - Negativo / trade-off: exige disciplina para manter o indice sempre atualizado.
- Plano de revisao: revisar na proxima rodada de saneamento de docs.

### DEC-003: Frente ativa imediata para proximos recortes
- Data: 2026-03-27
- Status: aceita
- Contexto: A7 (Mesa ao Vivo) esta madura e funcional, mas `attack-index` ainda marca frente em andamento com pendencias operacionais claras.
- Decisao: priorizar os proximos recortes de engenharia em A7/A8/A9 antes de abrir novas expansoes de superficie.
- Alternativas consideradas:
  - iniciar nova frente visual sem fechar pendencias operacionais;
  - atacar multiplas frentes em paralelo sem fechamento.
- Impacto:
  - Positivo: melhora confiabilidade da experiencia ao vivo e reduz debito estrutural.
  - Negativo / trade-off: pode adiar expansoes de escopo visivel no curto prazo.
- Plano de revisao: apos fechamento do proximo recorte de A7 com validacao de uso real.

### DEC-004: QuickSheet alinhada ao estado vivo da mesa
- Data: 2026-03-27
- Status: aceita
- Contexto: a leitura de ficha no fluxo ao vivo estava parcial (DEF/SAN inconsistentes) e desatualizada entre ajustes operacionais.
- Decisao: sincronizar a `QuickSheet` por polling de `/api/characters?withSheet=true` e corrigir o `OrdemSheet` para usar DEF/SAN reais da ficha.
- Alternativas consideradas:
  - manter fetch unico e exigir reabertura manual da ficha;
  - corrigir apenas UI de SAN sem sincronizacao viva.
- Impacto:
  - Positivo: consulta de ficha mais confiavel durante combate e narracao.
  - Negativo / trade-off: aumento moderado de chamadas periodicas no cliente.
- Plano de revisao: reavaliar cadence de polling apos validacao de mesa real.

### DEC-005: Handoff narrativo automatico ao encerrar combate
- Data: 2026-03-27
- Status: aceita
- Contexto: ao fim do combate, o foco narrativo voltava, mas paineis e camada publica podiam ficar em estado tatico residual.
- Decisao: ao detectar transicao de combate ativo -> inativo, forcar preset narrativo consistente (focus narrative, paineis completos, historico ativo, camada publica destravada) e persistir no `localStorage`.
- Alternativas consideradas:
  - manter apenas troca de foco e depender de ajuste manual do mestre;
  - aplicar reset parcial sem persistencia.
- Impacto:
  - Positivo: reduz friccao na saida de combate e melhora continuidade operacional da mesa.
  - Negativo / trade-off: menor liberdade de manter configuracao tatico-narrativa hibrida apos combate sem novo ajuste manual.
- Plano de revisao: confirmar em mesa real se o reset automatico esta agressivo demais.

### DEC-006: Busca transversal de memoria via endpoint world-scoped dedicado
- Data: 2026-03-27
- Status: aceita
- Contexto: filtros locais da campanha consultavam apenas recorte reduzido (`recentMemoryEvents`) e nao cobriam busca transversal forte de A8.
- Decisao: criar `GET /api/worlds/[id]/memory/search` com filtros operacionais (`q`, `campaignId`, `entityId`, `visibility`, `tone`, `timeWindow`) e integrar primeiro consumo na estacao de campanha.
- Alternativas consideradas:
  - expandir apenas `recentMemoryEvents` em `GET /api/campaigns/[id]`;
  - reutilizar `GET /api/worlds/[id]/events` sem semantica de memoria dedicada.
- Impacto:
  - Positivo: busca de memoria mais profunda sem quebrar contratos existentes de campanha/eventos.
  - Negativo / trade-off: introduz novo endpoint e logica de filtro complementar em servidor.
- Plano de revisao: medir uso real e decidir se consolidar tudo em um unico endpoint de memoria no fechamento de A8.

### DEC-007: Derivacao temporal agregada dentro da busca transversal de memoria
- Data: 2026-03-27
- Status: aceita
- Contexto: a busca transversal entregava lista relevante, mas ainda faltava leitura temporal agregada para apoiar continuidade narrativa no cockpit.
- Decisao: expandir `GET /api/worlds/[id]/memory/search` para retornar `meta.temporal` (7d/30d/90d/>90d, buckets mensais e limites temporais) e consumir esse pulso temporal nas superficies de campanha e mundo quando a busca transversal estiver ativa.
- Alternativas consideradas:
  - derivar agregacao apenas no cliente a partir da lista limitada retornada;
  - criar endpoint paralelo exclusivo de analytics temporal.
- Impacto:
  - Positivo: melhora leitura de continuidade por janela temporal sem criar nova rota de consulta.
  - Negativo / trade-off: aumenta responsabilidade do endpoint de busca e tamanho do `meta` retornado.
- Plano de revisao: validar em uso real se os buckets mensais atuais (top 6) sao suficientes para fechamento de A8.

### DEC-008: Pressao ao vivo orientada por recursos de ficha (PM/SAN)
- Data: 2026-03-27
- Status: aceita
- Contexto: A9 ainda apontava lacuna de leitura profunda de recursos em mesa ao vivo; `livePressure` considerava sobretudo HP/contagem/quedas.
- Decisao: expandir `analyzeLiveCombatPressure` para aceitar snapshot de recursos de party (PM/SAN medio + contagem em faixa baixa), ajustar score/fatores/recomendacao com esses sinais e expor os indicadores no bloco `Sinais ao vivo` do cockpit.
- Alternativas consideradas:
  - manter leitura de recursos apenas no card separado de estado da mesa;
  - criar card novo exclusivo de recursos no cockpit.
- Impacto:
  - Positivo: ajuste rapido fica mais fiel ao desgaste real do grupo sem aumentar troca de contexto.
  - Negativo / trade-off: heuristica de pressao ganha mais variaveis e pode exigir calibracao de thresholds.
- Plano de revisao: validar em mesa real se os limites atuais (30%/50% e maioria em faixa baixa) estao calibrados para nao gerar falso critico.

### DEC-009: Reuso estrutural dos blocos de leitura ao vivo no cockpit
- Data: 2026-03-27
- Status: aceita
- Contexto: o `LivePrepCockpit` mantinha blocos duplicados de `Sinais ao vivo` e `Ajuste rapido` em secoes taticas e narrativas, elevando custo de manutencao e risco de divergencia de UX.
- Decisao: extrair componentes reutilizaveis (`LivePressureCard` e `LiveAdjustmentCard`) e reutilizar a mesma renderizacao nos dois contextos, preservando comportamento e sem alterar heuristica.
- Alternativas consideradas:
  - manter duplicacao com ajustes manuais sincronizados;
  - extrair utilitarios de string sem consolidar a estrutura visual.
- Impacto:
  - Positivo: reduz divergencia entre modos, simplifica manutencao e deixa proximos ajustes de A9 mais seguros.
  - Negativo / trade-off: aumenta abstração local do arquivo, exigindo leitura inicial de dois componentes auxiliares.
- Plano de revisao: revisar no proximo recorte de A9 se ainda existe duplicacao estrutural relevante no cockpit ao vivo.

### DEC-010: Caminhos canonicos de documentacao em `README` e `attack-index`
- Data: 2026-03-27
- Status: aceita
- Contexto: ainda havia referencias legadas para `docs/*.md` sem segmentacao por pasta, gerando links quebrados e ambiguidade sobre fonte canonica.
- Decisao: alinhar referencias de planos/indice para `docs/00-strategy/*` e `docs/01-fronts/*` nos documentos de entrada (`README.md` e `docs/00-strategy/attack-index.md`).
- Alternativas consideradas:
  - manter caminhos antigos e depender de conhecimento implicito da equipe;
  - criar aliases/duplicatas de arquivos para compatibilidade retroativa.
- Impacto:
  - Positivo: reduz friccao de navegacao, evita link quebrado e reforca a estrutura oficial de governanca documental.
  - Negativo / trade-off: exige disciplina para manter novos docs usando os caminhos canonicos.
- Plano de revisao: incluir varredura rapida de referencias legadas no fechamento de cada recorte documental.

### DEC-011: Encerramento executivo formal da frente A8 no `attack-index`
- Data: 2026-03-27
- Status: aceita
- Contexto: a frente Memoria do Mundo ja tinha checklist tecnico completo (`W1..W6` em `[x]`) e entregas operacionais em `master`, mas permanecia sem fechamento executivo no indice mestre.
- Decisao: marcar A8 como concluida (`[x]`) no `docs/00-strategy/attack-index.md`, apoiado por report de fechamento (`docs/99-reports/memory-world-a8-executive-closure-2026-03-27.md`).
- Alternativas consideradas:
  - manter A8 em andamento ate novo recorte funcional;
  - fechar A8 sem report dedicado de evidencias.
- Impacto:
  - Positivo: melhora confiabilidade do status executivo e reduz ambiguidade de priorizacao.
  - Negativo / trade-off: futuras melhorias de memoria passam a entrar como evolucao incremental, nao como pendencia de fechamento da frente.
- Plano de revisao: reavaliar apenas se houver regressao funcional relevante na camada de memoria.

### DEC-012: Ajuste rapido orientado por estresse de PM/SAN
- Data: 2026-03-27
- Status: aceita
- Contexto: apos integrar PM/SAN no `livePressure`, as acoes de `suggestLiveAdjustment` ainda eram genericas e nem sempre refletiam que a pressao vinha de exaustao de recurso.
- Decisao: introduzir leitura explicita de `resourceStressed/resourceCritical` em `suggestLiveAdjustment`, priorizando acoes de respiro e preservacao de recurso quando PM/SAN estiverem baixos.
- Alternativas consideradas:
  - manter recomendacoes genericas e depender da leitura manual de fatores;
  - criar novo card de ajuste exclusivo para recursos.
- Impacto:
  - Positivo: recomendacao tatico-narrativa mais acionavel em mesa ao vivo, sem alterar estrutura da UI.
  - Negativo / trade-off: maior ramificacao textual no helper de ajuste, exigindo testes dedicados para evitar regressao.
- Plano de revisao: reavaliar calibracao de limiares de recurso apos validacao de mesa real de A7/A9.

### DEC-013: Encerrar referencias legadas de paths em docs ativos de governanca
- Data: 2026-03-27
- Status: aceita
- Contexto: mesmo apos saneamento inicial (`RPG-237`), documentos ativos de governanca ainda citavam caminhos antigos (`docs/*.md`) fora do padrao atual.
- Decisao: padronizar `AGENTS.md`, `ARCHITECTURE.md` e `CONTRIBUTING.md` para caminhos canonicos (`docs/00-strategy/*` e `docs/01-fronts/*`) e usar varredura textual como validacao de fechamento.
- Alternativas consideradas:
  - manter caminhos legados por compatibilidade textual;
  - corrigir apenas arquivos de onboarding e ignorar governanca tecnica.
- Impacto:
  - Positivo: reduz ambiguidade de fonte de verdade e previne regressao documental em novos recortes.
  - Negativo / trade-off: exige manter regra de varredura textual nos fechamentos de docs.
- Plano de revisao: repetir varredura de paths legados sempre que novos guias de contribuicao/governanca forem editados.

### DEC-014: Priorizar recuperacao de personagem caido no ajuste ao vivo
- Data: 2026-03-27
- Status: aceita
- Contexto: o `Ajuste rapido` já reagia a estado geral e PM/SAN, mas não enfatizava recuperação quando já havia personagem caído fora de cenários estritamente críticos.
- Decisao: tornar `downedPlayers > 0` um sinal prioritário em `suggestLiveAdjustment`, com ação explícita de estabilização/recuperação antes de nova escalada.
- Alternativas consideradas:
  - manter orientação apenas por estado agregado (`stable/rising/critical`);
  - criar um card separado para quedas de personagem.
- Impacto:
  - Positivo: recomendação mais aderente à urgência real da mesa, reduzindo risco de over-escalation com grupo quebrado.
  - Negativo / trade-off: texto do ajuste fica mais opinativo, exigindo calibragem futura em validação real.
- Plano de revisao: revisar na validação de campo de A7/A9 se os novos textos estão acionáveis sem excesso de intervenção.

### DEC-015: Postura conservadora em estado estavel para encontro preparado punitivo
- Data: 2026-03-27
- Status: aceita
- Contexto: o ramo `stable` de `suggestLiveAdjustment` sugeria escalada por padrao, mesmo quando o encontro preparado ja era `deadly/punitivo`.
- Decisao: quando `preparedRating` for punitivo, trocar a postura de `escalate` para `hold`, com orientacoes de variacao controlada sem aumentar brutalidade.
- Alternativas consideradas:
  - manter escalada padrao e confiar apenas em julgamento manual do mestre;
  - criar novo estado de pressao exclusivo para "estavel mas perigoso".
- Impacto:
  - Positivo: reduz incentivo de over-tuning em encontros ja pesados, mantendo consistencia com seguranca operacional da mesa.
  - Negativo / trade-off: reduz agressividade narrativa sugerida em alguns cenarios estaveis onde o grupo ainda poderia absorver mais pressao.
- Plano de revisao: validar em mesa real se a nova postura ficou conservadora demais para grupos de alta eficiencia.

### DEC-016: Fechamento de A9 condicionado por criterio objetivo de campo
- Data: 2026-03-27
- Status: aceita
- Contexto: A9 acumulou entregas tecnicas e testes, mas faltava um artefato executivo unico definindo exatamente quando encerrar a frente.
- Decisao: consolidar `docs/99-reports/t20-balance-a9-closure-readiness-2026-03-27.md` como gate de saida de A9, com criterio go/no-go atrelado a validacao em mesa real.
- Alternativas consideradas:
  - encerrar A9 apenas por checklist tecnico em codigo;
  - manter A9 indefinidamente em andamento sem criterio final.
- Impacto:
  - Positivo: reduz ambiguidade de encerramento e melhora rastreabilidade executiva.
  - Negativo / trade-off: cria dependencia explicita de rodada de campo para fechamento formal.
- Plano de revisao: reavaliar criterio apos primeira rodada de validacao real registrada.

### DEC-017: Centralizar limiares de pressao/ajuste ao vivo em constantes
- Data: 2026-03-27
- Status: aceita
- Contexto: o motor de pressao ao vivo acumulou evolucoes de regra e ficou com limiares numericos dispersos, dificultando calibracao apos testes de campo.
- Decisao: extrair thresholds relevantes para constantes nomeadas no `src/lib/t20-balance.ts`, preservando comportamento atual.
- Alternativas consideradas:
  - manter valores inline e calibrar por busca textual manual;
  - introduzir configuracao persistida em banco antes da validacao de campo.
- Impacto:
  - Positivo: melhora manutencao, legibilidade e velocidade de ajuste fino.
  - Negativo / trade-off: aumenta superficie de constantes que precisam ser mantidas coerentes entre si.
- Plano de revisao: revisar apenas os valores das constantes apos rodada de validacao real (A7-R3).

### DEC-018: Landing publica modular com linguagem premium e interacoes reais
- Data: 2026-03-27
- Status: aceita
- Contexto: a landing publica estava utilitaria e desconectada do posicionamento premium world-first desejado para o produto.
- Decisao: reconstruir `src/app/(public)/page.tsx` com secoes modulares em `src/components/landing/*` e interacoes guiadas por Framer Motion (hero video, tabs auto-play, carrossel horizontal, reveals por scroll e showcase de fluxo).
- Alternativas consideradas:
  - manter landing utilitaria atual com ajustes cosmeticos pontuais;
  - adotar clone literal de referencia externa sem adaptacao ao dominio T20 OS.
- Impacto:
  - Positivo: primeira impressao mais coerente com o posicionamento de produto premium e melhor narrativa de conversao para `/app`.
  - Negativo / trade-off: aumenta superficie de UI animada, exigindo validacao visual recorrente em browser real.
- Plano de revisao: executar A1-LP2 para ajustar timing/ritmo apos rodada de QA visual desktop/mobile.

### DEC-019: Benchmark funcional do `vvd.world` como referencia estrategica, sem ruptura de prioridade
- Data: 2026-03-30
- Status: aceita
- Contexto: foi recebido um diagnostico funcional completo do `vvd.world`, cobrindo editor, modulos internos, fluxos e dominio inferido alem da landing publica.
- Decisao: consolidar o benchmark em report dedicado (`docs/99-reports/vvd-world-product-diagnosis-benchmark-2026-03-30.md`) e usa-lo como insumo de evolucao incremental em A1/A2/A3, preservando a ordem oficial do `attack-index` e a prioridade operacional atual de A7/A9.
- Alternativas consideradas:
  - tratar o benchmark apenas como referencia visual de landing;
  - abrir nova frente paralela para reproduzir rapidamente as features do produto de referencia.
- Impacto:
  - Positivo: aumenta clareza competitiva e direcao de produto sem comprometer coerencia arquitetural world-first do T20 OS.
  - Negativo / trade-off: pode elevar expectativa de escopo; exige disciplina para converter benchmark em backlog sequenciado, sem salto de frente.
- Plano de revisao: revisar no inicio de `A1-LP3` se os itens derivados do benchmark estao priorizados de forma aderente ao roadmap e ao estado real do produto.
