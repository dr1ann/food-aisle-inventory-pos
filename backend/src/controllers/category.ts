import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.ts";
import { CreateCategorySchema } from "../types/validation.ts";
import * as categoryService from "../services/category.ts";

export async function getCategories(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const categories = await categoryService.getCategories();
        sendSuccess(res, categories);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getCategoryById(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);
        sendSuccess(res, category);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 404);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function createCategory(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const validatedData = CreateCategorySchema.parse(req.body);
        const category = await categoryService.createCategory(validatedData);
        sendSuccess(res, category, 201);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function updateCategory(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const validatedData = CreateCategorySchema.parse(req.body);
        const category = await categoryService.updateCategory(id, validatedData);
        sendSuccess(res, category);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function deleteCategory(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const category = await categoryService.toggleCategoryStatus(id);
        sendSuccess(res, {
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
            category,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}
