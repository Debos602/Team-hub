import { z } from 'zod';

// ── Reusable normalized fields ──────────────────────────────────────────────
const STATUS_VALUES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'] as const;
const PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const MILESTONE_STATUS_VALUES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;

const normalizedStatus = z.preprocess((v) => {
  if (Array.isArray(v)) return v[0];
  if (v == null) return v;
  return String(v);
}, z.string().transform((v, ctx) => {
  const transformed = v.replace(/\s+/g, '_').replace(/-/g, '_').toUpperCase();
  if (!STATUS_VALUES.includes(transformed as any)) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_value,
      values: STATUS_VALUES as unknown as [string, ...string[]],
      received: transformed,
    });
    return z.NEVER;
  }
  return transformed as typeof STATUS_VALUES[number];
}));

const normalizedPriority = z.preprocess((v) => {
  if (Array.isArray(v)) return v[0];
  if (v == null) return v;
  return String(v);
}, z.string().transform((v, ctx) => {
  const transformed = v.toUpperCase();
  if (!PRIORITY_VALUES.includes(transformed as any)) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_value,
      values: PRIORITY_VALUES as unknown as [string, ...string[]],
      received: transformed,
    });
    return z.NEVER;
  }
  return transformed as typeof PRIORITY_VALUES[number];
}));

const normalizedMilestoneStatus = z.preprocess((v) => {
  if (Array.isArray(v)) return v[0];
  if (v == null) return v;
  return String(v);
}, z.string().transform((v, ctx) => {
  const transformed = v.toUpperCase();
  if (!MILESTONE_STATUS_VALUES.includes(transformed as any)) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_value,
      values: MILESTONE_STATUS_VALUES as unknown as [string, ...string[]],
      received: transformed,
    });
    return z.NEVER;
  }
  return transformed as typeof MILESTONE_STATUS_VALUES[number];
}));

// ── Goal Schemas ────────────────────────────────────────────────────────────
export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: normalizedPriority.optional(),
  workspaceId: z.string().uuid(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: normalizedStatus.optional(),
  priority: normalizedPriority.optional(),
  progress: z.number().min(0).max(100).optional(),
});

export const getGoalsByPrioritySchema = z.object({
  priority: normalizedPriority.optional(),
  workspaceId: z.string().uuid(),
});

// ── Milestone Schemas ───────────────────────────────────────────────────────
export const createMilestoneSchema = z.object({
  title: z.string().min(1, 'Milestone title is required'),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  goalId: z.string().uuid(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: normalizedMilestoneStatus.optional(),
  progress: z.number().min(0).max(100).optional(),
});

// ── Goal Activity Schema ────────────────────────────────────────────────────
export const createActivitySchema = z.object({
  content: z.string().min(1, 'Activity content is required'),
  goalId: z.string().uuid(),
});

export default {
  createGoalSchema,
  updateGoalSchema,
  getGoalsByPrioritySchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  createActivitySchema,
};