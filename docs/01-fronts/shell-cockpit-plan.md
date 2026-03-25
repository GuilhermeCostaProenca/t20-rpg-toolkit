# T20 RPG Toolkit - Shell e Cockpit Plan

## Como usar
- Marque `[x]` quando concluido
- Use `[-]` para em andamento
- Use `[ ]` para pendente
- Atualize a linha `Notas:` com contexto curto, branch, PR ou decisao

---

## Objetivo

Refatorar a fundacao visual e estrutural do app para suportar um cockpit continuo do mestre.

Esta frente existe para eliminar o principal problema de UX do estado atual:
- paginas demais;
- ritmo visual inconsistente;
- shell sem coesao;
- largura e hierarquia quebradas;
- sensacao de app remendado em vez de sistema operacional do mestre.

Sem esta frente, as demais continuarao sendo montadas em cima de uma experiencia fragmentada.

---

## Workflow obrigatorio desta frente

### Branches recomendadas
- `codex/shell-cockpit-foundation`
- `codex/shell-world-context`
- `codex/shell-design-system-pass`

### Commit pattern recomendado
- `refactor(shell): unify world cockpit layout`
- `feat(shell): add persistent world workspace panels`
- `refactor(ui): align topbar shell and viewport rhythm`

### Merge policy
- cada recorte relevante abre PR propria;
- merge sempre em `master` via `squash merge`;
- branch apagada imediatamente apos merge;
- nenhuma mudanca de shell deve ficar presa em branch paralela aguardando "depois".

---

## Estado atual

Problemas ja identificados no repo:
- `Topbar` usa largura diferente do conteudo principal;
- `Shell` nao impõe um workspace consistente entre modulos;
- transicoes de pagina reforcam o paradigma de troca de rota inteira;
- a navegacao do mundo ainda parece uma colecao de links, nao uma superficie de operacao;
- o hub do mundo ainda parece dashboard, nao cockpit.

---

## Decisoes base

- Desktop-first e prioridade.
- O shell do mundo vira a experiencia principal.
- Dentro de um mundo, o app deve privilegiar continuidade de contexto.
- O uso de drawers, paineis laterais e inspeção rapida e encorajado.
- O visual final deve parecer "war room premium" e nao dashboard generico.
- Nada desta frente deve depender de Jarvis.

---

## Checklist Mestre

- [-] S1. Definir arquitetura final do shell do mundo
  Notas: Shell total iniciado. `/app`, `/app/worlds`, `/app/worlds/[id]`, `/app/campaign/[id]` e `/app/worlds/[id]/map` passaram a seguir a mesma leitura de produto.

- [-] S2. Unificar largura, grid e hierarquia do layout base
  Notas: `Topbar`, `Shell` e `AppSidebar` alinhados; largura fluida ampliada para `1840px` e leitura central mais larga no desktop.

- [-] S3. Criar padrao oficial de paines, drawers e detail surfaces
  Notas: Quick inspect evoluiu para `CockpitDetailSheet` reutilizavel e ja foi aplicado em mundo e campanha.

- [-] S4. Refatorar navegacao world-scoped para cockpit
  Notas: Sidebar contextual, novo cockpit do mundo, estacao de campanha, atlas e superficies internas de campanhas, personagens, locais, diario e compendio entregues em primeira passada.

- [-] S5. Fechar primeira passada do design system premium
  Notas: Tokens cinematics, superficies, heros principais e linguagem visual das paginas centrais aplicados na atualizacao 1.

- [-] S6. Validar shell em desktop largo com densidade alta
  Notas: Largura do shell, topbar e detail surfaces foram refinadas para desktop largo; falta apenas uma checagem visual automatizada em browser real, hoje bloqueada por sessao existente do Chrome no ambiente.

---

## Frente S1 - Arquitetura do shell

Contexto tecnico:
Esta frente precisa redefinir a experiencia base de `/app` e principalmente de `/app/worlds/[id]`.

- [x] S1.1 Definir o layout base do `World Cockpit`
  Notas: Primeira versao entregue em `/app/worlds/[id]`.

- [x] S1.2 Separar claramente niveis de navegacao
  Notas: Navegacao global, navegacao de mundo e contexto de campanha foram explicitados no shell e nas superfices principais.

- [x] S1.3 Definir o papel fixo de sidebar, topbar e area de trabalho
  Notas: Shell total consolidado com contexto global e contexto de mundo.

- [x] S1.4 Definir onde mora quick inspect e painel de contexto
  Notas: `Sheet` lateral adotado como quick inspect v1.

- [ ] S1.5 Definir quando usar rota completa versus overlay persistente
  Notas:

### Criterios de aceite da Frente S1
- existe um modelo unico de shell do mundo;
- qualquer pessoa lendo o codigo entende a hierarquia do workspace;
- a estrutura nao depende de improviso por pagina;
- ha um ponto claro para contexto global do mundo.

---

## Frente S2 - Grid, largura e ritmo

Contexto tecnico:
O app atual tem sinais claros de desacoplamento entre topo, conteudo e shell.

- [x] S2.1 Padronizar largura maxima e ritmo horizontal do app
  Notas: Workspace fluido alinhado em `max-w-[1840px]`.

- [x] S2.2 Alinhar `Topbar`, `Shell` e areas internas
  Notas: Topbar e shell compartilham a mesma largura, padding e leitura de desktop largo.

- [x] S2.3 Definir grid de desktop para workspace continuo
  Notas: Cockpit, biblioteca de mundos, campanha e atlas adotaram grids estaveis de desktop com coluna principal e coluna tatica.

