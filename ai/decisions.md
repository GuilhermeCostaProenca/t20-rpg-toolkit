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
