# Mesa ao Vivo - Validacao de Fluxo (M6.4)

Data: 2026-03-25  
Escopo: `play/[campaignId]` e sidebar operacional

## Objetivo

Validar se o fluxo principal da mesa ao vivo permanece continuo durante:
- operacao de combate;
- consulta rapida de entidades/NPCs;
- reveal + referencias visuais;
- suporte operacional (trilha, notas e atalho de busca).

## Cenarios validados

1. Operacao tatico-narrativa no mesmo cockpit
- `LiveWarRoom` alterna narrativo/tatico por estado de combate.
- Overlay de turno e controles de round permanecem no mapa.
- `CombatTracker` e `LivePrepCockpit` reagem ao mesmo `liveCombat`.

2. Encontro preparado sem quebra de contexto
- Inimigos do encontro possuem:
  - `Consultar` para abrir inspect do NPC;
  - `Convocar` no combate ativo com controle de quantidade.

3. Estado operacional do grupo
- Card `Estado da mesa` mostra:
  - HP/PM/SAN medio;
  - quedas;
  - alertas de faixas baixas.
- Poll dedicado de personagens sem depender do modo tatico.

4. Suporte de mesa sem app externo
- Card `Trilha da sessao` com slots `Ambiental` e `Combate`.
- `Bloco do mestre` persistido por campanha.
- Atalhos `Ctrl+K` / `Cmd+K` (busca), `Alt+1..4` (secoes) e `Alt+5` (chat).
- Presets de foco (`Narrativo`/`Tatico`) e controles de densidade de paineis.

5. Reducao de troca de contexto
- Atalho `Abrir Atlas` abre em nova aba e preserva a mesa ativa.
- Poll de eventos evita `setEvents` redundante quando nao ha mudanca.
- Historico/chat pode ser ocultado em foco tatico sem troca de rota/modal.
- Header expoe prontidao operacional `X/5` do checklist.

## Ajustes tecnicos aplicados nesta rodada

- `fix(live): unify event polling in play cockpit` (`1fb55f5`)
- `feat(live): add session soundtrack surface` (`77ec9a5`)
- `feat(live): add party status summary to sidebar` (`be769e0`)
- `feat(live): add npc quick inspect from encounters` (`6224fa9`)
- `feat(live): add quick search shortcut in play` (`df41695`)
- `feat(live): add gm scratchpad to live sidebar` (`da935d2`)
- `fix(live): keep cockpit active when opening atlas` (`1020105`)
- ajuste atual de fingerprint no poll de eventos (nao-render redundante)
- `vitest.config.ts` ajustado para excluir `references/**` e `.claude/**` da suite principal

## Validacao automatizada

- `npm run test:run` (2026-03-25): **passou** no escopo principal do produto (`4 files / 13 tests`).

## Estado de M5/M6 apos validacao

- M5.1: `[x]` (superficie de trilha entregue com persistencia local)
- M5.2: `[x]` (estado operacional de PCs entregue em resumo vivo)
- M5.3: `[x]` (consulta de NPC improvisado no encontro)
- M5.4: `[x]` (atalhos de busca e convivencia de fluxo no cockpit)
- M5.5: `[x]` (bloco do mestre persistente)
- M6.1: `[x]` (reduzida saida forcada da tela principal)
- M6.2: `[x]` (atalhos e acessos rapidos consolidados)
- M6.3: `[x]` (menos troca de rota/modal em operacao)
- M6.4: `[x]` (validacao de fluxo principal executada)
- M6.5: `[x]` (criterio operacional fechado com checklist objetivo)

## Proximo passo sugerido

Repetir o checklist `Pronto para mesa` em sessao real como validacao continua da frente e concentrar o proximo ciclo em M4 (`reveal`/referencia visual), que permanece principal pendencia da mesa ao vivo.
