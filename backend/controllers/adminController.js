// backend/controllers/adminController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import adminModel from "../models/adminModel.js";

// Utility for signing app JWTs
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET);

// Admin login with ID and password (for admin panel)
const adminLogin = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.json({ success: false, message: "ID and password required" });
    }

    // Find admin by id
    const admin = await adminModel
      .findOne({ id: id.toLowerCase() })
      .select("+password");
    if (!admin) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = signToken(admin._id);
    return res.json({
      success: true,
      token,
      user: { id: admin.id, role: admin.role, display: admin.name },
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    return res.json({ success: false, message: "Login failed" });
  }
};

export { adminLogin };
