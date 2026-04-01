# Front Foundation Guidelines (Fase 1+2)

Data: 2026-04-01

## Objetivo
Estabilizar o front-end com padrao unico de componentes, feedback e formularios sem alterar backend/regra de negocio.

## Primitives Canonicas
- `Button`: variantes oficiais (`default`, `secondary`, `outline`, `ghost`, `destructive`) e estado `disabled/loading`.
- `Input` e `Textarea`: sem override ad hoc de borda/altura fora de casos justificados.
- `Select`: usar `@/components/ui/select` como padrao unico.
- `Dialog`: usar `@/components/ui/dialog`; acoes destrutivas via `confirmDestructive`.
- `Card`: uso para blocos de conteudo; para superficie operacional usar `Panel`.
- `Panel`: variantes `default`, `elevated`, `danger`.
- States: `EmptyState`, `LoadingState`, `ErrorState` em `@/components/ui/states`.

## Feedback Global
- Provedor obrigatorio: `AppFeedbackProvider` no layout raiz.
- Sucesso: `notifySuccess` (duracao curta).
- Erro: `notifyError` (persistente quando `critical=true`).
- Loading transacional: `notifyPending` + `dismiss`.
- Confirmacao destrutiva: `confirmDestructive`.
- Proibido: `alert()` e `confirm()` nativos.

## Formularios
- Padrao: `react-hook-form` + `zodResolver`.
- Wrappers obrigatorios: `Form`, `FormField`, `FormControl`, `FormLabel`, `FormMessage`.
- Regras:
  - validar no submit;
  - revalidar em `onChange` apos erro;
  - botao de submit bloqueado em pending;
  - erro de campo + erro de formulario (`root`) quando necessario;
  - sucesso explicito via feedback global.

## Layout/Composicao
- Presets de composicao:
  - `PageContainer`
  - `SectionStack`
  - `Toolbar`
- Evitar classes soltas repetidas para estruturas de container.

## Checklist de Revisao de UI
- [ ] Sem `alert/confirm`.
- [ ] Sem `<select>` nativo estilizado localmente.
- [ ] Estados loading/error/empty usando componentes canonicos.
- [ ] Formularios com RHF + Zod.
- [ ] Acoes destrutivas com `confirmDestructive`.
- [ ] Feedback de sucesso/erro consistente.
