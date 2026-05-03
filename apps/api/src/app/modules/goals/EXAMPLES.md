# Goals API - Usage Examples

## Authentication
All requests require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Creating Goals and Milestones

### Example 1: Create a Q2 Revenue Goal with Milestones

```bash
# 1. Create the goal
curl -X POST http://localhost:5000/api/goals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q2 Revenue Target",
    "description": "Increase revenue by 25% in Q2 2026",
    "dueDate": "2026-06-30T23:59:59Z",
    "priority": "HIGH",
    "workspaceId": "workspace-123"
  }'

# Response:
{
  "success": true,
  "message": "Goal created successfully",
  "data": {
    "id": "goal-001",
    "title": "Q2 Revenue Target",
    "description": "Increase revenue by 25% in Q2 2026",
    "dueDate": "2026-06-30T23:59:59Z",
    "status": "NOT_STARTED",
    "priority": "HIGH",
    "progress": 0,
    "workspaceId": "workspace-123",
    "ownerId": "user-123",
    "owner": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://..."
    },
    "milestones": [],
    "activities": []
  }
}

# 2. Create milestones for the goal
curl -X POST http://localhost:5000/api/goals/goal-001/milestones \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Phase 1: Market Research",
    "description": "Identify target markets and customer segments",
    "dueDate": "2026-04-30T23:59:59Z"
  }'

# Response:
{
  "success": true,
  "message": "Milestone created successfully",
  "data": {
    "id": "milestone-001",
    "title": "Phase 1: Market Research",
    "description": "Identify target markets and customer segments",
    "dueDate": "2026-04-30T23:59:59Z",
    "status": "PENDING",
    "progress": 0,
    "goalId": "goal-001"
  }
}

# 3. Create more milestones
curl -X POST http://localhost:5000/api/goals/goal-001/milestones \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Phase 2: Strategy Development",
    "description": "Develop sales and marketing strategy",
    "dueDate": "2026-05-15T23:59:59Z"
  }'

curl -X POST http://localhost:5000/api/goals/goal-001/milestones \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Phase 3: Execution & Monitoring",
    "description": "Execute strategy and monitor progress",
    "dueDate": "2026-06-15T23:59:59Z"
  }'
```

---

## Tracking Progress with Activity Feed

### Example 2: Post Progress Updates

```bash
# Post an update to the activity feed
curl -X POST http://localhost:5000/api/goals/goal-001/activity \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Market research completed. Found 3 promising segments with high growth potential."
  }'

# Response:
{
  "success": true,
  "message": "Progress update posted",
  "data": {
    "id": "activity-001",
    "content": "Market research completed. Found 3 promising segments with high growth potential.",
    "goalId": "goal-001",
    "userId": "user-123",
    "createdAt": "2026-04-15T10:30:00Z",
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "avatar": "https://..."
    },
    "goal": {
      "id": "goal-001",
      "title": "Q2 Revenue Target"
    }
  }
}

# Post another update
curl -X POST http://localhost:5000/api/goals/goal-001/activity \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Team meeting held. Strategy agreed upon. Starting implementation next week."
  }'

# Get activity feed
curl -X GET http://localhost:5000/api/goals/goal-001/activity \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "message": "Activity feed retrieved",
  "data": {
    "activities": [
      {
        "id": "activity-002",
        "content": "Team meeting held. Strategy agreed upon. Starting implementation next week.",
        "goalId": "goal-001",
        "userId": "user-123",
        "createdAt": "2026-04-16T14:00:00Z",
        "user": {
          "id": "user-123",
          "name": "John Doe",
          "avatar": "https://..."
        }
      },
      {
        "id": "activity-001",
        "content": "Market research completed. Found 3 promising segments with high growth potential.",
        "goalId": "goal-001",
        "userId": "user-123",
        "createdAt": "2026-04-15T10:30:00Z",
        "user": {
          "id": "user-123",
          "name": "John Doe",
          "avatar": "https://..."
        }
      }
    ],
    "total": 2,
    "hasMore": false
  }
}
```

---

## Updating Milestones Progress

### Example 3: Update Milestone Progress

