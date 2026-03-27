# Contexto do Projeto

## Resumo Executivo
`t20-rpg-toolkit` esta em refatoracao para virar um sistema operacional world-first para mestres de Tormenta 20. O foco nao e adicionar CRUD isolado, e sim fechar modulos operacionais que sustentem criacao de mundo, preparacao, mesa ao vivo e memoria continua.

## Objetivo
Centralizar o ciclo real do mestre (antes, durante e depois da sessao) em um unico produto coeso, com `World` como raiz de dominio e cockpit continuo como experiencia principal.

## Stack
- Framework: Next.js 16 + React 19
- Linguagem: TypeScript 5
- UI: Tailwind CSS 4, Radix UI, Framer Motion
- Dados: Prisma + PostgreSQL
- Mapa/3D: MapLibre GL, Three.js / React Three Fiber
- Testes: Vitest
- Infra local: Docker Compose

## Restrições
- Toda mudanca relevante deve respeitar a ordem oficial de frentes em `docs/00-strategy/attack-index.md`.
- O dominio e world-scoped por padrao; evitar rotas e dados globais fora de `World`.
- Nao acumular trabalho operacional apenas em branch longa; priorizar ciclo curto com PR e merge.
- Atualizar `ai/*` como parte do fluxo obrigatorio de continuidade.

## Principios Tecnicos
- Mundo primeiro, campanha como linha do tempo.
- Cockpit continuo em vez de navegacao fragmentada.
- Entidades, relacoes e eventos como base da memoria do mundo.
- Entrega modular com criterio de aceite real (sem MVP fake).

## Metas Ativas
1. Consolidar as frentes A1-A9 do attack index ate status de encerramento real por criterio de aceite.
2. Finalizar o loop operacional da Mesa ao Vivo (fim de combate, leitura profunda de sheets, refinamentos de fluxo).
3. Manter coerencia entre planos, docs de status e estado efetivo do codigo.

## Definicao de Trabalho Nao Trivial
Considerar como nao trivial quando houver pelo menos 1 criterio:
- altera arquitetura, modelo de dominio ou contratos entre modulos;
- mexe em 3+ arquivos ou multiplas camadas (UI + dominio + persistencia);
- exige migracao de dados ou mudanca de comportamento em producao;
- demanda mais de 2 horas de execucao estimada.
