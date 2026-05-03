import express from 'express';
import auth from '../../middlewares/auth';
import { ActionItemController } from './action-item.controller';

const router = express.Router();

// ─────────────────────────────────────────
// ACTION ITEM ROUTES
// ─────────────────────────────────────────

// Create a new action item
/**
 * @swagger
 * /api/v1/action-items:
 *   post:
 *     tags: [action-items]
 *     summary: Create a new action item
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActionItemCreate'
 *     responses:
 *       '201':
 *         description: Action item created
 */
router.post('/', auth(), ActionItemController.createActionItem);

// Get a specific action item by ID
/**
 * @swagger
 * /api/v1/action-items/{actionItemId}:
 *   get:
 *     tags: [action-items]
 *     summary: Get a specific action item by ID
 *     parameters:
 *       - in: path
 *         name: actionItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Action item retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActionItem'
 */
router.get('/:actionItemId', auth(), ActionItemController.getActionItem);

// Get action items in a workspace (list or kanban view)
/**
 * @swagger
 * /api/v1/action-items/workspace/{workspaceId}:
 *   get:
 *     tags: [action-items]
 *     summary: Get action items in a workspace (list or kanban)
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: goalId
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Action items retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActionItem'
 */
router.get('/workspace/:workspaceId', auth(), ActionItemController.getActionItems);

// Get action items for a specific goal
/**
 * @swagger
 * /api/v1/action-items/goal/{goalId}:
 *   get:
 *     tags: [action-items]
 *     summary: Get action items for a specific goal
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Action items for goal retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActionItem'
 */
router.get('/goal/:goalId', auth(), ActionItemController.getActionItemsByGoal);

// Get my action items (assigned to me)
/**
 * @swagger
 * /api/v1/action-items/workspace/{workspaceId}/my-items:
 *   get:
 *     tags: [action-items]
 *     summary: Get my action items (assigned to me)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Your action items retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActionItem'
 */
router.get('/workspace/:workspaceId/my-items', auth(), ActionItemController.getMyActionItems);

// Update an action item
/**
 * @swagger
 * /api/v1/action-items/{actionItemId}:
 *   patch:
 *     tags: [action-items]
 *     summary: Update an action item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: actionItemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActionItem'
 *     responses:
 *       '200':
 *         description: Action item updated
 */
router.patch('/:actionItemId', auth(), ActionItemController.updateActionItem);

// Delete an action item
/**
 * @swagger
 * /api/v1/action-items/{actionItemId}:
 *   delete:
 *     tags: [action-items]
 *     summary: Delete an action item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: actionItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Action item deleted
 */
router.delete('/:actionItemId', auth(), ActionItemController.deleteActionItem);

// Get action item statistics for a workspace
/**
 * @swagger
 * /api/v1/action-items/workspace/{workspaceId}/stats:
 *   get:
 *     tags: [action-items]
 *     summary: Get action item statistics for a workspace
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Action item statistics retrieved
 */
router.get('/workspace/:workspaceId/stats', auth(), ActionItemController.getActionItemStats);

// ─────────────────────────────────────────
// KANBAN BOARD ROUTES
// ─────────────────────────────────────────

// Update kanban board order (batch update)
/**
 * @swagger
 * /api/v1/action-items/kanban/update-order:
 *   post:
 *     tags: [action-items]
 *     summary: Update kanban board order (batch)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Kanban board updated
 */
router.post('/kanban/update-order', auth(), ActionItemController.updateKanbanOrder);

// Move action item to a different status and position
/**
 * @swagger
 * /api/v1/action-items/{actionItemId}/move:
 *   post:
 *     tags: [action-items]
 *     summary: Move action item to a different status and position
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: actionItemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Action item moved
 */
router.post('/:actionItemId/move', auth(), ActionItemController.moveActionItem);

// ─────────────────────────────────────────
// ASSIGNMENT ROUTES
// ─────────────────────────────────────────

// Assign action item to a user
/**
 * @swagger
 * /api/v1/action-items/{actionItemId}/assign:
 *   post:
 *     tags: [action-items]
 *     summary: Assign action item to a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: actionItemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assigneeId:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Action item assigned
 */
router.post('/:actionItemId/assign', auth(), ActionItemController.assignActionItem);

// Unassign action item
/**
 * @swagger
 * /api/v1/action-items/{actionItemId}/unassign:
 *   post:
 *     tags: [action-items]
 *     summary: Unassign action item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: actionItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Action item unassigned
 */
router.post('/:actionItemId/unassign', auth(), ActionItemController.unassignActionItem);

export const ActionItemRoutes = router;
