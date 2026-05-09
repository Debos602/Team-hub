import prisma from '../../../shared/prisma';
import { Prisma } from '@prisma/client';
import { emitToWorkspace, emitToUser } from '../../../socket';
import {
  ANNOUNCEMENT_CREATED,
  ANNOUNCEMENT_UPDATED,
  ANNOUNCEMENT_DELETED,
  ANNOUNCEMENT_PINNED,
  ANNOUNCEMENT_UNPINNED,
  REACTION_ADDED,
  REACTION_REMOVED,
  COMMENT_CREATED,
  COMMENT_UPDATED,
  COMMENT_DELETED,
  MENTION_CREATED,
} from '../../../socket/events';

interface CreateAnnouncementPayload {
  title: string;
  content: string;
  workspaceId: string;
  mentionedUserIds?: string[];
}

interface UpdateAnnouncementPayload {
  title?: string;
  content?: string;
  isPinned?: boolean;
}

interface CreateReactionPayload {
  emoji: string;
  announcementId: string;
}

interface CreateCommentPayload {
  content: string;
  announcementId: string;
  parentId?: string;
  mentionedUserIds?: string[];
}

interface UpdateCommentPayload {
  content: string;
}

// ─────────────────────────────────────────
// ANNOUNCEMENT OPERATIONS
// ─────────────────────────────────────────

const createAnnouncement = async (userId: string, payload: CreateAnnouncementPayload) => {
  const announcement = await prisma.announcement.create({
    data: {
      title: payload.title,
      content: payload.content,
      workspaceId: payload.workspaceId,
      authorId: userId,
      isPinned: false,
    },
    include: {
      author: { select: { id: true, name: true, email: true, avatar: true } },
      workspace: { select: { id: true, name: true } },
      reactions: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      comments: {
        where: { parentId: null }, // Top-level comments only
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          replies: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
        },
      },
    },
  });

  emitToWorkspace(payload.workspaceId, ANNOUNCEMENT_CREATED, announcement);

  // If announcement mentions users, create notifications and emit mention events
  if (payload.mentionedUserIds && payload.mentionedUserIds.length > 0) {
    for (const mentionedUserId of payload.mentionedUserIds) {
      await prisma.notification.create({
        data: {
          type: 'MENTION',
          message: `${announcement.author.name} mentioned you in an announcement`,
          link: `/workspace/${announcement.workspaceId}/announcements/${announcement.id}`,
          userId: mentionedUserId,
        },
      });

      emitToUser(mentionedUserId, MENTION_CREATED, {
        announcement,
        mentionedBy: announcement.author,
      });
    }
  }

  return announcement;
};

const getAnnouncementById = async (announcementId: string) => {
  const announcement = await prisma.announcement.findUniqueOrThrow({
    where: { id: announcementId },
    include: {
      author: { select: { id: true, name: true, email: true, avatar: true } },
      workspace: { select: { id: true, name: true } },
      reactions: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      comments: {
        where: { parentId: null },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return announcement;
};

const getAnnouncementsByWorkspace = async (workspaceId: string) => {
  const announcements = await prisma.announcement.findMany({
    where: { workspaceId },
    include: {
      author: { select: { id: true, name: true, email: true, avatar: true } },
      reactions: true,
      comments: true,
    },
    orderBy: [
      { isPinned: 'desc' }, // Pinned announcements first
      { createdAt: 'desc' }, // Then by newest first
    ],
  });

  return announcements;
};

const updateAnnouncement = async (announcementId: string, payload: UpdateAnnouncementPayload) => {
  const updateData: any = {};

  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.content !== undefined) updateData.content = payload.content;
  if (payload.isPinned !== undefined) updateData.isPinned = payload.isPinned;

  const announcement = await prisma.announcement.update({
    where: { id: announcementId },
    data: updateData,
    include: {
      author: { select: { id: true, name: true, email: true, avatar: true } },
      reactions: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      comments: {
        where: { parentId: null },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          replies: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
        },
      },
    },
  });

  emitToWorkspace(announcement.workspaceId, ANNOUNCEMENT_UPDATED, announcement);
  return announcement;
};

const deleteAnnouncement = async (announcementId: string) => {
  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });
  await prisma.announcement.delete({ where: { id: announcementId } });
  if (announcement) emitToWorkspace(announcement.workspaceId, ANNOUNCEMENT_DELETED, { id: announcementId });
};

