import express from 'express';
import auth from '../../middlewares/auth';
import { AnnouncementController } from './announcement.controller';

const router = express.Router();

// ─────────────────────────────────────────
// ANNOUNCEMENT ROUTES
// ─────────────────────────────────────────

// Create a new announcement
/**
 * @swagger
 * /api/v1/announcements:
 *   post:
 *     tags: [announcements]
 *     summary: Create a new announcement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Announcement'
 *     responses:
 *       '201':
 *         description: Announcement published
 */
router.post('/', auth(), AnnouncementController.createAnnouncement);

// Get a specific announcement by ID
/**
 * @swagger
 * /api/v1/announcements/{announcementId}:
 *   get:
 *     tags: [announcements]
 *     summary: Get a specific announcement by ID
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Announcement retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 */
router.get('/:announcementId', auth(), AnnouncementController.getAnnouncement);

// Get all announcements in a workspace (pinned first)
/**
 * @swagger
 * /api/v1/announcements/workspace/{workspaceId}:
 *   get:
 *     tags: [announcements]
 *     summary: Get all announcements in a workspace
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Announcements retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Announcement'
 */
router.get('/workspace/:workspaceId', auth(), AnnouncementController.getAnnouncementsInWorkspace);

// Update an announcement
/**
 * @swagger
 * /api/v1/announcements/{announcementId}:
 *   patch:
 *     tags: [announcements]
 *     summary: Update an announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Announcement'
 *     responses:
 *       '200':
 *         description: Announcement updated
 */
router.patch('/:announcementId', auth(), AnnouncementController.updateAnnouncement);

// Delete an announcement
/**
 * @swagger
 * /api/v1/announcements/{announcementId}:
 *   delete:
 *     tags: [announcements]
 *     summary: Delete an announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Announcement deleted
 */
router.delete('/:announcementId', auth(), AnnouncementController.deleteAnnouncement);

// Pin an announcement
/**
 * @swagger
 * /api/v1/announcements/{announcementId}/pin:
 *   post:
 *     tags: [announcements]
 *     summary: Pin an announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Announcement pinned
 */
router.post('/:announcementId/pin', auth(), AnnouncementController.pinAnnouncement);

// Unpin an announcement
/**
 * @swagger
 * /api/v1/announcements/{announcementId}/unpin:
 *   post:
 *     tags: [announcements]
 *     summary: Unpin an announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Announcement unpinned
 */
router.post('/:announcementId/unpin', auth(), AnnouncementController.unpinAnnouncement);

// Get announcement statistics for a workspace
/**
 * @swagger
 * /api/v1/announcements/workspace/{workspaceId}/stats:
 *   get:
 *     tags: [announcements]
 *     summary: Get announcement statistics for a workspace
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Announcement statistics retrieved
 */
router.get('/workspace/:workspaceId/stats', auth(), AnnouncementController.getAnnouncementStats);

// ─────────────────────────────────────────
// REACTION ROUTES
// ─────────────────────────────────────────

// Add/toggle reaction
/**
 * @swagger
 * /api/v1/announcements/{announcementId}/reactions:
 *   post:
 *     tags: [announcements]
 *     summary: Add or toggle a reaction for an announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
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
 *               type:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Reaction added/toggled
 */
router.post('/:announcementId/reactions', auth(), AnnouncementController.addReaction);

// Get all reactions for an announcement
/**
 * @swagger
 * /api/v1/announcements/{announcementId}/reactions:
 *   get:
 *     tags: [announcements]
 *     summary: Get all reactions for an announcement
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Reactions list
 */
router.get('/:announcementId/reactions', auth(), AnnouncementController.getReactions);

// ─────────────────────────────────────────
// COMMENT ROUTES
// ─────────────────────────────────────────

// Create a comment on an announcement
/**
 * @swagger
 * /api/v1/announcements/{announcementId}/comments:
 *   post:
 *     tags: [announcements]
 *     summary: Create a comment on an announcement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       '201':
 *         description: Comment created
 */
router.post('/:announcementId/comments', auth(), AnnouncementController.createComment);

// Get all comments for an announcement
/**
 * @swagger
 * /api/v1/announcements/{announcementId}/comments:
 *   get:
 *     tags: [announcements]
 *     summary: Get all comments for an announcement
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Comments list
 */
router.get('/:announcementId/comments', auth(), AnnouncementController.getComments);

// Update a comment
/**
 * @swagger
 * /api/v1/announcements/comments/{commentId}:
 *   patch:
 *     tags: [announcements]
 *     summary: Update a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       '200':
 *         description: Comment updated
 */
router.patch('/comments/:commentId', auth(), AnnouncementController.updateComment);

// Delete a comment
/**
 * @swagger
 * /api/v1/announcements/comments/{commentId}:
 *   delete:
 *     tags: [announcements]
 *     summary: Delete a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Comment deleted
 */
router.delete('/comments/:commentId', auth(), AnnouncementController.deleteComment);

// Reply to a comment (threaded)
/**
 * @swagger
 * /api/v1/announcements/comments/{commentId}/replies:
 *   post:
 *     tags: [announcements]
 *     summary: Reply to a comment (threaded)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       '201':
 *         description: Reply created
 */
router.post('/comments/:commentId/replies', auth(), AnnouncementController.replyToComment);

// ─────────────────────────────────────────
// ENGAGEMENT ROUTES
// ─────────────────────────────────────────

// Get engagement metrics (reactions + comments count)
/**
 * @swagger
 * /api/v1/announcements/{announcementId}/engagement:
 *   get:
 *     tags: [announcements]
 *     summary: Get engagement metrics (reactions + comments count)
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Engagement metrics
 */
router.get('/:announcementId/engagement', auth(), AnnouncementController.getEngagement);

export const AnnouncementRoutes = router;
