import prisma from '../../../shared/prisma';
import { Prisma } from '@prisma/client';
import { emitToWorkspace } from '../../../socket';
import { ACTION_ITEM_STATUS_CHANGED } from '../../../socket/events';

type ActionItemStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface CreateActionItemPayload {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  workspaceId: string;
  assigneeId?: string;
  goalId?: string;
}

interface UpdateActionItemPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: ActionItemStatus;
  dueDate?: string;
  assigneeId?: string | null;
  goalId?: string | null;
}

interface UpdateOrderPayload {
  items: Array<{ id: string; order: number }>;
}

// ─────────────────────────────────────────
// ACTION ITEM OPERATIONS
// ─────────────────────────────────────────

const createActionItem = async (payload: CreateActionItemPayload) => {
  const actionItem = await prisma.actionItem.create({
    data: {
      title: payload.title,
      description: payload.description,
      priority: (payload.priority || 'MEDIUM') as Priority,
      status: 'TODO' as ActionItemStatus,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      workspaceId: payload.workspaceId,
      assigneeId: payload.assigneeId,
      goalId: payload.goalId,
      order: 0,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      goal: { select: { id: true, title: true } },
      workspace: { select: { id: true, name: true } },
    },
  });

  return actionItem;
};

const getActionItemById = async (actionItemId: string) => {
  const actionItem = await prisma.actionItem.findUniqueOrThrow({
    where: { id: actionItemId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      goal: { select: { id: true, title: true, status: true, progress: true } },
      workspace: { select: { id: true, name: true } },
    },
  });

  return actionItem;
};

const getActionItemsByWorkspace = async (
  workspaceId: string,
  filters?: {
    status?: ActionItemStatus;
    assigneeId?: string;
    goalId?: string;
    priority?: Priority;
  }
) => {
  const where: Prisma.ActionItemWhereInput = { workspaceId };

  if (filters?.status) where.status = filters.status as any;
  if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters?.goalId) where.goalId = filters.goalId;
  if (filters?.priority) where.priority = filters.priority as any;

  const actionItems = await prisma.actionItem.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      goal: { select: { id: true, title: true } },
    },
    orderBy: [{ order: 'asc' }, { dueDate: 'asc' }],
  });

  return actionItems;
};

const getActionItemsListView = async (
  workspaceId: string,
  filters?: {
    status?: ActionItemStatus;
    assigneeId?: string;
    goalId?: string;
    priority?: Priority;
  }
) => {
  const where: Prisma.ActionItemWhereInput = { workspaceId };

  if (filters?.status) where.status = filters.status as any;
  if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters?.goalId) where.goalId = filters.goalId;
  if (filters?.priority) where.priority = filters.priority as any;

  const actionItems = await prisma.actionItem.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      goal: { select: { id: true, title: true } },
    },
    orderBy: [
      { priority: 'asc' }, // HIGH priority first
      { dueDate: 'asc' }, // Earlier due dates first
      { createdAt: 'desc' }, // Newest first
    ],
  });

  return actionItems;
};

const getActionItemsKanbanView = async (workspaceId: string) => {
  const actionItems = await prisma.actionItem.findMany({
    where: { workspaceId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      goal: { select: { id: true, title: true } },
    },
    orderBy: { order: 'asc' },
  });

  // Group by status
  const kanban = {
    TODO: actionItems.filter((item) => item.status === 'TODO'),
    IN_PROGRESS: actionItems.filter((item) => item.status === 'IN_PROGRESS'),
    IN_REVIEW: actionItems.filter((item) => item.status === 'IN_REVIEW'),
    DONE: actionItems.filter((item) => item.status === 'DONE'),
  };

  return kanban;
};

const getActionItemsByAssignee = async (assigneeId: string, workspaceId: string) => {
  const actionItems = await prisma.actionItem.findMany({
    where: { assigneeId, workspaceId },
    include: {
      goal: { select: { id: true, title: true } },
      workspace: { select: { id: true, name: true } },
    },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
  });

  return actionItems;
};

const getActionItemsByGoal = async (goalId: string) => {
  const actionItems = await prisma.actionItem.findMany({
    where: { goalId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
    },
    orderBy: [{ order: 'asc' }, { dueDate: 'asc' }],
  });

  return actionItems;
};

