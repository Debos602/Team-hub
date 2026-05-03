# Action Items Module Implementation

## Overview
The Action Items module provides task management with assignees, priorities, and due dates. Supports both Kanban board and list views for flexible task organization and tracking linked to parent goals.

## Features

### 1. Action Items
- **Create Tasks**: Title, description, priority, due date, assignee
- **Goal Linking**: Link action items to parent goals
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT
- **Status Tracking**: TODO, IN_PROGRESS, IN_REVIEW, DONE
- **Assignee Management**: Assign tasks to team members
- **Workspace Scoped**: Tasks belong to specific workspaces

### 2. Kanban Board View
- **Drag & Drop**: Order items within columns using the `order` field
- **Status Columns**: TODO, IN_PROGRESS, IN_REVIEW, DONE
- **Batch Reordering**: Update multiple items' positions efficiently
- **Visual Workflow**: See tasks move through different stages

### 3. List View
- **Sorted Display**: By priority, due date, and creation date
- **Filtering**: By status, assignee, goal, and priority
- **Quick Actions**: Easy access to edit/reassign/delete
- **Timeline**: Due dates clearly visible

## API Endpoints

### Action Item Management

#### Create Action Item
```
POST /action-items
Body: {
  "title": "Implement user authentication",
  "description": "Add JWT-based auth system",
  "priority": "HIGH",
  "dueDate": "2026-05-15T23:59:59Z",
  "workspaceId": "workspace-uuid",
  "assigneeId": "user-uuid",
  "goalId": "goal-uuid" (optional)
}
Response: 201 Created
```

#### Get Action Item by ID
```
GET /action-items/:actionItemId
Returns: Action item with assignee and goal info
```

#### Get Action Items (List or Kanban View)
```
GET /action-items/workspace/:workspaceId?view=kanban
Query Parameters:
  - view: "list" or "kanban" (default: kanban)
  - status: TODO|IN_PROGRESS|IN_REVIEW|DONE
  - assigneeId: user-uuid
  - goalId: goal-uuid
  - priority: LOW|MEDIUM|HIGH|URGENT

Returns: 
  - Kanban view: { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] }
  - List view: Array of items sorted by priority/due date
```

#### Get Action Items for a Goal
```
GET /action-items/goal/:goalId
Returns: All action items linked to a specific goal
```

#### Get My Action Items
```
GET /action-items/workspace/:workspaceId/my-items
Returns: All action items assigned to the current user
```

#### Update Action Item
```
PATCH /action-items/:actionItemId
Body: {
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "assigneeId": "new-user-uuid"
}
```

#### Delete Action Item
```
DELETE /action-items/:actionItemId
```

#### Get Action Item Statistics
```
GET /action-items/workspace/:workspaceId/stats
Returns: {
  "total": 42,
  "completed": 18,
  "overdue": 2,
  "completionRate": 43,
  "byStatus": {
    "TODO": 15,
    "IN_PROGRESS": 8,
    "IN_REVIEW": 1,
    "DONE": 18
  }
}
```

### Kanban Board Operations

#### Update Kanban Order
```
POST /action-items/kanban/update-order
Body: {
  "items": [
    { "id": "item-1", "order": 0 },
    { "id": "item-2", "order": 1 },
    { "id": "item-3", "order": 2 }
  ]
}
Returns: { "success": true, "count": 3 }
```

#### Move Action Item
```
POST /action-items/:actionItemId/move
Body: {
  "status": "IN_PROGRESS",
  "order": 2
}
Returns: Updated action item with new status and position
```

### Assignment Management

#### Assign Action Item
```
POST /action-items/:actionItemId/assign
Body: {
  "assigneeId": "user-uuid"
}
Returns: Updated action item with assignee info
```

#### Unassign Action Item
```
POST /action-items/:actionItemId/unassign
Returns: Updated action item with assigneeId set to null
```

## Data Model

### ActionItem
```typescript
{
  id: string (UUID)
  createdAt: DateTime
  updatedAt: DateTime
  
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' (default: MEDIUM)
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' (default: TODO)
  dueDate?: DateTime
  order: number (for Kanban drag & drop)
  
  workspaceId: string (UUID)
  assigneeId?: string (UUID) - nullable for unassigned items
  goalId?: string (UUID) - nullable to allow standalone items
  
  // Relations
  workspace: Workspace
  assignee?: User
  goal?: Goal
}
```

## Business Logic

### List View Sorting
Items are sorted by:
1. Priority (HIGH → URGENT first)
2. Due Date (earliest first)
3. Creation Date (newest first)

### Kanban View Grouping
- Items grouped by status column
- Within each column, sorted by `order` field
- `order` field manages position for drag & drop

### Priority Order
```
URGENT (0) > HIGH (1) > MEDIUM (2) > LOW (3)
```

### Status Workflow
```
TODO → IN_PROGRESS → IN_REVIEW → DONE
```

### Overdue Calculation
- Items with `dueDate` < now and status ≠ DONE are overdue
- Tracked in statistics

### Goal Linking
- Action items can be linked to goals (optional)
- Supports independent action items
- When goal is deleted, actionItem.goalId is set to null (onDelete: SetNull)

## Error Handling

All endpoints use the `catchAsync` middleware:
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing auth)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

## Authentication

All endpoints require authentication via the `auth()` middleware:
- Checks for valid JWT token
- Extracts user ID from token
- Passes user to request object

## Performance Considerations

1. **Indexes**:
   - workspaceId (for workspace queries)
   - assigneeId (for user's tasks)
   - goalId (for goal's tasks)
   - status (for status filtering)
   - dueDate (for sorting/filtering)

2. **Kanban View**:
   - Single query with all items
   - Client-side grouping by status
   - Efficient for real-time updates

3. **List View**:
   - Pre-sorted by priority and due date
   - Ready for pagination if needed

## Kanban Board Implementation

### Frontend Integration Pattern
```typescript
// Get board data
const board = await GET /action-items/workspace/:workspaceId?view=kanban

// Render columns
columns = [
  { status: 'TODO', items: board.TODO },
  { status: 'IN_PROGRESS', items: board.IN_PROGRESS },
  { status: 'IN_REVIEW', items: board.IN_REVIEW },
  { status: 'DONE', items: board.DONE }
]

// On drag & drop
await POST /action-items/:id/move { status, order }
```

### Drag & Drop Considerations
- Each column maintains separate `order` sequence
- Moving between columns updates `status` and `order`
- Optimistic updates possible with rollback on error

## Future Enhancements

1. **Subtasks**: Break down action items into subtasks
2. **Time Tracking**: Track time spent on items
3. **Labels/Tags**: Categorize items beyond goals
4. **Recurring Tasks**: Create repeating action items
5. **Reminders**: Notify assignee of due dates
6. **Comments**: Discussion on action items
7. **Attachments**: Link files to tasks
8. **Activity Log**: Track changes to items
9. **Bulk Operations**: Update multiple items at once
10. **Custom Fields**: Additional metadata per workspace
11. **Templates**: Save/reuse action item templates
12. **Dependencies**: Link items that depend on others
13. **Time Estimates**: Estimate and track effort
14. **Sprint Planning**: Group items into sprints
