# Arquitetura

## Visao Geral
Arquitetura world-first: `World` e raiz de dominio. `Campaign` e linha do tempo do mundo. `Session` opera preparacao e execucao. `WorldEvent` preserva memoria narrativa e consequencia. A aplicacao prioriza cockpit continuo em rotas world-scoped.

## Modulos
- `src/app`: Superficies de produto (cockpit global, mundo, campanha, mesa ao vivo, APIs).
- `src/components`: Shell, cockpit, war-room, quick inspect, superficies visuais e modulos de sessao.
- `src/components/immersive-backdrop.tsx`: camada visual premium do app interno com video cinematografico, overlays atmosfericos e parallax leve para profundidade.
- `src/components/world/mode-switcher.tsx`: seletor de modo do cockpit (`Normal`, `Lousa`, `Quadro`) como linguagem de navegacao continua.
- `src/app/(public)/page.tsx`: landing publica de entrada do produto com narrativa comercial e CTA para o cockpit.
- `src/components/landing/*`: secoes modulares da landing (navbar, hero, toolkit, generos, missao, showcase, CTA e footer) com interacoes via Framer Motion.
- `src/lib`: Dominio e motor de apoio (combat, balanceamento T20, eventos, validacao, utilitarios).
- `prisma`: Modelo de dados, migracoes e contratos de persistencia.
- `docs`: Estrategia, attack index, planos por frente e relatorios de validacao.
- `docs/99-reports/t20-os-figma-design-blueprint-2026-03-31.md`: contrato de IA/UX visual para o rebuild (modos Normal/Lousa/Quadro e ordem de telas).

## Integracoes
- DB: Prisma <-> PostgreSQL para estado world-scoped persistente.
- API app routes (`src/app/api/**`) para campanhas, sessoes, entidades, condicoes, eventos e forja.
- UI live (`/app/play/[campaignId]`) integra preparo de sessao, combate, quick inspect e reveal em fluxo unico.

## Fluxos Criticos
1. Worldbuilding -> Codex/Grafo/Biblioteca -> Forja do Mundo -> estado persistente world-scoped.
2. Forja de Sessao -> Mesa ao Vivo -> Memoria da Sessao -> sincronizacao para `WorldEvent`.
3. Encontro preparado (A9) -> leitura de risco -> combate ao vivo -> ajuste rapido no cockpit.

## Convencoes
- Nomeacao: frentes referenciadas por codigos (`A1..A9`, `RPG-*`, `GUI-*`).
- Organizacao de rotas: tudo do dominio principal sob `/app/worlds/[id]/...` ou contexto equivalente de campanha.
- Estados e erros: feedback operacional no proprio cockpit, evitando troca de superficie.
- Atmosfera visual: `src/app/app/layout.tsx` injeta backdrop imersivo fixo (video + gradientes + camadas 3D) para reforcar sensacao de war room sem alterar contratos de dominio.
- Rotas canonicas de modulo world-scoped: `visual`, `memory`, `lousa` e `quadro` agora existem em `src/app/app/worlds/[id]/*` para alinhar IA e navegacao ao blueprint Figma sem descontinuar rotas legadas.
- Superficies de modulo (`world`, `forge`, `codex`, `graph`, `campaigns`, `visual-library`, `memory`, `lousa`, `quadro`) compartilham o mesmo `ModeSwitcher`, reduzindo quebra de contexto entre criacao e operacao ao vivo.
- Links internos de modulo foram convergidos para `visual` e `memory` como caminhos canonicos de UX; rotas legadas seguem apenas como compatibilidade durante transicao.
- Documentacao: status executivo no `attack-index`; continuidade operacional em `ai/*`.

## Divida Tecnica Relevante
- `play/[campaignId]` ainda concentra complexidade elevada apesar de recortes de extracao - impacto: alto, plano: continuar fatiamento modular com testes direcionados.
- Inconsistencias pontuais de documentacao (caminhos antigos e notas extensas) - impacto: medio, plano: rodada de saneamento DOCS dedicada.

## Atualizacao 2026-04-01 - Front Foundation
- Novo provider transversal de UX: `AppFeedbackProvider` no layout raiz (`src/app/layout.tsx`) para unificar feedback e confirmacao destrutiva.
- Novo bloco de primitives em `src/components/ui`:
  - `select.tsx` (padrao unico de select),
  - `panel.tsx` (superficies),
  - `states.tsx` (loading/error/empty),
  - `form.tsx` (wrappers RHF).
- Recomendacao de composicao aplicada em `ui/layout.tsx` para reduzir classes ad hoc de container.

## Atualizacao 2026-04-01 - Front Foundation (R2/R3)
- `SelectField` foi consolidado como camada de selecao transversal para modulos de operacao (`graph`, `codex entity`, `combat`, `quick-sheet`, `character wizard`, `character sheet`, `visual browser`).
- `src/components/visual/visual-library-filters.tsx` foi introduzido para manter filtros de querystring em pagina server-side com primitives do DS (sem `<select>` nativo).
- Contrato de feedback unificado (`useAppFeedback`) passou a cobrir os modulos de visual/graph/codex; uso direto de `toast` foi removido de `src/app` e `src/components`.
