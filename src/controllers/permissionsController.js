import pool from "../models/db.js";

// Get all permissions
export const getPermissions = async (req, res) => {
  try {
    const [permissions] = await pool.query("SELECT * FROM permissions");
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
};

// Create a new permission
export const createPermission = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Permission name is required" });
  }
  try {
    await pool.query("INSERT INTO permissions (name) VALUES (?)", [name]);
    res.status(201).json({ message: "Permission created successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Permission name already exists" });
    } else {
      res.status(500).json({ error: "Failed to create permission" });
    }
  }
};

// Assign a permission to a role
export const assignPermissionToRole = async (req, res) => {
  const { roleName, permissionName } = req.body;

  if (!roleName || !permissionName) {
    return res
      .status(400)
      .json({ error: "Role name and Permission name are required" });
  }

  try {
    // Find role ID
    const [roleResult] = await pool.query(
      "SELECT id FROM roles WHERE name = ?",
      [roleName]
    );
    if (roleResult.length === 0) {
      return res
        .status(404)
        .json({ error: `Role with name '${roleName}' not found` });
    }
    const roleId = roleResult[0].id;

    // Find permission ID
    const [permissionResult] = await pool.query(
      "SELECT id FROM permissions WHERE name = ?",
      [permissionName]
    );
    if (permissionResult.length === 0) {
      return res
        .status(404)
        .json({ error: `Permission with name '${permissionName}' not found` });
    }
    const permissionId = permissionResult[0].id;

    // Assign permission to role
    await pool.query(
      "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
      [roleId, permissionId]
    );

    res.status(200).json({
      message: `Permission '${permissionName}' assigned to role '${roleName}' successfully`,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Permission is already assigned to this role" });
    }
    res.status(500).json({ error: "Failed to assign permission to role" });
  }
};

// Get permissions of a specific role
export const getPermissionsOfRole = async (req, res) => {
  const { roleName } = req.params;

  try {
    // Find role ID
    const [roleResult] = await pool.query(
      "SELECT id FROM roles WHERE name = ?",
      [roleName]
    );
    if (roleResult.length === 0) {
      return res
        .status(404)
        .json({ error: `Role with name '${roleName}' not found` });
    }
    const roleId = roleResult[0].id;

    // Get permissions for the role
    const [permissions] = await pool.query(
      `
      SELECT p.name AS permissionName
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ?
      `,
      [roleId]
    );

    res.status(200).json({ roleName, permissions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch permissions for role" });
  }
};
