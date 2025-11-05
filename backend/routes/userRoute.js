// food-del/backend/routes/userRoute.js
import express from "express";
import { loginWithPhone, me } from "../controllers/userController.js";
import { adminLogin } from "../controllers/adminController.js";

const router = express.Router();

// Dev-only helper: direct phone login without OTP
router.post("/login", loginWithPhone);

// Admin login for admin panel
router.post("/admin-login", adminLogin);

// Example "me" route
router.get("/me", me);

export default router;
