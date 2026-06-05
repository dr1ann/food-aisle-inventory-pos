// # Database Query Examples - FoodAisle Inventory System
// These are the proper Prisma/TypeScript queries to interact with the database
// Use these through the API endpoints or in service functions, NOT as hardcoded mock data

// ============ CATEGORY QUERIES ============

// CREATE - Add a new category
await prisma.category.create({
    data: {
        name: "Produce",
    },
});

// READ - Get all categories
await prisma.category.findMany();

// READ - Get category by ID
await prisma.category.findUnique({
    where: { id: "categoryId" },
});

// UPDATE - Update category
await prisma.category.update({
    where: { id: "categoryId" },
    data: { name: "New Category Name" },
});

// DELETE - Delete category
await prisma.category.delete({
    where: { id: "categoryId" },
});

// ============ SUPPLIER QUERIES ============

// CREATE - Add a new supplier
await prisma.supplier.create({
    data: {
        name: "Fresh Farms Inc",
        contactInfo: "+1-555-0101",
        address: "123 Farm St, Agriculture City",
    },
});

// READ - Get all suppliers
await prisma.supplier.findMany();

// READ - Get supplier by ID
await prisma.supplier.findUnique({
    where: { id: "supplierId" },
    include: { products: true }, // Include products from this supplier
});

// UPDATE - Update supplier
await prisma.supplier.update({
    where: { id: "supplierId" },
    data: {
        name: "Updated Supplier Name",
        contactInfo: "+1-555-9999",
    },
});

// DELETE - Delete supplier
await prisma.supplier.delete({
    where: { id: "supplierId" },
});

// ============ PRODUCT QUERIES ============

// CREATE - Add a new product
await prisma.product.create({
    data: {
        name: "Apples",
        barcode: "5901234123457",
        price: "2.99",
        categoryId: "categoryId",
        supplierId: "supplierId",
    },
});

// READ - Get all products
await prisma.product.findMany({
    include: {
        category: true,
        supplier: true,
    },
});

// READ - Get product by ID
await prisma.product.findUnique({
    where: { id: "productId" },
    include: {
        category: true,
        supplier: true,
    },
});

// READ - Get all products with stock calculation
const productsWithStock = await prisma.product.findMany({
    include: {
        category: true,
        supplier: true,
        stockMovements: {
            select: {
                quantity: true,
                type: true,
            },
        },
    },
});

// Calculate stock for each product
const productsWithCalculatedStock = productsWithStock.map(product => ({
    ...product,
    currentStock: product.stockMovements.reduce((total, movement) => {
        return movement.type === "STOCK_IN"
            ? total + movement.quantity
            : total - movement.quantity;
    }, 0),
}));

// READ - Get products by category
await prisma.product.findMany({
    where: { categoryId: "categoryId" },
});

// READ - Get low stock products (stock < 20)
const lowStockProducts = await prisma.product.findMany({
    include: {
        stockMovements: {
            select: { quantity: true, type: true },
        },
    },
});

const lowStock = lowStockProducts.filter(product => {
    const current = product.stockMovements.reduce((total, movement) => {
        return movement.type === "STOCK_IN"
            ? total + movement.quantity
            : total - movement.quantity;
    }, 0);
    return current < 20;
});

// UPDATE - Update product
await prisma.product.update({
    where: { id: "productId" },
    data: {
        name: "Updated Product Name",
        price: "3.99",
    },
});

// DELETE - Delete product
await prisma.product.delete({
    where: { id: "productId" },
});

// ============ STOCK MOVEMENT QUERIES ============

// CREATE - Record stock movement (STOCK_IN or STOCK_OUT)
await prisma.stockMovement.create({
    data: {
        productId: "productId",
        quantity: 50,
        type: "STOCK_IN", // or "STOCK_OUT"
        notes: "Received from supplier",
    },
});

// READ - Get all stock movements for a product
await prisma.stockMovement.findMany({
    where: { productId: "productId" },
    orderBy: { date: "desc" },
});

