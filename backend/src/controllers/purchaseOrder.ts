import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.ts";
import {
    CreatePurchaseOrderSchema,
    CompletePurchaseOrderSchema,
} from "../types/validation.ts";
import * as purchaseOrderService from "../services/purchaseOrder.ts";

export async function createPurchaseOrder(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const validatedData = CreatePurchaseOrderSchema.parse(req.body);
        const order = await purchaseOrderService.createPurchaseOrder(validatedData);
        sendSuccess(res, order, 201);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getPurchaseOrders(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const orders = await purchaseOrderService.getPurchaseOrders();
        sendSuccess(res, orders);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getPurchaseOrderById(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const order = await purchaseOrderService.getPurchaseOrderById(id);
        sendSuccess(res, order);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 404);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function completePurchaseOrder(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const validatedData = CompletePurchaseOrderSchema.parse(req.body);
        const order = await purchaseOrderService.completePurchaseOrder(
            id,
            validatedData
        );
        sendSuccess(res, order);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getPurchaseOrdersBySupplier(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { supplierId } = req.params;
        const orders = await purchaseOrderService.getPurchaseOrdersBySupplier(
            supplierId
        );
        sendSuccess(res, orders);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getPendingPurchaseOrders(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const orders = await purchaseOrderService.getPendingPurchaseOrders();
        sendSuccess(res, orders);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}
