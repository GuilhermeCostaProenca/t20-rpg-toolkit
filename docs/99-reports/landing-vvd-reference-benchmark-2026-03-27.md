# Benchmark de Referencia - Landing Premium (vvd.world)

- Data: 2026-03-27
- Origem: material enviado pelo usuario (analise produzida via Claude)
- Escopo: consolidar referencia visual/comportamental para melhoria da landing do `t20-rpg-toolkit`
- Status: referencia salva para execucao futura (nao implementado nesta sessao)

> Atualizacao 2026-03-30: este benchmark (focado em landing) foi expandido por um diagnostico funcional completo do produto em `docs/99-reports/vvd-world-product-diagnosis-benchmark-2026-03-30.md`.

## Contexto
Foi fornecido um pacote de analise em 8 etapas (analise, design system, interacoes, implementacao base, refinamento e validacao) com foco em alta fidelidade de uma landing premium.

Este documento registra essa referencia como insumo oficial para os proximos recortes da frente A1 (Shell/Cockpit), especialmente no ponto de linguagem visual e primeira impressao.

## Estrutura da landing de referencia (ordem)
1. Navbar fixa com blur/transparencia, links centrais e CTA.
2. Hero fullscreen com video de fundo, badge, headline serif, subtitulo, CTA e social proof.
3. Toolkit/Features em duas colunas com tabs + preview de video.
4. Secao de generos com cards imageticos em trilho horizontal.
5. Secao de missao com narrativa por scroll.
6. Showcase de produto em etapas com comportamento sticky.
7. CTA final com pills de features e lista de beneficios.
8. Footer com links e social.

## Design system capturado (referencia)
- Fundo base: gradiente escuro entre `#0a0f1a`, `#162535`, `#1a3045` e preto.
- Texto: `#fafafa` com variantes mutadas em opacidade.
- Tipografia de impacto: serif display no hero/titulos.
- Tipografia de apoio: sans geometrica para corpo e UI.
- Superficies: cards transluidos (`rgba(..., 0.05)`), bordas suaves (`rgba(..., 0.1)`), blur leve.
- Radius predominante: `16px` (cards/tabs).
- Densidade de espacamento: ritmo compacto com respiracao controlada.

## Interacoes mapeadas (referencia)
- Navbar fixa com mudanca de estado por scroll.
- Hero com video em loop e fade inferior.
- Tabs de features com auto-rotacao por timer e barra de progresso.
- Expand/collapse suave de descricoes (accordion animado).
- Carrossel horizontal de cards com variacao de altura.
- Reveals por scroll (fade/slide) em secoes narrativas.
- Blocos sticky com transicao entre estagios de conteudo.
- Microinteracoes de hover em CTA, links e cards.

## Diretrizes tecnicas extraidas
- Stack alvo do exemplo: Next.js (App Router) + Tailwind + Framer Motion.
- Componentizacao por secao (navbar, hero, features, genres, mission, showcase, cta, footer).
- Responsividade real por breakpoint (mobile/tablet/desktop).
- Animacoes coordenadas e nao genericas (timing com easing/spring contextual).

## Adaptacao para o produto (t20-rpg-toolkit)
- Usar como referencia de qualidade visual/comportamental, nao como copia literal de marca.
- Preservar direcao world-first e identidade "war room premium" do projeto.
- Manter coesao com tokens/superficies ja existentes no shell atual.
- Priorizar ganho de primeira impressao sem quebrar ritmo operacional do cockpit.

## Gaps para execucao futura
- A referencia recebida e de segunda mao (texto), sem auditoria direta da pagina original nesta sessao.
- Nao houve implementacao de codigo nesta rodada; apenas consolidacao documental.
- Recomendado abrir recorte dedicado de implementacao (A1-LP1) com issue Linear propria.

## Proximo passo recomendado
Abrir recorte A1-LP1 para:
1. traduzir o benchmark em blueprint da landing do `t20-rpg-toolkit`;
2. implementar componentes/animacoes com fidelidade premium;
3. validar visual em desktop + mobile com checklist objetivo.
