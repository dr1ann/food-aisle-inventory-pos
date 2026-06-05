import { prisma } from "../utils/prisma.ts";
import { hashPassword, comparePassword } from "../utils/password.ts";
import { generateToken } from "../utils/jwt.ts";
import { LoginRequest, AuthResponse } from "../types/validation.ts";

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const passwordMatch = await comparePassword(data.password, user.password);
    if (!passwordMatch) {
        throw new Error("Invalid password");
    }

    const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
    };
}

export async function createUser(
    email: string,
    password: string,
    name: string,
    role: string = "staff"
) {
    const hashedPassword = await hashPassword(password);
    return prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role,
        },
    });
}
