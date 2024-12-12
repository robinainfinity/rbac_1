import pool from "../models/db.js";

// Assign a permission to a role
export const assignPermissionToRole = async (req, res) => {
  const { roleName, permissionName } = req.body;

  if (!roleName || !permissionName) {
    return res
      .status(400)
      .json({ error: "Role name and permission name are required" });
  }

  try {
    // Get role ID using roleName
    const [roleResult] = await pool.query(
      "SELECT id FROM roles WHERE name = ?",
      [roleName]
    );
    if (!roleResult.length) {
      return res
        .status(404)
        .json({ error: `Role '${roleName}' does not exist` });
    }
    const roleId = roleResult[0]?.id;

    // Get permission ID using permissionName
    const [permissionResult] = await pool.query(
      "SELECT id FROM permissions WHERE name = ?",
      [permissionName]
    );
    if (!permissionResult.length) {
      return res
        .status(404)
        .json({ error: `Permission '${permissionName}' does not exist` });
    }
    const permissionId = permissionResult[0]?.id;

    // Insert into role_permissions table
    await pool.query(
      "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
      [roleId, permissionId]
    );

    res.status(201).json({
      message: `Permission '${permissionName}' assigned to role '${roleName}' successfully`,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Permission is already assigned to this role" });
    }
    console.error("Error assigning permission to role:", error);
    res.status(500).json({ error: "Failed to assign permission to role" });
  }
};

// Get permissions for a role
export const getPermissionsByRole = async (req, res) => {
  const { roleName } = req.params;

  try {
    console.log("Fetching permissions for roleName:", roleName);

    // Fetch permissions for the given roleName
    const [permissions] = await pool.query(
      `SELECT p.id, p.name 
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN roles r ON rp.role_id = r.id
       WHERE r.name = ?`,
      [roleName]
    );

    res.status(200).json({
      role: roleName,
      permissions: permissions.map((permission) => permission.name),
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ error: "Failed to fetch permissions for the role" });
  }
};
