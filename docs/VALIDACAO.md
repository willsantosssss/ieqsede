# Registro de progresso — 12/09/2026

## Estado da entrega

**Parcial, em revisão. Não declarar a primeira etapa concluída. Não publicar em produção.**

Este registro documenta código implementado e verificações locais. Ainda não existe validação de integração com o MySQL novo do Railway, teste em dispositivo ou revisão completa das funcionalidades herdadas.

## Implementado

- Código selecionado da origem `willsantosssss/igreja-app`, sem importar seu histórico Git, credenciais de assinatura, exports, dados de usuários ou uploads.
- Configuração própria em `config/church.json`, novos identificadores, novas chaves de sessão e API local por padrão, sem fallback para a produção original.
- Senhas com scrypt e salt aleatório; rejeição de hashes SHA-256 legados. Sessões opacas com hash no banco, expiração e revogação.
- Autorização no servidor, operações administrativas restritas, validação de líder e escopo de célula, anotações vinculadas ao usuário autenticado.
- Respostas de autenticação sem hash de senha; remoção de senha administrativa fixa e autenticação local de líder por senha.
- Controle de origem, limites de requisições e uploads PDF autenticados.
- Home inicial sem fotos de pessoas ou células; cache de cinco minutos substitui polling de 30 segundos em pontos revisados.
- Remoção dos exemplos iniciais de eventos, notícias e pedidos de oração; dados bancários e contatos antigos esvaziados.
- Migração inicial MySQL com 23 tabelas, incluindo sessões. Arquivos SQL gerados sem conexão a nenhum banco.

## Verificações executadas neste ambiente

| Comando | Resultado |
| --- | --- |
| `npm run test:security` | 3 testes aprovados: senhas/salt, classificação de acesso e bloqueio de banco remoto não autorizado. |
| `npx vitest run tests/permissions.test.ts` | 8 testes aprovados: visitantes/membros/admin, escopo de líder, dono das anotações, ocultação de hash e revogação no logout. |
| `npm run check` | Concluído sem erros. Há arquivos herdados com `@ts-nocheck`, portanto a cobertura de tipos é parcial. |
| `npm run build` | Bundle do servidor gerado com esbuild. |
| `npx expo export --platform all --output-dir dist/app` | Exportação web, Android e iOS concluída. Não é build nativo assinado nem teste de execução. |
| `npm run db:generate` | Gerado `0000_melodic_supernaut.sql` com 23 tabelas. Não aplicado ao Railway. |

Os testes de autorização usam mocks do banco. Não verificam SQL real, persistência, conexão ou comportamento ponta a ponta. Os bundles ficam fora do Git; os comandos permitem reproduzi-los.

## Pendências para concluir a primeira etapa

1. Aplicar e testar as migrações em MySQL isolado; validar cadastro, login, expiração/revogação, relacionamentos e CRUD real.
2. Revisar os fluxos herdados do líder e administração: ainda há helpers em AsyncStorage e telas que consultam listas hoje restritas. Não ampliar permissões para contornar essas incompatibilidades.
3. Revisar sessão e armazenamento na web, cache após logout e privacidade dos dados retornados pelas rotas públicas.
4. Validar o limitador atrás do proxy do Railway: ele usa o endereço do socket e pode agrupar usuários. Não há limitador distribuído.
5. Configurar armazenamento persistente de anexos, CORS da nova API, backups e recuperação do novo banco. Recuperação de senha ainda não implementada.
6. Revisar a interface completa em dispositivo, navegação e notificações; completar identidade da igreja e retirar infraestrutura legada não utilizada.
7. Executar teste ponta a ponta com contas fictícias de membro, líder e administrador; registrar resultados antes de liberar a versão.

Não houve acesso ao banco de produção original, publicação nas lojas ou implantação do servidor neste trabalho. A informação de MySQL online no Railway veio do print fornecido pelo usuário; ela não comprova conexão do aplicativo nem existência das tabelas.
