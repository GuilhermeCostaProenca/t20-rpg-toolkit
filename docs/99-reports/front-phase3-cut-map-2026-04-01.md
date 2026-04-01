# Front Phase 3 Cut Map (Preparacao)

Data: 2026-04-01

## Objetivo
Definir pontos de corte para reduzir monolitos e separar apresentacao de logica sem redesign amplo.

## Modulos Criticos e Cortes

### 1. `app/campaign/[id]/page.tsx`
- Extrair para blocos compostos:
  - `CampaignHeaderMetrics`
  - `CampaignCharacterSection`
  - `CampaignSessionSection`
  - `CampaignNpcSection`
  - `CampaignMemorySection`
- Extrair hooks:
  - `useCampaignData`
  - `useCampaignCharacterActions`
  - `useCampaignSessionActions`
  - `useCampaignNpcActions`

### 2. `app/worlds/[id]/page.tsx`
- Extrair para blocos:
  - `WorldHeroHeader`
  - `WorldCampaignRadar`
  - `WorldMemoryFeed`
  - `WorldQuickActions`
- Extrair hooks:
  - `useWorldDetailData`
  - `useWorldMemoryFilters`

### 3. `app/app/play/[campaignId]/page.tsx`
- Extrair para blocos:
  - `LiveTableOrchestrator`
  - `LiveTimelineFeed`
  - `LiveMapStateSync`
  - `LiveCockpitStatePanel`
- Extrair hooks:
  - `useLiveCombatSync`
  - `useLiveEventsPolling`
  - `useLiveLocalPreferences`

## Contratos de Composicao
- UI components nao devem conhecer payload bruto de API quando houver adaptador disponivel.
- Handlers async ficam em hooks, nao em blocos visuais puros.
- Estado transacional de UI deve usar feedback global.

## Ordem de Execucao Recomendada (Fase 3)
1. Cortar `campaign/[id]`.
2. Cortar `worlds/[id]`.
3. Cortar `play/[campaignId]`.
4. Padronizar testes de componente/hooks por secao.
