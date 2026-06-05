import { Router } from "express";
import { authMiddleware } from "../middleware/auth.ts";
import * as supplierController from "../controllers/supplier.ts";

const router = Router();

router.get("/", authMiddleware, supplierController.getSuppliers);
router.get("/:id", authMiddleware, supplierController.getSupplierById);
router.get("/:id/products", authMiddleware, supplierController.getSupplierProducts);
router.post("/", authMiddleware, supplierController.createSupplier);
router.put("/:id", authMiddleware, supplierController.updateSupplier);
router.delete("/:id", authMiddleware, supplierController.deleteSupplier);

export default router;
