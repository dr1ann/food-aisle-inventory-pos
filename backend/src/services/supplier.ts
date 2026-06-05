import { prisma } from "../utils/prisma.ts";
import {
    CreateSupplierRequest,
    UpdateSupplierRequest,
} from "../types/validation.ts";

export async function getSuppliers() {
    return prisma.supplier.findMany({
        where: { isActive: true },
        include: {
            orders: true,
        },
    });
}

export async function getSupplierById(id: string) {
    const supplier = await prisma.supplier.findUnique({
        where: { id },
        include: {
            orders: {
                include: {
                    items: {
                        include: { product: true },
                    },
                },
            },
        },
    });

    if (!supplier) {
        throw new Error("Supplier not found");
    }

    return supplier;
}

export async function createSupplier(data: CreateSupplierRequest) {
    return prisma.supplier.create({
        data,
    });
}

export async function updateSupplier(id: string, data: UpdateSupplierRequest) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
        throw new Error("Supplier not found");
    }

    return prisma.supplier.update({
        where: { id },
        data,
    });
}

export async function deleteSupplier(id: string) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
        throw new Error("Supplier not found");
    }

    // Soft delete
    return prisma.supplier.update({
        where: { id },
        data: { isActive: false },
    });
}
