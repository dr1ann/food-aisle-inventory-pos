import { Router } from "express";
import { authMiddleware } from "../middleware/auth.ts";
import * as productController from "../controllers/product.ts";

const router = Router();

router.get("/", authMiddleware, productController.getProducts);
router.get("/with-stock", authMiddleware, productController.getProductsWithStock);
router.get("/low-stock", authMiddleware, productController.getLowStockProducts);
router.get("/out-of-stock", authMiddleware, productController.getOutOfStockProducts);
router.get("/category/:categoryId", authMiddleware, productController.getProductsByCategory);
router.get("/:id", authMiddleware, productController.getProductById);
router.post("/", authMiddleware, productController.createProduct);
router.put("/:id", authMiddleware, productController.updateProduct);
router.delete("/:id", authMiddleware, productController.deleteProduct);

export default router;
