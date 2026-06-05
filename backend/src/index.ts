import express from "express";
import cors from "cors";
import "dotenv/config";

// Routes
import authRoutes from "./routes/auth.ts";
import productRoutes from "./routes/product.ts";
import stockRoutes from "./routes/stock.ts";
import supplierRoutes from "./routes/supplier.ts";
import categoryRoutes from "./routes/category.ts";
import purchaseOrderRoutes from "./routes/purchaseOrder.ts";

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Middleware
app.use(express.json());
app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running" });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response) => {
    console.error(err);
    res.status(500).json({
        success: false,
        error: "Internal server error",
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📍 Frontend CORS allowed: ${FRONTEND_URL}`);
    console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
});

export default app;
