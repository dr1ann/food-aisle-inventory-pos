import { prisma } from "../utils/prisma.ts";
import {
    CreatePurchaseOrderRequest,
    CompletePurchaseOrderRequest,
} from "../types/validation.ts";

export async function createPurchaseOrder(data: CreatePurchaseOrderRequest) {
    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId },
    });

    if (!supplier) {
        throw new Error("Supplier not found");
    }

    // Verify all products exist
    for (const item of data.items) {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
        });

        if (!product) {
            throw new Error(`Product ${item.productId} not found`);
        }
    }

    // Create purchase order with items in transaction
    return prisma.purchaseOrder.create({
        data: {
            supplierId: data.supplierId,
            items: {
                createMany: {
                    data: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                },
            },
        },
        include: {
            supplier: true,
            items: {
                include: { product: true },
            },
        },
    });
}

export async function getPurchaseOrders() {
    return prisma.purchaseOrder.findMany({
        include: {
            supplier: true,
            items: {
                include: { product: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getPurchaseOrderById(id: string) {
    const order = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
            supplier: true,
            items: {
                include: { product: true },
            },
        },
    });

    if (!order) {
        throw new Error("Purchase order not found");
    }

    return order;
}

export async function completePurchaseOrder(
    orderId: string,
    data: CompletePurchaseOrderRequest
) {
    // Get the order
    const order = await prisma.purchaseOrder.findUnique({
        where: { id: orderId },
        include: { items: true },
    });

    if (!order) {
        throw new Error("Purchase order not found");
    }

    if (order.status === "COMPLETED") {
        throw new Error("Order already completed");
    }

    // Use transaction to ensure atomic operation
    return prisma.$transaction(async (tx) => {
        // Update purchase order status
        const updatedOrder = await tx.purchaseOrder.update({
            where: { id: orderId },
            data: { status: "COMPLETED" },
        });

        // Create stock movements for each item
        for (const item of data.items) {
            const orderItem = order.items.find((oi) => oi.productId === item.productId);

            if (!orderItem) {
                throw new Error(`Item ${item.productId} not in order`);
            }

            // Update received quantity
            await tx.purchaseOrderItem.update({
                where: { id: orderItem.id },
                data: { receivedQty: item.receivedQty },
            });

            // Create stock movement
            if (item.receivedQty > 0) {
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        quantity: item.receivedQty,
                        type: "STOCK_IN",
                        notes: `Purchase Order: ${orderId}`,
                    },
                });
            }
        }

        return tx.purchaseOrder.findUnique({
            where: { id: orderId },
            include: {
                supplier: true,
                items: {
                    include: { product: true },
                },
            },
        });
    });
}

export async function getPurchaseOrdersBySupplier(supplierId: string) {
    return prisma.purchaseOrder.findMany({
        where: { supplierId },
        include: {
            supplier: true,
            items: {
                include: { product: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getPendingPurchaseOrders() {
    return prisma.purchaseOrder.findMany({
        where: { status: "PENDING" },
        include: {
            supplier: true,
            items: {
                include: { product: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
