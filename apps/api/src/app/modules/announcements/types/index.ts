export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  workspaceId: string;
}

export interface UpdateAnnouncementPayload {
  title?: string;
  content?: string;
  isPinned?: boolean;
}

export interface CreateReactionPayload {
  emoji: string;
  announcementId: string;
}

export interface CreateCommentPayload {
  content: string;
  announcementId: string;
  parentId?: string;
}

export interface UpdateCommentPayload {
  content: string;
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export interface AnnouncementEngagement {
  reactions: number;
  comments: number;
  topLevelComments: number;
  totalEngagement: number;
}

export interface AnnouncementStats {
  total: number;
  pinned: number;
  unpinned: number;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  replies: Comment[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  reactions: Array<{
    id: string;
    emoji: string;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
  comments: Comment[];
}
