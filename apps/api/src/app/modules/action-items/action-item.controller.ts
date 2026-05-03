import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { ActionItemService } from './action-item.service';
import * as validation from './action-item.validation';

type AuthUser = { id: string; email?: string };

// ─────────────────────────────────────────
// ACTION ITEM CONTROLLER
// ─────────────────────────────────────────

const createActionItem = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const payload = validation.createActionItemSchema.parse(req.body);

  const actionItem = await ActionItemService.createActionItem(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Action item created',
    data: actionItem,
  });
});

const getActionItem = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { actionItemId } = req.params as { actionItemId: string };

  const actionItem = await ActionItemService.getActionItemById(actionItemId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Action item retrieved',
    data: actionItem,
  });
});

const getActionItems = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { workspaceId } = req.params as { workspaceId: string };
  const { status, assigneeId, goalId, priority, view } = req.query as {
    status?: string;
    assigneeId?: string;
    goalId?: string;
    priority?: string;
    view?: string;
  };

  const filters = {
    status: status as any,
    assigneeId,
    goalId,
    priority: priority as any,
  };

  let actionItems;

  if (view === 'kanban') {
    actionItems = await ActionItemService.getActionItemsKanbanView(workspaceId);
  } else if (view === 'list') {
    actionItems = await ActionItemService.getActionItemsListView(workspaceId, filters);
  } else {
    // Default to kanban view
    actionItems = await ActionItemService.getActionItemsKanbanView(workspaceId);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Action items retrieved',
    data: actionItems,
  });
});

const getActionItemsByGoal = catchAsync(
  async (req: Request & { user?: AuthUser }, res: Response) => {
    const { goalId } = req.params as { goalId: string };

    const actionItems = await ActionItemService.getActionItemsByGoal(goalId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Action items for goal retrieved',
      data: actionItems,
    });
  }
);

const getMyActionItems = catchAsync(
  async (req: Request & { user?: AuthUser }, res: Response) => {
    const user = req.user as AuthUser | undefined;
    if (!user) throw new Error('Unauthorized');

    const { workspaceId } = req.params as { workspaceId: string };

    const actionItems = await ActionItemService.getActionItemsByAssignee(user.id, workspaceId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Your action items retrieved',
      data: actionItems,
    });
  }
);

const updateActionItem = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { actionItemId } = req.params as { actionItemId: string };
  const payload = validation.updateActionItemSchema.parse(req.body);

  const actionItem = await ActionItemService.updateActionItem(actionItemId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Action item updated',
    data: actionItem,
  });
});

const deleteActionItem = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { actionItemId } = req.params as { actionItemId: string };

  await ActionItemService.deleteActionItem(actionItemId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Action item deleted',
    data: null,
  });
});

const getActionItemStats = catchAsync(
  async (req: Request & { user?: AuthUser }, res: Response) => {
    const { workspaceId } = req.params as { workspaceId: string };

    const stats = await ActionItemService.getActionItemStats(workspaceId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Action item statistics retrieved',
      data: stats,
    });
  }
);

// ─────────────────────────────────────────
// KANBAN BOARD CONTROLLER
// ─────────────────────────────────────────

const updateKanbanOrder = catchAsync(
  async (req: Request & { user?: AuthUser }, res: Response) => {
    const payload = validation.updateOrderSchema.parse(req.body);

    const result = await ActionItemService.updateKanbanOrder(payload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Kanban board updated',
      data: result,
    });
  }
);

const moveActionItem = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { actionItemId } = req.params as { actionItemId: string };
  const { status, order } = req.body as { status: string; order: number };

  if (!status || order === undefined) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Status and order are required',
      data: null,
    });
  }

  const actionItem = await ActionItemService.moveActionItemToStatus(
    actionItemId,
    status as any,
    order
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Action item moved',
    data: actionItem,
  });
});

// ─────────────────────────────────────────
// ASSIGNMENT CONTROLLER
// ─────────────────────────────────────────

const assignActionItem = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { actionItemId } = req.params as { actionItemId: string };
  const { assigneeId } = req.body as { assigneeId: string };

  if (!assigneeId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Assignee ID is required',
      data: null,
    });
  }

  const actionItem = await ActionItemService.assignActionItem(actionItemId, assigneeId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Action item assigned',
    data: actionItem,
  });
});

const unassignActionItem = catchAsync(
  async (req: Request & { user?: AuthUser }, res: Response) => {
    const { actionItemId } = req.params as { actionItemId: string };

    const actionItem = await ActionItemService.unassignActionItem(actionItemId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Action item unassigned',
      data: actionItem,
    });
  }
);

export const ActionItemController = {
  // Core operations
  createActionItem,
  getActionItem,
  getActionItems,
  getActionItemsByGoal,
  getMyActionItems,
  updateActionItem,
  deleteActionItem,
  getActionItemStats,

  // Kanban
  updateKanbanOrder,
  moveActionItem,

  // Assignment
  assignActionItem,
  unassignActionItem,
};
