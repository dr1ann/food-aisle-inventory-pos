import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.ts";
import { CheckoutSaleSchema } from "../types/validation.ts";
import * as saleService from "../services/sale.ts";

export async function checkoutSale(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const validatedData = CheckoutSaleSchema.parse(req.body);
        const sale = await saleService.checkoutSale(validatedData);
        sendSuccess(res, sale, 201);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getSales(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const sales = await saleService.getSales();
        sendSuccess(res, sales);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getSaleById(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const sale = await saleService.getSaleById(id);
        sendSuccess(res, sale);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 404);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}
