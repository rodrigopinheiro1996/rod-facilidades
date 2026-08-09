# Relatório do Passe 0 — contrato técnico

## Contagens

- IDs estáticos únicos: 106.
- Navegações `data-view`: 5; todos possuem painel `view-*` correspondente.
- Chaves explícitas de localStorage do painel e bookmarklet: 11.
- Chave de autenticação do Supabase derivada em runtime: 1 padrão documentado e redigido.
- IndexedDB: 1 banco, 1 object store e 1 chave de registro.
- Bancos destacados: 11.
- Bancos da lista completa: 93.
- Ocorrências: 55.
- Cartões do JIRA: 7.
- Notas complementares do JIRA: 3.
- Itens congelados do JIRA: 10.

## Hashes principais — SHA-256

- `index.html`: `56cfc726199964f5a830b4c5b67f979a34eb89cc47a3151605923c03e362ecd2`.
- `bookmarkletCode()`: `a68c4ad7b107e1c6dbc21b6ca269886bfe393a3a1daab0322a9bffe9ed986897`.
- Conteúdo estático canônico: `cd8c29cf1351cb9e3d9f69855b8c5b852760445cabb01466daed7fc5db2d2b2f`.
- HTML dos cartões fictícios: `998876bfc1bea0a15a13bd07211d166bff14632ea63eca00bd94450aba203f2f`.
- Configuração de URL do Supabase, valor redigido: `93ecdd53eced24c7219c219a16e0c4bd6bd47da68e1b59b3d65cac054f0ced22`.
- Chave anônima configurada do Supabase, valor redigido: `8286533bc2dad6b6776228c683ab94c87e5ab6ae248bccdcdcf34143cb7f5630`.

Hashes adicionais dos blocos congelados e de cada evidência estão em `contract.json`.

## Resultados conhecidos

- Busca de macros por `fixture_favorita`: 1 cartão.
- Busca pelo conteúdo `Conteúdo de teste`: 0 cartões, preservando a busca somente por atalho.
- Saldo fictício: original R$ 1.000,00; desconto R$ 100,00; pago R$ 200,00; saldo R$ 700,00.
- Ponto fictício: ajuste +01:45; total diário e semanal mínimo 01:45; saldo −02:15; progresso 43,75% de 04:00.

## Responsividade

- 1440 px: sem rolagem horizontal.
- 768 px: sem rolagem horizontal.
- 390 px: sem rolagem horizontal.
- 320 px: sem rolagem horizontal.
- Console: nenhum aviso ou erro registrado durante as capturas.

## Segurança

- Nenhum dado real foi utilizado.
- Nenhuma URL completa ou chave do Supabase foi copiada para esta pasta.
- O backup congelado possui somente `version`, `updatedAt`, `macros`, `ponto` e `ocorrencias_uses`.
- Saldo devedor, tema e informações locais do chat continuam explicitamente fora do backup.
- Esta pasta não é referenciada nem carregada por `index.html`.
