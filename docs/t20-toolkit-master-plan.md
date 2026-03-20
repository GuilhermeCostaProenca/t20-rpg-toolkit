# T20 RPG Toolkit - Plano Mestre Completo

## 1. Visao do produto

O `t20-rpg-toolkit` deve deixar de ser um conjunto de paginas e features isoladas e passar a ser o sistema operacional do mestre.

Ele nao existe para ser apenas:
- uma interface bonita;
- um dashboard de campanha;
- um tracker de combate;
- um lugar para guardar alguns cadastros;
- um shell futuro para o Jarvis.

Ele deve ser o lugar onde o mestre consegue:
- criar mundos;
- organizar lore;
- estruturar familias, faccoes, casas, lugares, artefatos e conflitos;
- estruturar genealogias, linhagens e redes politicas;
- anexar referencias visuais;
- preparar sessoes;
- operar sessoes;
- consultar contexto em segundos;
- registrar o que aconteceu;
- manter a continuidade do mundo sem depender de memoria manual.

A meta final e centralizar o fluxo real do mestre em um unico produto.

## 2. Problema real que o app precisa resolver

Hoje o fluxo do mestre esta quebrado em varias ferramentas e contextos.

### Antes da sessao
O mestre:
- conversa com IA para desenvolver ideias;
- cria PDFs e documentos de lore;
- busca referencias no Pinterest;
- organiza imagens em pastas e boards;
- monta NPCs, casas, ligacoes, arvores genealogicas e conflitos;
- define eras, eventos historicos, dias marcantes, politica e equilibrio de poder;
- cria ameacas e encontros;
- improvisa muita coisa sem ter um lugar central para consolidar.

### Durante a sessao
O mestre:
- espelha tela na TV;
- abre imagens e referencias manualmente;
- consulta notas, fichas e PDFs;
- controla narrativa, combate e ritmo;
- precisa lembrar quem e quem, quem morreu, quem odeia quem e o que aconteceu antes;
- sofre com inimigos fracos demais ou fortes demais;
- precisa alternar entre muitas interfaces para manter a mesa viva.

### Depois da sessao
O mundo muda, mas essa mudanca nao fica naturalmente organizada.
O custo de atualizar memoria, continuidade e contexto e alto demais.

## 2.1 Criar mundo nao pode terminar no nome

No produto final, `criar um mundo` nao pode ser apenas:
- informar nome;
- salvar um card;
- cair em um dashboard vazio.

Esse fluxo precisa abrir uma experiencia real de bootstrap de mundo, onde o mestre consegue comecar a construir:
- conceito central e tom;
- eras, calendarios, marcos historicos e eventos fundadores;
- familias, casas, faccoes e estruturas de poder;
- genealogias e linhagens;
- personagens-base, temperamentos, segredos e funcoes narrativas;
- lugares importantes;
- corpus de lore e notas estruturadas;
- referencias visuais do mundo e das entidades;
- sementes de conflito, politica e ameacas.

O app precisa assumir que a criacao de mundo e trabalho pesado, iterativo e profundamente visual.
Esse momento nao pode ser tratado como uma etapa superficial do onboarding.

## 3. Papel do toolkit

O `t20-rpg-toolkit` sera o produto principal.

Regra estrutural:
- o toolkit precisa funcionar sem Jarvis;
- o Jarvis precisara ser capaz de operar o toolkit no futuro;
- mas o toolkit nao pode depender do Jarvis para ser bom.

Leitura correta:
- o toolkit e a mesa do mestre;
- o Jarvis, no futuro, sera um operador e copiloto desse sistema;
- o valor do app precisa existir mesmo sem automacao nenhuma.

## 3.1 Ciclo real de uso do mestre

O produto precisa respeitar o ciclo real de uso do mestre, e nao um fluxo simplificado de CRUD.

### Etapa 1 - Ideia e conversa inicial
O mestre chega com uma ideia bruta e conversa com a IA para:
- lapidar conceito;
- descobrir tom;
- estruturar o mundo;
- definir politica, conflitos, personagens-base e direcao.

### Etapa 2 - Nascimento do mundo
Depois da ideia, o mestre construi o mundo de verdade:
- lore;
- funcionamento politico;
- familias e casas;
- genealogias;
- personagens e suas fichas;
- lugares;
- eventos historicos;
- referencias visuais.

### Etapa 3 - Preparacao da sessao
Com o mundo estruturado, o mestre prepara a sessao:
- escolhe personagens envolvidos;
- define ganchos e conflitos;
- seleciona imagens, pins e referencias;
- organiza trilha sonora;
- revisa ameacas, fichas e equilibrio.

