ALTER TABLE `configEscolaCrescimento` ADD `descricaoConecte` text;--> statement-breakpoint
ALTER TABLE `configEscolaCrescimento` ADD `descricaoLidere1` text;--> statement-breakpoint
ALTER TABLE `configEscolaCrescimento` ADD `descricaoLidere2` text;--> statement-breakpoint
ALTER TABLE `configEscolaCrescimento` ADD `descricaoAvance` text;--> statement-breakpoint
ALTER TABLE `eventos` ADD `especial` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `inscricoesEventos` ADD `status` varchar(50) DEFAULT 'confirmado' NOT NULL;--> statement-breakpoint
ALTER TABLE `noticias` ADD `imagemUrl` varchar(500);