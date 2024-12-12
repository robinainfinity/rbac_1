import express from "express";
import {
  createUser,
  getUsers,
  loginUser,
  assignRoleToUser,
  authenticateToken,
  forgotPassword,
  resetPassword
} from "../controllers/usercontrollers.js";
import { checkPermission } from "../middleware/rbac.js";

const router = express.Router();

// Register
router.post("/register", createUser);

// Login 
router.post("/login", loginUser);

// Assign a role
router.post("/assign-role",authenticateToken,checkPermission('assign_role'),assignRoleToUser);

// Fetch all users with roles
router.get("/getallusers",authenticateToken,checkPermission('read_users'), getUsers);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
export default router;
