import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  accentColor: z.string().regex(/^#([0-9A-Fa-f]{6})$/).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  accentColor: z.string().regex(/^#([0-9A-Fa-f]{6})$/).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
});

export default {};