- [x] S2.4 Ajustar espacamento vertical para leitura densa
  Notas: Hero, secoes, cards e tabs foram reescalados para leitura mais densa sem perder respiracao.

- [x] S2.5 Reduzir "vazios decorativos" sem funcao operacional
  Notas: Entradas globais, campanha e mapa trocaram vazios de template por cards taticos, atalhos e leituras operacionais.

### Criterios de aceite da Frente S2
- topo e conteudo compartilham a mesma logica de largura;
- nao ha sensacao de topo "solto" sobre paginas diferentes;
- o app parece uma unica superficie coesa;
- a densidade visual sustenta uso longo em monitor.

---

## Frente S3 - Paines, drawers e superfices de detalhe

Contexto tecnico:
O cockpit so funciona se o app suportar consulta e edicao sem sempre trocar de tela.

- [x] S3.1 Criar padrao de drawer lateral para quick inspect
  Notas: `src/components/cockpit/cockpit-detail-sheet.tsx` virou o wrapper oficial de detail surface lateral.

- [x] S3.2 Criar padrao de painel de detalhe com scroll interno
  Notas: Drawer oficial passou a ter header, corpo com scroll interno e footer opcional padronizados.

- [x] S3.3 Criar padrao de acoes contextuais sem perder o estado da pagina
  Notas: Mundo e campanha agora abrem leitura rapida com CTA final sem sacrificar o contexto da rota atual.

- [x] S3.4 Definir o kit visual de cards, sections e overlays
  Notas: Hero, cinematic-frame, cards taticos e detail sheet passaram a compor um kit visual coerente para o cockpit.

- [x] S3.5 Garantir que drawers e paineis respeitem acessibilidade basica
  Notas: Labels de fechamento em PT-BR e controles mais explicitos aplicados em `dialog` e `sheet`.

### Criterios de aceite da Frente S3
- quick inspect existe como linguagem oficial do produto;
- drawers e overlays nao parecem componentes avulsos;
- detalhes podem ser abertos e fechados sem quebrar o fluxo principal.

---

## Frente S4 - Navegacao world-scoped

Contexto tecnico:
O mundo precisa parecer um ambiente unico.

- [x] S4.1 Revisar a sidebar world-scoped
  Notas: Sidebar redesenhada com separacao clara entre global e mundo.

- [x] S4.2 Definir ordem e agrupamento final das entradas do mundo
  Notas: Sidebar reorganizada por cockpit, campanhas, elenco, locais, diario, compendio, atlas e biblioteca.

- [x] S4.3 Substituir paginas-resumo superficiais por workspaces mais vivos
  Notas: Dashboard global, biblioteca de mundos, cockpit e principais paginas internas do mundo foram substituidos.

- [x] S4.4 Remover friccao de "entrar e sair" para tarefas relacionadas
  Notas: Estacao de campanha concentra elenco, sessao, combate e atalhos para o ecossistema do mundo sem depender de saltos cegos.

- [x] S4.5 Garantir contexto do mundo visivel em toda navegacao interna
  Notas: Topbar contextual, links de retorno e hero sections mantem mundo e campanha visiveis nas rotas principais.

### Criterios de aceite da Frente S4
- navegar dentro do mundo parece navegar dentro de um sistema, nao entre paginas independentes;
- o mestre entende onde esta e em que contexto opera;
- tarefas relacionadas exigem menos trocas de rota do que hoje.

---

## Frente S5 - Direcao visual premium

Contexto tecnico:
Nao basta organizar layout; a linguagem visual precisa subir de nivel.

- [x] S5.1 Definir tokens de superficie, borda, sombra e profundidade
  Notas: `chrome-panel`, `cinematic-frame` e `world-hero` formalizados.

- [x] S5.2 Definir hierarquia tipografica do cockpit
  Notas: Section eyebrow, heros uppercase, blocos taticos e titulos de frente ficaram padronizados nas paginas centrais.

- [x] S5.3 Revisar paleta para fantasia epica premium sem perder contraste
  Notas: Base visual movida para bronze, vinho e sombra cinematica.

- [x] S5.4 Definir padrao de hero areas e uso de imagem
  Notas: Hero de mundo, campanhas, biblioteca, estacao de campanha e atlas passaram a seguir o mesmo padrao de hero cinematica.

- [x] S5.5 Eliminar sinais de template generico nas telas principais
  Notas: Dashboard, mundos, campanha, biblioteca e mapa perderam o aspecto de demo/admin panel e agora seguem a identidade do produto.

### Criterios de aceite da Frente S5
- o produto tem linguagem visual propria;
- o shell parece premium e intencional;
- o visual sustenta uso operacional e nao atrapalha leitura;
- a primeira impressao do mundo e aspiracional, nao utilitaria comum.

---

## Fora de escopo desta frente

- schema de entidades;
- grafo narrativo;
- forja de sessao;
- memoria do mundo;
- regras T20.

Esta frente prepara a casa para as outras.

---

## Definition of Done da frente inteira

Esta frente so termina quando:
- existe um shell do mundo coerente;
- a navegacao e visivelmente mais fluida;
- o app deixa de parecer uma colecao de paginas desconectadas;
- quick inspect e paineis de detalhe estao formalizados;
- o design system base do cockpit esta estabelecido;
- a `master` contem essa fundacao estavel.

---

## Criterio de merge final da frente

Para encerrar esta frente via PR final:
- layout principal do mundo funcional e estavel;
- componentes de shell reutilizaveis extraidos;
- sem regressao nas rotas principais do mundo;
- docs desta frente atualizados;
- branch removida apos merge.