### Etapa 4 - Operacao da mesa
Durante a sessao, o app precisa sustentar:
- consulta rapida de contexto;
- rolagem;
- fichas;
- mapa;
- reveals para TV/segunda tela;
- controle de quem entrou, morreu, apareceu ou mudou;
- suporte para ritmo sem quebrar a narracao.

### Etapa 5 - Pos-sessao e continuidade
Quando a sessao acaba, o sistema precisa conseguir consolidar:
- o que aconteceu;
- quem morreu;
- quem apareceu ou nao apareceu;
- o que vira publico;
- o que permanece privado do mestre;
- como isso altera o mundo dali para frente.

### Etapa 6 - Reuso do mesmo mundo
O mesmo mundo precisa sustentar:
- novas mesas;
- outros grupos;
- novas eras;
- campanhas no passado ou no futuro;
- linhas temporais ligadas ao mesmo universo.

O produto precisa ser bom em todas essas etapas, porque esse e o fluxo real do mestre.

## 4. O que o app precisa contemplar

O app precisa cobrir, ao longo da sua maturidade, todas estas frentes.

### Mundo vivo
- mundos como raiz do sistema;
- campanhas como linhas do tempo;
- multiplas mesas e campanhas no mesmo mundo, inclusive simultaneas;
- reutilizacao do mesmo mundo em novas eras, passados, futuros ou outros grupos;
- entidades persistentes;
- continuidade entre preparacao, sessao e memoria.

### Worldbuilding
- criacao de NPCs, personagens, faccoes, casas, lugares, artefatos e eventos importantes;
- ficha para personagens importantes, inclusive NPCs;
- ficha rapida e geracao aleatoria para necessidades improvisadas;
- organizacao de relacoes;
- genealogias, linhagens e arvores familiares;
- politica, conselhos, poderes, tensoes e estruturas de governo;
- eras, datas, dias importantes, cronologias e fatos fundadores;
- segredos, motivacoes, objetivos e conflitos;
- estrutura do mundo antes da mesa com profundidade real.

### Preparacao de sessao
- roteiro;
- ganchos;
- revelacoes;
- planejamento de cenas;
- encontros;
- ameacas;
- trilha e playlist de sessao;
- imagens e reveals;
- notas do mestre.

### Operacao de sessao
- combate;
- mapa;
- iniciativas;
- turnos;
- rolagem de dados e estado vivo de ficha;
- vida, nivel, status e estado operacional de PCs e NPCs;
- consulta de entidade;
- reveal de imagens;
- segunda tela / TV para exibicao de pins, lugares, personagens e cenas;
- apoio a trilha sonora da sessao;
- acesso rapido a referencias e informacoes chave;
- fluxo que nao quebre a narracao.

### Memoria e continuidade
- registrar acontecimentos;
- atualizar o estado narrativo do mundo;
- preservar relacoes e consequencias;
- distinguir o que fica publico e o que fica privado para o mestre;
- consolidar quem apareceu, quem nao apareceu, quem morreu e o que mudou;
- permitir consulta rapida do que mudou.

### Biblioteca visual
- capa;
- retrato;
- galeria;
- moodboard;
- referencias por entidade e por sessao;
- referencias por familia, faccao, lugar e bloco do mundo;
- preparo de reveals e uso durante a mesa.

### Balanceamento T20
- suporte para encontros;
- leitura de risco e dificuldade;
- apoio para montar ameacas e calibrar a mesa.

### Interface premium
- layout fluido;
- menos troca de rota;
- mais continuidade;
- visual epico, bonito e digno de produto aspiracional;
- sem cara de template generico.

## 5. O que o app nao deve ser

- nao deve tentar resolver tudo de uma vez;
- nao deve continuar crescendo como um amontoado de telas;
- nao deve depender de "depois a IA resolve";
- nao deve ser MVP capado;
- nao deve exigir sair entrando e saindo de paginas para tudo;
- nao deve parecer um SaaS comum com skin de RPG.

## 6. Principios nao negociaveis

- Um modulo por vez, fechado de ponta a ponta.
- Nada de MVP parcial que nao sirva no uso real.
- Cada entrega precisa ser usavel de verdade.
- O app precisa melhorar o fluxo do mestre imediatamente.
- Desktop-first para o mestre e prioridade.
- O mundo e o contexto raiz.
- O visual precisa subir de nivel sem perder legibilidade.
- A refatoracao deve ser por camadas, nao por reescrita cega.
- O produto deve ficar mais coeso a cada modulo, nao mais espalhado.

## 7. Leitura do estado atual

