// middleware/chatRateLimiter.js
import rateLimit from "express-rate-limit";

export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: { message: "Too many chat requests, please slow down." },
});