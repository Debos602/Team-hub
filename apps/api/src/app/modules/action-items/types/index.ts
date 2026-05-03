export type ActionItemStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ViewType = 'list' | 'kanban';

export interface CreateActionItemPayload {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  workspaceId: string;
  assigneeId?: string;
  goalId?: string;
}

export interface UpdateActionItemPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: ActionItemStatus;
  dueDate?: string;
  assigneeId?: string | null;
  goalId?: string | null;
}

export interface UpdateOrderPayload {
  items: Array<{
    id: string;
    order: number;
  }>;
}

export interface ActionItemFilters {
  status?: ActionItemStatus;
  assigneeId?: string;
  goalId?: string;
  priority?: Priority;
  view?: ViewType;
}

export interface KanbanBoard {
  TODO: ActionItem[];
  IN_PROGRESS: ActionItem[];
  IN_REVIEW: ActionItem[];
  DONE: ActionItem[];
}

export interface ActionItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description?: string;
  priority: Priority;
  status: ActionItemStatus;
  dueDate?: Date;
  order: number;
  workspaceId: string;
  assigneeId?: string;
  goalId?: string;

  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };

  goal?: {
    id: string;
    title: string;
    status?: string;
    progress?: number;
  };

  workspace?: {
    id: string;
    name: string;
  };
}

export interface ActionItemStats {
  total: number;
  completed: number;
  overdue: number;
  completionRate: number;
  byStatus: Record<ActionItemStatus, number>;
}

export interface ActionItemStatsByAssignee {
  total: number;
  completed: number;
  completionRate: number;
  byStatus: Record<ActionItemStatus, number>;
}
