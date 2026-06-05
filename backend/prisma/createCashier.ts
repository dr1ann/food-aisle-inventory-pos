import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const password = await bcryptjs.hash("cashier123", 10);

    await prisma.user.upsert({
        where: { email: "cashier@foodaisle.com" },
        update: {
            password,
            name: "Cashier",
            role: "cashier",
            isActive: true,
        },
        create: {
            email: "cashier@foodaisle.com",
            password,
            name: "Cashier",
            role: "cashier",
            isActive: true,
        },
    });

    console.log("Cashier account is ready: cashier@foodaisle.com / cashier123");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error: unknown) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
