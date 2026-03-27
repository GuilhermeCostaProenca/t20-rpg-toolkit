# Decisões Técnicas e Arquiteturais

## Template de Decisão (ADR enxuto)
### DEC-`[número]`: `[título]`
- Data: `[YYYY-MM-DD]`
- Status: `[proposta|aceita|substituída|revogada]`
- Contexto: `[problema que motivou]`
- Decisão: `[o que foi decidido]`
- Alternativas consideradas:
  - `[alternativa 1]`
  - `[alternativa 2]`
- Impacto:
  - Positivo: `[benefício]`
  - Negativo / trade-off: `[custo]`
- Plano de revisão: `[quando revisar ou gatilho]`

## Histórico
### DEC-001: Inicialização da memória externa do projeto
- Data: 2026-03-27
- Status: aceita
- Contexto: instruções do projeto exigem continuidade e rastreabilidade fora do chat.
- Decisão: criar `ai/` com arquivos de contexto, estado, tarefas, arquitetura, decisões e log de sessão.
- Alternativas consideradas:
  - manter contexto só no histórico de conversa;
  - usar apenas issues sem documentação local.
- Impacto:
  - Positivo: continuidade operacional entre sessões.
  - Negativo / trade-off: custo de manutenção documental contínua.
- Plano de revisão: revisar em 2 semanas para simplificar se houver excesso de overhead.