// READ - Get recent stock activity (last 30 days)
await prisma.stockMovement.findMany({
    where: {
        date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
    },
    orderBy: { date: "desc" },
    include: {
        product: true,
    },
});

// READ - Calculate total stock value
const allMovements = await prisma.stockMovement.findMany({
    include: {
        product: true,
    },
});

let totalValue = 0;
const stockByProduct = new Map();

for (const movement of allMovements) {
    const key = movement.productId;
    if (!stockByProduct.has(key)) {
        stockByProduct.set(key, { quantity: 0, price: movement.product.price });
    }
    const current = stockByProduct.get(key);
    current.quantity += movement.type === "STOCK_IN" ? movement.quantity : -movement.quantity;
}

for (const [_, value] of stockByProduct) {
    totalValue += value.quantity * parseFloat(value.price);
}

// ============ PURCHASE ORDER QUERIES ============

// CREATE - Create purchase order
await prisma.purchaseOrder.create({
    data: {
        supplierId: "supplierId",
        status: "PENDING",
        items: {
            create: [
                {
                    productId: "productId1",
                    quantity: 100,
                },
                {
                    productId: "productId2",
                    quantity: 50,
                },
            ],
        },
    },
    include: {
        items: true,
    },
});

// READ - Get all purchase orders
await prisma.purchaseOrder.findMany({
    include: {
        supplier: true,
        items: {
            include: {
                product: true,
            },
        },
    },
});

// READ - Get pending purchase orders
await prisma.purchaseOrder.findMany({
    where: { status: "PENDING" },
    include: {
        supplier: true,
        items: {
            include: {
                product: true,
            },
        },
    },
});

// READ - Get purchase order by ID
await prisma.purchaseOrder.findUnique({
    where: { id: "orderId" },
    include: {
        supplier: true,
        items: {
            include: {
                product: true,
            },
        },
    },
});

// UPDATE - Complete purchase order (with atomic transaction)
await prisma.$transaction(async (tx) => {
    // Update order status
    await tx.purchaseOrder.update({
        where: { id: "orderId" },
        data: { status: "COMPLETED" },
    });

    // Get order items
    const orderItems = await tx.purchaseOrderItem.findMany({
        where: { orderId: "orderId" },
    });

    // Update receivedQty and create stock movements
    for (const item of orderItems) {
        await tx.purchaseOrderItem.update({
            where: { id: item.id },
            data: { receivedQty: item.quantity },
        });

        await tx.stockMovement.create({
            data: {
                productId: item.productId,
                quantity: item.quantity,
                type: "STOCK_IN",
                notes: `Received from purchase order ${orderId}`,
            },
        });
    }
});

// ============ USER QUERIES ============

// CREATE - Create new user
const hashedPassword = await bcryptjs.hash("password123", 10);
await prisma.user.create({
    data: {
        email: "user@example.com",
        password: hashedPassword,
        name: "User Name",
        role: "staff", // or "admin"
    },
});

// READ - Get user by email
await prisma.user.findUnique({
    where: { email: "admin@foodaisle.com" },
});

// READ - Get all users
await prisma.user.findMany();

// UPDATE - Update user
await prisma.user.update({
    where: { id: "userId" },
    data: {
        name: "Updated Name",
        isActive: true,
    },
});

// DELETE - Delete user
await prisma.user.delete({
    where: { id: "userId" },
});

// ============ USAGE IN API ENDPOINTS ============
// These queries should be used in service files like:
// - backend/src/services/product.ts
// - backend/src/services/stock.ts
// - backend/src/services/supplier.ts
// - backend/src/services/category.ts
// - backend/src/services/purchaseOrder.ts
// - backend/src/services/auth.ts

// Example service function:
export async function getProductsWithStock() {
    const products = await prisma.product.findMany({
        include: {
            category: true,
            supplier: true,
            stockMovements: {
                select: {
                    quantity: true,
                    type: true,
                },
            },
        },
    });

    return products.map(product => ({
        ...product,
        currentStock: product.stockMovements.reduce((total, movement) => {
            return movement.type === "STOCK_IN"
                ? total + movement.quantity
                : total - movement.quantity;
        }, 0),
    }));
}
