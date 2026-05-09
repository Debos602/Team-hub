import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { NotificationService } from './notification.service';

const getMyNotifications = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req.user;
  if (!user) throw new Error('Not authenticated');
  const notes = await NotificationService.getNotificationsForUser(user.id);
  return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Notifications retrieved', data: notes });
});

const markRead = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req.user;
  if (!user) throw new Error('Not authenticated');
  const { id } = req.params as { id: string };
  const count = await NotificationService.markNotificationRead(id, user.id);
  return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Notification marked read', data: { updated: count } });
});

export const NotificationController = { getMyNotifications, markRead };
