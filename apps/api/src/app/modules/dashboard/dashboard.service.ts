import prisma from '../../../shared/prisma';

const getDashboardStats = async (workspaceId: string) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    totalGoals,
    itemsCompletedThisWeek,
    overdueGoals,
    overdueActionItems,
  ] = await Promise.all([
    prisma.goal.count({ where: { workspaceId } }),
    prisma.actionItem.count({
      where: {
        workspaceId,
        status: 'DONE',
        updatedAt: { gte: startOfWeek },
      },
    }),
    prisma.goal.count({
      where: {
        workspaceId,
        dueDate: { lt: now },
        status: { not: 'COMPLETED' },
      },
    }),
    prisma.actionItem.count({
      where: {
        workspaceId,
        dueDate: { lt: now },
        status: { not: 'DONE' },
      },
    }),
  ]);

  return {
    totalGoals,
    itemsCompletedThisWeek,
    overdueCount: overdueGoals + overdueActionItems,
  };
};

export const DashboardService = {
  getDashboardStats,
};

export default DashboardService;
