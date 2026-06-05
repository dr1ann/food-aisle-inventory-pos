import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.ts";
import {
    CreateProductSchema,
    UpdateProductSchema,
} from "../types/validation.ts";
import * as productService from "../services/product.ts";

export async function getProducts(req: Request, res: Response): Promise<void> {
    try {
        const products = await productService.getProducts();
        sendSuccess(res, products);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getProductById(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const product = await productService.getProductById(id);
        sendSuccess(res, product);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 404);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function createProduct(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const validatedData = CreateProductSchema.parse(req.body);
        const product = await productService.createProduct(validatedData);
        sendSuccess(res, product, 201);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function updateProduct(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const validatedData = UpdateProductSchema.parse(req.body);
        const product = await productService.updateProduct(id, validatedData);
        sendSuccess(res, product);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function deleteProduct(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        await productService.deleteProduct(id);
        sendSuccess(res, { message: "Product deleted successfully" });
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getProductsByCategory(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { categoryId } = req.params;
        const products = await productService.getProductsByCategory(categoryId);
        sendSuccess(res, products);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getLowStockProducts(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const threshold = req.query.threshold
            ? parseInt(req.query.threshold as string)
            : 10;
        const products = await productService.getLowStockProducts(threshold);
        sendSuccess(res, products);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getOutOfStockProducts(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const products = await productService.getOutOfStockProducts();
        sendSuccess(res, products);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getProductsWithStock(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const products = await productService.getProductsWithStock();
        sendSuccess(res, products);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}
