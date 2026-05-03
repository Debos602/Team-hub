import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import * as validation from './workspace.validation';
import { inviteMemberSchema, acceptInviteSchema } from './workspace.validation';

import { InviteMemberPayload } from './types';
import { WorkspaceService } from './workspace.service';

type AuthUser = { id: string; email?: string };

const getParamString = (val: string | string[] | undefined, name = 'id') => {
  if (Array.isArray(val)) return val[0];
  if (!val) throw new Error(`Missing parameter: ${name}`);
  return val;
};
const createWorkspace = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  const payload = validation.createWorkspaceSchema.parse(req.body);
  if (!user) throw new Error('Unauthorized');
  const ws = await WorkspaceService.createWorkspace(user.id, payload);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'Workspace created', data: ws });
});

const getMyWorkspaces = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  if (!user) throw new Error('Unauthorized');
  const workspaces = await WorkspaceService.getMyWorkspaces(user.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Workspaces retrieved', data: workspaces });
});

const getWorkspace = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  const ws = await WorkspaceService.getWorkspaceById(id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Workspace retrieved', data: ws });
});

const getMembers = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  const members = await WorkspaceService.getWorkspaceMembers(id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Workspace members retrieved', data: members });
});

const updateWorkspace = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
 const id = getParamString(req.params.id, 'id');
  const payload = validation.updateWorkspaceSchema.parse(req.body);
  const ws = await WorkspaceService.updateWorkspace(id, payload);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Workspace updated', data: ws });
});

const deleteWorkspace = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const id = getParamString(req.params.id, 'id');
  await WorkspaceService.deleteWorkspace(id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Workspace deleted', data: null });
});


const inviteMember = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  if (!user) throw new Error('Unauthorized');
  const payload = inviteMemberSchema.parse(req.body) as InviteMemberPayload;
  const workspaceId = getParamString(req.params.id, 'id');
  const invite = await WorkspaceService.inviteMember(user.id, workspaceId, payload.email, payload.role as 'ADMIN' | 'MEMBER');
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'Invite created', data: invite });
});

const acceptInvite = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  if (!user) throw new Error('Unauthorized');
  const payload = acceptInviteSchema.parse(req.body);
  const member = await WorkspaceService.acceptInvite(payload.token, user.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Invite accepted', data: member });
});

const switchWorkspace = catchAsync(async (req: Request & { user?: AuthUser }, res: Response) => {
  const user = req.user as AuthUser | undefined;
  if (!user) throw new Error('Unauthorized');
  const id = getParamString(req.params.id, 'id');
  await WorkspaceService.switchWorkspace(user.id, id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Active workspace switched', data: { activeWorkspaceId: id } });
});

// attach new handlers
export const WorkspaceController = {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  getMembers,
  updateWorkspace,
  deleteWorkspace,

  // invite
  inviteMember, 
  acceptInvite, 
  switchWorkspace
};



