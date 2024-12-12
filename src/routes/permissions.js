import express from "express";
import {
  getPermissions,
  createPermission,
} from "../controllers/permissionsController.js";
import { checkPermission } from "../middleware/rbac.js";

const router = express.Router();

// Basic CRUD for permissions
router.get("/",getPermissions);
router.post("/", createPermission);

export default router;
