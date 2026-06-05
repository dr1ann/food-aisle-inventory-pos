import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.ts";
import { LoginSchema } from "../types/validation.ts";
import { loginUser } from "../services/auth.ts";

export async function login(req: Request, res: Response): Promise<void> {
    try {
        const validatedData = LoginSchema.parse(req.body);
        const result = await loginUser(validatedData);
        sendSuccess(res, result, 200);
    } catch (error: unknown) {
        if (error instanceof Error) {
            sendError(res, error.message, 400);
        } else {
            sendError(res, "An error occurred", 500);
        }
    }
}

export async function getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
    }

    sendSuccess(res, {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role,
    });
}
