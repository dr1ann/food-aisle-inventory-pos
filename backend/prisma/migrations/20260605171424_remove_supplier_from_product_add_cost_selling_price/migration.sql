/*
  Warnings:

  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `products` table. All the data in the column will be lost.
  - Added the required column `costPrice` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellingPrice` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_supplierId_fkey`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `price`,
    DROP COLUMN `supplierId`,
    ADD COLUMN `costPrice` DECIMAL(10, 2) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `sellingPrice` DECIMAL(10, 2) NOT NULL;
