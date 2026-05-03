import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { DashboardService } from './dashboard.service';

const getStats = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { workspaceId } = req.params as { workspaceId: string };

  const stats = await DashboardService.getDashboardStats(workspaceId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard stats retrieved',
    data: stats,
  });
});

export const DashboardController = {
  getStats,
};
