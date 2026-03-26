# T20 RPG Toolkit - Reference Harvest Plan

## Como usar
- Marque `[x]` quando concluido
- Use `[-]` para em andamento
- Use `[ ]` para pendente
- Atualize a linha `Notas:` com contexto curto, branch, PR ou decisao

---

## Objetivo

Este documento existe para organizar o uso da pasta `references/` de forma disciplinada.

Ele serve para:
- mapear cada referencia disponivel;
- deixar claro o que cada repo pode fornecer;
- indicar em qual frente cada referencia entra;
- separar o que e reaproveitamento de dominio, reaproveitamento visual e reaproveitamento tecnico;
- impedir copia cega de arquitetura, UI ou codigo;
- reduzir retrabalho;
- garantir que o toolkit continue sendo um produto coeso, mesmo bebendo de varias fontes.

Este documento nao substitui os planos de ataque.
Ele e a camada de rastreabilidade de influencias e material reaproveitavel.

---

## Regra de ouro

`reference-first, not copy-first`

Toda referencia deve ser tratada como:
- fonte de dominio;
- fonte de ideia;
- fonte de estrutura;
- fonte de asset ou UX;

e nao como algo para ser importado em bloco.

O toolkit nao deve virar uma colagem de repositorios.

---

## Workflow obrigatorio para usar referencias

### Branches recomendadas
- `codex/reference-harvest-mapping`
- `codex/<frente>-reference-adoption`

### Commit pattern recomendado
- `docs(reference): map reusable sources for t20 toolkit`
- `docs(reference): record adopted patterns from artonMap`
- `docs(reference): register t20 rules sources for balance module`

### Merge policy
- alteracoes em documentacao de referencia podem ir em PRs proprias;
- adocao real de referencia em uma frente deve ser mencionada na PR daquela frente;
- nenhuma referencia deve ser "copiada e depois decidimos";
- o uso deve ser explicitado em `Notas:` do plano da frente correspondente;
- merge sempre em `master` via `squash merge`;
- branch apagada apos merge.

---

## Regras de adocao

### Pode ser reaproveitado diretamente
- dados licenciados e tecnicamente utilizaveis dentro do contexto do projeto;
- estruturas de taxonomia;
- nomenclaturas de dominio;
- ideias de fluxo;
- convencoes de organizacao de assets;
- heuristicas de UX;
- assets internos quando houver permissao e adequacao.

### Pode ser adaptado
- modelos de tela;
- conceitos de wizard;
- arquitetura de modulo;
- mecanicas de consulta;
- estruturas de calculo;
- formas de representar mapa, grimoire e ficha.

### Nao deve ser copiado cegamente
- shell de produto inteiro;
- design system completo de outro repo;
- componentes de UI inteiros sem adaptacao;
- arquitetura global de app;
- codigo colado sem ownership claro;
- qualquer coisa que traga acoplamento ao modelo antigo ou a outra stack de forma desnecessaria.

### Sempre registrar
Toda vez que uma frente realmente absorver algo de `references/`, registrar:
- de qual repo veio;
- o que foi absorvido;
- se foi dominio, UX, visual ou tecnico;
- o que foi deliberadamente descartado;
- em qual PR isso entrou.

---

## Mapa das referencias atuais

## 1. `references/gerador-ficha-tormenta20`

### Leitura rapida
Esta e a referencia mais forte de dominio T20 hoje no workspace.

Pelo material presente, ela oferece:
- base de dados ampla de Tormenta 20;
- criacao de personagem;
- geracao de ameacas;
- exportacoes e PDF;
- temas e estrutura de UI mais madura;
- fluxo de wizard e manipulacao de regras;
- possivel leitura de recompensas, equipamento, classes, racas, magias e poderes.

### O que pode fornecer

#### Reaproveitamento de dominio
- taxonomia de classes, racas, origens, poderes, magias e equipamentos;
- estrutura de personagem e ameaca;
- regras e heuristicas T20 para criacao de ficha;
- nomenclaturas e agrupamentos de dominio;
- possiveis entradas para balanceamento e encounter support.

