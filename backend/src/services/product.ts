import { prisma } from "../utils/prisma.ts";
import {
    CreateProductRequest,
    UpdateProductRequest,
} from "../types/validation.ts";

export async function getProducts() {
    return prisma.product.findMany({
        where: { isActive: true },
        include: {
            category: true,
            supplier: true,
            stockMovements: {
                orderBy: { date: "desc" },
            },
        },
    });
}

export async function getProductById(id: string) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            supplier: true,
            stockMovements: {
                orderBy: { date: "desc" },
            },
        },
    });

    if (!product) {
        throw new Error("Product not found");
    }

    return product;
}

export async function createProduct(data: CreateProductRequest) {
    // Check barcode uniqueness
    const existingProduct = await prisma.product.findUnique({
        where: { barcode: data.barcode },
    });

    if (existingProduct) {
        throw new Error("Barcode already exists");
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
    });

    if (!category) {
        throw new Error("Category not found");
    }

    // Verify supplier exists if provided
    if (data.supplierId) {
        const supplier = await prisma.supplier.findUnique({
            where: { id: data.supplierId },
        });

        if (!supplier) {
            throw new Error("Supplier not found");
        }
    }

    return prisma.product.create({
        data: {
            name: data.name,
            barcode: data.barcode,
            price: data.price,
            categoryId: data.categoryId,
            supplierId: data.supplierId || null,
        },
        include: {
            category: true,
            supplier: true,
        },
    });
}

export async function updateProduct(id: string, data: UpdateProductRequest) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
        throw new Error("Product not found");
    }

    // Check barcode uniqueness if updating
    if (data.barcode && data.barcode !== product.barcode) {
        const existingProduct = await prisma.product.findUnique({
            where: { barcode: data.barcode },
        });

        if (existingProduct) {
            throw new Error("Barcode already exists");
        }
    }

    // Verify category if updating
    if (data.categoryId) {
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
        });

        if (!category) {
            throw new Error("Category not found");
        }
    }

    // Verify supplier if updating
    if (data.supplierId) {
        const supplier = await prisma.supplier.findUnique({
            where: { id: data.supplierId },
        });

        if (!supplier) {
            throw new Error("Supplier not found");
        }
    }

    return prisma.product.update({
        where: { id },
        data,
        include: {
            category: true,
            supplier: true,
        },
    });
}

export async function deleteProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
        throw new Error("Product not found");
    }

    // Soft delete
    return prisma.product.update({
        where: { id },
        data: { isActive: false },
    });
}

export async function getProductsByCategory(categoryId: string) {
    return prisma.product.findMany({
        where: {
            categoryId,
            isActive: true,
        },
        include: {
            category: true,
            supplier: true,
            stockMovements: true,
        },
    });
}

export async function getCurrentStock(productId: string): Promise<number> {
    const movements = await prisma.stockMovement.findMany({
        where: { productId },
    });

    return movements.reduce((acc, movement) => {
        if (movement.type === "STOCK_IN") {
            return acc + movement.quantity;
        } else if (movement.type === "STOCK_OUT") {
            return acc - movement.quantity;
        }
        return acc;
    }, 0);
}

export async function getProductsWithStock() {
    const products = await prisma.product.findMany({
        where: { isActive: true },
        include: {
            category: true,
            supplier: true,
            stockMovements: true,
        },
    });

    return products.map((product) => {
        const currentStock = product.stockMovements.reduce((acc, movement) => {
            if (movement.type === "STOCK_IN") {
                return acc + movement.quantity;
            } else if (movement.type === "STOCK_OUT") {
                return acc - movement.quantity;
            }
            return acc;
        }, 0);

        return {
            ...product,
            currentStock,
        };
    });
}

export async function getLowStockProducts(threshold: number = 10) {
    const products = await getProductsWithStock();
    return products.filter((p) => p.currentStock <= threshold);
}

export async function getOutOfStockProducts() {
    const products = await getProductsWithStock();
    return products.filter((p) => p.currentStock === 0);
}
