import express from 'express';
import {getRoles,createRole}from '../controllers/rolesControllers.js'
import { authenticateToken } from '../controllers/userControllers.js';
import { checkPermission } from '../middleware/rbac.js';
const router = express.Router();

router.get('/',authenticateToken,checkPermission('read_role'),getRoles);
router.post('/',authenticateToken,checkPermission('create_role'),createRole);

export default router;