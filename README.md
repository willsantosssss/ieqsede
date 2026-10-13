# Igreja do Evangelho Quadrangular Sede

Base em desenvolvimento de um aplicativo Expo/React Native com API Express/tRPC e MySQL.

**Entrega parcial para revisão. A primeira etapa ainda não está concluída e esta versão não está liberada para produção.** Consulte [as validações e pendências](docs/VALIDACAO.md).

O código foi derivado de `willsantosssss/igreja-app` por leitura e seleção de arquivos. O histórico Git, credenciais, dados de usuários, exportações de banco, uploads e artefatos do aplicativo original não foram importados. O aplicativo original não foi alterado.

## Desenvolvimento

Use Node.js 22 ou superior e npm:

```sh
npm ci
cp .env.example .env
```

Configure um banco MySQL exclusivo de desenvolvimento em `.env`. Depois:

```sh
npm run db:migrate
npm run dev
```

`npm run db:generate` gera SQL a partir do schema, sem precisar conectar ao banco. `npm run db:migrate` aplica as migrações a um banco novo e vazio: nunca use a conexão do aplicativo original. Para o banco Railway que recebeu somente a estrutura copiada, use `npm run db:prepare`; esse comando cria apenas as tabelas e colunas ausentes, é idempotente e não copia nem altera dados.

Personalização da igreja e identificadores do app: `config/church.json`. Os identificadores são provisórios e independentes do aplicativo original. Configure `EXPO_PUBLIC_API_BASE_URL` com o endereço da nova API antes de gerar uma versão para dispositivos.

## Verificação

```sh
npm run test:security
npx vitest run tests/permissions.test.ts
npm run check
npm run build
npm run export:app
```

A exportação Expo gera bundles JavaScript/Hermes. Não produz APK/IPA assinado nem comprova funcionamento em dispositivo.

## Railway

No serviço exclusivo `ieqsede`, use `DATABASE_URL=${{MySQL.MYSQL_URL}}`, `NODE_ENV=production`, `HOST=0.0.0.0` e `ALLOW_REMOTE_DATABASE=true`, somente após confirmar que o MySQL é o novo banco isolado.

O comando `npm run build` gera o bundle do servidor e também `dist/app`, necessário para servir a aplicação web. O `npm start` prepara o schema copiado com `npm run db:prepare` antes de iniciar o servidor. Para um banco novo e vazio, use `npm run db:migrate` com as dependências de desenvolvimento disponíveis. Configure `CORS_ORIGINS` para as origens web autorizadas e armazenamento persistente para a pasta `uploads` antes de usar anexos. Não coloque credenciais de banco no aplicativo mobile ou no GitHub.

O primeiro administrador deve ser uma conta criada no novo banco, promovida explicitamente com `npx tsx scripts/promote-admin.ts email-da-conta`. Não há senha administrativa padrão.