const updateActionItem = async (actionItemId: string, payload: UpdateActionItemPayload) => {
  const existing = await prisma.actionItem.findUnique({ where: { id: actionItemId } });

  const updateData: any = {};

  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.description !== undefined) updateData.description = payload.description;
  if (payload.priority) updateData.priority = payload.priority as Priority;
  if (payload.status) updateData.status = payload.status as ActionItemStatus;
  if (payload.dueDate) updateData.dueDate = new Date(payload.dueDate);
  if (payload.assigneeId !== undefined) updateData.assigneeId = payload.assigneeId;
  if (payload.goalId !== undefined) updateData.goalId = payload.goalId;

  const actionItem = await prisma.actionItem.update({
    where: { id: actionItemId },
    data: updateData,
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      goal: { select: { id: true, title: true } },
    },
  });

  if (payload.status && existing && existing.status !== payload.status) {
    emitToWorkspace(actionItem.workspaceId, ACTION_ITEM_STATUS_CHANGED, {
      actionItemId,
      oldStatus: existing.status,
      newStatus: payload.status,
      actionItem,
    });
  }

  return actionItem;
};

const deleteActionItem = async (actionItemId: string) => {
  await prisma.actionItem.delete({ where: { id: actionItemId } });
};

// ─────────────────────────────────────────
// KANBAN BOARD OPERATIONS
// ─────────────────────────────────────────

const updateKanbanOrder = async (payload: UpdateOrderPayload) => {
  // Update order for multiple items
  const updates = payload.items.map((item) =>
    prisma.actionItem.update({
      where: { id: item.id },
      data: { order: item.order },
    })
  );

  await Promise.all(updates);

  return { success: true, count: payload.items.length };
};

const moveActionItemToStatus = async (
  actionItemId: string,
  newStatus: ActionItemStatus,
  newOrder: number
) => {
  const existing = await prisma.actionItem.findUnique({ where: { id: actionItemId } });

  const actionItem = await prisma.actionItem.update({
    where: { id: actionItemId },
    data: {
      status: newStatus,
      order: newOrder,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      goal: { select: { id: true, title: true } },
    },
  });

  if (existing && existing.status !== newStatus) {
    emitToWorkspace(actionItem.workspaceId, ACTION_ITEM_STATUS_CHANGED, {
      actionItemId,
      oldStatus: existing.status,
      newStatus,
      actionItem,
    });
  }

  return actionItem;
};

// ─────────────────────────────────────────
// ASSIGNMENT OPERATIONS
// ─────────────────────────────────────────

const assignActionItem = async (actionItemId: string, assigneeId: string) => {
  const actionItem = await prisma.actionItem.update({
    where: { id: actionItemId },
    data: { assigneeId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      goal: { select: { id: true, title: true } },
    },
  });

  return actionItem;
};

const unassignActionItem = async (actionItemId: string) => {
  const actionItem = await prisma.actionItem.update({
    where: { id: actionItemId },
    data: { assigneeId: null },
    include: {
      goal: { select: { id: true, title: true } },
    },
  });

  return actionItem;
};

// ─────────────────────────────────────────
// STATISTICS OPERATIONS
// ─────────────────────────────────────────

const getActionItemStats = async (workspaceId: string) => {
  const stats = await prisma.actionItem.groupBy({
    by: ['status'],
    where: { workspaceId },
    _count: true,
  });

  const total = await prisma.actionItem.count({ where: { workspaceId } });
  const completed = await prisma.actionItem.count({
    where: { workspaceId, status: 'DONE' },
  });
  const overdue = await prisma.actionItem.count({
    where: {
      workspaceId,
      dueDate: { lt: new Date() },
      status: { not: 'DONE' },
    },
  });

  return {
    total,
    completed,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    byStatus: stats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
};

const getActionItemStatsByAssignee = async (assigneeId: string, workspaceId: string) => {
  const stats = await prisma.actionItem.groupBy({
    by: ['status'],
    where: { assigneeId, workspaceId },
    _count: true,
  });

  const total = await prisma.actionItem.count({
    where: { assigneeId, workspaceId },
  });
  const completed = await prisma.actionItem.count({
    where: { assigneeId, workspaceId, status: 'DONE' },
  });

  return {
    total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    byStatus: stats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
};

export const ActionItemService = {
  // Core operations
  createActionItem,
  getActionItemById,
  getActionItemsByWorkspace,
  getActionItemsListView,
  getActionItemsKanbanView,
  getActionItemsByAssignee,
  getActionItemsByGoal,
  updateActionItem,
  deleteActionItem,

  // Kanban operations
  updateKanbanOrder,
  moveActionItemToStatus,

  // Assignment
  assignActionItem,
  unassignActionItem,

  // Statistics
  getActionItemStats,
  getActionItemStatsByAssignee,
};

export default ActionItemService;
