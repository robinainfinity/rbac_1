import express from "express";
import {
  createUser,
  getUsers,
  loginUser,
  assignRoleToUser,
  authenticateToken,
  forgotPassword,
  resetPassword,
  deleteUser,
  updateUser
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
router.delete("/delete-user",authenticateToken,checkPermission('delete_users'), deleteUser);
router.put("/update-user",authenticateToken,updateUser)
export default router;