const pinAnnouncement = async (announcementId: string) => {
  const announcement = await prisma.announcement.update({
    where: { id: announcementId },
    data: { isPinned: true },
    include: {
      author: { select: { id: true, name: true, email: true, avatar: true } },
      reactions: true,
      comments: true,
    },
  });

  emitToWorkspace(announcement.workspaceId, ANNOUNCEMENT_PINNED, announcement);
  return announcement;
};

const unpinAnnouncement = async (announcementId: string) => {
  const announcement = await prisma.announcement.update({
    where: { id: announcementId },
    data: { isPinned: false },
    include: {
      author: { select: { id: true, name: true, email: true, avatar: true } },
      reactions: true,
      comments: true,
    },
  });

  emitToWorkspace(announcement.workspaceId, ANNOUNCEMENT_UNPINNED, announcement);
  return announcement;
};

// ─────────────────────────────────────────
// REACTION OPERATIONS
// ─────────────────────────────────────────

const addReaction = async (userId: string, payload: CreateReactionPayload) => {
  // Upsert - add reaction if not exists, remove if already exists (toggle)
  const existing = await prisma.reaction.findUnique({
    where: {
      userId_announcementId_emoji: {
        userId,
        announcementId: payload.announcementId,
        emoji: payload.emoji,
      },
    },
  });

  if (existing) {
    // Remove reaction if it already exists
    await prisma.reaction.delete({ where: { id: existing.id } });
    const announcement = await prisma.announcement.findUnique({ where: { id: payload.announcementId } });
    if (announcement) emitToWorkspace(announcement.workspaceId, REACTION_REMOVED, { announcementId: payload.announcementId, emoji: payload.emoji, userId });
    return { action: 'removed' };
  } else {
    // Add new reaction
    const reaction = await prisma.reaction.create({
      data: {
        emoji: payload.emoji,
        userId,
        announcementId: payload.announcementId,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    const announcement = await prisma.announcement.findUnique({ where: { id: payload.announcementId } });
    if (announcement) emitToWorkspace(announcement.workspaceId, REACTION_ADDED, { reaction, announcementId: payload.announcementId });
    return { action: 'added', data: reaction };
  }
};

const getReactionsForAnnouncement = async (announcementId: string) => {
  const reactions = await prisma.reaction.findMany({
    where: { announcementId },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  // Group by emoji with user list
  const grouped = reactions.reduce(
    (acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction.user);
      return acc;
    },
    {} as Record<string, any[]>
  );

  return Object.entries(grouped).map(([emoji, users]) => ({
    emoji,
    count: (users as any[]).length,
    users,
  }));
};

const removeReaction = async (reactionId: string) => {
  await prisma.reaction.delete({ where: { id: reactionId } });
};

// ─────────────────────────────────────────
// COMMENT OPERATIONS
// ─────────────────────────────────────────

const createComment = async (userId: string, payload: CreateCommentPayload) => {
  const comment = await prisma.comment.create({
    data: {
      content: payload.content,
      userId,
      announcementId: payload.announcementId,
      parentId: payload.parentId,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      replies: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
  });

  // Get announcement for workspaceId and link
  const announcement = await prisma.announcement.findUnique({
    where: { id: payload.announcementId },
    select: { id: true, title: true, workspaceId: true },
  });

  // Emit comment created
  if (announcement) {
    emitToWorkspace(announcement.workspaceId, COMMENT_CREATED, { comment, announcementId: payload.announcementId });
  }

  // Handle mentions
  if (payload.mentionedUserIds && payload.mentionedUserIds.length > 0 && announcement) {
    // Create Mention records
    await prisma.mention.createMany({
      data: payload.mentionedUserIds.map((uid) => ({
        userId: uid,
        commentId: comment.id,
      })),
    });

    // Create Notification records and emit events
    for (const mentionedUserId of payload.mentionedUserIds) {
      await prisma.notification.create({
        data: {
          type: 'MENTION',
          message: `${comment.user.name} mentioned you in a comment`,
          link: `/workspace/${announcement.workspaceId}/announcements/${announcement.id}`,
          userId: mentionedUserId,
        },
      });

      emitToUser(mentionedUserId, MENTION_CREATED, {
        comment,
        mentionedBy: comment.user,
        announcementId: payload.announcementId,
      });
    }
  }

  return comment;
};

const getCommentsByAnnouncement = async (announcementId: string) => {
  // Get only top-level comments with threaded replies
  const comments = await prisma.comment.findMany({
    where: { announcementId, parentId: null },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return comments;
};

const updateComment = async (commentId: string, payload: UpdateCommentPayload) => {
  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { content: payload.content },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      replies: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
  });

  const announcement = await prisma.announcement.findUnique({ where: { id: comment.announcementId } });
  if (announcement) emitToWorkspace(announcement.workspaceId, COMMENT_UPDATED, { comment, announcementId: comment.announcementId });
  return comment;
};

const deleteComment = async (commentId: string) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  // When deleting a comment, also delete all replies
  await prisma.comment.deleteMany({
    where: { parentId: commentId },
  });

  await prisma.comment.delete({ where: { id: commentId } });

  if (comment) {
    const announcement = await prisma.announcement.findUnique({ where: { id: comment.announcementId } });
    if (announcement) emitToWorkspace(announcement.workspaceId, COMMENT_DELETED, { id: commentId, announcementId: comment.announcementId });
  }
};

const replyToComment = async (userId: string, parentCommentId: string, content: string) => {
  // Get parent comment to verify it exists and get announcementId
  const parent = await prisma.comment.findUniqueOrThrow({
    where: { id: parentCommentId },
  });

  const reply = await prisma.comment.create({
    data: {
      content,
      userId,
      announcementId: parent.announcementId,
      parentId: parentCommentId,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  });

  const announcement = await prisma.announcement.findUnique({ where: { id: parent.announcementId } });
  if (announcement) emitToWorkspace(announcement.workspaceId, COMMENT_CREATED, { comment: reply, announcementId: parent.announcementId });

  return reply;
};

// ─────────────────────────────────────────
// STATISTICS OPERATIONS
// ─────────────────────────────────────────

const getAnnouncementStats = async (workspaceId: string) => {
  const total = await prisma.announcement.count({ where: { workspaceId } });
  const pinned = await prisma.announcement.count({
    where: { workspaceId, isPinned: true },
  });

  return {
    total,
    pinned,
    unpinned: total - pinned,
  };
};

const getAnnouncementEngagement = async (announcementId: string) => {
  const reactions = await prisma.reaction.count({
    where: { announcementId },
  });

  const comments = await prisma.comment.count({
    where: { announcementId },
  });

  const topLevelComments = await prisma.comment.count({
    where: { announcementId, parentId: null },
  });

  return {
    reactions,
    comments,
    topLevelComments,
    totalEngagement: reactions + comments,
  };
};

export const AnnouncementService = {
  // Announcements
  createAnnouncement,
  getAnnouncementById,
  getAnnouncementsByWorkspace,
  updateAnnouncement,
  deleteAnnouncement,
  pinAnnouncement,
  unpinAnnouncement,

  // Reactions
  addReaction,
  getReactionsForAnnouncement,
  removeReaction,

  // Comments
  createComment,
  getCommentsByAnnouncement,
  updateComment,
  deleteComment,
  replyToComment,

  // Statistics
  getAnnouncementStats,
  getAnnouncementEngagement,
};

export default AnnouncementService;