#### Reaproveitamento tecnico
- estrategias de organizacao de dados T20;
- estrutura de calculos e derivacoes de personagem;
- ideias de pipeline para PDF/ficha;
- padroes de wizard e gerenciamento de estado de construcao.

#### Reaproveitamento visual
- referencias de fluxo premium para criacao de ficha;
- hierarquia de telas de criacao;
- padroes de destaque visual de personagem e ameaca;
- referencia de o que funciona bem em interfaces T20.

### Entra principalmente em quais frentes
- `codex-do-mundo-plan.md`
- `forja-de-sessao-plan.md`
- `mesa-ao-vivo-plan.md`
- `balanceamento-t20-plan.md`

### O que nao deve ser copiado
- o app inteiro;
- o shell geral do produto;
- Material UI como direcao obrigatoria;
- qualquer arquitetura que conflite com a estrategia `world-first` do toolkit;
- qualquer UX que force o toolkit a virar "gerador de ficha com extras".

### Criterio de uso correto
- usar o repo como base de dominio T20 e referencias de fluxo especializado;
- nao transformar o toolkit em clone do Fichas de Nimb.

---

## 2. `references/roll20_tormenta20_grimoire`

### Leitura rapida
Esta referencia e fortissima para consulta e estrutura de conteudo de regras.

Ela oferece:
- base extensa de magias, poderes, equipamentos, racas, classes e regras;
- estrutura de grimorio;
- busca rapida;
- organizacao de conteudo consumivel em jogo;
- integracao historica com ficha e consulta contextual.

### O que pode fornecer

#### Reaproveitamento de dominio
- banco de termos e taxonomia T20;
- organizacao de regras de combate;
- estrutura de categorias de grimorio;
- conteudo de poderes, condicoes, equipamentos e magias;
- dados para compendium e apoio a balanceamento.

#### Reaproveitamento tecnico
- estrategias de indexacao de regras;
- estrutura de dados para consulta rapida;
- agrupamentos para compendium e pesquisa;
- modelo mental de "abrir regra certa rapido".

#### Reaproveitamento visual
- referencias de navegacao de grimorio;
- ideias de quick lookup;
- conceitos de acesso contextual a regras durante uso ativo.

### Entra principalmente em quais frentes
- `codex-do-mundo-plan.md`
- `mesa-ao-vivo-plan.md`
- `balanceamento-t20-plan.md`

### O que nao deve ser copiado
- UI de extensao/browser;
- ergonomia especifica de Roll20;
- estrutura de produto orientada a plugin;
- qualquer decisao visual limitada ao ambiente Roll20.

### Criterio de uso correto
- absorver conteudo e estrutura de consulta;
- nao importar a experiencia de extensao como se fosse app principal.

---

## 3. `references/artonMap`

### Leitura rapida
Esta referencia e a principal fonte para mapa, geografia e visualizacao espacial de Arton.

Ela oferece:
- mapas interativos;
- tiles prontos;
- logica de localizacao;
- estrutura de pins;
- navegacao geografica por regioes.

### O que pode fornecer

#### Reaproveitamento de dominio
- organizacao geografica de Arton;
- nomes de regioes e pontos importantes;
- referencia de como estruturar lugares e localizacoes.

#### Reaproveitamento tecnico
- estrategia de tiles e assets de mapa;
- ideias de organizacao de mapas por regiao;
- referencia de manipulacao de mapas interativos.

#### Reaproveitamento visual
- representacao visual de mundo geografico;
- pins e camadas de mapa;
- linguagem de exploracao espacial.

### Entra principalmente em quais frentes
- `shell-cockpit-plan.md`
- `codex-do-mundo-plan.md`
- `biblioteca-visual-plan.md`
- `mesa-ao-vivo-plan.md`

### O que nao deve ser copiado
- estrutura inteira de projeto em Leaflet puro;
- falta de organizacao do repo original;
- qualquer decisao tecnica que regrida o uso atual de MapLibre;
- htmls e javascripts duplicados por regiao.

### Criterio de uso correto
- reaproveitar assets, geografia, ideias de mapa e navegacao;
- manter a implementacao adaptada ao stack atual do toolkit.

