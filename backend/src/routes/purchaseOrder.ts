import { Router } from "express";
import { authMiddleware } from "../middleware/auth.ts";
import * as purchaseOrderController from "../controllers/purchaseOrder.ts";

const router = Router();

router.post("/", authMiddleware, purchaseOrderController.createPurchaseOrder);
router.get("/", authMiddleware, purchaseOrderController.getPurchaseOrders);
router.get("/pending", authMiddleware, purchaseOrderController.getPendingPurchaseOrders);
router.get("/supplier/:supplierId", authMiddleware, purchaseOrderController.getPurchaseOrdersBySupplier);
router.get("/:id", authMiddleware, purchaseOrderController.getPurchaseOrderById);
router.post("/:id/complete", authMiddleware, purchaseOrderController.completePurchaseOrder);

export default router;
