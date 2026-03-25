# T20 RPG Toolkit - Front Cleanup Zero Plan

## Como usar
- Marque `[x]` quando concluido
- Use `[-]` para em andamento
- Use `[ ]` para pendente
- Atualize a linha `Notas:` com contexto curto, branch, PR ou decisao

---

## Objetivo

Executar a limpeza minima necessaria para a Atualizacao 1 sem desmontar o produto em producao.

Esta frente existe para:
- remover ruido visual obvio;
- tirar superfices de demo do centro do app;
- isolar material de referencia do lint e do build do produto principal;
- preparar o shell novo sem apagar o backend util.

---

## Workflow obrigatorio desta frente

### Branch recomendada
- `codex/front-cleanup-zero`

### Commit pattern recomendado
- `refactor(front): replace legacy dashboard entry`
- `chore(tooling): exclude references from app lint and build`
- `refactor(shell): remove legacy navigation noise`

### Merge policy
- merge em `master` via `squash merge`;
- branch apagada apos merge;
- nenhum item de cleanup fica preso em branch longa.

---

## Checklist Mestre

- [x] F0. Isolar `references/` e `.claude/` do lint e do typecheck do app
  Notas: `eslint.config.mjs` e `tsconfig.json` atualizados.

- [x] F1. Substituir a entrada global com mock e branding misturado
  Notas: `/app` refeito como painel real do mestre.

- [x] F2. Reposicionar `/app/worlds` como biblioteca premium de mundos
  Notas: Biblioteca redesenhada e integrada ao novo shell.

- [x] F3. Tirar a navegacao global antiga do centro do produto
  Notas: Sidebar global reduzida para painel e mundos.

- [x] F4. Mapear paginas antigas que ainda sobrevivem como legado
  Notas: Rotas globais de personagens, NPCs, locais, diario e compendio viraram bridges oficiais para o fluxo world-scoped. Comunidade ficou em quarentena declarada.

- [-] F5. Encerrar a frente com inventario fechado do que continua legado
  Notas: Biblioteca documental foi alinhada ao novo shell; ainda falta decidir o destino final de `community` e de outras superfices secundarias apos o Codex.

---

## Criterios de aceite

- o app principal compila sem depender de `references/`;
- o novo shell vira a entrada oficial do produto;
- dashboard antigo deixa de ser a cara do sistema;
- a biblioteca de mundos deixa de parecer lista utilitaria;
- o caminho principal de navegacao nao expõe mais o front legado.

---

## Fora de escopo

- limpar todo o passivo antigo de lint do repo;
- remover toda rota legada imediatamente;
- mexer no backend por motivo puramente estetico;
- iniciar o `Codex do Mundo`.
