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
- `src/components/landing/landing-handoff.tsx` + `landing-handoff.module.css`: superficie publica fiel ao handoff visual, com composicao unica para hero premium e painel de tweaks.
- `src/app/(public)/mestre/page.tsx` + `src/components/mestre/*`: pagina publica do mestre com layout cockpit dedicado (sem depender do shell interno de `/app`), usada como destino direto do CTA da landing.
- `public/handoff/cockpit/*`: bundle estatico legado do primeiro cockpit aprovado no handoff, mantido como referencia historica do recorte inicial.
- `public/handoff/t20-toolkit/*`: bundle estatico completo do novo handoff do Claude Design, com landing, tokens, assets e telas de Cockpit, Codex, Forja, Grafo, Visual, Memoria e Mesa; `/` aponta para a landing e `/mestre` aponta para o cockpit desse bundle via iframe para comparacao visual navegavel enquanto as rotas reais sao convertidas por modulo.
- `public/handoff/t20-toolkit/Hub.html` + `handoff-navigation.js`: camada de hub/navegacao global do prototipo estatico, com transicao cinematografica compartilhada entre Landing, Hub e telas de modulo.
- `src/app/app/worlds/[id]/codex/page.tsx`: indice real do Codex em layout handoff-native, com toolbar densa, chips de tipo, grid operacional, dialog de criacao e painel lateral deslizante de quick inspect sobre as APIs reais de entidades.
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
- Shell lateral agora suporta modo colapsado persistido em `localStorage` (`t20:sidebar-collapsed`) sem alterar a IA world-scoped das rotas; o estado impacta apenas a densidade de navegacao desktop.
- Topbar evoluiu para leitura de cockpit ao vivo (status operacional + relogio) mantendo a mesma responsabilidade de contexto (`sectionLabel` + mundo ativo).
- Documentacao: status executivo no `attack-index`; continuidade operacional em `ai/*`.
- Landing publica (`/`) agora usa composicao dedicada de handoff em vez do conjunto modular antigo; componentes legacy de landing foram preservados no repo para referencia e rollback controlado.
- CTA principal da landing aponta para `/mestre`, criando um funil direto de entrada para a experiencia de cockpit do mestre.
- `/` e `/mestre` agora desacoplam da implementacao React interna para renderizar, respectivamente, a landing e o hub do pacote estatico completo `public/handoff/t20-toolkit` como fonte de verdade visual imediata.
- O shell interno (`src/app/app/layout.tsx`) exige `min-w-0` na area principal para que superficies densas world-scoped nao estourem horizontalmente ao lado da sidebar.
- O indice do Codex passa a ser a primeira conversao de prototipo de handoff para superficie funcional real: os arquivos de handoff orientam anatomia visual, mas dados, criacao, filtros e navegação continuam usando contratos Next/API existentes.

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
