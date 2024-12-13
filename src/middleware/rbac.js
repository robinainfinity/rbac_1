import pool from "../models/db.js";

// Middleware to check permissions
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const { role } = req.user;

      
      if (!role) {
        return res
          .status(403)
          .json({ error: "User role is missing in the token" });
      }

      
      const [results] = await pool.query(
        `SELECT p.name AS permission
         FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         JOIN roles r ON rp.role_id = r.id
         WHERE r.name = ?`,
        [role]
      );

      
      const rolePermissions = new Set(results.map((row) => row.permission));

     
      if (!rolePermissions.has(permission)) {
        return res.status(403).json({
          error: `Access denied: missing '${permission}' permission`,
        });
      }

      
      next();
    } catch (error) {
      console.error("RBAC middleware error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};
