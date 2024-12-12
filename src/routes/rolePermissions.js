import express from "express";
import {
  assignPermissionToRole,
  getPermissionsByRole,
} from "../controllers/rolePermissionsControllers.js";
import { checkPermission } from "../middleware/rbac.js";
import { authenticateToken } from "../controllers/userControllers.js";
const router = express.Router();

// Role-permission management
router.post("/assign", assignPermissionToRole);
router.get("/:roleName", getPermissionsByRole);

export default router;
