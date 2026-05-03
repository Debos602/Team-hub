# Action Items API - Usage Examples

## Authentication
All requests require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Creating and Managing Action Items

### Example 1: Creating Multiple Action Items for a Goal

```bash
# Assume we have a goal with ID goal-001

# Create action item 1: API Development
curl -X POST http://localhost:5000/api/action-items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement REST API endpoints",
    "description": "Create GET, POST, PATCH, DELETE endpoints for goals",
    "priority": "HIGH",
    "dueDate": "2026-05-10T23:59:59Z",
    "workspaceId": "ws-123",
    "assigneeId": "user-1",
    "goalId": "goal-001"
  }'

# Response:
{
  "success": true,
  "message": "Action item created",
  "data": {
    "id": "item-001",
    "title": "Implement REST API endpoints",
    "priority": "HIGH",
    "status": "TODO",
    "order": 0,
    "assignee": {
      "id": "user-1",
      "name": "John",
      "avatar": "..."
    },
    "goal": {
      "id": "goal-001",
      "title": "Q2 Development"
    }
  }
}

# Create action item 2: Documentation
curl -X POST http://localhost:5000/api/action-items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write API documentation",
    "description": "Document all endpoints with examples",
    "priority": "MEDIUM",
    "dueDate": "2026-05-15T23:59:59Z",
    "workspaceId": "ws-123",
    "assigneeId": "user-2",
    "goalId": "goal-001"
  }'

# Create action item 3: Testing
curl -X POST http://localhost:5000/api/action-items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unit tests for API",
    "description": "Achieve 80% code coverage",
    "priority": "HIGH",
    "dueDate": "2026-05-12T23:59:59Z",
    "workspaceId": "ws-123",
    "assigneeId": "user-3",
    "goalId": "goal-001"
  }'
```

---

## Kanban Board View

### Example 2: Viewing Kanban Board

```bash
# Get kanban board view (default)
curl -X GET 'http://localhost:5000/api/action-items/workspace/ws-123?view=kanban' \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "message": "Action items retrieved",
  "data": {
    "TODO": [
      {
        "id": "item-001",
        "title": "Implement REST API endpoints",
        "priority": "HIGH",
        "order": 0,
        "assignee": { "id": "user-1", "name": "John" },
        "dueDate": "2026-05-10T23:59:59Z"
      },
      {
        "id": "item-002",
        "title": "Write API documentation",
        "priority": "MEDIUM",
        "order": 1,
        "assignee": { "id": "user-2", "name": "Jane" },
        "dueDate": "2026-05-15T23:59:59Z"
      }
    ],
    "IN_PROGRESS": [
      {
        "id": "item-003",
        "title": "Unit tests for API",
        "priority": "HIGH",
        "order": 0,
        "assignee": { "id": "user-3", "name": "Bob" }
      }
    ],
    "IN_REVIEW": [],
    "DONE": []
  }
}
```

---

## List View

### Example 3: Viewing List View

```bash
# Get list view - sorted by priority, due date
curl -X GET 'http://localhost:5000/api/action-items/workspace/ws-123?view=list' \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response (sorted by priority HIGH first, then by due date):
{
  "success": true,
  "message": "Action items retrieved",
  "data": [
    {
      "id": "item-001",
      "title": "Implement REST API endpoints",
      "priority": "HIGH",
      "status": "TODO",
      "dueDate": "2026-05-10T23:59:59Z",
      "assignee": { "id": "user-1", "name": "John" }
    },
    {
      "id": "item-003",
      "title": "Unit tests for API",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "dueDate": "2026-05-12T23:59:59Z",
      "assignee": { "id": "user-3", "name": "Bob" }
    },
    {
      "id": "item-002",
      "title": "Write API documentation",
      "priority": "MEDIUM",
      "status": "TODO",
      "dueDate": "2026-05-15T23:59:59Z",
      "assignee": { "id": "user-2", "name": "Jane" }
    }
  ]
}

# Filter by priority
curl -X GET 'http://localhost:5000/api/action-items/workspace/ws-123?view=list&priority=HIGH' \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by status
curl -X GET 'http://localhost:5000/api/action-items/workspace/ws-123?view=list&status=IN_PROGRESS' \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by assignee
curl -X GET 'http://localhost:5000/api/action-items/workspace/ws-123?view=list&assigneeId=user-1' \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Kanban Drag & Drop Operations

### Example 4: Moving Items Between Columns

```bash
# Start work on an item - move from TODO to IN_PROGRESS
curl -X POST http://localhost:5000/api/action-items/item-001/move \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "order": 0
  }'

# Response:
{
  "success": true,
  "message": "Action item moved",
  "data": {
    "id": "item-001",
    "title": "Implement REST API endpoints",
    "status": "IN_PROGRESS",
    "order": 0
  }
}

# Submit for review - move from IN_PROGRESS to IN_REVIEW
curl -X POST http://localhost:5000/api/action-items/item-001/move \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_REVIEW",
    "order": 0
  }'

