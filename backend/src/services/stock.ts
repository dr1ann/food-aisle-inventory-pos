import { prisma } from "../utils/prisma.ts";
import { CreateStockMovementRequest } from "../types/validation.ts";
import { getCurrentStock } from "./product.ts";

export async function recordStockMovement(data: CreateStockMovementRequest) {
    // Verify product exists
    const product = await prisma.product.findUnique({
        where: { id: data.productId },
    });

    if (!product) {
        throw new Error("Product not found");
    }

    // Get current stock
    const currentStock = await getCurrentStock(data.productId);

    // Prevent negative stock for STOCK_OUT
    if (data.type === "STOCK_OUT") {
        const newStock = currentStock - data.quantity;
        if (newStock < 0) {
            throw new Error(
                `Insufficient stock. Current: ${currentStock}, Attempting to remove: ${data.quantity}`
            );
        }
    }

    // Validate quantity is positive
    if (data.quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
    }

    return prisma.stockMovement.create({
        data: {
            productId: data.productId,
            quantity: data.quantity,
            type: data.type,
            notes: data.notes || null,
        },
    });
}

export async function getStockMovements(productId: string) {
    return prisma.stockMovement.findMany({
        where: { productId },
        include: { product: true },
        orderBy: { date: "desc" },
    });
}

export async function getRecentStockActivity(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return prisma.stockMovement.findMany({
        where: {
            date: {
                gte: startDate,
            },
        },
        include: { product: true },
        orderBy: { date: "desc" },
    });
}

export async function getTotalStockValue() {
    const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { stockMovements: true },
    });

    let totalValue = 0;

    for (const product of products) {
        const currentStock = product.stockMovements.reduce((acc, movement) => {
            if (movement.type === "STOCK_IN") {
                return acc + movement.quantity;
            } else if (movement.type === "STOCK_OUT") {
                return acc - movement.quantity;
            }
            return acc;
        }, 0);

        totalValue += parseFloat(product.price.toString()) * currentStock;
    }

    return totalValue;
}
