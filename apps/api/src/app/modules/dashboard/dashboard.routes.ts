import express from 'express';
import auth from '../../middlewares/auth';
import { DashboardController } from './dashboard.controller';

const router = express.Router();

/**
 * @swagger
 * /api/v1/dashboard/{workspaceId}:
 *   get:
 *     tags: [dashboard]
 *     summary: Get dashboard statistics for a workspace
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Dashboard stats retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 */
router.get('/:workspaceId', auth(), DashboardController.getStats);

export const DashboardRoutes = router;
