# T20 RPG Toolkit - Biblioteca Visual Plan

## Como usar
- Marque `[x]` quando concluido
- Use `[-]` para em andamento
- Use `[ ]` para pendente
- Atualize a linha `Notas:` com contexto curto, branch, PR ou decisao

---

## Objetivo

Centralizar e profissionalizar a camada visual do mundo.

Esta frente existe para resolver a fragmentacao atual de referencias visuais entre:
- Pinterest;
- pastas soltas;
- links perdidos;
- imagens jogadas em descricoes;
- reveal improvisado na hora da mesa.

A `Biblioteca Visual` deve transformar imagem em parte central do mundo, e nao em adendo.

---

## Workflow obrigatorio desta frente

### Branches recomendadas
- `codex/visual-library-foundation`
- `codex/visual-entity-galleries`
- `codex/visual-reveal-prep`

### Commit pattern recomendado
- `feat(visual): add world visual library foundation`
- `feat(visual): build entity galleries and image roles`
- `feat(reveal): prepare visual assets for live session use`

### Merge policy
- PRs por recorte funcional;
- merge em `master` via `squash merge`;
- branch removida apos merge;
- nenhuma reestruturacao de assets deve ficar divergente da `master`.

---

## Dependencias

Esta frente depende de:
- `shell-cockpit-plan.md`
- `codex-do-mundo-plan.md`

---

## Checklist Mestre

- [-] V1. Estruturar biblioteca visual por mundo
  Notas: Primeira slice world-scoped entregue em `/app/worlds/[id]/visual-library`, agrupando assets por entidade a partir de `EntityImage` + capa/retrato do Codex.

- [-] V2. Fechar galerias por entidade
  Notas: Biblioteca visual ja agrupa assets por entidade, ganhou ordenacao consistente por `sortOrder` e quick inspect proprio com curadoria inline; ainda falta aprofundar a leitura premium e organizacao mais forte para locais menores.

- [-] V3. Definir papeis visuais das imagens
  Notas: Camada compartilhada de papeis visuais entrou em `src/lib/visual-library.ts` e o Codex deixou de depender de texto livre para `kind`.

- [-] V4. Integrar referencias visuais a reveals e consulta
  Notas: A biblioteca visual ja expoe reveal direto, quick inspect, marcacao inline de `reveal`, promocao para capa/retrato e `mesa pack` por campanha; ainda faltam refinamentos finais de contexto para cena em uso real.

- [-] V5. Garantir navegacao visual premium
  Notas: Biblioteca visual agora tem lightbox navegavel com contexto do asset, reveal e salto para entidade; ainda faltam mais refinamento de segunda tela e leitura hero.

---

## Frente V1 - Biblioteca por mundo

Contexto tecnico:
A camada visual precisa existir alem das paginas de entidade.

- [x] V1.1 Criar superficie principal da biblioteca visual do mundo
  Notas: Rota `/app/worlds/[id]/visual-library` entregue como primeira biblioteca visual world-scoped.

- [x] V1.2 Organizar assets por contexto navegavel
  Notas: Assets agora sao agrupados por entidade, com campanha, tags e papel visual visiveis.

- [x] V1.3 Definir modelos de agrupamento visual
  Notas: Slice inicial usa agrupamento por entidade e papel visual, em vez de uma pasta plana de uploads.

- [x] V1.4 Permitir busca e filtro visual
  Notas: Biblioteca visual ja suporta busca por termo e filtros por tipo, papel visual, campanha e tag.

- [x] V1.5 Integrar com o cockpit do mundo
  Notas: Superficie ja entrou na sidebar do mundo e nos atalhos do cockpit.

- [-] V1.6 Permitir organizar referencias por cidade, castelo, taverna, caverna e outros lugares menores
  Notas: Biblioteca visual agora expõe subtipo da entidade e preset de lugares; ainda falta aprofundar curadoria especifica para cenas por local menor.

### Criterios de aceite da Frente V1
- o mundo possui uma biblioteca visual propria;
- o mestre consegue navegar imagens alem do fluxo de uma entidade isolada;
- a biblioteca nao parece so uma pasta de uploads.

---

## Frente V2 - Galerias por entidade

Contexto tecnico:
Cada entidade precisa ser visualmente rica e organizada.

- [x] V2.1 Fechar visual de capa, retrato e galeria
  Notas: Slice atual unifica capa, retrato e galeria dentro da leitura da biblioteca visual por entidade.

- [-] V2.2 Permitir ordenacao e curadoria da galeria
  Notas: Biblioteca visual e quick inspect agora expõem `sortOrder` de forma visivel e permitem edicao inline; ainda falta UX melhor para reordenacao mais fluida no workspace da entidade.

