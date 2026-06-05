import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * clearData.ts — Wipes all rows from every table.
 * Schema (fields, columns, relations) is NOT touched.
 *
 * Run with:
 *   npm run db:clear
 */
async function main() {
    console.log("🗑️  Clearing all data...\n");

    // Order matters — child tables must be cleared before parents
    await prisma.purchaseOrderItem.deleteMany();
    console.log("  ✓ purchase_order_items");

    await prisma.purchaseOrder.deleteMany();
    console.log("  ✓ purchase_orders");

    await prisma.saleItem.deleteMany();
    console.log("  ✓ sale_items");

    await prisma.sale.deleteMany();
    console.log("  ✓ sales");

    await prisma.stockMovement.deleteMany();
    console.log("  ✓ stock_movements");

    await prisma.product.deleteMany();
    console.log("  ✓ products");

    await prisma.supplier.deleteMany();
    console.log("  ✓ suppliers");

    await prisma.category.deleteMany();
    console.log("  ✓ categories");

    await prisma.user.deleteMany();
    console.log("  ✓ users");

    console.log("\n✅ All data cleared. Schema is intact.");
    console.log("   Run  npm run prisma:seed  to repopulate with default data.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Error:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
