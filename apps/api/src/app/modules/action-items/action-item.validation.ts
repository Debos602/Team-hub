import { z } from 'zod';

// Action Item Schemas
export const createActionItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.preprocess(
    (v) => typeof v === 'string' ? v.toUpperCase() : v,
    z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  ).optional(),
  dueDate: z.string().datetime().optional(),
  workspaceId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  goalId: z.string().uuid().optional(),
});

export const updateActionItemSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.preprocess(
    (v) => typeof v === 'string' ? v.toUpperCase() : v,
    z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  ).optional(),
  status: z.preprocess(
    (v) => typeof v === 'string' ? v.toUpperCase() : v,
    z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
  ).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  goalId: z.string().uuid().optional().nullable(),
});

export const updateOrderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number(),
    })
  ),
});

export const getActionItemsSchema = z.object({
  workspaceId: z.string().uuid(),
  status: z.preprocess(
    (v) => typeof v === 'string' ? v.toUpperCase() : v,
    z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
  ).optional(),
  assigneeId: z.string().uuid().optional(),
  goalId: z.string().uuid().optional(),
  priority: z.preprocess(
    (v) => typeof v === 'string' ? v.toUpperCase() : v,
    z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  ).optional(),
  view: z.enum(['list', 'kanban']).optional(),
});

export default {
  createActionItemSchema,
  updateActionItemSchema,
  updateOrderSchema,
  getActionItemsSchema,
};
