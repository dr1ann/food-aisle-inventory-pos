import { Router } from "express";
import { authMiddleware } from "../middleware/auth.ts";
import * as stockController from "../controllers/stock.ts";

const router = Router();

router.post("/", authMiddleware, stockController.recordStockMovement);
router.get("/movements/:productId", authMiddleware, stockController.getStockMovements);
router.get("/activity/recent", authMiddleware, stockController.getRecentStockActivity);
router.get("/value/total", authMiddleware, stockController.getTotalStockValue);

export default router;
