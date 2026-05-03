import prisma from "../../../shared/prisma";
import { CreateWorkspacePayload, UpdateWorkspacePayload } from "./types";
import crypto from 'crypto';
import ApiError from '../../errors/ApiError';
import config from '../../../config';
import { sendInviteEmail } from './email.service';

const createWorkspace = async (userId: string, payload: CreateWorkspacePayload) => {
  const ws = await prisma.workspace.create({
    data: {
      name: payload.name,
      description: payload.description,
      accentColor: payload.accentColor || '#6366f1',
      ownerId: userId,
      members: {
        create: {
          userId,
          role: 'ADMIN'
        }
      }
    }
  });
  return ws;
};

const getMyWorkspaces = async (userId: string) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: { members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } } }
      }
    }
  });
  return memberships.map(m => ({
    ...m.workspace,
    role: m.role,
  }));
};

const getWorkspaceById = async (workspaceId: string) => {
  const ws = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    include: { members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } } }
  });
  return ws;
};

const getWorkspaceMembers = async (workspaceId: string) => {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    orderBy: { role: 'desc' }
  });
  return members.map(m => ({ id: m.id, role: m.role, joinedAt: m.createdAt, user: m.user }));
};

const updateWorkspace = async (workspaceId: string, payload: UpdateWorkspacePayload) => {
  const ws = await prisma.workspace.update({ where: { id: workspaceId }, data: payload });
  return ws;
};

const deleteWorkspace = async (workspaceId: string) => {
  await prisma.workspace.delete({ where: { id: workspaceId } });
  return;
};

const inviteMember = async (senderId: string, workspaceId: string, email: string, role: 'ADMIN' | 'MEMBER') => {
  // ensure sender is admin or owner
  const workspace = await prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId } });
  if (workspace.ownerId !== senderId) {
    const senderMembership = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId: senderId } });
    if (!senderMembership || senderMembership.role !== 'ADMIN') {
      throw new ApiError(403, 'Only ADMIN can invite members');
    }
  }

  // if user with email exists and already a member, prevent duplicate
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const alreadyMember = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId: existingUser.id } });
    if (alreadyMember) throw new ApiError(400, 'User is already a member of this workspace');
  }

  // create invite
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await prisma.workspaceInvite.create({
    data: {
      email,
      workspaceId,
      senderId,
      role,
      token,
      expiresAt,
    },
    include: {
      sender: { select: { name: true } }
    }
  });

  // send invite email
  const inviteLink = `${config.frontendUrl}/accept-invite?token=${token}`;
  await sendInviteEmail(
    email,
    invite.sender.name || 'A team member',
    workspace.name,
    role,
    inviteLink
  ).catch(err => console.error('Failed to send invite email:', err));

  return invite;
};

const acceptInvite = async (token: string, userId: string) => {
  const invite = await prisma.workspaceInvite.findUnique({ where: { token } });
  if (!invite) throw new ApiError(404, 'Invite not found');
  if (invite.status !== 'PENDING') throw new ApiError(400, 'Invite is not pending');
  if (invite.expiresAt < new Date()) {
    await prisma.workspaceInvite.update({ where: { id: invite.id }, data: { status: 'EXPIRED' } });
    throw new ApiError(400, 'Invite expired');
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.email !== invite.email) throw new ApiError(403, 'This invite is not for your account');

  // prevent duplicate membership
  const existingMember = await prisma.workspaceMember.findFirst({ where: { workspaceId: invite.workspaceId, userId } });
  if (existingMember) {
    await prisma.workspaceInvite.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } });
    throw new ApiError(400, 'Already a member');
  }

  const member = await prisma.workspaceMember.create({ data: { workspaceId: invite.workspaceId, userId, role: invite.role } });
  await prisma.workspaceInvite.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } });

  return member;
};

const switchWorkspace = async (userId: string, workspaceId: string) => {
  // ensure membership
  const member = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId } });
  if (!member) throw new ApiError(403, 'User is not a member of this workspace');

  const user = await prisma.user.update({ where: { id: userId }, data: { activeWorkspaceId: workspaceId } });
  return user;
};


export const WorkspaceService = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceById,
  getWorkspaceMembers,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  acceptInvite,
  switchWorkspace,
};

