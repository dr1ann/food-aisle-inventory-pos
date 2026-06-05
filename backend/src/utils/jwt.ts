import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";

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
