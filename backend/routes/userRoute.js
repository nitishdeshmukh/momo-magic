// food-del/backend/routes/userRoute.js
import express from "express";
import { loginWithPhone, me } from "../controllers/userController.js";
import {
  adminLogin,
  resetAdminPassword,
} from "../controllers/adminController.js";

const router = express.Router();

// Dev-only helper: direct phone login without OTP
router.post("/login", loginWithPhone);

// Admin login for admin panel
router.post("/admin-login", adminLogin);

// Admin password reset
router.post("/admin/reset-password", resetAdminPassword);

// Example "me" route
router.get("/me", me);

export default router;
