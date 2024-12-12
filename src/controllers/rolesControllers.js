import pool from "../models/db.js";

// Get all roles
export const getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query("SELECT * FROM roles");
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};

// Create a new role
export const createRole = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Role name is required" });
  }
  try {
    await pool.query("INSERT INTO roles (name) VALUES (?)", [name]);
    res.status(201).json({ message: "Role created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create role" });
  }
};