```bash
# Update Phase 1 milestone to 100% complete
curl -X PATCH http://localhost:5000/api/goals/milestones/milestone-001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "progress": 100,
    "status": "COMPLETED"
  }'

# Response: Goal progress auto-updates!
{
  "success": true,
  "message": "Milestone updated",
  "data": {
    "id": "milestone-001",
    "title": "Phase 1: Market Research",
    "status": "COMPLETED",
    "progress": 100,
    "goalId": "goal-001"
  }
}

# Update Phase 2 to 50%
curl -X PATCH http://localhost:5000/api/goals/milestones/milestone-002 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "progress": 50,
    "status": "IN_PROGRESS"
  }'

# Get the goal - notice progress is now 50% (average of 100, 50, 0)
curl -X GET http://localhost:5000/api/goals/goal-001 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response shows updated progress
{
  "success": true,
  "message": "Goal retrieved",
  "data": {
    "id": "goal-001",
    "title": "Q2 Revenue Target",
    "status": "IN_PROGRESS",
    "progress": 50,  # Auto-calculated: (100 + 50 + 0) / 3 = 50
    "milestones": [
      { "id": "milestone-001", "progress": 100, "status": "COMPLETED" },
      { "id": "milestone-002", "progress": 50, "status": "IN_PROGRESS" },
      { "id": "milestone-003", "progress": 0, "status": "PENDING" }
    ]
  }
}
```

---

## Viewing Goal Statistics

### Example 4: Get Workspace Goal Statistics

```bash
# Get stats for a workspace
curl -X GET http://localhost:5000/api/goals/workspace/workspace-123/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
{
  "success": true,
  "message": "Goal statistics retrieved",
  "data": {
    "totalGoals": 15,
    "completedGoals": 5,
    "completionRate": 33,
    "byStatus": {
      "NOT_STARTED": 3,
      "IN_PROGRESS": 7,
      "COMPLETED": 5,
      "OVERDUE": 0
    }
  }
}
```

---

## Filtering and Pagination

### Example 5: Advanced Queries

```bash
# Get only in-progress goals
curl -X GET 'http://localhost:5000/api/goals/workspace/workspace-123?status=IN_PROGRESS' \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get my own goals
curl -X GET http://localhost:5000/api/goals/workspace/workspace-123/my-goals \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get activity feed with pagination
curl -X GET 'http://localhost:5000/api/goals/goal-001/activity?take=10&skip=0' \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get next page of activity
curl -X GET 'http://localhost:5000/api/goals/goal-001/activity?take=10&skip=10' \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Complete Goal Workflow Example

```bash
# 1. Create goal
GOAL_ID=$(curl -s -X POST http://localhost:5000/api/goals \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Launch New Product",
    "priority": "HIGH",
    "dueDate": "2026-12-31T23:59:59Z",
    "workspaceId": "ws-123"
  }' | jq -r '.data.id')

echo "Created goal: $GOAL_ID"

# 2. Add milestones
curl -X POST http://localhost:5000/api/goals/$GOAL_ID/milestones \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Design Phase", "dueDate": "2026-07-31T23:59:59Z"}'

curl -X POST http://localhost:5000/api/goals/$GOAL_ID/milestones \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Development", "dueDate": "2026-09-30T23:59:59Z"}'

# 3. Post updates as work progresses
curl -X POST http://localhost:5000/api/goals/$GOAL_ID/activity \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Design phase started. Mockups in progress."}'

# 4. Update milestone progress
curl -X PATCH http://localhost:5000/api/goals/milestones/milestone-1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"progress": 75, "status": "IN_PROGRESS"}'

# 5. Check goal status
curl -X GET http://localhost:5000/api/goals/$GOAL_ID \
  -H "Authorization: Bearer TOKEN"

# 6. View activity history
curl -X GET http://localhost:5000/api/goals/$GOAL_ID/activity \
  -H "Authorization: Bearer TOKEN"
```

---

## Notes

- All timestamps are in ISO 8601 format with UTC timezone
- Progress values are integers from 0-100
- Goal progress is automatically calculated as the average of milestone progress
- Delete operations cascade (deleting a goal deletes all its milestones and activities)
- Activity feed is paginated for performance
- All endpoints require authentication
