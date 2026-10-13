CREATE TABLE `anexos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nomeArquivo` varchar(255) NOT NULL,
	`urlArquivo` varchar(500) NOT NULL,
	`tipo` varchar(50),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `anexos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aniversariantes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`dataNascimento` varchar(10) NOT NULL,
	`celula` varchar(255),
	`telefone` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aniversariantes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anotacoesDevocional` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`livro` varchar(100) NOT NULL,
	`capitulo` int NOT NULL,
	`texto` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anotacoesDevocional_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avisoImportante` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`dataExpiracao` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `avisoImportante_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `celulas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`lider` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`endereco` varchar(255) NOT NULL,
	`latitude` text NOT NULL,
	`longitude` text NOT NULL,
	`diaReuniao` varchar(50) NOT NULL,
	`horario` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `celulas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `configEscolaCrescimento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dataInicio` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configEscolaCrescimento_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `configPagamentosEventos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventoId` int NOT NULL,
	`valor` varchar(20) NOT NULL,
	`qrCodeUrl` varchar(500),
	`chavePix` varchar(255) NOT NULL,
	`nomeRecebedor` varchar(255) NOT NULL,
	`linkCredito1x` varchar(500),
	`linkCredito2x` varchar(500),
	`linkCredito3x` varchar(500),
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configPagamentosEventos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contatosIgreja` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`email` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contatosIgreja_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contribuicoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`valor` varchar(20) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`data` varchar(50) NOT NULL,
	`comprovanteUrl` varchar(500),
	`status_contribuicao` enum('pendente','confirmado','rejeitado') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contribuicoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dadosContribuicao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pixKey` varchar(255) NOT NULL,
	`pixType` enum('email','cpf','cnpj','telefone','aleatoria') NOT NULL,
	`bank` varchar(255) NOT NULL,
	`agency` varchar(50) NOT NULL,
	`account` varchar(50) NOT NULL,
	`cnpj` varchar(50) NOT NULL,
	`titular` varchar(255) NOT NULL,
	`mensagemMotivacional` text NOT NULL,
	`versiculoRef` varchar(255) NOT NULL,
	`mensagemAgradecimento` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dadosContribuicao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`data` varchar(50) NOT NULL,
	`horario` varchar(20) NOT NULL,
	`local` varchar(255) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`requireInscricao` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eventos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inscricoesBatismo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`dataNascimento` varchar(10) NOT NULL,
	`celula` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`motivacao` text NOT NULL,
	`status_batismo` enum('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
	`dataProcessamento` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inscricoesBatismo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inscricoesEscolaCrescimento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`nome` varchar(255) NOT NULL,
	`email` varchar(255),
	`celula` varchar(100),
	`curso` varchar(100),
	`status` varchar(50) DEFAULT 'confirmado',
	`dataInscricao` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `inscricoesEscolaCrescimento_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inscricoesEventos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventoId` int NOT NULL,
	`userId` int,
	`nomeInscrito` varchar(255) NOT NULL,
	`emailInscrito` varchar(255),
	`telefoneinscrito` varchar(20),
	`celulaInscrito` varchar(100),
	`dataInscricao` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `inscricoesEventos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lideres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`celula` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`email` varchar(255),
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lideres_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `noticias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text,
	`data` varchar(50),
	`destaque` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `noticias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pagamentos_eventos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inscricaoId` int NOT NULL,
	`valor` varchar(20) NOT NULL,
	`metodo` varchar(50) NOT NULL,
	`opcaoPagamento` varchar(50),
	`status` varchar(50) NOT NULL DEFAULT 'pendente',
	`comprovante` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pagamentos_eventos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pedidosOracao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`categoria` varchar(50) NOT NULL,
	`contadorOrando` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`respondido` int NOT NULL DEFAULT 0,
	`testemunho` text,
	CONSTRAINT `pedidosOracao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`atualizado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relatorios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`liderId` int NOT NULL,
	`celula` varchar(255) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`periodo` varchar(100) NOT NULL,
	`presentes` int NOT NULL,
	`novosVisitantes` int NOT NULL DEFAULT 0,
	`conversoes` int NOT NULL DEFAULT 0,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `relatorios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`tokenHash` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `sessions_tokenHash` PRIMARY KEY(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320),
	`name` text,
	`password` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`openId` varchar(64),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `usuariosCadastrados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`celula` varchar(255),
	`dataNascimento` varchar(10),
	`email` varchar(320),
	`telefone` varchar(20),
	`dataRegistro` timestamp,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usuariosCadastrados_id` PRIMARY KEY(`id`),
	CONSTRAINT `usuariosCadastrados_email_unique` UNIQUE(`email`),
	CONSTRAINT `usuariosCadastrados_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;