- [x] V2.3 Exibir galerias no workspace de entidade
  Notas: Workspace do Codex continua exibindo galeria e agora usa papeis visuais padronizados.

- [x] V2.4 Permitir consulta rapida da galeria em quick inspect
  Notas: Biblioteca visual agora possui quick inspect proprio em drawer lateral, sem depender do workspace completo da entidade.

- [x] V2.5 Garantir consistencia entre index, workspace e biblioteca
  Notas: Biblioteca visual e Codex agora compartilham semantica de papel visual.

### Criterios de aceite da Frente V2
- a entidade tem identidade visual forte;
- a galeria e mais do que um dump de imagens;
- o mestre consegue consultar a imagem certa com rapidez.

---

## Frente V3 - Papeis visuais e semantica

Contexto tecnico:
Imagem sem papel definido vira bagunca.

- [x] V3.1 Definir papeis visuais oficiais
  Notas: Papeis `cover`, `portrait`, `reference`, `scene` e `reveal` definidos em camada compartilhada.

- [x] V3.2 Suportar capa, retrato, referencia, scene reference e reveal asset
  Notas: Biblioteca e Codex agora suportam esses papeis de forma consistente.

- [ ] V3.3 Definir prioridades de exibicao por papel
  Notas:

- [ ] V3.4 Definir metadados minimos por asset visual
  Notas:

- [x] V3.5 Garantir que a semantica seja visivel para o mestre
  Notas: Labels e descricoes de papel visual passaram a aparecer no fluxo da biblioteca e do Codex.

### Criterios de aceite da Frente V3
- cada imagem pode ser usada de forma intencional;
- o mestre sabe para que serve cada asset;
- o sistema nao trata tudo como "upload generico".

---

## Frente V4 - Integracao com reveal e uso de mesa

Contexto tecnico:
A biblioteca visual precisa alimentar o fluxo da sessao.

- [x] V4.1 Permitir marcar imagens prontas para reveal
  Notas: Quick inspect permite marcar um `EntityImage` diretamente como `reveal` dentro da biblioteca.

- [x] V4.2 Permitir abrir assets visuais a partir da entidade
  Notas: Cada grupo da biblioteca visual aponta de volta para o workspace da entidade e permite abrir o asset diretamente.

- [x] V4.3 Integrar com o reveal existente do produto
  Notas: Primeira slice usa `RevealButton` e corrige o mapeamento de tipos para funcionar com `/api/reveal`.

- [x] V4.4 Definir atalhos de consulta visual para mesa
  Notas: Quick inspect e lightbox agora concentram reveal, abertura da segunda tela e salto direto para a entidade.

- [-] V4.5 Garantir que o asset certo apareca no contexto certo
  Notas: Biblioteca visual agora destaca uma campanha foco e sugere assets de reveal, cena/lugar e retrato via `mesa pack`; ainda falta aprofundar isso com contexto mais fino de sessao/cena.

- [-] V4.6 Garantir fluxo claro para TV ou segunda tela
  Notas: Lightbox da biblioteca visual agora expõe botoes explicitos para abrir `/play/[roomCode]` por campanha; ainda faltam refinamentos de operacao para mesa.

### Criterios de aceite da Frente V4
- o mestre consegue sair da preparacao para a mesa com os assets organizados;
- o reveal usa a base visual do mundo e nao improviso;
- a exibicao em TV/segunda tela fica natural;
- a biblioteca ajuda operacao, nao so armazenamento.

---

## Frente V5 - Navegacao visual premium

Contexto tecnico:
Como esta frente tambem e visual, ela precisa elevar a experiencia do produto.

- [ ] V5.1 Definir visual da biblioteca e galerias
  Notas:

- [x] V5.2 Definir lightbox, zoom e navegacao entre imagens
  Notas: Biblioteca visual agora possui lightbox navegavel entre assets.

- [ ] V5.3 Definir superfices hero para capas e retratos
  Notas:

- [ ] V5.4 Evitar layout de "galeria generica de admin"
  Notas:

- [ ] V5.5 Garantir consistencia com a linguagem premium do cockpit
  Notas:

### Criterios de aceite da Frente V5
- a biblioteca visual parece produto premium;
- imagens sao valorizadas sem atrapalhar operacao;
- a experiencia e bonita e ao mesmo tempo pratica.

---

## Definition of Done da frente inteira

Esta frente so termina quando:
- o mundo tem biblioteca visual propria;
- cada entidade tem galeria util;
- o mestre consegue curar imagem por papel visual;
- os assets servem para consulta e reveal;
- a camada visual e claramente melhor do que o fluxo espalhado atual.

---

## Criterio de merge final da frente

- biblioteca visual funcional;
- galerias por entidade estaveis;
- integracao com reveal concluida;
- sem regressao no codex;
- docs atualizados;
- branch apagada apos merge.
