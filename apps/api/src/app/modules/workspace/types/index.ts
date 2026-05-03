export interface CreateWorkspacePayload {
  name: string;
  description?: string;
  accentColor?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string;
  accentColor?: string;
}

export interface InviteMemberPayload {
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface AcceptInvitePayload {
  token: string;
}

export interface SwitchWorkspacePayload {
  workspaceId: string;
}

export interface WorkspacePublic {
  id: string;
  name: string;
  description?: string | null;
  accentColor: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export default {};
