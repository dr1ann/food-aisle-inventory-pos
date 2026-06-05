import { Request, Response, NextFunction } from "express";
import { verifyToken, extractToken, JWTPayload } from "../utils/jwt.ts";
import { sendError } from "../utils/response.ts";

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    try {
        const token = extractToken(req.headers.authorization);
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        sendError(res, "Unauthorized", 401);
    }
}

export function roleMiddleware(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            sendError(res, "Forbidden", 403);
            return;
        }
        next();
    };
}
