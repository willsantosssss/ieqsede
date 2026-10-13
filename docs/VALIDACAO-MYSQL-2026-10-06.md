# Integração MySQL — validação de 06/10/2026

## Resultado

Integração existente validada novamente com sucesso em MySQL real, isolado e descartável. Não foi necessária alteração de código nesta execução. Este registro atualiza a pendência de confirmação do CI nos registros anteriores; não declara toda a primeira etapa concluída.

- Código validado: `295c4c5e8da661bd0565b156e3bf7d2801ecc94a`, branch `work/base-ieqsede`.
- Execução: https://github.com/willsantosssss/ieqsede/actions/runs/36165948384
- Job desta reexecução: https://github.com/willsantosssss/ieqsede/actions/runs/36165948384/job/112328892506
- Integração concluída em 06/10/2026 às 14:43:38 UTC (10:43:38 America/Cuiaba).
- MySQL 8.4.11, banco novo e vazio `ieqsede_test`, localhost, dados fictícios.
- Resultado do teste integrado: 1 aprovado, 0 falhas, 0 ignorados. Logs conferidos, além do status do job.

## Fluxos exercitados

O arquivo `tests/mysql.integration.ts` aplica as migrações reais e verifica pelo menos 23 tabelas. Exercita cadastro, normalização de email, login, senha incorreta, duplicidade, sessão opaca, perfil sem senha, expiração e revogação.

Valida autorização administrativa, propriedade de anotações e inscrições, cadastro de membro, resposta limitada de aniversariantes, criação/consulta/atualização/exclusão de eventos, inscrição com pagamento pendente e confirmação do pagamento. Confere que o cliente não pode atribuir inscrição a outro usuário. Verifica consultas do líder restritas à própria célula e bloqueio de liderança inativa.

Inicia o servidor compilado e verifica HTTP real: readiness, login com cookie HttpOnly/SameSite=Lax, sessão autenticada, rejeição de origem não permitida, HTML em /, /login e /agenda, logout e resposta 401 depois da revogação.

## Outras verificações aprovadas no mesmo job

- `npm ci`
- `npm run check`
- `npm run test:security`
- `npm test -- tests/permissions.test.ts tests/session-storage.test.ts`
- `npm run build`
- `npm run export:app` (web, Android e iOS)
- `node --import tsx --test tests/mysql.integration.ts`

## Limitações

Não houve conexão, migração ou implantação no Railway nesta validação. Não foram acessados dados de produção nem alterado o aplicativo original. O teste requer banco local novo e vazio; não deve ser apontado para um banco existente.

Respostas HTTP de HTML não comprovam renderização ou interação visual. Exportações Expo não equivalem a APK/IPA assinado ou execução em dispositivos. Arquivos herdados ainda usam @ts-nocheck, limitando a checagem de tipos. A cobertura não comprova todos os relacionamentos, rollback de todas as operações, concorrência ou todos os fluxos herdados.

Continuam pendentes a homologação do Railway (conexão própria, proxy, CORS, anexos persistentes e backups), revisão dos demais fluxos e privacidade, navegação visual e dispositivos. A primeira etapa completa permanece parcial.
