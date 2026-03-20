# World-First Architecture

## Manifesto do Mundo Vivo

Este projeto nao e um app de RPG no sentido convencional.

Ele e um sistema para criar, operar, lembrar e evoluir mundos narrativos vivos.

Uma campanha pode acabar.
Uma sessao pode falhar.
Um personagem pode morrer.

O mundo permanece.

Essa e a ideia central que deve orientar arquitetura, dados, UX e roadmap.

---

## 1. O principio raiz

`World` e a entidade raiz do sistema.

Nada importante deve existir fora de um mundo.
Tudo deve pertencer a um mundo, direta ou indiretamente.

```txt
World
|- Campaigns
|  |- Sessions
|  |  |- Events
|  |- Characters in timeline context
|- Global Characters / Entities
|- NPCs / Houses / Factions / Places / Artifacts
|- Lore / Compendium
|- Visual Library
|- Narrative Graph
`- World Memory Ledger
```

### Proibido

- personagem solto sem mundo
- NPC solto sem mundo
- sessao fora de campanha
- campanha sem mundo
- dados narrativos importantes vivendo apenas em UI local

### Verdade arquitetural

Campanha nao e raiz.
Campanha e linha do tempo dentro de um mundo.

---

## 2. Mundo primeiro, campanha depois

Um mesmo mundo pode conter:
- varias campanhas
- varias mesas simultaneas
- varias epocas
- passado, presente e futuro
- linhas paralelas
- recortes de exploracao, guerra, intriga e memoria

O produto precisa permitir que:
- campanhas contem historias
- mundos guardem verdades

Isso significa que o toolkit nao pode ser modelado como "um app de campanha com extras".
Ele precisa ser um app de mundo com superficies de campanha dentro dele.

---

## 3. Tudo que importa vira estado do mundo

O toolkit precisa ser capaz de representar:
- quem existe
- como se relaciona
- o que aconteceu
- o que mudou
- o que esta oculto
- o que pode ser revelado

O estado do mundo nao pode depender de:
- memoria manual do mestre
- PDFs soltos
- notas externas sem estrutura
- improviso sem rastro

O sistema precisa tratar como primeira classe:
- entidades
- relacoes
- eventos narrativos
- referencias visuais
- contexto de sessao
- visibilidade publica versus privada
- reuso do mesmo mundo em novas campanhas e eras

Criar um mundo, portanto, nao pode parar em nome + dashboard vazio.
O produto precisa dar superficie para bootstrap de mundo:
- familias e casas;
- genealogias e linhagens;
- politica e estruturas de poder;
- eras, calendarios e eventos fundadores;
- lore-base e referencias visuais.

---

## 4. Eventos sao a memoria do mundo

O mundo deve lembrar por eventos.

Eventos sao o rastro do que aconteceu:
- falas relevantes
- decisoes
- descobertas
- mentiras
- batalhas
- mudancas politicas
- mortes
- aliancas
- traicoes
- revelacoes

### Regras do ledger

- eventos nao devem ser apagados sem motivo excepcional
- eventos nao devem ser reescritos como se nunca tivessem existido
- o mundo deve conseguir derivar memoria e historico a partir deles

### Micro e macro eventos

O sistema deve suportar:
- microeventos, pequenos mas rastreaveis
- macroeventos, com impacto estrutural no mundo

Um microevento pode se tornar macro conforme o contexto evolui.
A classificacao nao deve ser tratada como algo totalmente rigido.

---

## 5. Estado derivado e continuidade

Sempre que possivel, o toolkit deve favorecer estado derivado a partir do historico do mundo.

Exemplos:
- uma entidade "morta" pode ser resultado de evento narrativo, nao apenas flag manual
- uma relacao hostil pode ser sustentada por historico, nao so por um campo textual
- uma sessao pode produzir consequencias que alimentam a memoria de entidades, campanhas e mundo

Na pratica do produto, isso permite:
- continuidade melhor
- menos retrabalho
- consultas mais confiaveis
- mundo mais vivo

---

## 6. UI philosophy

O toolkit deve sair do paradigma de "muitas paginas" e ir para "cockpit continuo".

### Objetivo

Quando o mestre entra em um mundo, ele deve sentir que entrou em um ambiente de operacao.

Nao em uma lista de telas desconectadas.

### Consequencias

- menos troca de rota
- mais drawers e paineis de detalhe
- quick inspect como linguagem nativa do produto
- workspaces de entidade, sessao e mesa
- contexto persistente do mundo durante a navegacao

### World Hub

O hub do mundo nao deve ser apenas um dashboard.
Ele deve ser o cockpit principal do mestre.

### Sidebar dinamica

Fora do mundo:
- acesso ao sistema e a lista de mundos

Dentro do mundo:
- superficies do proprio mundo
- sempre em contexto world-scoped

### Regra de rotas

Errado:

```txt
/app/npcs
/app/personagens
/app/locais
```

Certo:

```txt
/app/worlds/[id]/...
```

Se algo pertence ao mundo, a rota deve refletir isso.

---

## 7. Entidades como nucleo do worldbuilding

O estado atual do produto ja tem `World`, `Campaign`, `Session`, `WorldEvent`, `Npc` e `Character`.

Mas o futuro do sistema exige uma camada mais universal.

O toolkit precisa evoluir para uma modelagem centrada em entidades de mundo, capaz de representar:
- personagens
- NPCs
- faccoes
- casas
- lugares
- artefatos
- pontos narrativos relevantes

Essa camada sera a base de:
- codex do mundo
- grafo narrativo
- biblioteca visual
- memoria do mundo
- consulta rapida durante a mesa

---

## 8. Visual e produto

O toolkit nao deve parecer um admin panel generico.

A direcao visual do produto e:
- fantasia epica
- premium
- forte presenca visual
- alta legibilidade
- uso intenso em desktop

Isso significa:
- boas imagens
- hierarquia forte
- superficies bonitas
- densidade operacional
- acabamento intencional

O app deve parecer uma war room do mestre, nao um CRUD tematico.

---

## 9. Modularidade de entrega

O produto nao deve ser atacado como "vamos fazer tudo ao mesmo tempo".

A estrategia correta e:
- uma frente por vez
- um modulo de verdade por vez
- nada de MVP incompleto
- cada modulo precisa ser usavel de ponta a ponta

Ordem oficial atual:
1. Shell e Cockpit
2. Codex do Mundo
3. Grafo Narrativo
4. Biblioteca Visual
5. Forja do Mundo
6. Forja de Sessao
7. Mesa ao Vivo
8. Memoria do Mundo
9. Balanceamento T20

---

## 10. Papel futuro da IA e do Jarvis

O toolkit precisa ser forte mesmo sem automacao.

No futuro, Jarvis podera:
- operar o toolkit
- criar e editar entidades
- consultar o mundo
- ajudar em preparacao
- apoiar a mesa ao vivo

Mas isso e camada futura.

Regra presente:
- o toolkit nao pode depender do Jarvis para ser bom
- o Jarvis deve plugar em um produto forte, e nao compensar um produto fraco

---

## 11. Regras de implementacao

Toda mudanca importante deve respeitar estas regras:

- nada direto na `master`
- usar branch com prefixo `codex/`
- abrir PR para `master`
- merge via `squash merge`
- apagar a branch apos merge
- atualizar planos em `docs/` quando a frente evoluir

Os documentos de execucao vivem em:
- `docs/t20-toolkit-master-plan.md`
- `docs/attack-index.md`
- planos de frente em `docs/*-plan.md`

---

## 12. Regra final

Se uma mudanca:
- enfraquece a ideia de mundo vivo
- aumenta a fragmentacao do mestre
- empurra o produto de volta para telas isoladas
- ou transforma o toolkit em uma colecao de features sem centro

entao essa mudanca esta errada, mesmo que o codigo funcione.
