import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { GoalService } from './goal.service';
import * as validation from './goal.validation';

type AuthUser = { id: string; email?: string };

// ─────────────────────────────────────────
// GOAL CONTROLLER
// ─────────────────────────────────────────

const createGoal = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  if (!user) throw new Error('Unauthorized');

  const payload = validation.createGoalSchema.parse(req.body);
  const goal = await GoalService.createGoal(user.id, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Goal created successfully',
    data: goal,
  });
});

const getGoal = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { goalId } = req.params as { goalId: string };

  const goal = await GoalService.getGoalById(goalId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Goal retrieved',
    data: goal,
  });
});

const getGoalsInWorkspace = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { workspaceId } = req.params as { workspaceId: string };
  const { priority } = validation.getGoalsByPrioritySchema
    .pick({ priority: true })
    .parse(req.query);

  const goals = await GoalService.getGoalsByWorkspace(workspaceId, priority);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Goals retrieved',
    data: goals,
  });
});

const getMyGoals = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  if (!user) throw new Error('Unauthorized');

  const { workspaceId } = req.params as { workspaceId: string };

  const goals = await GoalService.getGoalsByOwner(user.id, workspaceId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Your goals retrieved',
    data: goals,
  });
});

const updateGoal = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { goalId } = req.params as { goalId: string };
  const payload = validation.updateGoalSchema.parse(req.body);

  const goal = await GoalService.updateGoal(goalId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Goal updated',
    data: goal,
  });
});

const deleteGoal = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { goalId } = req.params as { goalId: string };

  await GoalService.deleteGoal(goalId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Goal deleted',
    data: null,
  });
});

const getGoalStats = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { workspaceId } = req.params as { workspaceId: string };

  const stats = await GoalService.getGoalStats(workspaceId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Goal statistics retrieved',
    data: stats,
  });
});

// ─────────────────────────────────────────
// MILESTONE CONTROLLER
// ─────────────────────────────────────────


const createMilestone = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const payload = validation.createMilestoneSchema.parse(req.body);

  const milestone = await GoalService.createMilestone(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Milestone created successfully',
    data: milestone,
  });
});

const getMilestonesForGoal = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { goalId } = req.params as { goalId: string };

  const milestones = await GoalService.getMilestonesByGoal(goalId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestones retrieved',
    data: milestones,
  });
});

const updateMilestone = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { milestoneId } = req.params as { milestoneId: string };
  const payload = validation.updateMilestoneSchema.parse(req.body);

  const milestone = await GoalService.updateMilestone(milestoneId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestone updated',
    data: milestone,
  });
});

const deleteMilestone = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { milestoneId } = req.params as { milestoneId: string };

  await GoalService.deleteMilestone(milestoneId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestone deleted',
    data: null,
  });
});

// ─────────────────────────────────────────
// ACTIVITY/PROGRESS UPDATE CONTROLLER
// ─────────────────────────────────────────

const postProgressUpdate = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  if (!user) throw new Error('Unauthorized');

  const payload = validation.createActivitySchema.parse(req.body);

  const activity = await GoalService.addProgressUpdate(user.id, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Progress update posted',
    data: activity,
  });
});

const getActivityFeed = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { goalId } = req.params as { goalId: string };
  const { take = '20', skip = '0' } = req.query as { take?: string; skip?: string };

  const feed = await GoalService.getGoalActivityFeed(
    goalId,
    parseInt(take, 10),
    parseInt(skip, 10)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Activity feed retrieved',
    data: feed,
  });
});

const deleteActivity = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const { activityId } = req.params as { activityId: string };

  await GoalService.deleteActivity(activityId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Activity deleted',
    data: null,
  });
});

export const GoalController = {
  // Goals
  createGoal,
  getGoal,
  getGoalsInWorkspace,
  getMyGoals,
  updateGoal,
  deleteGoal,
  getGoalStats,

  // Milestones
  createMilestone,
  getMilestonesForGoal,
  updateMilestone,
  deleteMilestone,

  // Activities
  postProgressUpdate,
  getActivityFeed,
  deleteActivity,
};