---

## 4. `references/fichas-de-nimb-fvvt`

### Leitura rapida
Esta referencia parece focada em importacao de fichas para Foundry.

Ela oferece:
- formato de importacao;
- leitura de ficha exportada;
- nocao de interoperabilidade com VTT.

### O que pode fornecer

#### Reaproveitamento de dominio
- entendimento de campos de ficha relevantes para importacao/exportacao;
- referencia de como serializar dados de personagem.

#### Reaproveitamento tecnico
- estrategias de importer/exporter;
- shape de payload para exportacao futura;
- pistas de compatibilidade com ecossistemas externos.

#### Reaproveitamento visual
- pouco valor direto para a direcao principal do toolkit.

### Entra principalmente em quais frentes
- `codex-do-mundo-plan.md`
- `balanceamento-t20-plan.md`

### O que nao deve ser copiado
- UX de importer HTML simplista;
- qualquer fluxo inteiro voltado a Foundry como centro do produto;
- estrutura de modulo de VTT como base do toolkit.

### Criterio de uso correto
- usar como referencia secundaria de interoperabilidade;
- nao tratar como referencia principal de produto.

---

## 5. `references/jarvez-mcp-rpg`

Observacao:
- o nome da pasta continua legado, mas a leitura de produto deve tratar esta referencia como material do `Jarvis`.

### Leitura rapida
Esta referencia e a principal fonte para:
- memoria de mundo local;
- cache de entidades;
- grafo de relacoes;
- eventos narrativos;
- suporte de dominio RPG fora do app visual.

Ela e valiosa como referencia conceitual e estrutural, mesmo estando fora do escopo de implementacao direta nesta fase.

### O que pode fornecer

#### Reaproveitamento de dominio
- conceito de entidade universal;
- relacoes entre entidades;
- eventos narrativos;
- snapshot de mundo;
- estrutura de memoria local;
- ideia de bootstrap e sincronizacao futura.

#### Reaproveitamento tecnico
- shape inicial de `world_cache`;
- schema mental de `Entity`, `EntityRelationship` e `NarrativeEvent`;
- operacoes de snapshot e consulta de mundo;
- fluxo de contexto para "quem existe no mundo e como se conectam".

#### Reaproveitamento visual
- pouco valor visual direto;
- muito valor para modelagem de superficies de consulta.

### Entra principalmente em quais frentes
- `codex-do-mundo-plan.md`
- `grafo-narrativo-plan.md`
- `memoria-do-mundo-plan.md`

### O que nao deve ser copiado
- implementacao MCP;
- fluxo standalone do server;
- detalhes de stack Python como arquitetura principal do app;
- qualquer acoplamento do toolkit ao servidor em vez de ao proprio dominio.

### Criterio de uso correto
- usar como fonte de modelo mental e estrutura de dominio;
- nao misturar backend MCP com arquitetura central do toolkit.

---

## Matriz de aproveitamento por frente

## `shell-cockpit-plan.md`

### Referencias mais uteis
- `artonMap`
- `gerador-ficha-tormenta20`

### Tipo de aproveitamento
- visual;
- UX;
- organizacao de superficie;
- referencia de navegacao especializada.

### O que evitar
- copiar shell de outro produto;
- puxar componentes inteiros sem adaptar para a direcao premium do toolkit.

---

## `codex-do-mundo-plan.md`

### Referencias mais uteis
- `jarvez-mcp-rpg`
- `gerador-ficha-tormenta20`
- `roll20_tormenta20_grimoire`
- `artonMap`

### Tipo de aproveitamento
- dominio;
- taxonomia;
- modelagem de entidade;
- lugares e geografia;
- consulta de conteudo.

### O que evitar
- acoplamento ao legado de NPC;
- importar estrutura de app de terceiros em vez de absorver o dominio.

---

## `grafo-narrativo-plan.md`

### Referencias mais uteis
- `jarvez-mcp-rpg`

### Tipo de aproveitamento
- dominio;
- memoria;
- relacoes;
- snapshot de mundo.

### O que evitar
- portar implementacao literal de cache local ou MCP para o app web;
- tratar o grafo como reflexo do backend de referencia, em vez de necessidade do toolkit.

