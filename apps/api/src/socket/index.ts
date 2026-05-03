import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import config from '../config';
import { authenticateSocket } from './auth';
import { updatePresence, getOnlineMembers } from './presence';
import prisma from '../shared/prisma';

let io: Server | null = null;

export const initializeSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.frontendUrl ? [config.frontendUrl] : '*',
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on('connection', async (socket: Socket) => {
    const user = (socket as any).user;
    if (!user?.id) return socket.disconnect();

    // Get user's workspace memberships
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      select: { workspaceId: true },
    });

    // Join workspace rooms and user room
    const workspaceIds = memberships.map((m) => m.workspaceId);
    workspaceIds.forEach((id) => {
      socket.join(`workspace:${id}`);
    });
    socket.join(`user:${user.id}`);

    // Update presence to online
    await Promise.all(
      workspaceIds.map((workspaceId) =>
        updatePresence(user.id, workspaceId, true)
      )
    );

    // Emit online status to each workspace
    await Promise.all(
      workspaceIds.map(async (workspaceId) => {
        io!.to(`workspace:${workspaceId}`).emit('presence:online', {
          userId: user.id,
          workspaceId,
        });
        const onlineMembers = await getOnlineMembers(workspaceId);
        io!.to(`workspace:${workspaceId}`).emit('workspace:online-members', onlineMembers);
      })
    );

    // Handle disconnect
    socket.on('disconnect', async () => {
      await Promise.all(
        workspaceIds.map(async (workspaceId) => {
          await updatePresence(user.id, workspaceId, false);
          io!.to(`workspace:${workspaceId}`).emit('presence:offline', {
            userId: user.id,
            workspaceId,
          });
          const onlineMembers = await getOnlineMembers(workspaceId);
          io!.to(`workspace:${workspaceId}`).emit('workspace:online-members', onlineMembers);
        })
      );
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export const emitToWorkspace = (workspaceId: string, event: string, data: any) => {
  try {
    getIO().to(`workspace:${workspaceId}`).emit(event, data);
  } catch (err) {
    console.error('Failed to emit socket event:', err);
  }
};

export const emitToUser = (userId: string, event: string, data: any) => {
  getIO().to(`user:${userId}`).emit(event, data);
};
