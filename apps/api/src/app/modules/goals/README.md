# Goals Module Implementation

## Overview
The Goals module provides comprehensive functionality for creating and managing goals, milestones, and progress tracking within a workspace.

## Features

### 1. Goals
- **Create Goals**: Title, description, due date, priority, and status
- **Goal Ownership**: Each goal is owned by a specific user
- **Status Tracking**: NOT_STARTED, IN_PROGRESS, COMPLETED, OVERDUE
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT
- **Progress Calculation**: Automatically calculated from milestone progress
- **Workspace Scoped**: Goals belong to specific workspaces

### 2. Milestones
- **Nested Structure**: Milestones belong to goals
- **Progress Tracking**: Individual progress percentage (0-100)
- **Status Management**: PENDING, IN_PROGRESS, COMPLETED
- **Auto Recalculation**: Goal progress updates automatically when milestones change

### 3. Activity Feed
- **Progress Updates**: Post updates on a goal's activity feed
- **User Attribution**: Each activity shows who posted it and when
- **Pagination Support**: Fetch activity with skip/take parameters
- **Chronological Order**: Activities sorted by creation date (newest first)

## API Endpoints

### Goal Management

#### Create Goal
```
POST /goals
Body: {
  "title": "Q2 Revenue Target",
  "description": "Increase revenue by 25%",
  "dueDate": "2026-06-30T23:59:59Z",
  "priority": "HIGH",
  "workspaceId": "workspace-uuid"
}
```

#### Get Goal by ID
```
GET /goals/:goalId
Returns: Goal with all milestones and recent activities
```

#### Get Goals in Workspace
```
GET /goals/workspace/:workspaceId?status=IN_PROGRESS
Optional query: ?status=NOT_STARTED|IN_PROGRESS|COMPLETED|OVERDUE
```

#### Get My Goals
```
GET /goals/workspace/:workspaceId/my-goals
Returns: Goals owned by the current user
```

#### Update Goal
```
PATCH /goals/:goalId
Body: {
  "status": "IN_PROGRESS",
  "progress": 50,
  "priority": "URGENT"
}
```

#### Delete Goal
```
DELETE /goals/:goalId
Cascade deletes all milestones and activities
```

#### Get Goal Statistics
```
GET /goals/workspace/:workspaceId/stats
Returns: {
  "totalGoals": 10,
  "completedGoals": 3,
  "completionRate": 30,
  "byStatus": {
    "NOT_STARTED": 2,
    "IN_PROGRESS": 5,
    "COMPLETED": 3,
    "OVERDUE": 0
  }
}
```

### Milestone Management

#### Create Milestone
```
POST /goals/:goalId/milestones
Body: {
  "title": "Phase 1: Planning",
  "description": "Complete project planning",
  "dueDate": "2026-05-15T23:59:59Z"
}
```

#### Get Milestones for Goal
```
GET /goals/:goalId/milestones
Returns: Array of milestones ordered by creation date
```

#### Update Milestone
```
PATCH /goals/milestones/:milestoneId
Body: {
  "progress": 75,
  "status": "IN_PROGRESS"
}
Note: Goal progress auto-updates when milestone changes
```

#### Delete Milestone
```
DELETE /goals/milestones/:milestoneId
Note: Goal progress recalculated after deletion
```

### Activity Feed

#### Post Progress Update
```
POST /goals/:goalId/activity
Body: {
  "content": "Completed initial research phase. Team is ready to move to design."
}
```

#### Get Activity Feed
```
GET /goals/:goalId/activity?take=20&skip=0
Query Parameters:
  - take: Number of activities to fetch (default: 20)
  - skip: Number of activities to skip for pagination (default: 0)

Returns: {
  "activities": [...],
  "total": 42,
  "hasMore": true
}
```

#### Delete Activity
```
DELETE /goals/activity/:activityId
```

## Data Model

### Goal
```typescript
{
  id: string (UUID)
  createdAt: DateTime
  updatedAt: DateTime
  title: string
  description?: string
  dueDate?: DateTime
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
  progress: number (0-100, auto-calculated from milestones)
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  workspaceId: string (UUID)
  ownerId: string (UUID)
  
  // Relations
  owner: User
  workspace: Workspace
  milestones: Milestone[]
  activities: GoalActivity[]
}
```

### Milestone
```typescript
{
  id: string (UUID)
  createdAt: DateTime
  updatedAt: DateTime
  title: string
  description?: string
  dueDate?: DateTime
  progress: number (0-100, manual)
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  goalId: string (UUID)
  
  // Relations
  goal: Goal
}
```

### GoalActivity
```typescript
{
  id: string (UUID)
  createdAt: DateTime
  content: string
  goalId: string (UUID)
  userId: string (UUID)
  
  // Relations
  goal: Goal
  user: User
}
```

## Business Logic

### Auto-Progress Calculation
When a milestone is created, updated, or deleted:
1. Fetch all milestones for the goal
2. Calculate average progress from all milestones
3. Update goal progress to this average
4. If no milestones exist, set progress to 0

### Activity Feed
- New activities are always added to the newest
- Fetched in descending chronological order (newest first)
- Pagination support for large activity feeds
- Includes user information (name, avatar)

### Status Management
- Goals can be manually set to any status
- Consider setting status to 'OVERDUE' if dueDate < now()
- Status changes are tracked in the activity feed (optional enhancement)

## Error Handling

All endpoints use the `catchAsync` middleware for error handling:
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing auth)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

## Authentication

All endpoints require authentication via the `auth()` middleware:
- Checks for valid JWT token
- Extracts user ID from token
- Passes user to request object

## Future Enhancements

1. **Goal Collaboration**: Multiple owners per goal
2. **Notifications**: Alert when milestones are near due date
3. **Audit Trail**: Log all changes to goals and milestones
4. **Filtering**: Advanced filtering by date range, priority, owner
5. **Search**: Full-text search for goals
6. **Archiving**: Soft delete for completed goals
7. **Reminders**: Email/notification reminders for upcoming deadlines
8. **Templates**: Goal templates for recurring types
9. **Comments on Milestones**: Threaded discussions
10. **Goal Dependencies**: Link goals to other goals
