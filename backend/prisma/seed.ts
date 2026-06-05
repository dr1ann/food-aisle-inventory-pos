import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    // Clear existing data
    await prisma.purchaseOrderItem.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.product.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    const hashedPassword = await bcryptjs.hash("admin123", 10);
    await prisma.user.create({
        data: {
            email: "admin@foodaisle.com",
            password: hashedPassword,
            name: "Admin",
            role: "admin",
        },
    });

    // Create default categories
    const categories = await Promise.all([
        prisma.category.create({ data: { name: "Produce", isActive: true } }),
        prisma.category.create({ data: { name: "Dairy", isActive: true } }),
        prisma.category.create({ data: { name: "Meat", isActive: true } }),
        prisma.category.create({ data: { name: "Beverages", isActive: true } }),
        prisma.category.create({ data: { name: "Dry Goods", isActive: true } }),
    ]);

    console.log("✅ Database seeded with admin user and default categories successfully!");
    console.log(`✅ Created ${categories.length} categories:`, categories.map(c => c.name).join(", "));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