O repositorio atual ja possui base tecnica forte:
- arquitetura world-first;
- campanhas, sessoes e ledger de eventos;
- combate e trackers;
- mapa interativo;
- reveal;
- dados;
- camadas de AI e voz;
- shell visual.

Mas o produto ainda esta fragmentado.

Os maiores problemas atuais sao:
- navegacao baseada em paginas demais;
- experiencia pouco fluida;
- shell visual com ritmos e larguras inconsistentes;
- dashboard de mundo ainda superficial;
- ausencia de um codex real como centro do mundo;
- ausencia de um modelo universal de entidade;
- visual ainda sem direcao final consolidada;
- muitas features isoladas e poucos fluxos realmente fechados.

## 8. Direcao de UX e layout

A refatoracao deve sair do paradigma de "muitas telas" para um paradigma de "cockpit continuo".

### Objetivo de UX
Quando o mestre entra em um mundo, ele deve sentir que entrou em um ambiente de operacao continuo, nao em uma lista de paginas.

### Resultado esperado
- menos troca de rota;
- mais drawers, paines laterais, workspaces e contexto persistente;
- exploracao do mundo a partir de um hub operacional;
- consulta rapida sem perder o que estava aberto;
- experiencia mais parecida com uma war room do mestre.

### Problemas atuais que precisam ser corrigidos
- topbar e conteudo com larguras e ritmos diferentes;
- shell com sensacao de encaixe parcial;
- template animando transicoes de pagina inteira quando o ideal e continuidade;
- world pages ainda muito separadas;
- muita navegacao para acessar contexto relacionado.

### Meta de shell
Criar um `World Cockpit` persistente com:
- navegacao lateral enxuta;
- topo contextual;
- area central modular;
- painel de detalhes;
- inspecao rapida;
- busca global do mundo;
- continuidade visual entre modulos.

## 9. Direcao visual

A direcao visual travada para a refatoracao e:

- fantasia epica;
- premium;
- forte impacto visual;
- imagens bonitas;
- sensacao aspiracional de produto de alto nivel;
- densidade operacional de ferramenta real.

A referencia nao e um admin panel comum.
A ambicao e algo que pareca:
- sofisticado;
- belo;
- imersivo;
- com presenca;
- mas ainda rapido de operar.

### Consequencias praticas
- revisar paleta, superfices e contrastes;
- revisar tipografia e hierarquia;
- revisar cards, paines, drawers e overlays;
- revisar espacamento e ritmo;
- usar imagens grandes e hero sections quando fizer sentido;
- evitar cara de template generico;
- preservar leitura e uso intensivo em desktop.

## 10. Estrategia de entrega

A estrategia oficial nao sera "construir o app todo ao mesmo tempo".

A estrategia sera:
- dividir o produto em modulos;
- fechar um modulo inteiro por vez;
- so abrir o proximo quando o anterior estiver realmente usavel.

Regra:
- se um modulo nao resolve um problema real sozinho, ele ainda nao esta pronto.

## 11. Roadmap oficial de modulos

## Modulo 1 - Codex do Mundo
Primeiro modulo oficial e obrigatorio.

### Objetivo
Ser a base de centralizacao do mundo e resolver o maior gargalo atual do mestre:
- pessoas;
- relacoes;
- lugares;
- faccoes;
- referencias;
- consulta.

### Escopo
- entidades universais;
- relacoes entre entidades;
- imagens por entidade;
- indice do codex;
- busca e filtros;
- quick inspect;
- workspace completo de entidade.

### Resultado
Mesmo sem nenhum outro modulo novo, o app ja passa a servir como central real de worldbuilding.

---

## Modulo 2 - Grafo Narrativo

### Objetivo
Tornar visivel a rede viva do mundo.

### Escopo
- visualizacao em grafo;
- navegacao entre entidades;
- relacoes direcionais;
- forca/importancia opcional da relacao;
- filtros por campanha, tipo e tag.

### Resultado
O mestre deixa de depender de memoria manual ou documentos dispersos para entender o tecido do mundo.

---

## Modulo 3 - Biblioteca Visual

### Objetivo
Centralizar de verdade a referencia visual do mestre.

### Escopo
- galeria por entidade;
- galeria por mundo;
- selecao de capa e retrato;
- organizacao de reveals;
- colecoes visuais por contexto.

### Resultado
Sai Pinterest espalhado e entra uma base visual integrada ao mundo.

---

## Modulo 4 - Forja do Mundo

### Objetivo
Transformar a criacao estrutural de mundo em uma experiencia de primeira classe dentro do app.

