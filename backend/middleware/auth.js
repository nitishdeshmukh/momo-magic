// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import adminModel from "../models/adminModel.js";

const authMiddleware = async (req, res, next) => {
  // Accept either "token" header or "Authorization: Bearer <jwt>"
  let raw = req.headers.token;
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!raw && typeof auth === "string" && auth.startsWith("Bearer ")) {
    raw = auth.slice("Bearer ".length).trim();
  }

  if (!raw) {
    return res.status(401).json({ success: false, message: "Not Authorized Login Again" });
  }

  try {
    const token_decode = jwt.verify(raw, process.env.JWT_SECRET);
    const userId = token_decode.id;

    // Try to find user in userModel first (regular users)
    let user = await userModel.findById(userId);
    if (user) {
      req.body.userId = userId;
      req.user = user;
      return next();
    }

    // If not found in userModel, try adminModel (admin users)
    const admin = await adminModel.findById(userId);
    if (admin) {
      req.body.userId = userId;
      req.user = admin;
      return next();
    }

    // If neither found, unauthorized
    return res.status(401).json({ success: false, message: "User not found" });
  } catch (error) {
    // Tell the client clearly; still 401 so UI can react
    return res.status(401).json({ success: false, message: error.message || "Unauthorized" });
  }
};

export default authMiddleware;
