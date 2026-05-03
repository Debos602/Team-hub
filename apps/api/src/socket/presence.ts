import prisma from '../shared/prisma';

export const updatePresence = async (
  userId: string,
  workspaceId: string,
  isOnline: boolean
) => {
  await prisma.workspaceMember.updateMany({
    where: { userId, workspaceId },
    data: {
      isOnline,
      lastSeen: isOnline ? undefined : new Date(),
    },
  });
};

export const getOnlineMembers = async (workspaceId: string) => {
  return prisma.workspaceMember.findMany({
    where: { workspaceId, isOnline: true },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });
};