### Escopo
- bootstrap de mundo apos criacao inicial;
- conceito, tom e pilares do mundo;
- casas, familias, faccoes e conselhos;
- genealogias e linhagens;
- politica, poderes e tensoes estruturais;
- eras, datas, calendarios e eventos fundadores;
- lore-base e documentos estruturados;
- referencias visuais ligadas aos blocos centrais do mundo.

### Resultado
Criar um mundo deixa de ser um cadastro minimo e vira um processo real de construcao dentro do produto.

---

## Modulo 5 - Forja de Sessao

### Objetivo
Trazer a preparacao de sessao para dentro do app.

### Escopo
- roteiro;
- cenas;
- ganchos;
- revelacoes;
- segredos;
- planejamento de encontros;
- referencias ligadas a sessao;
- notas do mestre.

### Resultado
A preparacao deixa de ficar espalhada entre chat, PDF e notas soltas.

---

## Modulo 6 - Mesa ao Vivo

### Objetivo
Transformar o app em central de operacao durante a sessao.

### Escopo
- combate;
- mapa;
- reveals;
- ficha rapida;
- consultas rapidas;
- timeline;
- operacao mais fluida.

### Resultado
Menos troca de ferramentas durante a mesa.

---

## Modulo 7 - Memoria do Mundo

### Objetivo
Transformar sessao jogada em continuidade do mundo.

### Escopo
- eventos narrativos;
- historico por entidade;
- mudancas de status;
- alteracoes de relacao;
- memoria persistente do que aconteceu.

### Resultado
O mundo passa a lembrar por estrutura, nao por esforco manual.

---

## Modulo 8 - Balanceamento T20

### Objetivo
Ajudar o mestre a preparar e corrigir o nivel de desafio.

### Escopo
- ferramentas de encontro;
- leitura de risco;
- dificuldade;
- apoio a montagem de ameacas;
- calibragem para uso de preparacao e consulta rapida.

### Resultado
Menos combate quebrado e mais seguranca na montagem de sessao.

## 12. Modulo 1 detalhado: Codex do Mundo

## 12.1 Objetivo
O `Codex do Mundo` sera o primeiro modulo realmente completo do produto.

Ele existe para centralizar o trabalho estrutural do mestre antes e durante a campanha.
Ele e a fundacao do worldbuilding, mas nao pretende sozinho resolver toda a experiencia de bootstrap de mundo, que passa a existir como frente propria em `Forja do Mundo`.

## 12.2 Modelo de dados
A base do modulo 1 sera uma camada de `Entity` universal.

### Entity
Tipos iniciais:
- character;
- npc;
- faction;
- house;
- place;
- artifact;
- rumor/event anchor.

Campos base esperados:
- `id`
- `worldId`
- `campaignId?`
- `type`
- `subtype?`
- `name`
- `slug?`
- `summary`
- `description`
- `status`
- `tags`
- `visibility`
- `coverImageUrl?`
- `portraitImageUrl?`
- `metadataJson?`
- `createdAt`
- `updatedAt`

### EntityRelationship
Campos esperados:
- `id`
- `worldId`
- `fromEntityId`
- `toEntityId`
- `type`
- `directionality`
- `weight?`
- `notes?`
- `visibility`
- `createdAt`
- `updatedAt`

### EntityImage
Campos esperados:
- `id`
- `entityId`
- `worldId`
- `url`
- `kind`
- `caption?`
- `sortOrder`
- `createdAt`

### NarrativeEvent
Campos minimos esperados para o modulo 1:
- `id`
- `worldId`
- `entityId?`
- `campaignId?`
- `type`
- `title`
- `description`
- `ts`
- `visibility`

## 12.3 Regras de produto do Codex
- Toda entidade pertence a um mundo.
- Campanha pode contextualizar, mas nao substitui o mundo.
- O codex precisa servir para preparacao e consulta.
- Imagem nao e anexo secundario; imagem faz parte do valor da entidade.
- Relacoes sao primeira classe, nao nota escondida.
- O mestre deve conseguir abrir contexto rapido sem perder o fluxo principal.

## 12.4 Experiencia do modulo
O modulo 1 deve ter tres superficies principais.

### A. Codex Index
A lista viva do mundo.

Deve permitir:
- busca;
- filtros;
- agrupamento por tipo;
- destaque visual;
- abertura rapida de entidade;
- entrada rapida para criacao.

### B. Quick Inspect
Inspecao em drawer ou painel lateral.

Deve mostrar:
- nome;
- tipo;
- resumo;
- imagem principal;
- relacoes principais;
- tags;
- eventos recentes ligados a entidade.

Objetivo:
- consultar sem sair do cockpit.

### C. Entity Workspace
Workspace completo da entidade.