---

## `biblioteca-visual-plan.md`

### Referencias mais uteis
- `artonMap`
- `gerador-ficha-tormenta20`

### Tipo de aproveitamento
- visual;
- assets;
- navegacao espacial;
- apresentacao premium.

### O que evitar
- virar uma galeria generica;
- copiar UIs de terceiros sem coesao com o cockpit.

---

## `forja-de-sessao-plan.md`

### Referencias mais uteis
- `gerador-ficha-tormenta20`
- `roll20_tormenta20_grimoire`
- `jarvez-mcp-rpg`

### Tipo de aproveitamento
- dominio T20;
- consulta de regras;
- estrutura de memoria e ideias de contexto de sessao.

### O que evitar
- transformar a forja em wizard de ficha;
- misturar preparacao narrativa com fluxo de importer/exporter.

---

## `mesa-ao-vivo-plan.md`

### Referencias mais uteis
- `artonMap`
- `roll20_tormenta20_grimoire`
- `gerador-ficha-tormenta20`

### Tipo de aproveitamento
- mapa;
- lookup rapido de regras;
- T20 e superficie de ficha/ameaca.

### O que evitar
- depender de UX de plugin;
- espalhar logica de mesa em superfices diferentes de novo.

---

## `memoria-do-mundo-plan.md`

### Referencias mais uteis
- `jarvez-mcp-rpg`

### Tipo de aproveitamento
- dominio;
- eventos;
- snapshots;
- estrutura de continuidade.

### O que evitar
- copiar a solucao Python;
- amarrar o app a uma implementacao de cache pensada para MCP.

---

## `balanceamento-t20-plan.md`

### Referencias mais uteis
- `gerador-ficha-tormenta20`
- `roll20_tormenta20_grimoire`
- `fichas-de-nimb-fvvt`

### Tipo de aproveitamento
- regras;
- dados de ficha;
- ameacas;
- representacao de personagem;
- dominio de combate e grimoire.

### O que evitar
- heuristicas obscuras importadas sem explicacao;
- UX centrada em VTT ou em gerador puro.

---

## Checklist Mestre

- [x] R1. Mapear oficialmente as referencias do workspace
  Notas: Mapa oficial consolidado com as cinco referencias atuais em `references/` (`gerador-ficha-tormenta20`, `roll20_tormenta20_grimoire`, `artonMap`, `fichas-de-nimb-fvvt`, `jarvez-mcp-rpg`).

- [x] R2. Registrar o papel de cada referencia por frente
  Notas: Matriz por frente preenchida neste documento, com tipo de aproveitamento e limites de adocao para Shell, Codex, Grafo, Biblioteca, Forja, Mesa, Memoria e Balanceamento.

- [x] R3. Definir o que pode e o que nao pode ser copiado
  Notas: Regras de adocao formalizadas (`pode reaproveitar`, `pode adaptar`, `nao copiar cegamente`) e criterio obrigatorio de registro por frente/PR.

- [x] R4. Usar este documento em cada frente ativa
  Notas: Politica operacional consolidada: toda adocao de referencia deve ser registrada no plano da frente e na PR correspondente (alinhado com `AGENTS.md` e com este plano).

- [x] R5. Atualizar este plano sempre que uma nova referencia entrar
  Notas: Regra de manutencao definida como obrigatoria para novas entradas em `references/`; este plano passa a ser o inventario vivo de referencia do produto.

---

## Criterio de encerramento

Esta frente documental so e considerada util de verdade quando:
- toda referencia relevante do workspace esta mapeada;
- cada frente sabe quais repositorios consultar;
- o time consegue reaproveitar melhor sem copiar errado;
- o retrabalho de "lembrar de onde tirar cada coisa" cai fortemente.

---

## Proximo uso recomendado

Quando uma frente entrar em implementacao:
1. abrir o plano da frente;
2. abrir este documento;
3. anotar em `Notas:` quais referencias serao usadas naquele ataque;
4. citar isso explicitamente na PR;
5. registrar o que foi reaproveitado e o que foi descartado.
