import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.ts";
import {
    CreateSupplierSchema,
    UpdateSupplierSchema,
} from "../types/validation.ts";
import * as supplierService from "../services/supplier.ts";

export async function getSuppliers(req: Request, res: Response): Promise<void> {
    try {
        const suppliers = await supplierService.getSuppliers();
        sendSuccess(res, suppliers);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getSupplierById(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const supplier = await supplierService.getSupplierById(id);
        sendSuccess(res, supplier);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 404);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function createSupplier(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const validatedData = CreateSupplierSchema.parse(req.body);
        const supplier = await supplierService.createSupplier(validatedData);
        sendSuccess(res, supplier, 201);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function updateSupplier(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const validatedData = UpdateSupplierSchema.parse(req.body);
        const supplier = await supplierService.updateSupplier(id, validatedData);
        sendSuccess(res, supplier);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function deleteSupplier(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        await supplierService.deleteSupplier(id);
        sendSuccess(res, { message: "Supplier deleted successfully" });
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getSupplierProducts(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const { id } = req.params;
        const products = await supplierService.getSupplierProducts(id);
        sendSuccess(res, products);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}
