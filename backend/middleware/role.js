import adminModel from "../models/adminModel.js";

// Middleware to require specific roles
export const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      // Check if user has role property (admin users)
      if (req.user.role && allowedRoles.includes(req.user.role)) {
        return next();
      }

      // If no role or not allowed, deny access
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    } catch (error) {
      console.error("Role middleware error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
};

// Specific role checks
export const isAdmin = requireRole(["admin"]);
export const isAdminOrDeveloper = requireRole(["admin", "developer"]);
