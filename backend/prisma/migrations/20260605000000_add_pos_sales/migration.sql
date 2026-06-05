-- CreateTable
CREATE TABLE `sales` (
    `id` VARCHAR(191) NOT NULL,
    `receiptNo` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `paidAmount` DECIMAL(10, 2) NOT NULL,
    `changeAmount` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'CASH',
    `customerName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sales_receiptNo_key`(`receiptNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sale_items` (
    `id` VARCHAR(191) NOT NULL,
    `saleId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `lineTotal` DECIMAL(10, 2) NOT NULL,

    INDEX `sale_items_saleId_idx`(`saleId`),
    INDEX `sale_items_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sale_items` ADD CONSTRAINT `sale_items_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_items` ADD CONSTRAINT `sale_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
