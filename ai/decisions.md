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
