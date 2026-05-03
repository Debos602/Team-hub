import { z } from 'zod';

// Announcement Schemas
export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  workspaceId: z.string().uuid(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  isPinned: z.boolean().optional(),
});

// Reaction Schema
export const createReactionSchema = z.object({
  emoji: z.string().min(1, 'Emoji is required').max(10),
  announcementId: z.string().uuid(),
});

// Comment Schema
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
  announcementId: z.string().uuid(),
  parentId: z.string().uuid().optional(), // For threaded replies
  mentionedUserIds: z.array(z.string().uuid()).optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
});

export default {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  createReactionSchema,
  createCommentSchema,
  updateCommentSchema,
};
