export interface CreateGoalPayload {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  workspaceId: string;
}

export interface UpdateGoalPayload {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  progress?: number;
}

export interface CreateMilestonePayload {
  title: string;
  description?: string;
  dueDate?: string;
  goalId: string;
}

export interface UpdateMilestonePayload {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  progress?: number;
}

export interface CreateActivityPayload {
  content: string;
  goalId: string;
}

export interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  byStatus: Record<string, number>;
}
