import jwt from "jsonwebtoken";
import { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "default_secret";
const JWT_EXPIRY: SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRY as SignOptions["expiresIn"] | undefined) || "7d";

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JWTPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        throw new Error("Invalid token");
    }
}

export function extractToken(authHeader: string | undefined): string {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Missing or invalid authorization header");
    }
    return authHeader.slice(7);
}
