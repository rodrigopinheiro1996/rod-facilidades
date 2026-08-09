# Contrato técnico — Rodrigo Facilidades

Este diretório congela a estrutura e o comportamento observados antes da refatoração interna.

Ele não é carregado por `index.html` e contém somente dados fictícios, inventários, hashes e evidências de teste.

## Conteúdo

- `contract.json`: inventário estrutural, chaves, formatos, hashes e contagens.
- `static-content.json`: conteúdo integral das bases e orientações congeladas.
- `fixtures/`: entradas exclusivamente fictícias usadas nos testes de caracterização.
- `expected/`: resultados e HTML produzidos pelo comportamento atual.
- `visual/computed-styles.json`: estilos computados nas larguras aprovadas, sem capturas volumosas.
- `verify-contract.mjs`: verificação somente leitura dos elementos estruturais e blocos congelados.

## Verificação

Execute a partir da raiz do projeto:

```powershell
node contract/verify-contract.mjs
```

O script não escreve no projeto nem abre a aplicação. Ele retorna código diferente de zero quando detecta mudança no contrato registrado.

## Limites

- O hash do Supabase é registrado sem expor a URL completa ou a chave.
- O bookmarklet é protegido por hash; seu código integral continua apenas no `index.html`.
- Fixtures não representam clientes, contratos ou conversas reais.
- Resultados com data são descritos por cenário relativo ao dia da execução.
