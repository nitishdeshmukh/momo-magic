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
      user: {
        id: admin.id,
        role: admin.role,
        display: admin.name,
        phoneNumber: admin.phoneNumber,
      },
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    return res.json({ success: false, message: "Login failed" });
  }
};

const resetAdminPassword = async (req, res) => {
  try {
    const { phoneNumber, newPassword } = req.body;

    if (!phoneNumber || !newPassword) {
      return res.json({
        success: false,
        message: "Phone number and new password required",
      });
    }

    // Find admin by phone number
    const admin = await adminModel.findOne({ phoneNumber });
    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    admin.password = hashedPassword;
    await admin.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("resetAdminPassword error:", err);
    return res.json({ success: false, message: "Password reset failed" });
  }
};

export { adminLogin, resetAdminPassword };
