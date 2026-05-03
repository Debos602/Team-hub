import { NextFunction, Request, Response } from 'express';
import ApiError from '../errors/ApiError';
import httpStatus from 'http-status';
import prisma from '../../shared/prisma';

// options: ownerOnly, requireAdmin
const workspaceAuthorize = (options: { ownerOnly?: boolean; requireAdmin?: boolean } = {}) => {
  return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      let workspaceId = (req.params as any).id || (req.body as any).workspaceId;
      if (Array.isArray(workspaceId)) workspaceId = workspaceId[0];
      if (!user || !workspaceId) throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');

      // check owner
      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId as string } });
      if (!workspace) throw new ApiError(httpStatus.NOT_FOUND, 'Workspace not found');

      if (options.ownerOnly) {
        if (workspace.ownerId !== user.id) throw new ApiError(httpStatus.FORBIDDEN, 'Only owner allowed');
        return next();
      }

      // check membership
      const membership = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId: user.id } });
      if (!membership) throw new ApiError(httpStatus.FORBIDDEN, 'Not a member of this workspace');

      if (options.requireAdmin && membership.role !== 'ADMIN') {
        throw new ApiError(httpStatus.FORBIDDEN, 'Admin role required');
      }

      // attach membership if needed
      (req as any).membership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default workspaceAuthorize;
