# T20 OS - Blueprint de Design para Figma (2026-03-31)

## Objetivo
Consolidar um blueprint unico de produto/UX para guiar o redesign visual e estrutural do T20 OS sem herdar as limitacoes do design atual (exceto aprendizados validos da landing).

Este documento define:
- arquitetura de informacao final;
- experiencia por modo (`Normal`, `Lousa`, `Quadro`);
- fluxos criticos;
- sistema de componentes;
- ordem de construcao no Figma.

---

## Premissas de produto (nao negociaveis)
- `World` e raiz de tudo.
- Menos paginas isoladas, mais cockpit continuo.
- Fluxo completo do mestre: criar -> preparar -> operar -> lembrar.
- Interface premium com densidade operacional real (nao vitrine vazia).
- Cada tela precisa indicar proxima acao objetiva.

---

## O que descartar do design atual
- Hero sections longas dentro de telas operacionais.
- Excesso de texto estrategico no runtime.
- Menu flat com muitos itens no mesmo nivel sem prioridade.
- Blocos redundantes de CTA para a mesma acao.
- Estados vazios passivos sem trilha de acao.

---

## Arquitetura de Informacao alvo (v1)

### Camada 1 - Contexto
- Mundo atual
- Campanha ativa
- Sessao ativa

### Camada 2 - Modo de trabalho
- `Normal`: cockpit de operacao e consulta
- `Lousa`: ideacao e modelagem livre espacial
- `Quadro`: orquestracao de cena/mesa com cards operacionais

### Camada 3 - Modulos
- Mundo: Forja, Codex, Grafo, Biblioteca Visual
- Mesa: Sessoes, Mesa ao Vivo, Diario/Memoria
- Apoio: Compendio, Atlas, Balanceamento

Regra: navegacao lateral agrupada por contexto (Mundo / Mesa / Apoio), nunca lista unica sem hierarquia.

---

## Modos de experiencia

## 1) Modo Normal (core)
Uso: consulta rapida, edicao estruturada, decisao operacional.

Layout:
- Sidebar contextual (agrupada por blocos).
- Topbar com contexto vivo (mundo, campanha, sessao, busca global).
- Centro em blocos de operacao.
- Painel direito de inspect/estado.

Comportamento:
- Toda acao chave com feedback claro.
- Quick inspect sem navegar para fora.
- CTA principal unico por secao.

## 2) Modo Lousa
Uso: descoberta, brainstorm, relacoes abertas, ideacao de mundo.

Layout:
- Canvas livre infinito.
- Biblioteca lateral de entidades arrastaveis.
- Mini-mapa e camadas.
- Barra superior de ferramentas leves.

Comportamento:
- Arrastar entidade cria nodo vivo.
- Vinculos visuais podem virar relacao formal no Codex.
- Alternancia rapida entre lousa e entidade sem perder contexto.

## 3) Modo Quadro
Uso: conduzir sessao e ritmo narrativo/tatico.

Layout:
- Colunas operacionais (Cena atual, Proximos beats, Reveals, Estado de mesa).
- Trilho de acoes rapidas (consultar, revelar, registrar evento, ajustar encontro).
- Painel publico vs privado explicito.

Comportamento:
- Foco em "agora/proximo/depois".
- Estado de combate e narracao coexistem sem troca de app.
- Encerramento de sessao gera consolidacao de memoria com 1 fluxo.

---

## Fluxos canonicos (que devem nascer no Figma)

1. Criar mundo do zero (sem dashboard vazio)
- Conceito minimo -> pilares -> blocos de poder -> primeira campanha sugerida.

2. Criar campanha a partir de mundo existente
- Selecionar contexto -> definir frente ativa -> abrir quadro de sessao.

3. Preparar sessao
- Objetivo -> cenas/subcenas -> reveals -> encontro -> checklist de prontidao.

4. Operar sessao ao vivo
- Quadro ativo -> modo tatico/narrativo -> reveis/consulta/registro em tempo real.

5. Pos-sessao
- Consolidar fatos -> atualizar entidades -> publicar memoria relevante.

---

## Blueprint de telas no Figma (ordem de construcao)

## Fase A - Fundacao de shell (A1)
1. App Frame Base (desktop 1440)
2. Sidebar agrupada (Mundo/Mesa/Apoio)
3. Topbar contextual global
4. Painel inspect padrao
5. Empty/loading/error states padronizados

## Fase B - Cockpit e entrada (A1/A2)
6. Entrada global (`/app`) focada em "continuar trabalho"
7. Biblioteca de mundos (`/app/worlds`)
8. Cockpit do mundo (`/app/worlds/[id]`) com proxima acao clara

## Fase C - Modos (A2-A7)
9. Modo Normal (cockpit operacional)
10. Modo Lousa (canvas de ideacao world-first)
11. Modo Quadro (orquestracao de sessao e mesa)

## Fase D - Modulos estruturais
12. Codex index + workspace
13. Grafo narrativo
14. Biblioteca visual
15. Forja do mundo
16. Forja de sessao
17. Mesa ao vivo
18. Memoria do mundo

## Fase E - Mobile de suporte
19. Versoes compactas para consulta (nao full authoring)

---

## Sistema de componentes (MVP de design system)

### Primitivos
- `ShellFrame`
- `ContextHeader`
- `CommandBar`
- `SectionCard`
- `EntityRow`
- `StatPill`
- `StateBadge`
- `ActionRail`
- `InspectDrawer`
- `ModeSwitcher`

### Compositos
- `WorldSnapshotPanel`
- `SessionFlowBoard`
- `RevealQueue`
- `CombatPressurePanel`
- `MemoryPulsePanel`

### Estados obrigatorios de todo componente
- default
- hover/focus
- active/selected
- loading (skeleton)
- empty
- error com acao
- disabled com motivo

---

## Diretrizes visuais objetivas
- Landing pode manter narrativa cinematica; produto interno deve priorizar operacao.
- Tipografia: hierarquia funcional > headline dramatica.
- Contraste: texto secundario nunca abaixo de legibilidade operacional.
- Densidade: cards com informacao util, sem "blocos manifesto".
- Cor: usar cor para estado e prioridade, nao so estetica.

---

## Regras de copy
- Toda secao responde: "o que e", "estado atual", "proxima acao".
- Evitar linguagem vaga de roadmap na interface operacional.
- Labels devem refletir acao concreta.
- Mensagens de erro com causa + proximo passo.

---

## Handoff para implementacao

Cada tela Figma precisa sair com:
- objetivo da tela (1 linha);
- fluxos cobertos;
- componentes usados;
- estados de erro/loading/empty;
- eventos de analytics esperados;
- criterio de aceite ligado a frente oficial (`A1..A9`).

---

## Checklist de prontidao do blueprint
- [x] IA world-first consolidada
- [x] tres modos definidos (Normal/Lousa/Quadro)
- [x] fluxos canonicos definidos
- [x] ordem de construcao de telas definida
- [x] sistema de componentes inicial definido
- [x] regras de copy e estados definidas
- [ ] prototipo Figma criado com navegacao clicavel
- [ ] validacao de fluxo com cenarios reais de mesa

---

## Proximo passo imediato
Criar no Figma o arquivo `T20 OS - Product Rebuild Blueprint` e executar a Fase A + B primeiro (shell + cockpit + entrada), antes de detalhar visual final de modulos profundos.
