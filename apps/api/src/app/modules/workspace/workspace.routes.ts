import express from 'express';
import auth from '../../middlewares/auth';
import { WorkspaceController } from './workspace.controller';
import workspaceAuthorize from '../../middlewares/workspaceAuthorize';


const router = express.Router();

/**
 * @swagger
 * /api/v1/workspaces:
 *   post:
 *     tags: [workspace]
 *     summary: Create a new workspace
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkspaceCreate'
 *     responses:
 *       '201':
 *         description: Workspace created
 */
router.post('/', auth(), WorkspaceController.createWorkspace);

/**
 * @swagger
 * /api/v1/workspaces:
 *   get:
 *     tags: [workspace]
 *     summary: Get my workspaces
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Workspaces retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workspace'
 */
router.get('/', auth(), WorkspaceController.getMyWorkspaces);

/**
 * @swagger
 * /api/v1/workspaces/{id}:
 *   get:
 *     tags: [workspace]
 *     summary: Get a specific workspace
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Workspace retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 */
router.get('/:id', auth(), workspaceAuthorize(), WorkspaceController.getWorkspace);

/**
 * @swagger
 * /api/v1/workspaces/{id}/members:
 *   get:
 *     tags: [workspace]
 *     summary: Get all members of a workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Members retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkspaceMember'
 */
router.get('/:id/members', auth(), workspaceAuthorize(), WorkspaceController.getMembers);

/**
 * @swagger
 * /api/v1/workspaces/{id}:
 *   patch:
 *     tags: [workspace]
 *     summary: Update a workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Workspace'
 *     responses:
 *       '200':
 *         description: Workspace updated
 */
router.patch('/:id', auth(), workspaceAuthorize({ requireAdmin: true }), WorkspaceController.updateWorkspace);

/**
 * @swagger
 * /api/v1/workspaces/{id}:
 *   delete:
 *     tags: [workspace]
 *     summary: Delete a workspace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Workspace deleted
 */
router.delete('/:id', auth(), workspaceAuthorize({ ownerOnly: true }), WorkspaceController.deleteWorkspace);

// Invite member to workspace (ADMIN only)
/**
 * @swagger
 * /api/v1/workspaces/{id}/invite:
 *   post:
 *     tags: [workspace]
 *     summary: Invite a member to a workspace (ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InviteMemberRequest'
 *     responses:
 *       201:
 *         description: Invite created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceInvite'
 *       400:
 *         description: Bad request (user already a member)
 *       403:
 *         description: Forbidden (not an admin)
 *       404:
 *         description: Workspace not found
 */
router.post('/:id/invite', auth(), workspaceAuthorize({ requireAdmin: true }), WorkspaceController.inviteMember);

// Accept an invite (authenticated user must match invite email)
/**
 * @swagger
 * /api/v1/workspaces/invite/accept:
 *   post:
 *     tags: [workspace]
 *     summary: Accept workspace invite
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AcceptInviteRequest'
 *     responses:
 *       200:
 *         description: Invite accepted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkspaceMember'
 *       400:
 *         description: Bad request (invite expired, already a member)
 *       403:
 *         description: Forbidden (invite not for your account)
 *       404:
 *         description: Invite not found
 */
router.post('/invite/accept', auth(), WorkspaceController.acceptInvite);

// Switch active workspace for user
/**
 * @swagger
 * /api/v1/workspaces/{id}/switch:
 *   post:
 *     tags: [workspace]
 *     summary: Switch active workspace for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active workspace switched
 */
router.post('/:id/switch', auth(), WorkspaceController.switchWorkspace);

export const WorkspaceRoutes = router;
