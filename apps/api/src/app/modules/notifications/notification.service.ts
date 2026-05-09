import prisma from '../../../shared/prisma';

const getNotificationsForUser = async (userId: string) => {
  const notes = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return notes;
};

const markNotificationRead = async (notificationId: string, userId: string) => {
  // safeguard: only mark if it belongs to the user
  const updated = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
  return updated.count;
};

export const NotificationService = { getNotificationsForUser, markNotificationRead };
export default NotificationService;
