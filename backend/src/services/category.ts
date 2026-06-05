import { prisma } from "../utils/prisma.ts";
import { CreateCategoryRequest } from "../types/validation.ts";

export async function getCategories() {
    return prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
        where: { id },
        include: { products: true },
    });

    if (!category) {
        throw new Error("Category not found");
    }

    return category;
}

export async function createCategory(data: CreateCategoryRequest) {
    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
        where: { name: data.name },
    });

    if (existingCategory) {
        throw new Error("Category already exists");
    }

    return prisma.category.create({
        data,
    });
}

export async function updateCategory(id: string, data: CreateCategoryRequest) {
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
        throw new Error("Category not found");
    }

    // Check if new name already exists
    if (data.name !== category.name) {
        const existingCategory = await prisma.category.findUnique({
            where: { name: data.name },
        });

        if (existingCategory) {
            throw new Error("Category name already exists");
        }
    }

    return prisma.category.update({
        where: { id },
        data,
    });
}

export async function toggleCategoryStatus(id: string) {
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw new Error("Category not found");
    }

    return prisma.category.update({
        where: { id },
        data: { isActive: !category.isActive },
    });
}
