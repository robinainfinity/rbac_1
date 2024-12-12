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

      // Fetch permissions for the role from the database
      const [results] = await pool.query(
        `SELECT p.name AS permission
                 FROM permissions p
                 JOIN role_permissions rp ON p.id = rp.permission_id
                 JOIN roles r ON rp.role_id = r.id
                 WHERE r.name = ?`,
        [role]
      );

      // Extract permissions into an array
      const rolePermissions = results.map((row) => row.permission);

      // Check if the required permission exists
      if (!rolePermissions.includes(permission)) {
        return res
          .status(403)
          .json({
            error: `Access denied: missing '${permission}' permission`,
          });
      }

      // Permission is valid; proceed to the next middleware or controller
      next();
    } catch (error) {
      console.error("RBAC middleware error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};
