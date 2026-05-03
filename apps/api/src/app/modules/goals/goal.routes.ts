import express from 'express';
import auth from '../../middlewares/auth';
import { GoalController } from './goal.controller';


const router = express.Router();

// ─────────────────────────────────────────
// GOAL ROUTES
// ─────────────────────────────────────────

// Create a new goal
/**
 * @swagger
 * /api/v1/goals:
 *   post:
 *     tags: [goals]
 *     summary: Create a new goal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoalCreate'
 *     responses:
 *       '201':
 *         description: Goal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Goal'
 */
router.post('/', auth(), GoalController.createGoal);

// Get a specific goal by ID
/**
 * @swagger
 * /api/v1/goals/{goalId}:
 *   get:
 *     tags: [goals]
 *     summary: Get a specific goal by ID
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Goal retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Goal'
 */
router.get('/:goalId', auth(), GoalController.getGoal);

// Get all goals in a workspace (with optional priority filter)
/**
 * @swagger
 * /api/v1/goals/workspace/{workspaceId}:
 *   get:
 *     tags: [goals]
 *     summary: Get all goals in a workspace
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         description: Filter goals by priority
 *     responses:
 *       '200':
 *         description: Goals retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Goal'
 */
router.get('/workspace/:workspaceId', auth(), GoalController.getGoalsInWorkspace);

// Get my goals in a workspace
/**
 * @swagger
 * /api/v1/goals/workspace/{workspaceId}/my-goals:
 *   get:
 *     tags: [goals]
 *     summary: Get my goals in a workspace
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
 *         description: Your goals retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Goal'
 */
router.get('/workspace/:workspaceId/my-goals', auth(), GoalController.getMyGoals);

// Update a goal
/**
 * @swagger
 * /api/v1/goals/{goalId}:
 *   patch:
 *     tags: [goals]
 *     summary: Update a goal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Goal'
 *     responses:
 *       '200':
 *         description: Goal updated
 */
router.patch('/:goalId', auth(), GoalController.updateGoal);

// Delete a goal
/**
 * @swagger
 * /api/v1/goals/{goalId}:
 *   delete:
 *     tags: [goals]
 *     summary: Delete a goal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Goal deleted
 */
router.delete('/:goalId', auth(), GoalController.deleteGoal);

// Get goal statistics for a workspace
/**
 * @swagger
 * /api/v1/goals/workspace/{workspaceId}/stats:
 *   get:
 *     tags: [goals]
 *     summary: Get goal statistics for a workspace
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Goal statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 */
router.get('/workspace/:workspaceId/stats', auth(), GoalController.getGoalStats);

// ─────────────────────────────────────────
// MILESTONE ROUTES
// ─────────────────────────────────────────

// Create a new milestone
/**
 * @swagger
 * /api/v1/goals/{goalId}/milestones:
 *   post:
 *     tags: [goals]
 *     summary: Create a new milestone for a goal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Milestone'
 *     responses:
 *       '201':
 *         description: Milestone created
 */
router.post('/:goalId/milestones', auth(), GoalController.createMilestone);

// Get milestones for a goal
/**
 * @swagger
 * /api/v1/goals/{goalId}/milestones:
 *   get:
 *     tags: [goals]
 *     summary: Get milestones for a goal
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Milestones retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Milestone'
 */
router.get('/:goalId/milestones', auth(), GoalController.getMilestonesForGoal);

// Update a milestone
/**
 * @swagger
 * /api/v1/goals/milestones/{milestoneId}:
 *   patch:
 *     tags: [goals]
 *     summary: Update a milestone
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Milestone'
 *     responses:
 *       '200':
 *         description: Milestone updated
 */
router.patch('/milestones/:milestoneId', auth(), GoalController.updateMilestone);

// Delete a milestone
/**
 * @swagger
 * /api/v1/goals/milestones/{milestoneId}:
 *   delete:
 *     tags: [goals]
 *     summary: Delete a milestone
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Milestone deleted
 */
router.delete('/milestones/:milestoneId', auth(), GoalController.deleteMilestone);

// ─────────────────────────────────────────
// ACTIVITY/PROGRESS UPDATE ROUTES
// ─────────────────────────────────────────

// Post a progress update on a goal's activity feed
/**
 * @swagger
 * /api/v1/goals/{goalId}/activity:
 *   post:
 *     tags: [goals]
 *     summary: Post a progress update on a goal's activity feed
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Activity'
 *     responses:
 *       '201':
 *         description: Progress update posted
 */
router.post('/:goalId/activity', auth(), GoalController.postProgressUpdate);

// Get activity feed for a goal (with pagination)
/**
 * @swagger
 * /api/v1/goals/{goalId}/activity:
 *   get:
 *     tags: [goals]
 *     summary: Get activity feed for a goal
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: take
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Activity feed retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 */
router.get('/:goalId/activity', auth(), GoalController.getActivityFeed);

// Delete an activity
/**
 * @swagger
 * /api/v1/goals/activity/{activityId}:
 *   delete:
 *     tags: [goals]
 *     summary: Delete an activity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Activity deleted
 */
router.delete('/activity/:activityId', auth(), GoalController.deleteActivity);

export const GoalRoutes = router;
