import { Response } from "express";

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
    res.status(statusCode).json({
        success: true,
        data,
    } as ApiResponse<T>);
}

export function sendError(
    res: Response,
    error: string,
    statusCode: number = 400
): void {
    res.status(statusCode).json({
        success: false,
        error,
    } as ApiResponse<null>);
}