Deve conter:
- overview;
- descricao;
- galeria;
- relacoes;
- notas do mestre;
- historico basico;
- links para itens conectados.

Objetivo:
- concentrar criacao, edicao e consulta profunda.

## 12.5 APIs esperadas
- `GET /api/worlds/:id/entities`
- `POST /api/worlds/:id/entities`
- `GET /api/worlds/:id/entities/:entityId`
- `PATCH /api/worlds/:id/entities/:entityId`
- `DELETE /api/worlds/:id/entities/:entityId`
- `GET /api/worlds/:id/relationships`
- `POST /api/worlds/:id/relationships`
- `PATCH /api/worlds/:id/relationships/:relationshipId`
- `DELETE /api/worlds/:id/relationships/:relationshipId`
- `POST /api/worlds/:id/entities/:entityId/images`
- `PATCH /api/worlds/:id/entities/:entityId/images/:imageId`
- `DELETE /api/worlds/:id/entities/:entityId/images/:imageId`
- `GET /api/worlds/:id/codex`

## 12.6 Layout que acompanha o modulo 1
O modulo 1 ja precisa comecar a refatoracao do shell.

Mudancas esperadas:
- transformar `/worlds/[id]` em cockpit de verdade;
- unificar topbar, shell e largura real de trabalho;
- reduzir dependencia de paginas separadas para cada consulta;
- criar base de drawers e paines de detalhe;
- elevar a consistencia visual dos modulos internos.

## 12.7 Criterios de aceite do modulo 1
O modulo 1 so esta pronto quando:
- o mestre consegue montar entidades reais de um mundo;
- consegue ligar essas entidades entre si;
- consegue anexar referencias visuais;
- consegue encontrar rapidamente o que procura;
- consegue consultar uma entidade sem quebrar o fluxo;
- sente que ja pode abandonar parte do uso espalhado entre notas e referencias externas.

## 13. Estrategia de refatoracao

A refatoracao deve ser por camadas.

### Significa
- nao destruir o que ja funciona sem necessidade;
- introduzir a nova camada de `Entity` sem parar o app inteiro;
- conviver temporariamente com modelos legados;
- migrar gradualmente o centro de gravidade do produto.

### Nao significa
- manter a arquitetura atual por medo de mexer;
- empilhar mais features novas no modelo antigo;
- adiar a consolidacao de dominio.

Regra:
- o legado pode continuar existindo durante a transicao;
- mas o novo modulo nao deve nascer preso conceitualmente ao legado.

## 14. Papel futuro do Jarvis no contexto do toolkit

Mesmo fora de escopo de implementacao neste plano, o documento precisa preservar essa visao para nao perder contexto.

No futuro, o Jarvis deve:
- operar o toolkit sozinho ou junto com o mestre;
- criar e editar entidades;
- estruturar relacoes;
- ajudar na preparacao;
- consultar e responder sobre o mundo;
- apoiar a sessao ao vivo;
- agir sobre a superficie visual do app.

Mas o toolkit precisa ser forte antes disso.
A regra e:
- primeiro um produto forte;
- depois um operador forte em cima dele.

## 15. Sucesso do produto

A refatoracao sera considerada bem-sucedida quando:
- o toolkit parar de parecer um conjunto de telas e passar a parecer um sistema unico;
- o mestre conseguir usar pelo menos um modulo diariamente de forma real;
- o mundo virar o centro operacional do app;
- a preparacao comecar a sair de ferramentas espalhadas;
- o visual subir para um nivel premium sem virar enfeite vazio;
- o caminho para os proximos modulos ficar mais claro e mais facil, nao mais confuso.

## 16. Defaults travados

Decisoes fechadas neste plano:
- foco inteiramente no toolkit;
- nada de implementar MCP ou Jarvis agora;
- nada de MVPs;
- um modulo completo por vez;
- primeiro modulo = `Codex do Mundo`;
- escopo do primeiro modulo = `entidades + relacoes + imagens`;
- estrategia de refatoracao = `por camadas`;
- prioridade de plataforma = `desktop do mestre`;
- paradigma de UX = `cockpit continuo`;
- direcao visual = `fantasia epica premium`, com imagens fortes e acabamento de alto nivel.

## 17. Proximo passo recomendado

Executar o planejamento tecnico detalhado do `Modulo 1 - Codex do Mundo` como primeiro ataque real do rework.

Esse detalhamento deve fechar:
- schema final;
- adaptacao do shell;
- rotas e APIs;
- experiencia do cockpit;
- superficies do codex;
- criterios de pronto do modulo.

A partir dai, a implementacao pode comecar sem abrir outras frentes.
