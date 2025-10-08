import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/auth";
import {
  signup,
  login,
  getProfile,
  someAdminOnlyHandler,
  updateProfile,
} from "../controllers/authController";

const router = express.Router();

// Public route (login/signup)
router.post("/signup", signup);
router.post("/login", login);

// Protected route, login required
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

// Admin-only route
router.get(
  "/admin/dashboard",
  verifyToken,
  authorizeRoles("admin"),
  someAdminOnlyHandler
);

export default router;
