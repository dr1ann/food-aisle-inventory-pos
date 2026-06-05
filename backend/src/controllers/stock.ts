import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.ts";
import { CreateStockMovementSchema } from "../types/validation.ts";
import * as stockService from "../services/stock.ts";

export async function recordStockMovement(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const validatedData = CreateStockMovementSchema.parse(req.body);
        const movement = await stockService.recordStockMovement(validatedData);
        sendSuccess(res, movement, 201);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getStockMovements(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { productId } = req.params;
        const movements = await stockService.getStockMovements(productId);
        sendSuccess(res, movements);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getRecentStockActivity(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const days = req.query.days ? parseInt(req.query.days as string) : 7;
        const activity = await stockService.getRecentStockActivity(days);
        sendSuccess(res, activity);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getTotalStockValue(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const value = await stockService.getTotalStockValue();
        sendSuccess(res, { totalValue: value.toFixed(2) });
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}