# Complete item - move to DONE
curl -X POST http://localhost:5000/api/action-items/item-001/move \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DONE",
    "order": 0
  }'
```

### Example 5: Reordering Items Within Column

```bash
# Reorder items in TODO column (user dragged item-002 above item-003)
curl -X POST http://localhost:5000/api/action-items/kanban/update-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "id": "item-002", "order": 0 },
      { "id": "item-004", "order": 1 },
      { "id": "item-003", "order": 2 }
    ]
  }'

# Response:
{
  "success": true,
  "message": "Kanban board updated",
  "data": {
    "success": true,
    "count": 3
  }
}
```

---

## Assignment Management

### Example 6: Assigning and Unassigning Items

```bash
# Assign an unassigned item to a user
curl -X POST http://localhost:5000/api/action-items/item-004/assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assigneeId": "user-5"
  }'

# Response:
{
  "success": true,
  "message": "Action item assigned",
  "data": {
    "id": "item-004",
    "title": "Setup CI/CD pipeline",
    "assignee": {
      "id": "user-5",
      "name": "Alice",
      "avatar": "..."
    }
  }
}

# Reassign to different user
curl -X POST http://localhost:5000/api/action-items/item-004/assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assigneeId": "user-1"
  }'

# Unassign an item
curl -X POST http://localhost:5000/api/action-items/item-004/unassign \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "message": "Action item unassigned",
  "data": {
    "id": "item-004",
    "title": "Setup CI/CD pipeline",
    "assignee": null
  }
}
```

---

## Personal Dashboard

### Example 7: Get My Action Items

```bash
# Get all items assigned to me
curl -X GET 'http://localhost:5000/api/action-items/workspace/ws-123/my-items' \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "message": "Your action items retrieved",
  "data": [
    {
      "id": "item-001",
      "title": "Implement REST API endpoints",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "dueDate": "2026-05-10T23:59:59Z",
      "goal": {
        "id": "goal-001",
        "title": "Q2 Development"
      }
    },
    {
      "id": "item-005",
      "title": "Code review",
      "priority": "MEDIUM",
      "status": "TODO",
      "dueDate": "2026-05-08T23:59:59Z",
      "goal": null  // Standalone item, not linked to a goal
    }
  ]
}
```

---

## Statistics and Analytics

### Example 8: Viewing Statistics

```bash
# Get workspace statistics
curl -X GET 'http://localhost:5000/api/action-items/workspace/ws-123/stats' \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "message": "Action item statistics retrieved",
  "data": {
    "total": 25,
    "completed": 8,
    "overdue": 2,
    "completionRate": 32,
    "byStatus": {
      "TODO": 10,
      "IN_PROGRESS": 5,
      "IN_REVIEW": 2,
      "DONE": 8
    }
  }
}
```

---

## Updating Action Items

### Example 9: Editing Action Items

```bash
# Update priority and add description
curl -X PATCH http://localhost:5000/api/action-items/item-001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "URGENT",
    "description": "This is now critical - needed for demo"
  }'

# Change due date
curl -X PATCH http://localhost:5000/api/action-items/item-001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dueDate": "2026-05-08T17:00:00Z"
  }'

# Link to a different goal
curl -X PATCH http://localhost:5000/api/action-items/item-001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": "goal-002"
  }'

# Unlink from goal
curl -X PATCH http://localhost:5000/api/action-items/item-001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": null
  }'
```

---

## Complete Workflow Example

```bash
# 1. Create action items for a sprint
ITEM_1=$(curl -s -X POST http://localhost:5000/api/action-items \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backend API",
    "priority": "HIGH",
    "workspaceId": "ws-123"
  }' | jq -r '.data.id')

ITEM_2=$(curl -s -X POST http://localhost:5000/api/action-items \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend UI",
    "priority": "HIGH",
    "workspaceId": "ws-123"
  }' | jq -r '.data.id')

# 2. Assign items
curl -X POST http://localhost:5000/api/action-items/$ITEM_1/assign \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assigneeId": "user-1"}'

curl -X POST http://localhost:5000/api/action-items/$ITEM_2/assign \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assigneeId": "user-2"}'

# 3. View kanban board
curl -X GET 'http://localhost:5000/api/action-items/workspace/ws-123?view=kanban' \
  -H "Authorization: Bearer TOKEN"

# 4. Start work
curl -X POST http://localhost:5000/api/action-items/$ITEM_1/move \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS", "order": 0}'

# 5. Check statistics
curl -X GET 'http://localhost:5000/api/action-items/workspace/ws-123/stats' \
  -H "Authorization: Bearer TOKEN"
```

---

## Notes

- All timestamps are in ISO 8601 format with UTC timezone
- `order` field is for Kanban board drag & drop positioning
- Items within a column are sorted by `order`, not by ID
- Overdue items are calculated as: dueDate < now AND status ≠ DONE
- Completion rate is: (completed / total) * 100
- Action items can exist independently or linked to goals
- Deleting a goal sets actionItem.goalId to null (doesn't delete items)
- All endpoints require authentication
