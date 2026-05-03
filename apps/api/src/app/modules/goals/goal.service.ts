import prisma from '../../../shared/prisma';
import { Prisma } from '@prisma/client';
import { emitToWorkspace } from '../../../socket';
import { GOAL_STATUS_CHANGED } from '../../../socket/events';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

interface CreateGoalPayload {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
  workspaceId: string;
}

interface UpdateGoalPayload {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: GoalStatus;
  priority?: Priority;
  progress?: number;
}

interface CreateMilestonePayload {
  title: string;
  description?: string;
  dueDate?: string;
  goalId: string;
}

interface UpdateMilestonePayload {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: MilestoneStatus;
  progress?: number;
}

interface CreateActivityPayload {
  content: string;
  goalId: string;
}

// ─────────────────────────────────────────
// GOAL OPERATIONS
// ─────────────────────────────────────────

const createGoal = async (userId: string, payload: CreateGoalPayload) => {
  const goal = await prisma.goal.create({
    data: {
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      priority: (payload.priority || 'MEDIUM') as Priority,
      status: 'NOT_STARTED' as GoalStatus,
      progress: 0,
      workspaceId: payload.workspaceId,
      ownerId: userId,
    },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      milestones: true,
      activities: { include: { user: { select: { id: true, name: true, avatar: true } } } },
    },
  });
  return goal;
};

const getGoalById = async (goalId: string) => {
  const goal = await prisma.goal.findUniqueOrThrow({
    where: { id: goalId },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      workspace: { select: { id: true, name: true } },
      milestones: {
        orderBy: { createdAt: 'asc' },
        include: { goal: { select: { id: true, title: true } } },
      },
      activities: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
  });
  return goal;
};

const getGoalsByWorkspace = async (workspaceId: string, priority?: string) => {
  const where: any = { workspaceId };

  if (priority) {
    where.priority = priority as any;
  }

  const goals = await prisma.goal.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      milestones: true,
      activities: { take: 3, orderBy: { createdAt: 'desc' } },
    },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  });
  return goals;
};

const getGoalsByOwner = async (userId: string, workspaceId: string) => {
  const goals = await prisma.goal.findMany({
    where: { ownerId: userId, workspaceId },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      milestones: true,
      activities: { take: 3, orderBy: { createdAt: 'desc' } },
    },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
  });
  return goals;
};

const updateGoal = async (goalId: string, payload: UpdateGoalPayload) => {
  const existing = await prisma.goal.findUnique({
    where: { id: goalId },
    select: { id: true, status: true, progress: true, workspaceId: true },
  });

  if (!existing) throw new Error('Goal not found');

  const updateData: any = {};

  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.description !== undefined) updateData.description = payload.description;
  if (payload.dueDate) updateData.dueDate = new Date(payload.dueDate);
  if (payload.priority) updateData.priority = payload.priority;
  if (payload.progress !== undefined) updateData.progress = Number(payload.progress);

  // Handle status change
  const statusChanged = payload.status && existing.status !== payload.status;
  if (statusChanged) {
    updateData.status = payload.status;

    // Auto-update progress based on status change
    if (payload.status === 'COMPLETED') {
      updateData.progress = 100;
    } else if (payload.status === 'IN_PROGRESS' && existing.status === 'NOT_STARTED') {
      updateData.progress = 25;
    } else if (payload.status === 'OVERDUE') {
      const currentProgress = Number(existing.progress ?? 0);
      updateData.progress = Math.max(0, currentProgress - 15);
    }
  }

  // If updateData is empty, just return existing goal
  if (Object.keys(updateData).length === 0) {
    return await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        milestones: true,
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  const goal = await prisma.goal.update({
    where: { id: goalId },
    data: updateData,
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      milestones: true,
      activities: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (statusChanged) {
    try {
      emitToWorkspace(existing.workspaceId, GOAL_STATUS_CHANGED, {
        goalId,
        oldStatus: existing.status,
        newStatus: payload.status,
        goal,
      });
    } catch (err) {
      console.error('Failed to emit socket event:', err);
    }
  }

  return goal;
};

const deleteGoal = async (goalId: string) => {
  await prisma.goal.delete({ where: { id: goalId } });
};

// ─────────────────────────────────────────
// MILESTONE OPERATIONS
// ─────────────────────────────────────────

const createMilestone = async (payload: CreateMilestonePayload) => {
  const milestone = await prisma.milestone.create({
    data: {
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      status: 'PENDING' as MilestoneStatus,
      progress: 0,
      goalId: payload.goalId,
    },
  });

  // Trigger goal progress recalculation
  await recalculateGoalProgress(payload.goalId);

  return milestone;
};

const getMilestonesByGoal = async (goalId: string) => {
  const milestones = await prisma.milestone.findMany({
    where: { goalId },
    orderBy: { createdAt: 'asc' },
  });
  return milestones;
};

const updateMilestone = async (milestoneId: string, payload: UpdateMilestonePayload) => {
  const updateData: any = {};

  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.description !== undefined) updateData.description = payload.description;
  if (payload.dueDate) updateData.dueDate = new Date(payload.dueDate);
  if (payload.status) updateData.status = payload.status;
  if (payload.progress !== undefined) updateData.progress = payload.progress;

  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: updateData,
  });

  // Recalculate goal progress
  await recalculateGoalProgress(milestone.goalId);

  return milestone;
};

