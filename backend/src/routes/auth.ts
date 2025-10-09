import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/auth";
import {
  login,
  forgotPassword,
  resetPassword,
  logout,
} from "../controllers/authController";

const router = express.Router();

// Public route (login/signup)
router.post("/login", login);

// Protected route, login required
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

// Admin-only route
router.get("/admin/dashboard", verifyToken, authorizeRoles("admin"));

export default router;
