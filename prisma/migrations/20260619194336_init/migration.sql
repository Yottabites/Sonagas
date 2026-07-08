-- CreateTable
CREATE TABLE `utilizadores` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `perfil` ENUM('ADMIN', 'GESTOR_LICENCAS', 'GESTOR_ESTOQUE', 'FISCAL', 'ANALISTA', 'REVENDEDOR', 'GROSSISTA') NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `revendedorId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `utilizadores_email_key`(`email`),
    UNIQUE INDEX `utilizadores_revendedorId_key`(`revendedorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zonas_geograficas` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `provincia` VARCHAR(191) NOT NULL,
    `municipio` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agentes` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `nif` VARCHAR(191) NOT NULL,
    `contacto` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `zonaId` VARCHAR(191) NULL,
    `codigoSap` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `agentes_nif_key`(`nif`),
    UNIQUE INDEX `agentes_codigoSap_key`(`codigoSap`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `licencas` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `agenteId` VARCHAR(191) NOT NULL,
    `dataEmissao` DATETIME(3) NOT NULL,
    `dataValidade` DATETIME(3) NOT NULL,
    `status` ENUM('ATIVA', 'PENDENTE_RENOVACAO', 'EXPIRADA', 'SUSPENSA', 'CANCELADA') NOT NULL DEFAULT 'ATIVA',
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `sapReferencia` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `licencas_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `renovacoes_licenca` (
    `id` VARCHAR(191) NOT NULL,
    `licencaId` VARCHAR(191) NOT NULL,
    `dataSolicitacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataAprovacao` DATETIME(3) NULL,
    `novaValidade` DATETIME(3) NULL,
    `observacoes` TEXT NULL,
    `aprovado` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fiscalizacoes` (
    `id` VARCHAR(191) NOT NULL,
    `licencaId` VARCHAR(191) NOT NULL,
    `agenteId` VARCHAR(191) NOT NULL,
    `fiscalId` VARCHAR(191) NOT NULL,
    `dataFiscalizacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `conforme` BOOLEAN NOT NULL,
    `observacoes` TEXT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `unidade` VARCHAR(191) NOT NULL DEFAULT 'UNIDADE',
    `pesoKg` DOUBLE NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `produtos_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `armazens` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `localizacao` VARCHAR(191) NULL,
    `zonaId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lotes_estoque` (
    `id` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `armazemId` VARCHAR(191) NOT NULL,
    `codigoLote` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `dataEntrada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataValidade` DATETIME(3) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lotes_estoque_codigoLote_key`(`codigoLote`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimentos_estoque` (
    `id` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `armazemId` VARCHAR(191) NOT NULL,
    `loteId` VARCHAR(191) NULL,
    `tipo` ENUM('ENTRADA', 'SAIDA', 'AJUSTE', 'TRANSFERENCIA') NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `referenciaDoc` VARCHAR(191) NULL,
    `distribuicaoId` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `distribuicoes` (
    `id` VARCHAR(191) NOT NULL,
    `agenteId` VARCHAR(191) NOT NULL,
    `pontoVendaId` VARCHAR(191) NULL,
    `status` ENUM('PLANEADA', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADA') NOT NULL DEFAULT 'PLANEADA',
    `dataPrevista` DATETIME(3) NULL,
    `dataEntrega` DATETIME(3) NULL,
    `observacoes` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_distribuicao` (
    `id` VARCHAR(191) NOT NULL,
    `distribuicaoId` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revendedores` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `nif` VARCHAR(191) NOT NULL,
    `tipo` ENUM('REVENDEDOR', 'GROSSISTA') NOT NULL,
    `contacto` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `revendedores_nif_key`(`nif`),
    UNIQUE INDEX `revendedores_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pontos_venda` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `revendedorId` VARCHAR(191) NOT NULL,
    `zonaId` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `status` ENUM('ATIVO', 'PENDENTE_CADASTRO', 'INATIVO') NOT NULL DEFAULT 'PENDENTE_CADASTRO',
    `dataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pontos_venda_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedidos` (
    `id` VARCHAR(191) NOT NULL,
    `revendedorId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDENTE', 'APROVADO', 'EM_PROCESSAMENTO', 'CONCLUIDO', 'REJEITADO') NOT NULL DEFAULT 'PENDENTE',
    `observacoes` TEXT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_pedido` (
    `id` VARCHAR(191) NOT NULL,
    `pedidoId` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relatorios` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `tipo` ENUM('DISTRIBUICAO', 'VENDAS', 'ESTOQUE', 'LICENCAS', 'FISCALIZACAO', 'DESEMPENHO_AGENTE') NOT NULL,
    `zonaId` VARCHAR(191) NULL,
    `periodoInicio` DATETIME(3) NULL,
    `periodoFim` DATETIME(3) NULL,
    `geradoPorId` VARCHAR(191) NOT NULL,
    `dadosJson` JSON NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `utilizadores` ADD CONSTRAINT `utilizadores_revendedorId_fkey` FOREIGN KEY (`revendedorId`) REFERENCES `revendedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agentes` ADD CONSTRAINT `agentes_zonaId_fkey` FOREIGN KEY (`zonaId`) REFERENCES `zonas_geograficas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `licencas` ADD CONSTRAINT `licencas_agenteId_fkey` FOREIGN KEY (`agenteId`) REFERENCES `agentes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `renovacoes_licenca` ADD CONSTRAINT `renovacoes_licenca_licencaId_fkey` FOREIGN KEY (`licencaId`) REFERENCES `licencas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fiscalizacoes` ADD CONSTRAINT `fiscalizacoes_licencaId_fkey` FOREIGN KEY (`licencaId`) REFERENCES `licencas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fiscalizacoes` ADD CONSTRAINT `fiscalizacoes_agenteId_fkey` FOREIGN KEY (`agenteId`) REFERENCES `agentes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fiscalizacoes` ADD CONSTRAINT `fiscalizacoes_fiscalId_fkey` FOREIGN KEY (`fiscalId`) REFERENCES `utilizadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lotes_estoque` ADD CONSTRAINT `lotes_estoque_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lotes_estoque` ADD CONSTRAINT `lotes_estoque_armazemId_fkey` FOREIGN KEY (`armazemId`) REFERENCES `armazens`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_armazemId_fkey` FOREIGN KEY (`armazemId`) REFERENCES `armazens`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_loteId_fkey` FOREIGN KEY (`loteId`) REFERENCES `lotes_estoque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_distribuicaoId_fkey` FOREIGN KEY (`distribuicaoId`) REFERENCES `distribuicoes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `distribuicoes` ADD CONSTRAINT `distribuicoes_agenteId_fkey` FOREIGN KEY (`agenteId`) REFERENCES `agentes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `distribuicoes` ADD CONSTRAINT `distribuicoes_pontoVendaId_fkey` FOREIGN KEY (`pontoVendaId`) REFERENCES `pontos_venda`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_distribuicao` ADD CONSTRAINT `itens_distribuicao_distribuicaoId_fkey` FOREIGN KEY (`distribuicaoId`) REFERENCES `distribuicoes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_distribuicao` ADD CONSTRAINT `itens_distribuicao_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pontos_venda` ADD CONSTRAINT `pontos_venda_revendedorId_fkey` FOREIGN KEY (`revendedorId`) REFERENCES `revendedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pontos_venda` ADD CONSTRAINT `pontos_venda_zonaId_fkey` FOREIGN KEY (`zonaId`) REFERENCES `zonas_geograficas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidos` ADD CONSTRAINT `pedidos_revendedorId_fkey` FOREIGN KEY (`revendedorId`) REFERENCES `revendedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_pedido` ADD CONSTRAINT `itens_pedido_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `pedidos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_pedido` ADD CONSTRAINT `itens_pedido_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `relatorios` ADD CONSTRAINT `relatorios_geradoPorId_fkey` FOREIGN KEY (`geradoPorId`) REFERENCES `utilizadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
