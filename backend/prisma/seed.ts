import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed script — ADDITIVE mode.
 *
 * - Users and Categories are upserted (safe to re-run; won't duplicate).
 * - Products are created fresh each run using a timestamp-based barcode,
 *   so running multiple times will add more sample products.
 *
 * To wipe all data first, run:
 *   npx prisma migrate reset --force
 * then re-run this seed.
 */
async function main() {
    // ── Users (upsert — idempotent) ──────────────────────────────────────────
    const hashedAdminPw = await bcryptjs.hash("admin123", 10);
    await prisma.user.upsert({
        where: { email: "admin@foodaisle.com" },
        update: {},
        create: {
            email: "admin@foodaisle.com",
            password: hashedAdminPw,
            name: "Admin",
            role: "admin",
        },
    });

    const hashedCashierPw = await bcryptjs.hash("cashier123", 10);
    await prisma.user.upsert({
        where: { email: "cashier@foodaisle.com" },
        update: {},
        create: {
            email: "cashier@foodaisle.com",
            password: hashedCashierPw,
            name: "Cashier",
            role: "cashier",
        },
    });

    // ── Categories (upsert — idempotent) ─────────────────────────────────────
    const categoryNames = ["Produce", "Dairy", "Meat", "Beverages", "Dry Goods"];
    const categories: Record<string, string> = {};

    for (const name of categoryNames) {
        const cat = await prisma.category.upsert({
            where: { name },
            update: { isActive: true },
            create: { name, isActive: true },
        });
        categories[name] = cat.id;
    }

    // ── Products (always created fresh — run multiple times to add more) ──────
    const ts = Date.now();
    const productSeed = [
        {
            name: "Trust",
            description: "Condom",
            costPrice: "180.00",
            sellingPrice: "270.00",
            category: "Produce",
        }
    ];

    const created = await Promise.all(
        productSeed.map((p, i) =>
            prisma.product.create({
                data: {
                    name: p.name,
                    barcode: `PROD-${ts}-${i + 1}`,
                    description: p.description,
                    costPrice: p.costPrice,
                    sellingPrice: p.sellingPrice,
                    categoryId: categories[p.category],
                },
            })
        )
    );

    console.log("✅ Seed completed successfully!");
    console.log(`   • 2 users ensured (admin + cashier)`);
    console.log(`   • ${categoryNames.length} categories ensured`);
    console.log(`   • ${created.length} products created`);
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
