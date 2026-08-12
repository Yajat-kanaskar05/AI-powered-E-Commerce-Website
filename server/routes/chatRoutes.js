import express from "express";
import { handleChat } from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { chatRateLimiter } from "../middleware/chatRateLimiter.js";

const router = express.Router();

router.post("/", authMiddleware, chatRateLimiter, handleChat);

export default router;