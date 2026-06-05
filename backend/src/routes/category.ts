import { Router } from "express";
import { authMiddleware } from "../middleware/auth.ts";
import * as categoryController from "../controllers/category.ts";

const router = Router();

router.get("/", authMiddleware, categoryController.getCategories);
router.get("/:id", authMiddleware, categoryController.getCategoryById);
router.post("/", authMiddleware, categoryController.createCategory);
router.put("/:id", authMiddleware, categoryController.updateCategory);
router.delete("/:id", authMiddleware, categoryController.deleteCategory);

export default router;
