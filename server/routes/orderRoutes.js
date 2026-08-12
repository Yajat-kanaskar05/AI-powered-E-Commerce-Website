import express from "express";
import { createCheckoutSession, getMyOrders, getOrderById } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/checkout", createCheckoutSession);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);

export default router;