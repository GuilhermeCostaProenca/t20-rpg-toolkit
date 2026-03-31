# Diagnostico Completo de Produto - Benchmark `vvd.world`

- Data: 2026-03-30
- Origem: pesquisa direta enviada pelo usuario (exploracao real de app, nao so landing)
- Issue Linear: `RPG-250`
- Escopo: consolidar benchmark funcional e estrategico para orientar evolucao world-first do `t20-rpg-toolkit`

## Resumo Executivo
O `vvd.world` se posiciona como sistema de worldbuilding estruturado para criadores de ficcao, com foco em transformar conhecimento disperso em um universo navegavel e publicavel. O diferencial mais forte nao e uma feature isolada, e sim a combinacao de:
- taxonomia de tipos extensivel;
- editor de entidades com relacoes nativas;
- camadas visuais operacionais (canvas, grafo, mapa);
- trilha emocional e identidade de produto (radio ambiental);
- caminho para publicacao (wiki) e autoria narrativa (`Quill`).

## O que o benchmark prova (sinais de produto)
1. `World` como workspace unificado aumenta retencao de contexto e reduz friccao entre modulos.
2. Entidade como unidade base (card + tipo + propriedades + relacoes + revisoes) viabiliza escalabilidade sem colapso organizacional.
3. Duas visualizacoes sincronizadas (canvas livre + grafo relacional) fortalecem descoberta e navegacao.
4. Publicacao nativa (`wiki`) cria saida de valor para fora do workspace, aumentando utilidade percebida.
5. Identidade sensorial (radio + ambientacao) reforca "ritual de criacao", nao apenas produtividade funcional.

## Mapa funcional consolidado (benchmark)
- Autenticacao e onboarding orientado por persona de uso.
- Dashboard de mundos com contexto visual e continuidade de trabalho.
- Home do mundo com recentes, templates e atalhos de gestao.
- Editor central de cartoes com split view, aliases, propriedades customizadas e historico.
- Tipos hierarquicos extensivos (Character/Location/Faction/Item/Event etc.) com subtipos.
- Mapa interativo com pins vinculados a entidades e zonas visuais.
- Canvas (tldraw) com composicao livre de entidades.
- Grafo relacional filtravel por tipo.
- Family Tree (beta) com reaproveitamento de personagens.
- Wiki publica com controle de visibilidade por entrada.
- `Quill` como espaco de escrita/publicacao em alpha.
- Marketplace de temas com autoria da comunidade.
- Busca global (atalho) e colaboracao em tempo real (plano pago).
- Revisoes por cartao e restauracao de versoes.
- Radio player ambiental no fluxo principal.
- Sugestao automatica de entidades no texto (NLP inferido).

## Modelo de dominio inferido no benchmark
- `World` como raiz.
- `Card` como objeto de conhecimento principal.
- `CardType` como schema/taxonomia configuravel.
- `Map`, `Canvas`, `Graph`, `FamilyTree` como documentos derivados do mesmo dominio.
- `Revision` por cartao.
- `Theme` como pacote visual de mundo.
- `User` com niveis de plano e colaboracao.
- `RadioStation` como camada de experiencia/imersao.

## Mecanica-chave de relacao observada
O `@mention` funciona como mecanismo central de aresta sem exigir formulario separado de relacionamento. Isso reduz friccao de modelagem e alimenta o grafo automaticamente.

## Implicacoes estrategicas para o T20 OS (sem desviar da arquitetura atual)
1. Reforcar `world-first` com entidade universal como lingua franca entre Codex, Grafo, Biblioteca, Forja e Mesa.
2. Tratar tipagem extensivel como eixo de escalabilidade (schema de entidade e subtipos orientados ao mestre).
3. Evoluir relacoes para fluxo hibrido:
- explicitas (editor de relacao);
- implicitas (mencao contextual com sugestao/confirmacao).
4. Fortalecer o cockpit continuo com superificies acopladas por estado compartilhado (nao por "ilhas" de pagina).
5. Planejar publicacao world-scoped como trilha futura da plataforma (apos frentes base estaveis), sem comprometer prioridade atual de A7/A9.
6. Considerar camada de imersao operacional (audio/ambiencia) como multiplicador de experiencia, nao como prioridade de fundacao.

## Anti-copia (guardrails obrigatorios)
- Nao copiar shell ou identidade visual literal do `vvd`.
- Nao importar taxonomia fixa sem aderencia ao dominio Tormenta 20.
- Nao abrir novas frentes fora da ordem oficial (`attack-index`) por efeito de benchmark.
- Nao trocar consolidacao operacional (A7/A9) por expansao de escopo de marketing/produto.

## Oportunidades acionaveis por frente (curto/medio prazo)
### A1 Shell/Cockpit
- consolidar linguagem de continuidade entre modulos com menos quebra de fluxo.
- avaliar camada de "ambient mode" opcional no cockpit (exploratorio, sem compromisso de entrega imediata).

### A2 Codex do Mundo
- priorizar tipagem/subtipagem e propriedades customizadas por tipo com UX de baixo atrito.
- amadurecer referencias cruzadas entre entidades com fluxo de mencao assistida.

### A3 Grafo Narrativo
- reforcar sincronia direta entre mudancas de entidade e leitura no grafo.
- ampliar filtros operacionais por tipo/subtipo/contexto de campanha.

### A4 Biblioteca Visual
- aproximar biblioteca das entidades como relacao nativa (capa/retrato/reveal/contexto).

### A5-A6 Forja
- usar benchmark para aumentar continuidade entre construcao de mundo e preparo de sessao.

### A7-A9 Mesa/Balanceamento
- manter prioridade de fechamento em validacao real.
- adotar benchmark apenas como insumo de UX e fluxo, sem trocar foco de confiabilidade operacional.

## Decisao recomendada de produto
Usar o `vvd.world` como benchmark de excelencia funcional em worldbuilding conectado, mantendo o `t20-rpg-toolkit` fiel ao eixo "war room do mestre de Tormenta 20", com prioridade imediata em fechamento operacional das frentes ativas e incorporacao incremental de aprendizados.
