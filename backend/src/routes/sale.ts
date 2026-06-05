import { Router } from "express";
import { authMiddleware } from "../middleware/auth.ts";
import * as saleController from "../controllers/sale.ts";

const router = Router();

router.post("/checkout", authMiddleware, saleController.checkoutSale);
router.get("/", authMiddleware, saleController.getSales);
router.get("/:id", authMiddleware, saleController.getSaleById);

export default router;
