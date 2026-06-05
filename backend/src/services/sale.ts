import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.ts";
import { CheckoutSaleRequest } from "../types/validation.ts";

interface ConsolidatedSaleItem {
    productId: string;
    quantity: number;
}

function consolidateItems(items: CheckoutSaleRequest["items"]): ConsolidatedSaleItem[] {
    const itemMap = new Map<string, number>();

    for (const item of items) {
        itemMap.set(item.productId, (itemMap.get(item.productId) ?? 0) + item.quantity);
    }

    return Array.from(itemMap.entries()).map(([productId, quantity]) => ({
        productId,
        quantity,
    }));
}

function getReceiptNo(): string {
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `POS-${Date.now()}-${randomPart}`;
}

export async function checkoutSale(data: CheckoutSaleRequest) {
    const items = consolidateItems(data.items);
    const productIds = items.map((item) => item.productId).sort();
    const paidAmount = Number(data.paidAmount);

    return prisma.$transaction(async (tx) => {
        await tx.$queryRaw`
            SELECT id FROM products
            WHERE id IN (${Prisma.join(productIds)})
            FOR UPDATE
        `;

        const products = await tx.product.findMany({
            where: {
                id: { in: productIds },
                isActive: true,
            },
            include: {
                stockMovements: true,
            },
        });

        if (products.length !== productIds.length) {
            throw new Error("One or more products were not found");
        }

        let totalAmount = 0;
        const saleItems = items.map((item) => {
            const product = products.find((currentProduct) => currentProduct.id === item.productId);

            if (!product) {
                throw new Error(`Product ${item.productId} not found`);
            }

            const currentStock = product.stockMovements.reduce((acc, movement) => {
                if (movement.type === "STOCK_IN") {
                    return acc + movement.quantity;
                }

                if (movement.type === "STOCK_OUT") {
                    return acc - movement.quantity;
                }

                return acc;
            }, 0);

            if (item.quantity > currentStock) {
                throw new Error(
                    `Insufficient stock for ${product.name}. Current: ${currentStock}, Requested: ${item.quantity}`
                );
            }

            const unitPrice = Number(product.price);
            const lineTotal = unitPrice * item.quantity;
            totalAmount += lineTotal;

            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: unitPrice.toFixed(2),
                lineTotal: lineTotal.toFixed(2),
            };
        });

        if (paidAmount < totalAmount) {
            throw new Error("Paid amount is less than total amount");
        }

        const sale = await tx.sale.create({
            data: {
                receiptNo: getReceiptNo(),
                totalAmount: totalAmount.toFixed(2),
                paidAmount: paidAmount.toFixed(2),
                changeAmount: (paidAmount - totalAmount).toFixed(2),
                paymentMethod: data.paymentMethod,
                customerName: data.customerName ?? null,
                items: {
                    createMany: {
                        data: saleItems,
                    },
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        await tx.stockMovement.createMany({
            data: saleItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                type: "STOCK_OUT",
                notes: `POS Sale: ${sale.receiptNo}`,
            })),
        });

        return sale;
    });
}

export async function getSales() {
    return prisma.sale.findMany({
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getSaleById(id: string) {
    const sale = await prisma.sale.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!sale) {
        throw new Error("Sale not found");
    }

    return sale;
}