const deleteMilestone = async (milestoneId: string) => {
  const milestone = await prisma.milestone.findUniqueOrThrow({
    where: { id: milestoneId },
  });

  await prisma.milestone.delete({ where: { id: milestoneId } });

  // Recalculate goal progress
  await recalculateGoalProgress(milestone.goalId);
};

// ─────────────────────────────────────────
// PROGRESS & ACTIVITY OPERATIONS
// ─────────────────────────────────────────

const addProgressUpdate = async (userId: string, payload: CreateActivityPayload) => {
  const activity = await prisma.goalActivity.create({
    data: {
      content: payload.content,
      goalId: payload.goalId,
      userId,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      goal: { select: { id: true, title: true } },
    },
  });

  return activity;
};

const getGoalActivityFeed = async (goalId: string, take = 20, skip = 0) => {
  const activities = await prisma.goalActivity.findMany({
    where: { goalId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });

  const total = await prisma.goalActivity.count({ where: { goalId } });

  return { activities, total, hasMore: skip + take < total };
};

const deleteActivity = async (activityId: string) => {
  await prisma.goalActivity.delete({ where: { id: activityId } });
};

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────

const recalculateGoalProgress = async (goalId: string) => {
  const milestones = await prisma.milestone.findMany({
    where: { goalId },
  });

  if (milestones.length === 0) {
    // No milestones, set progress to 0
    await prisma.goal.update({
      where: { id: goalId },
      data: { progress: 0 },
    });
    return;
  }

  // Calculate average progress from milestones
  const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0);
  const avgProgress = Math.round(totalProgress / milestones.length);

  // Update goal progress
  await prisma.goal.update({
    where: { id: goalId },
    data: { progress: avgProgress },
  });
};

const getGoalStats = async (workspaceId: string) => {
  const stats = await prisma.goal.groupBy({
    by: ['status'],
    where: { workspaceId },
    _count: true,
  });

  const totalGoals = await prisma.goal.count({
    where: { workspaceId },
  });

  const completedGoals = await prisma.goal.count({
    where: { workspaceId, status: 'COMPLETED' },
  });

  return {
    totalGoals,
    completedGoals,
    completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
    byStatus: stats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
};

export const GoalService = {
  // Goals
  createGoal,
  getGoalById,
  getGoalsByWorkspace,
  getGoalsByOwner,
  updateGoal,
  deleteGoal,

  // Milestones
  createMilestone,
  getMilestonesByGoal,
  updateMilestone,
  deleteMilestone,

  // Activities
  addProgressUpdate,
  getGoalActivityFeed,
  deleteActivity,

  // Helpers
  recalculateGoalProgress,
  getGoalStats,
};

export default GoalService;
