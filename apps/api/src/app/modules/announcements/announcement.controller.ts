import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { AnnouncementService } from './announcement.service';
import * as validation from './announcement.validation';

type AuthUser = { id: string; email?: string };

// ─────────────────────────────────────────
// ANNOUNCEMENT CONTROLLER
// ─────────────────────────────────────────

const createAnnouncement = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  if (!user) throw new Error('Unauthorized');

  const payload = validation.createAnnouncementSchema.parse(req.body);
  const announcement = await AnnouncementService.createAnnouncement(user.id, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Announcement published',
    data: announcement,
  });
});

const getAnnouncement = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { announcementId } = req.params as { announcementId: string };

  const announcement = await AnnouncementService.getAnnouncementById(announcementId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Announcement retrieved',
    data: announcement,
  });
});

const getAnnouncementsInWorkspace = catchAsync(
  async (req: Request & { user?: AuthUser }, res: Response) => {
    const { workspaceId } = req.params as { workspaceId: string };

    const announcements = await AnnouncementService.getAnnouncementsByWorkspace(workspaceId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Announcements retrieved',
      data: announcements,
    });
  }
);

const updateAnnouncement = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { announcementId } = req.params as { announcementId: string };
  const payload = validation.updateAnnouncementSchema.parse(req.body);

  const announcement = await AnnouncementService.updateAnnouncement(announcementId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Announcement updated',
    data: announcement,
  });
});

const deleteAnnouncement = catchAsync(
  async (req: Request & { user?: AuthUser }, res: Response) => {
    const { announcementId } = req.params as { announcementId: string };

    await AnnouncementService.deleteAnnouncement(announcementId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Announcement deleted',
      data: null,
    });
  }
);

const pinAnnouncement = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { announcementId } = req.params as { announcementId: string };

  const announcement = await AnnouncementService.pinAnnouncement(announcementId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Announcement pinned',
    data: announcement,
  });
});

const unpinAnnouncement = catchAsync(
  async (req: Request & { user?: AuthUser }, res: Response) => {
    const { announcementId } = req.params as { announcementId: string };

    const announcement = await AnnouncementService.unpinAnnouncement(announcementId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Announcement unpinned',
      data: announcement,
    });
  }
);

/**
 * @swagger
 * /announcements/workspace/{workspaceId}/stats:
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
const getAnnouncementStats = catchAsync(
  async (req: Request & { user?: AuthUser }, res: Response) => {
    const { workspaceId } = req.params as { workspaceId: string };

    const stats = await AnnouncementService.getAnnouncementStats(workspaceId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Announcement statistics retrieved',
      data: stats,
    });
  }
);

// ─────────────────────────────────────────
// REACTION CONTROLLER
// ─────────────────────────────────────────

/**
 * @swagger
 * /announcements/{announcementId}/reactions:
 *   post:
 *     tags: [announcements]
 *     summary: Add or toggle a reaction on an announcement
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
 *             $ref: '#/components/schemas/Reaction'
 *     responses:
 *       '200':
 *         description: Reaction toggled
 */
const addReaction = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  if (!user) throw new Error('Unauthorized');

  const payload = validation.createReactionSchema.parse(req.body);
  const result = await AnnouncementService.addReaction(user.id, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.action === 'added' ? 'Reaction added' : 'Reaction removed',
    data: result,
  });
});

/**
 * @swagger
 * /announcements/{announcementId}/reactions:
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
 *         description: Reactions retrieved
 */
const getReactions = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { announcementId } = req.params as { announcementId: string };

  const reactions = await AnnouncementService.getReactionsForAnnouncement(announcementId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reactions retrieved',
    data: reactions,
  });
});

// ─────────────────────────────────────────
// COMMENT CONTROLLER
// ─────────────────────────────────────────

/**
 * @swagger
 * /announcements/{announcementId}/comments:
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
 *         description: Comment added
 */
const createComment = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  if (!user) throw new Error('Unauthorized');

  const payload = validation.createCommentSchema.parse(req.body);
  const comment = await AnnouncementService.createComment(user.id, {
    ...payload,
    mentionedUserIds: req.body.mentionedUserIds,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment added',
    data: comment,
  });
});

/**
 * @swagger
 * /announcements/{announcementId}/comments:
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
 *         description: Comments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
const getComments = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { announcementId } = req.params as { announcementId: string };

  const comments = await AnnouncementService.getCommentsByAnnouncement(announcementId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments retrieved',
    data: comments,
  });
});

/**
 * @swagger
 * /announcements/comments/{commentId}:
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
const updateComment = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { commentId } = req.params as { commentId: string };
  const payload = validation.updateCommentSchema.parse(req.body);

  const comment = await AnnouncementService.updateComment(commentId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment updated',
    data: comment,
  });
});

/**
 * @swagger
 * /announcements/comments/{commentId}:
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
const deleteComment = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { commentId } = req.params as { commentId: string };

  await AnnouncementService.deleteComment(commentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment deleted',
    data: null,
  });
});

/**
 * @swagger
 * /announcements/comments/{commentId}/replies:
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
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Reply added
 */
const replyToComment = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  if (!user) throw new Error('Unauthorized');

  const { commentId } = req.params as { commentId: string };
  const { content } = req.body as { content: string };

  if (!content || content.trim().length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Reply content is required',
      data: null,
    });
  }

  const reply = await AnnouncementService.replyToComment(user.id, commentId, content);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Reply added',
    data: reply,
  });
});

// ─────────────────────────────────────────
// ENGAGEMENT CONTROLLER
// ─────────────────────────────────────────

/**
 * @swagger
 * /announcements/{announcementId}/engagement:
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
 *         description: Engagement metrics retrieved
 */
const getEngagement = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { announcementId } = req.params as { announcementId: string };

  const engagement = await AnnouncementService.getAnnouncementEngagement(announcementId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Engagement metrics retrieved',
    data: engagement,
  });
});

export const AnnouncementController = {
  // Announcements
  createAnnouncement,
  getAnnouncement,
  getAnnouncementsInWorkspace,
  updateAnnouncement,
  deleteAnnouncement,
  pinAnnouncement,
  unpinAnnouncement,
  getAnnouncementStats,

  // Reactions
  addReaction,
  getReactions,

  // Comments
  createComment,
  getComments,
  updateComment,
  deleteComment,
  replyToComment,

  // Engagement
  getEngagement,
};
